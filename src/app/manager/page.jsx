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
import usePresetStore from "@/stores/usePresetStore";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link.js";
import Image from "next/image";

import EndGameModal from "@/features/game/end-game-modal.jsx";

export default function GameManager() {
    const { preset } = usePresetStore();
    const router = useRouter();

    const [level, setLevel] = useState(1);
    const [isRunning, setIsRunning] = useState(false);
    const [timeLeft, setTimeLeft] = useState(preset.levelDurationMin * 60); // en secondes
    const [playersLeft, setPlayersLeft] = useState(preset.maxPlayers || 0);
    const [showEndModal, setShowEndModal] = useState(false);

    const timerRef = useRef(null);

    // redirect si pas de preset
    useEffect(() => {
        if (!preset.title) {
            router.push("/manager/preset");
        }
    }, [preset, router]);

    // gestion timer
    useEffect(() => {
        if (isRunning) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        setIsRunning(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }

        return () => clearInterval(timerRef.current);
    }, [isRunning]);

    // reset timer quand changement de level
    useEffect(() => {
        setTimeLeft(preset.levelDurationMin * 60);
        setIsRunning(false);
    }, [level, preset.levelDurationMin]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    if (!preset.title) return null;

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
                    onClick={() => setLevel(Math.max(1, level - 1))}
                >
                    <FontAwesomeIcon icon={faBackwardStep} /> Prev
                </button>
                <button
                    className="btn btn--control"
                    onClick={() => setIsRunning(!isRunning)}
                >
                    <FontAwesomeIcon icon={isRunning ? faPause : faPlay} />{" "}
                    {isRunning ? "Pause" : "Start"}
                </button>
                <button
                    className="btn btn--control"
                    onClick={() => setLevel(level + 1)}
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
                    players={preset.players || []}
                    payoutDistribution={preset.payoutDistribution || []}
                    buyIn={preset.buyIn || 0}
                    onClose={() => setShowEndModal(false)}
                />
            )}

        </div>
    );
}
