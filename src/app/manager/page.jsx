"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPause,
    faPlay,
    faForwardStep,
    faBackwardStep,
    faRotateRight,
    faRightFromBracket,
    faPenToSquare,
    faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";
import usePresetStore, { usePresetHydrated } from "@/stores/usePresetStore";
import { NEW_TIMER, getTimeLeft, goToLevel, pauseTimer, startTimer } from "@/utils/timer.utils.js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link.js";
import Image from "next/image";

import EndGameModal from "@/features/game/end-game-modal.jsx";

// Références stables : un nouveau [] à chaque tick du timer réinitialisait le classement de la modale
const NO_PLAYERS = [];
const NO_PAYOUT = [];

export default function GameManager() {
    const hydrated = usePresetHydrated();
    const { preset, setPreset } = usePresetStore();
    const router = useRouter();

    const [showEndModal, setShowEndModal] = useState(false);
    const [now, setNow] = useState(() => Date.now());

    // Timer sauvegardé dans le preset : survit à un rechargement de la page
    const timer = preset.timer ?? NEW_TIMER;
    const level = timer.level;
    const levelSeconds = (Number(preset.levelDurationMin) || 0) * 60;
    const isRunning = timer.endsAt !== null;
    const timeLeft = getTimeLeft(timer, levelSeconds, now); // en secondes
    const playersLeft = preset.maxPlayers || 0;

    // redirect si pas de preset (une fois la sauvegarde relue)
    useEffect(() => {
        if (hydrated && !preset.title) {
            router.push("/manager/preset");
        }
    }, [hydrated, preset.title, router]);

    // Rafraîchit l'affichage ; le temps restant est recalculé depuis l'heure de fin à chaque tick
    useEffect(() => {
        if (!isRunning) return;
        setNow(Date.now());
        const interval = setInterval(() => setNow(Date.now()), 500);
        return () => clearInterval(interval);
    }, [isRunning]);

    // Fin du niveau : le timer s'arrête à 00:00
    useEffect(() => {
        if (isRunning && timeLeft === 0) {
            setPreset({ timer: pauseTimer(timer, levelSeconds, Date.now()) });
        }
    }, [isRunning, timeLeft, timer, levelSeconds, setPreset]);

    const toggleTimer = () => {
        const current = Date.now();
        setNow(current);
        setPreset({
            timer: isRunning
                ? pauseTimer(timer, levelSeconds, current)
                : startTimer(timer, levelSeconds, current),
        });
    };

    const changeLevel = (newLevel) => setPreset({ timer: goToLevel(newLevel) });

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    if (!hydrated || !preset.title) return null;

    // calculs utiles
    const prizePool = preset.buyIn * (preset.maxPlayers || 0); // simplifié (sans rebuys)
    const avgStack =
        preset.chipsPerPlayer && playersLeft
            ? Math.floor(
                (preset.chipsPerPlayer * (preset.maxPlayers || 0)) / playersLeft
            )
            : 0;

    return (
        <div className="manager">
            {/* HEADER */}
            <div className="manager__header">
                <h1>{preset.title}</h1>
            </div>

            {/* INFOS LEFT */}
            <div className="manager__sidebar left">
                <Link href={"/"} className="logo">
                    <Image
                        src="/pokerbuddy_logo_light.png"
                        className="logo logo--header"
                        alt="PokerBuddy logo"
                        width={72}
                        height={35}
                        priority
                    />
                </Link>
                <p>
                    <strong>Prize Pool:</strong> {prizePool}
                </p>
                <p>
                    <strong>Players:</strong> {playersLeft} / {preset.maxPlayers}
                </p>
                <div className="divider"></div>
                <p>
                    <strong>Avg Stack:</strong> {avgStack}
                </p>
                <p>
                    <strong>Buy-in:</strong> {preset.buyIn}€
                </p>
                {preset.allowRebuys && <p><strong>Rebuys Allowed</strong></p>}
            </div>

            {/* TIMER + BLINDS */}
            <div className="manager__main">
                <p>Level {level}</p>
                <h2>{formatTime(timeLeft)}</h2>
                <h1>
                    {preset.smallBlind * level} / {preset.bigBlind * level}
                </h1>
                <small>
                    Next: {preset.smallBlind * (level + 1)} / {preset.bigBlind * (level + 1)}
                </small>
            </div>

            {/* INFOS RIGHT */}
            <div className="manager__sidebar right">
                <div className="manager__item">
                    <p>
                        <strong>Level Duration:</strong> <br />
                        {preset.levelDurationMin} min
                    </p>
                    <Link href={"/manager/preset"}>
                        <div className="btn btn--control">
                            <FontAwesomeIcon icon={faPenToSquare} /> Edit
                        </div>
                    </Link>

                    {/* Bouton END → ouvre la modal */}
                    <div
                        className="btn btn--control"
                        onClick={() => setShowEndModal(true)}
                    >
                        <FontAwesomeIcon icon={faCircleXmark} /> End
                    </div>
                </div>
                <Link href={"/manager/preset"}>
                    <FontAwesomeIcon icon={faRightFromBracket} size="xl" />
                </Link>
            </div>

            {/* CONTROLS */}
            <div className="manager__controls">
                <button
                    className="btn btn--control"
                    onClick={() => changeLevel(Math.max(1, level - 1))}
                >
                    <FontAwesomeIcon icon={faBackwardStep} /> Prev
                </button>
                <button
                    className="btn btn--control"
                    onClick={toggleTimer}
                >
                    <FontAwesomeIcon icon={isRunning ? faPause : faPlay} />{" "}
                    {isRunning ? "Pause" : "Start"}
                </button>
                <button
                    className="btn btn--control"
                    onClick={() => changeLevel(level + 1)}
                >
                    <FontAwesomeIcon icon={faForwardStep} /> Next
                </button>
            </div>

            <div className="manager__message">
                <FontAwesomeIcon icon={faRotateRight} />{" "}
                <small>Rotate your device for the best experience</small>
            </div>

            {/* Modal affichée si showEndModal = true */}
            {showEndModal && (
                <EndGameModal
                    gameId={preset.gameId} // ⚡ il faut que ton preset contienne gameId
                    players={preset.players ?? NO_PLAYERS}
                    payoutDistribution={preset.payoutDistribution ?? NO_PAYOUT}
                    buyIn={preset.buyIn || 0}
                    onClose={() => setShowEndModal(false)}
                />
            )}

        </div>
    );
}
