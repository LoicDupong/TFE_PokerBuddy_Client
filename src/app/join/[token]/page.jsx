"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import useAuthStore from "@/stores/useAuthStore";
import joinService from "@/services/join.service";

export default function JoinPage() {
    const { token } = useParams();
    const userId = useAuthStore((state) => state.user?.id);
    const isReady = useAuthStore((state) => state.isReady);
    const router = useRouter();
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    // Évite un double POST (StrictMode en dev, user rafraîchi par /auth/me)
    const hasJoined = useRef(false);

    useEffect(() => {
        if (!isReady) return;

        if (!userId) {
            router.replace(`/auth/login?redirect=${encodeURIComponent(`/join/${token}`)}`);
            return;
        }

        if (hasJoined.current) return;
        hasJoined.current = true;

        (async () => {
            const res = await joinService.joinByToken(token);
            if (res.success) setResult(res.data);
            else setError(res.error);
        })();
    }, [isReady, userId, token, router]);

    if (!isReady || !userId) return null;

    if (!result && !error) return <p>Joining game…</p>;

    if (error) {
        return (
            <section className="card">
                <div className="card__header">
                    <h2 className="title title--card">Unable to join</h2>
                </div>
                <div className="card__body">
                    <p>{error}</p>
                    <Link href="/" className="btn btn--primary" style={{ marginTop: "1rem", display: "inline-block" }}>
                        Go home
                    </Link>
                </div>
            </section>
        );
    }

    const message = {
        joined: "You've joined the game!",
        accepted: "You're confirmed for this game.",
        already_accepted: "You're already in this game.",
    }[result.status] ?? "Done!";

    return (
        <section className="card">
            <div className="card__header">
                <h2 className="title title--card">{message}</h2>
                <h4 className="subtitle subtitle--card">{result.gameName}</h4>
            </div>
            <div className="card__body">
                <Link href={`/games/${result.gameId}`} className="btn btn--primary" style={{ display: "inline-block" }}>
                    View game
                </Link>
            </div>
        </section>
    );
}
