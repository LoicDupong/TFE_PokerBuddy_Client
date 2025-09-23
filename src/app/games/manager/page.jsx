"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPause, faPlay, faForwardStep, faBackwardStep } from "@fortawesome/free-solid-svg-icons";
import usePresetStore from "@/stores/usePresetStore";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

export default function GameManager() {
    const { preset } = usePresetStore();
    const router = useRouter();

    const [level, setLevel] = useState(1);
    const [isRunning, setIsRunning] = useState(false);
    const [timeLeft, setTimeLeft] = useState(preset.levelDurationMin * 60); // en secondes

    const timerRef = useRef(null);

    useEffect(() => {
        if (!preset.title) {
            router.push("/games/manager/preset"); // si pas de preset → retour
        }
    }, [preset, router]);

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

    // reset timer quand le level change
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

    return (
        <div className="manager">
            <header className="manager__header">
                <h1>{preset.title}</h1>
                <p>
                    {preset.location} ·{" "}
                    {preset.dateTime
                        ? new Date(preset.dateTime).toLocaleString("fr-FR")
                        : ""}
                </p>
            </header>

            <section className="manager__info">
                <div className="info__item">
                    <span>Blinds</span>
                    <h2>
                        {preset.smallBlind} / {preset.bigBlind}
                    </h2>
                </div>
                <div className="info__item">
                    <span>Level Duration</span>
                    <h2>{preset.levelDurationMin} min</h2>
                </div>
                <div className="info__item">
                    <span>Buy-in</span>
                    <h2>
                        {preset.buyIn} {preset.currency}
                    </h2>
                </div>
                <div className="info__item">
                    <span>Level</span>
                    <h2>{level}</h2>
                </div>
            </section>

            {/* Timer affichage */}
            <section className="manager__timer">
                <h1>{formatTime(timeLeft)}</h1>
            </section>

            <section className="manager__controls">
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
            </section>
        </div>
    );
}
