"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import useAuthStore from "@/stores/useAuthStore";
import useToastStore from "@/stores/useToastStore.js";
import joinService from "@/services/join.service";
import gameService from "@/services/game.service.js";
import gameInviteService from "@/services/gameInvite.service.js";
import { currencySymbol } from "@/utils/game.utils.js";
import { useInviteResponseToast } from "@/utils/game-labels.utils.js";
import { useT } from "@/i18n/i18n-provider.jsx";
import { COMMON } from "@/i18n/common.js";
import { useServerError } from "@/utils/server-errors.utils.js";
import { canAddToCalendar } from "@/utils/calendar.utils.js";
import AddToCalendar from "./add-to-calendar.jsx";

const MESSAGES = {
    en: {
        ...COMMON.en,
        unable: "Unable to open this invitation", goHome: "Go home", loading: "Loading invitation…",
        invitesYou: "{host} invites you to", date: "Date", time: "Time", place: "Place", buyIn: "Buy-in", confirmed: "Confirmed",
        player: "player", players: "players", finished: "This game is already finished.",
        youreIn: "You're in. See you there!", cantMake: "Got it, you can't make it.",
        firstName: "Your first name", firstNamePh: "e.g. Marc", enterName: "Please enter your first name.",
        answeringAs: "Answering as {name}", imIn: "I'm in", cantMakeIt: "Can't make it", viewGame: "View game",
        logIn: "Log in", createAccount: "Create an account",
        claimTitle: "Create an account to keep your game history at hand",
        claimText: "Your answer is saved. With an account you get your stats and your games in one place.",
        createMine: "Create my account", later: "Maybe later",
    },
    fr: {
        ...COMMON.fr,
        unable: "Impossible d'ouvrir cette invitation", goHome: "Retour à l'accueil", loading: "Chargement de l'invitation…",
        invitesYou: "{host} t'invite à", date: "Date", time: "Heure", place: "Lieu", buyIn: "Buy-in", confirmed: "Confirmés",
        player: "joueur", players: "joueurs", finished: "Cette partie est déjà terminée.",
        youreIn: "C'est noté, tu viens. À bientôt !", cantMake: "Bien reçu, tu ne peux pas venir.",
        firstName: "Ton prénom", firstNamePh: "ex. Marc", enterName: "Saisis ton prénom.",
        answeringAs: "Tu réponds en tant que {name}", imIn: "Je viens", cantMakeIt: "Je ne peux pas", viewGame: "Voir la partie",
        logIn: "Connexion", createAccount: "Créer un compte",
        claimTitle: "Crée un compte pour garder l'historique de tes parties",
        claimText: "Ta réponse est enregistrée. Avec un compte, tu retrouves tes stats et tes parties au même endroit.",
        createMine: "Créer mon compte", later: "Plus tard",
    },
};

// Clé du jeton invité : un par partie et par navigateur
const guestKey = (gameId) => `pokerbuddy-guest-${gameId}`;
const readGuest = (gameId) => { try { return JSON.parse(localStorage.getItem(guestKey(gameId))); } catch { return null; } };
const writeGuest = (gameId, value) => { try { localStorage.setItem(guestKey(gameId), JSON.stringify(value)); } catch { /* stockage indisponible */ } };

