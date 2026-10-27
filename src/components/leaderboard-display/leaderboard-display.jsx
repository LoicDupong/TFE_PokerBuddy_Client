"use client";

import leaderboardService from "@/services/leaderboard.service.js";
import Link from "next/link.js";
import { useEffect, useState } from "react";
import useAuthStore from "@/stores/useAuthStore";

export default function LeaderboardDisplay({ compact = false }) {
    const limit = compact ? 3 : 10;
    const currentUser = useAuthStore((state) => state.user);
    const [players, setPlayers] = useState([]);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        leaderboardService.getLeaderboard(page, limit).then((data) => {
            if (data) {
                setPlayers(data.players);
                setPages(data.pages);
            }
            setLoading(false);
        });
    }, [page, limit]);

    // "No friends" s'affichait pendant le chargement
    if (loading) return <p>Loading leaderboard...</p>;
    if (players.length === 0) return <p>No friends with stats yet.</p>;

    return (
        <div>
            <div className={`leaderboard__table${compact ? "" : " leaderboard__table--full"}`}>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Player</th>
                            <th className="col--secondary">Wins</th>
                            <th>Winrate</th>
                            {!compact && <th className="col--secondary">Games</th>}
                            {!compact && <th className="col--secondary">Avg Place</th>}
                            <th>Net</th>
                        </tr>
                    </thead>
                    <tbody>
                        {players.map((p) => (
                            <tr key={p.id} className={p.id === currentUser?.id ? "leaderboard__row--me" : undefined}>
                                <td>{p.rank}</td>
                                <td>
                                    <Link href={`/profile/${p.id}`} className={`leaderboard__player-link${p.rank === 1 ? " red" : ""}`}>
                                        {p.username}
                                    </Link>
                                    {p.id === currentUser?.id && <span className="leaderboard__you">You</span>}
                                </td>
                                <td className="col--secondary">{p.wins}</td>
                                <td>{p.winRate}%</td>
                                {!compact && <td className="col--secondary">{p.totalGames}</td>}
                                {!compact && <td className="col--secondary">{p.avgPlacement ?? "—"}</td>}
                                <td>{p.netResult >= 0 ? `+${p.netResult}` : p.netResult}€</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {compact && (
                <Link href="/leaderboard" className="btn btn--full">
                    View full leaderboard
                </Link>
            )}
            {!compact && pages > 1 && (
                <div className="pagination">
                    <button className="btn btn--small" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                    <span>{page} / {pages}</span>
                    <button className="btn btn--small" disabled={page === pages} onClick={() => setPage(p => p + 1)}>Next →</button>
                </div>
            )}
        </div>
    );
}
