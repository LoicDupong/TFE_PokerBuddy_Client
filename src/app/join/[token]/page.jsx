"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import useAuthStore from "@/stores/useAuthStore";
import useToastStore from "@/stores/useToastStore.js";
import joinService from "@/services/join.service";
import gameService from "@/services/game.service.js";
import gameInviteService from "@/services/gameInvite.service.js";
import { currencySymbol, inviteResponseToast } from "@/utils/game.utils.js";

// Clé du jeton invité : un par partie et par navigateur
const guestKey = (gameId) => `pokerbuddy-guest-${gameId}`;
const readGuest = (gameId) => { try { return JSON.parse(localStorage.getItem(guestKey(gameId))); } catch { return null; } };
const writeGuest = (gameId, value) => { try { localStorage.setItem(guestKey(gameId), JSON.stringify(value)); } catch { /* stockage indisponible */ } };

export default function JoinPage() {
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
            if (!ok) setFormError(res.errorMessage?.[0]);
        } else if (status === "accepted") {
            const res = await joinService.joinByToken(token);
            ok = res.success;
            if (!ok) setFormError(res.error);
        } else {
            // Pas de ligne pour moi dans la partie : rien à enregistrer pour un refus
            setMyStatus("refused");
            setBusy(false);
            return;
        }
        if (ok) {
            setMyStatus(status);
            showToast(...inviteResponseToast(status, info.name));
            loadInfo();
        }
        setBusy(false);
    }

    async function answerGuest(status) {
        setFormError(null);
        const trimmed = name.trim();
        if (!guest && !trimmed) { setFormError("Please enter your first name."); return; }
        setBusy(true);
        const res = guest
            ? await joinService.updateGuestAnswer(guest.guestToken, status)
            : await joinService.answerAsGuest(token, trimmed, status);
        setBusy(false);
        if (!res.success) { setFormError(res.error); return; }

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
                    <h2 className="title title--card">Unable to open this invitation</h2>
                </div>
                <div className="card__body">
                    <p>{error}</p>
                    <Link href="/" className="btn btn--primary">Go home</Link>
                </div>
            </section>
        );
    }
    if (!info || !isReady) return <p>Loading invitation…</p>;

    const date = new Date(info.dateStart);
    const answered = myStatus === "accepted" || myStatus === "refused";
    const symbol = currencySymbol(info.currency);

    return (
        <>
            <section className="card invite-card">
                <div className="card__header">
                    <p className="subtitle subtitle--card">{info.host} invites you to</p>
                    <h1 className="title title--card invite-card__title">{info.name}</h1>
                </div>
                <div className="card__body">
                    <dl className="invite-card__facts">
                        <div><dt>Date</dt><dd>{date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</dd></div>
                        <div><dt>Time</dt><dd>{date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</dd></div>
                        {info.location && <div><dt>Place</dt><dd>{info.location}</dd></div>}
                        <div><dt>Buy-in</dt><dd>{info.buyIn} {symbol}</dd></div>
                        <div><dt>Confirmed</dt><dd>{info.confirmedCount}{info.maxPlayers ? ` / ${info.maxPlayers}` : ""} {info.confirmedCount === 1 && !info.maxPlayers ? "player" : "players"}</dd></div>
                    </dl>

                    {info.status === "finished" ? (
                        <p>This game is already finished.</p>
                    ) : (
                        <>
                            {answered && (
                                <p className="invite-card__confirm" role="status">
                                    {myStatus === "accepted" ? "You're in. See you there!" : "Got it, you can't make it."}
                                </p>
                            )}

                            {!userId && !guest && (
                                <div className="invite-card__field">
                                    <label htmlFor="guest-name">Your first name</label>
                                    <input
                                        id="guest-name"
                                        type="text"
                                        maxLength={30}
                                        autoComplete="given-name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Marc"
                                    />
                                </div>
                            )}
                            {!userId && guest && <p className="gray">Answering as {guest.name}</p>}

                            {formError && <p className="form__error" role="alert">{formError}</p>}

                            <div className="invite-card__actions">
                                <button
                                    type="button"
                                    className="btn btn--primary"
                                    disabled={busy || myStatus === "accepted"}
                                    onClick={() => answer("accepted")}
                                >
                                    I&apos;m in
                                </button>
                                <button
                                    type="button"
                                    className="btn btn--card"
                                    disabled={busy || myStatus === "refused"}
                                    onClick={() => answer("refused")}
                                >
                                    Can&apos;t make it
                                </button>
                            </div>

                            {userId && answered && (
                                <Link href={`/games/${info.gameId}`} className="invite-card__link link">View game</Link>
                            )}

                            {!userId && (
                                <p className="invite-card__auth">
                                    <Link href={`/auth/login?redirect=${redirectParam}`} className="link">Log in</Link>
                                    {" · "}
                                    <Link
                                        href={`/auth/register?redirect=${redirectParam}${guest ? `&claim=${encodeURIComponent(guest.guestToken)}` : ""}`}
                                        className="link"
                                    >
                                        Create an account
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
                        <h2 id="claim-title" className="modal__title">Create an account to keep your game history at hand</h2>
                        <p>Your answer is saved. With an account you get your stats and your games in one place.</p>
                        <div className="invite-card__actions">
                            <button
                                type="button"
                                className="btn btn--primary"
                                onClick={() => router.push(`/auth/register?claim=${encodeURIComponent(guest.guestToken)}&redirect=${redirectParam}`)}
                            >
                                Create my account
                            </button>
                            <button type="button" className="btn btn--card" onClick={() => setShowModal(false)}>
                                Maybe later
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