export default function JoinPage() {
    const { t, intlLocale } = useT(MESSAGES);
    const serverError = useServerError();
    const inviteToast = useInviteResponseToast();
    const { token } = useParams();
    const router = useRouter();
    const userId = useAuthStore((state) => state.user?.id);
    const isReady = useAuthStore((state) => state.isReady);
    const showToast = useToastStore((state) => state.showToast);

    const [info, setInfo] = useState(null);
    const [error, setError] = useState(null);
    const [name, setName] = useState("");
    const [busy, setBusy] = useState(false);
    const [formError, setFormError] = useState(null);
    // Ma réponse actuelle : "accepted" | "refused" | "pending" | null (aucune)
    const [myStatus, setMyStatus] = useState(null);
    const [myInviteId, setMyInviteId] = useState(null);
    const [guest, setGuest] = useState(null); // { guestToken, name, status }
    const [showModal, setShowModal] = useState(false);

    const redirectParam = encodeURIComponent(`/join/${token}`);

    const loadInfo = useCallback(async () => {
        const res = await joinService.getInfo(token);
        if (res.success) setInfo(res.data);
        else setError(res.error);
    }, [token]);

    useEffect(() => { loadInfo(); }, [loadInfo]);

    // Retrouve ma réponse : compte connecté, sinon jeton invité du navigateur
    const gameId = info?.gameId;
    useEffect(() => {
        if (!gameId || !isReady) return;
        if (userId) {
            (async () => {
                const invites = await gameInviteService.getMyInvites();
                const pending = invites?.find((i) => i.gameId === gameId);
                if (pending) { setMyInviteId(pending.inviteId); setMyStatus("pending"); return; }
                const data = await gameService.getById(gameId);
                const mine = data?.game?.playerLinks?.find((p) => p.userId === userId);
                if (mine) { setMyInviteId(mine.id); setMyStatus(mine.status); }
            })();
        } else {
            const saved = readGuest(gameId);
            if (saved?.guestToken) { setGuest(saved); setMyStatus(saved.status); }
        }
    }, [gameId, isReady, userId]);

    async function answerLoggedIn(status) {
        setBusy(true);
        setFormError(null);
        let ok = false;
        if (myInviteId) {
            const res = await gameInviteService.respond(myInviteId, status);
            ok = res.success;
            if (!ok) setFormError(t("genericError"));
        } else {
            // Pas de ligne pour moi : l'endpoint la crée (aussi pour un refus, que l'hôte doit voir)
            const res = await joinService.joinByToken(token, status);
            ok = res.success;
            if (!ok) setFormError(serverError(res.error));
        }
        if (ok) {
            setMyStatus(status);
            showToast(...inviteToast(status, info.name));
            loadInfo();
        }
        setBusy(false);
    }

    async function answerGuest(status) {
        setFormError(null);
        const trimmed = name.trim();
        if (!guest && !trimmed) { setFormError(t("enterName")); return; }
        setBusy(true);
        const res = guest
            ? await joinService.updateGuestAnswer(guest.guestToken, status)
            : await joinService.answerAsGuest(token, trimmed, status);
        setBusy(false);
        if (!res.success) { setFormError(serverError(res.error)); return; }

        const saved = guest
            ? { ...guest, status }
            : { guestToken: res.data.guestToken, name: trimmed, status };
        writeGuest(info.gameId, saved);
        setGuest(saved);
        if (!guest) setShowModal(true);
        setMyStatus(status);
        loadInfo();
    }

    const answer = (status) => (userId ? answerLoggedIn(status) : answerGuest(status));

    if (error) {
        return (
            <section className="card invite-card">
                <div className="card__header">
                    <h2 className="title title--card">{t("unable")}</h2>
                </div>
                <div className="card__body">
                    <p>{serverError(error)}</p>
                    <Link href="/" className="btn btn--primary">{t("goHome")}</Link>
                </div>
            </section>
        );
    }
    if (!info || !isReady) return <p>{t("loading")}</p>;

    const date = new Date(info.dateStart);
    const answered = myStatus === "accepted" || myStatus === "refused";
    const symbol = currencySymbol(info.currency);

    return (
        <>
            <section className="card invite-card">
                <div className="card__header">
                    <p className="subtitle subtitle--card">{t("invitesYou", { host: info.host })}</p>
                    <h1 className="title title--card invite-card__title">{info.name}</h1>
                </div>
                <div className="card__body">
                    <dl className="invite-card__facts">
                        <div><dt>{t("date")}</dt><dd>{date.toLocaleDateString(intlLocale, { weekday: "long", day: "numeric", month: "long" })}</dd></div>
                        <div><dt>{t("time")}</dt><dd>{date.toLocaleTimeString(intlLocale, { hour: "2-digit", minute: "2-digit" })}</dd></div>
                        {info.location && <div><dt>{t("place")}</dt><dd>{info.location}</dd></div>}
                        <div><dt>{t("buyIn")}</dt><dd>{info.buyIn} {symbol}</dd></div>
                        <div><dt>{t("confirmed")}</dt><dd>{info.confirmedCount}{info.maxPlayers ? ` / ${info.maxPlayers}` : ""} {info.confirmedCount === 1 && !info.maxPlayers ? t("player") : t("players")}</dd></div>
                    </dl>

                    {canAddToCalendar(info) && <AddToCalendar token={token} info={info} />}

                    {info.status === "finished" ? (
                        <p>{t("finished")}</p>
                    ) : (
                        <>
                            {answered && (
                                <p className="invite-card__confirm" role="status">
                                    {myStatus === "accepted" ? t("youreIn") : t("cantMake")}
                                </p>
                            )}

                            {!userId && !guest && (
                                <div className="invite-card__field">
                                    <label htmlFor="guest-name">{t("firstName")}</label>
                                    <input
                                        id="guest-name"
                                        type="text"
                                        maxLength={30}
                                        autoComplete="given-name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder={t("firstNamePh")}
                                    />
                                </div>
                            )}
                            {!userId && guest && <p className="gray">{t("answeringAs", { name: guest.name })}</p>}

                            {formError && <p className="form__error" role="alert">{formError}</p>}

                            <div className="invite-card__actions">
                                <button
                                    type="button"
                                    className="btn btn--primary"
                                    disabled={busy || myStatus === "accepted"}
                                    onClick={() => answer("accepted")}
                                >
                                    {t("imIn")}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn--card"
                                    disabled={busy || myStatus === "refused"}
                                    onClick={() => answer("refused")}
                                >
                                    {t("cantMakeIt")}
                                </button>
                            </div>

                            {userId && answered && (
                                <Link href={`/games/${info.gameId}`} className="invite-card__link link">{t("viewGame")}</Link>
                            )}

                            {!userId && (
                                <p className="invite-card__auth">
                                    <Link href={`/auth/login?redirect=${redirectParam}`} className="link">{t("logIn")}</Link>
                                    {" · "}
                                    <Link
                                        href={`/auth/register?redirect=${redirectParam}${guest ? `&claim=${encodeURIComponent(guest.guestToken)}` : ""}`}
                                        className="link"
                                    >
                                        {t("createAccount")}
                                    </Link>
                                </p>
                            )}
                        </>
                    )}
                </div>
            </section>

            {showModal && guest && (
                <div className="modal" role="dialog" aria-modal="true" aria-labelledby="claim-title">
                    <div className="modal__overlay" onClick={() => setShowModal(false)} />
                    <div className="modal__content invite-modal">
                        <h2 id="claim-title" className="modal__title">{t("claimTitle")}</h2>
                        <p>{t("claimText")}</p>
                        <div className="invite-card__actions">
                            <button
                                type="button"
                                className="btn btn--primary"
                                onClick={() => router.push(`/auth/register?claim=${encodeURIComponent(guest.guestToken)}&redirect=${redirectParam}`)}
                            >
                                {t("createMine")}
                            </button>
                            <button type="button" className="btn btn--card" onClick={() => setShowModal(false)}>
                                {t("later")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
