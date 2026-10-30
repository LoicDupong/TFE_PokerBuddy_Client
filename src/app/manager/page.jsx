"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPause,
    faPlay,
    faForwardStep,
    faBackwardStep,
    faRightFromBracket,
    faPenToSquare,
    faCircleXmark,
    faExpand,
    faCompress,
    faVolumeHigh,
    faVolumeXmark,
    faForward,
    faUserMinus,
    faUserPlus,
    faCoins,
} from "@fortawesome/free-solid-svg-icons";
import usePresetStore, { usePresetHydrated } from "@/stores/usePresetStore";
import { NEW_TIMER, formatTime, getTimeLeft, goToLevel, pauseTimer, startTimer } from "@/utils/timer.utils.js";
import { currencySymbol } from "@/utils/game.utils.js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link.js";
import Image from "next/image";

import EndGameModal from "@/features/game/end-game-modal.jsx";
import FinancePanel from "@/features/game/finance-panel.jsx";
import useGameFinance from "@/features/game/use-game-finance.js";
import { formatCents } from "@/utils/money.utils.js";
import {
    playBeeps,
    unlockAudio,
    useFullscreen,
    useHotkeys,
    useIdle,
    useMediaQuery,
    useWakeLock,
} from "@/features/game/manager-effects.js";
import { useT } from "@/i18n/i18n-provider.jsx";

const MESSAGES = {
    en: {
        home: "PokerBuddy home",
        soundOn: "Sound on",
        soundOff: "Sound off",
        autoOn: "Auto-advance on",
        autoOff: "Auto-advance off",
        exitFullscreen: "Exit fullscreen",
        enterFullscreen: "Enter fullscreen",
        edit: "Edit",
        players: "Players",
        end: "End",
        leave: "Leave the Game Manager",
        level: (p) => `Level ${p.level}`,
        levelProgress: "Level progress",
        nextLevel: "Next level",
        gameInfo: "Game information",
        prizePool: "Prize pool",
        bountiesInPlay: "Bounties in play",
        playersLeft: "Players left",
        playerOut: "Player out",
        undoPlayer: "Undo: put a player back in",
        avgStack: "Avg stack",
        buyIn: "Buy-in",
        rebuysSuffix: " + rebuys",
        levelDuration: "Level duration",
        minutes: (p) => `${p.n} min`,
        prev: "Prev",
        pause: "Pause",
        start: "Start",
        next: "Next",
        closePanel: "Close the players panel",
        loadingFinances: "Loading the game finances…",
        needGame: "Start the Game Manager from a game to track rebuys and knockouts.",
    },
    fr: {
        home: "Accueil PokerBuddy",
        soundOn: "Son activé",
        soundOff: "Son coupé",
        autoOn: "Niveau auto activé",
        autoOff: "Niveau auto coupé",
        exitFullscreen: "Quitter le plein écran",
        enterFullscreen: "Passer en plein écran",
        edit: "Modifier",
        players: "Joueurs",
        end: "Terminer",
        leave: "Quitter le Game Manager",
        level: (p) => `Niveau ${p.level}`,
        levelProgress: "Progression du niveau",
        nextLevel: "Niveau suivant",
        gameInfo: "Informations sur la partie",
        prizePool: "Prize pool",
        bountiesInPlay: "Bounties en jeu",
        playersLeft: "Joueurs restants",
        playerOut: "Joueur éliminé",
        undoPlayer: "Annuler : remettre un joueur en jeu",
        avgStack: "Tapis moyen",
        buyIn: "Buy-in",
        rebuysSuffix: " + rebuys",
        levelDuration: "Durée du niveau",
        minutes: (p) => `${p.n} min`,
        prev: "Préc.",
        pause: "Pause",
        start: "Démarrer",
        next: "Suiv.",
        closePanel: "Fermer le panneau des joueurs",
        loadingFinances: "Chargement des finances de la partie…",
        needGame: "Lance le Game Manager depuis une partie pour suivre les rebuys et les éliminations.",
    },
};

// Références stables : un nouveau [] à chaque tick du timer réinitialisait le classement de la modale
const NO_PLAYERS = [];
const NO_PAYOUT = [];

// Dernière minute d'un niveau : le timer passe au rouge
const WARNING_SECONDS = 60;

// Taille des blinds selon la longueur du texte, pour que "10000 / 20000" tienne à l'écran
const blindsSize = (text) => (text.length <= 9 ? "m" : text.length <= 12 ? "l" : "xl");

export default function GameManager() {
    const hydrated = usePresetHydrated();
    const { preset, setPreset } = usePresetStore();
    const router = useRouter();
    const { t, intlLocale } = useT(MESSAGES);

    const [showEndModal, setShowEndModal] = useState(false);
    const [now, setNow] = useState(() => Date.now());
    const [flash, setFlash] = useState(0);
    const [showPlayers, setShowPlayers] = useState(false);
    // Argent de la partie liée (rebuys, add-ons, bounties) ; null en session libre
    const { finance, setFinance } = useGameFinance(preset.gameId);
    const tracked = Boolean(finance?.tracked);
    const pko = Boolean(finance?.config.pkoEnabled);

    // Timer sauvegardé dans le preset : survit à un rechargement de la page
    const timer = preset.timer ?? NEW_TIMER;
    const level = timer.level;
    const levelSeconds = (Number(preset.levelDurationMin) || 0) * 60;
    const isRunning = timer.endsAt !== null;
    const timeLeft = getTimeLeft(timer, levelSeconds, now); // en secondes
    const totalPlayers = Number(preset.maxPlayers) || preset.players?.length || 0;
    const manualLeft = Math.min(Math.max(preset.playersLeft ?? totalPlayers, 1), Math.max(totalPlayers, 1));
    // En PKO, les joueurs restants viennent des knockouts enregistrés
    const playersLeft = pko ? Math.max(finance.totals.aliveCount, 1) : manualLeft;

    const { supported: fullscreenOk, active: isFullscreen, toggle: toggleFullscreen } = useFullscreen();
    const isWide = useMediaQuery("(min-width: 1024px)");
    // Jamais masqué en pause : l'hôte doit voir ses boutons
    const idle = useIdle(isWide && isRunning && !showEndModal && !showPlayers);
    useWakeLock(isRunning);

    // redirect si pas de preset (une fois la sauvegarde relue)
    useEffect(() => {
        // Pas de redirection tant que la modale de fin est ouverte : après la sauvegarde
        // le preset est vidé, mais la modale doit encore afficher les résultats
        if (hydrated && !preset.title && !showEndModal) {
            router.push("/manager/preset");
        }
    }, [hydrated, preset.title, showEndModal, router]);

    // Rafraîchit l'affichage ; le temps restant est recalculé depuis l'heure de fin à chaque tick
    useEffect(() => {
        if (!isRunning) return;
        setNow(Date.now());
        const interval = setInterval(() => setNow(Date.now()), 500);
        return () => clearInterval(interval);
    }, [isRunning]);

    // Fin du niveau : flash + son, puis niveau suivant (auto-advance) ou arrêt à 00:00
    useEffect(() => {
        if (!isRunning || timeLeft !== 0) return;
        const current = Date.now();
        const advance = preset.autoAdvance && levelSeconds > 0;
        setNow(current);
        setPreset({
            timer: advance
                ? startTimer(goToLevel(level + 1), levelSeconds, current)
                : pauseTimer(timer, levelSeconds, current),
        });
        if (levelSeconds > 0) {
            setFlash((n) => n + 1);
            if (preset.soundOn) playBeeps(3);
        }
    }, [isRunning, timeLeft, timer, level, levelSeconds, preset.autoAdvance, preset.soundOn, setPreset]);

    // Le son n'est autorisé qu'après un geste : après un rechargement, le premier clic/touche le débloque
    useEffect(() => {
        if (!preset.soundOn) return;
        const unlock = () => unlockAudio();
        window.addEventListener("pointerdown", unlock, { once: true });
        window.addEventListener("keydown", unlock, { once: true });
        return () => {
            window.removeEventListener("pointerdown", unlock);
            window.removeEventListener("keydown", unlock);
        };
    }, [preset.soundOn]);

    const toggleTimer = () => {
        const current = Date.now();
        setNow(current);
        if (!isRunning && timeLeft === 0) {
            // Niveau terminé : Start lance directement le niveau suivant
            setPreset({ timer: startTimer(goToLevel(level + 1), levelSeconds, current) });
            return;
        }
        setPreset({
            timer: isRunning
                ? pauseTimer(timer, levelSeconds, current)
                : startTimer(timer, levelSeconds, current),
        });
    };

    const changeLevel = (newLevel) => setPreset({ timer: goToLevel(newLevel) });

    const toggleSound = () => {
        if (!preset.soundOn) {
            // Ce clic débloque l'audio ; un bip court confirme que le son fonctionne
            unlockAudio();
            playBeeps(1);
        }
        setPreset({ soundOn: !preset.soundOn });
    };

    const setPlayersLeft = (n) => setPreset({ playersLeft: Math.min(Math.max(n, 1), totalPlayers) });

    // Raccourcis clavier, coupés pendant que la modale de fin est ouverte
    useHotkeys(
        {
            toggle: toggleTimer,
            prev: () => changeLevel(Math.max(1, level - 1)),
            next: () => changeLevel(level + 1),
            fullscreen: toggleFullscreen,
        },
        showEndModal || showPlayers
    );

    if (!hydrated || (!preset.title && !showEndModal)) return null;

    // calculs utiles
    const symbol = currencySymbol(preset.currency);
    const buyIn = Number(preset.buyIn) || 0;
    // Prize pool réel (buy-ins + rebuys + add-ons, hors bounties) pour une partie suivie
    const prizePoolText = tracked ? formatCents(finance.totals.prizePoolCents, preset.currency, intlLocale) : `${buyIn * totalPlayers}${symbol}`;
    // Stack moyen : masqué sans jetons de départ (sinon "0" n'aurait aucun sens)
    // Partie suivie : jetons réellement en jeu (rebuys et add-ons inclus) quand le serveur les connaît
    const avgStack =
        preset.chipsPerPlayer && totalPlayers
            ? Math.floor((tracked && finance.totals.chips > 0 ? finance.totals.chips : preset.chipsPerPlayer * totalPlayers) / playersLeft)
            : 0;

    const blinds = `${preset.smallBlind * level} / ${preset.bigBlind * level}`;
    const nextBlinds = `${preset.smallBlind * (level + 1)} / ${preset.bigBlind * (level + 1)}`;
    const progress = levelSeconds > 0 ? Math.min(1, Math.max(0, 1 - timeLeft / levelSeconds)) : 0;
    const warning = timeLeft <= WARNING_SECONDS;

    return (
        <div className={`manager${idle ? " manager--idle" : ""}`}>
            {preset.title && (<>
            {flash > 0 && (
                <div
                    key={flash}
                    className="manager__flash"
                    aria-hidden="true"
                    onAnimationEnd={() => setFlash(0)}
                />
            )}

            {/* HEADER */}
            <header className="manager__header">
                <Link href={"/"} className="logo" aria-label={t("home")}>
                    <Image
                        src="/pokerbuddy_logo_light.png"
                        className="logo logo--header"
                        alt=""
                        width={72}
                        height={35}
                        priority
                    />
                </Link>
                <h1>{preset.title}</h1>

                <div className="manager__host">
                    <button
                        type="button"
                        className="btn btn--control"
                        aria-pressed={!!preset.soundOn}
                        onClick={toggleSound}
                    >
                        <FontAwesomeIcon icon={preset.soundOn ? faVolumeHigh : faVolumeXmark} />{" "}
                        {preset.soundOn ? t("soundOn") : t("soundOff")}
                    </button>
                    <button
                        type="button"
                        className="btn btn--control"
                        aria-pressed={!!preset.autoAdvance}
                        onClick={() => setPreset({ autoAdvance: !preset.autoAdvance })}
                    >
                        <FontAwesomeIcon icon={faForward} /> {preset.autoAdvance ? t("autoOn") : t("autoOff")}
                    </button>
                    {fullscreenOk && (
                        <button
                            type="button"
                            className="btn btn--control"
                            aria-label={isFullscreen ? t("exitFullscreen") : t("enterFullscreen")}
                            onClick={toggleFullscreen}
                        >
                            <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} />
                        </button>
                    )}
                    <Link href={"/manager/preset"} className="btn btn--control">
                        <FontAwesomeIcon icon={faPenToSquare} /> {t("edit")}
                    </Link>
                    <button type="button" className="btn btn--control" onClick={() => setShowPlayers(true)}>
                        <FontAwesomeIcon icon={faCoins} /> {t("players")}
                    </button>
                    {/* Bouton END → ouvre la modal */}
                    <button
                        type="button"
                        className="btn btn--control"
                        onClick={() => setShowEndModal(true)}
                    >
                        <FontAwesomeIcon icon={faCircleXmark} /> {t("end")}
                    </button>
                    <Link
                        href={"/manager/preset"}
                        className="manager__exit"
                        aria-label={t("leave")}
                    >
                        <FontAwesomeIcon icon={faRightFromBracket} size="xl" />
                    </Link>
                </div>
            </header>

            {/* TIMER + BLINDS */}
            <main className="manager__main">
                <p className="manager__level">{t("level", { level })}</p>
                <div className={`manager__timer${warning ? " manager__timer--warning" : ""}`}>
                    {formatTime(timeLeft)}
                </div>
                <div
                    className="manager__progress"
                    role="progressbar"
                    aria-label={t("levelProgress")}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(progress * 100)}
                >
                    <div className="manager__progress-bar" style={{ transform: `scaleX(${progress})` }} />
                </div>
                <div className={`manager__blinds manager__blinds--${blindsSize(blinds)}`}>{blinds}</div>
                <p className="manager__next">
                    {t("nextLevel")} <strong>{nextBlinds}</strong>
                </p>
            </main>

            {/* INFOS */}
            <section className="manager__stats" aria-label={t("gameInfo")}>
                {buyIn > 0 && totalPlayers > 0 && (
                    <div className="manager__stat">
                        <span>{t("prizePool")}</span>
                        <strong>{prizePoolText}</strong>
                    </div>
                )}
                {pko && (
                    <div className="manager__stat">
                        <span>{t("bountiesInPlay")}</span>
                        <strong>{formatCents(finance.totals.bountiesOnTableCents, preset.currency, intlLocale)}</strong>
                    </div>
                )}
                {totalPlayers > 0 && (
                    <div className="manager__stat">
                        <span>{t("playersLeft")}</span>
                        <strong>{playersLeft} / {totalPlayers}</strong>
                        {!pko && <div className="manager__stat-actions">
                            <button
                                type="button"
                                className="btn btn--small btn--control"
                                disabled={playersLeft <= 1}
                                onClick={() => setPlayersLeft(playersLeft - 1)}
                            >
                                <FontAwesomeIcon icon={faUserMinus} /> {t("playerOut")}
                            </button>
                            <button
                                type="button"
                                className="btn btn--small btn--control"
                                aria-label={t("undoPlayer")}
                                disabled={playersLeft >= totalPlayers}
                                onClick={() => setPlayersLeft(playersLeft + 1)}
                            >
                                <FontAwesomeIcon icon={faUserPlus} /> +1
                            </button>
                        </div>}
                    </div>
                )}
                {avgStack > 0 && (
                    <div className="manager__stat">
                        <span>{t("avgStack")}</span>
                        <strong>{avgStack}</strong>
                    </div>
                )}
                {buyIn > 0 && (
                    <div className="manager__stat">
                        <span>{t("buyIn")}</span>
                        <strong>{buyIn}{symbol}{(finance?.config.allowRebuys ?? preset.allowRebuys) ? t("rebuysSuffix") : ""}</strong>
                    </div>
                )}
                {levelSeconds > 0 && (
                    <div className="manager__stat">
                        <span>{t("levelDuration")}</span>
                        <strong>{t("minutes", { n: preset.levelDurationMin })}</strong>
                    </div>
                )}
            </section>

            {/* CONTROLS */}
            <div className="manager__controls">
                <button
                    type="button"
                    className="btn btn--control"
                    onClick={() => changeLevel(Math.max(1, level - 1))}
                >
                    <FontAwesomeIcon icon={faBackwardStep} /> {t("prev")}
                </button>
                <button
                    type="button"
                    className="btn btn--control"
                    onClick={toggleTimer}
                >
                    <FontAwesomeIcon icon={isRunning ? faPause : faPlay} />{" "}
                    {isRunning ? t("pause") : t("start")}
                </button>
                <button
                    type="button"
                    className="btn btn--control"
                    onClick={() => changeLevel(level + 1)}
                >
                    <FontAwesomeIcon icon={faForwardStep} /> {t("next")}
                </button>
            </div>

            </>)}

            {showPlayers && (
                finance ? (
                    <FinancePanel
                        finance={finance}
                        gameId={preset.gameId}
                        currency={preset.currency}
                        chips={Number(preset.chipsPerPlayer) || 0}
                        onFinance={setFinance}
                        onClose={() => setShowPlayers(false)}
                    />
                ) : (
                    <div className="fin-panel" role="dialog" aria-modal="true" aria-label={t("players")}>
                        <div className="fin-panel__overlay" onClick={() => setShowPlayers(false)} />
                        <aside className="fin-panel__sheet">
                            <header className="fin-panel__head">
                                <h2>{t("players")}</h2>
                                <button type="button" className="fin-panel__close" onClick={() => setShowPlayers(false)} aria-label={t("closePanel")}>
                                    <FontAwesomeIcon icon={faCircleXmark} />
                                </button>
                            </header>
                            <p className="fin-note">
                                {preset.gameId
                                    ? t("loadingFinances")
                                    : t("needGame")}
                            </p>
                        </aside>
                    </div>
                )
            )}

            {/* Modal affichée si showEndModal = true */}
            {showEndModal && (
                <EndGameModal
                    gameId={preset.gameId} // ⚡ il faut que ton preset contienne gameId
                    players={preset.players ?? NO_PLAYERS}
                    payoutDistribution={preset.payoutDistribution ?? NO_PAYOUT}
                    buyIn={preset.buyIn || 0}
                    currency={preset.currency}
                    onClose={() => setShowEndModal(false)}
                />
            )}

        </div>
    );
}
