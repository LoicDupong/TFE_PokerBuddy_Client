"use client";

import leaderboardService from "@/services/leaderboard.service.js";
import Link from "next/link.js";
import { useEffect, useState } from "react";

export default function LeaderboardDisplay({ compact = false }) {
    const limit = compact ? 3 : 10;
    const [players, setPlayers] = useState([]);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);

    useEffect(() => {
        leaderboardService.getLeaderboard(page, limit).then((data) => {
            if (data) {
                setPlayers(data.players);
                setPages(data.pages);
            }
        });
    }, [page]);

    if (players.length === 0) return <p>No friends with stats yet.</p>;

    return (
        <div>
            <div className={`leaderboard__table${compact ? "" : " leaderboard__table--full"}`}>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Player</th>
                            <th>Wins</th>
                            <th>Winrate</th>
                            {!compact && <th>Games</th>}
                            {!compact && <th>Avg Place</th>}
                            <th>Net</th>
                        </tr>
                    </thead>
                    <tbody>
                        {players.map((p) => (
                            <tr key={p.id}>
                                <td>{p.rank}</td>
                                <td>
                                    <Link href={`/profile/${p.id}`} className={`leaderboard__player-link${p.rank === 1 ? " red" : ""}`}>
                                        {p.username}
                                    </Link>
                                </td>
                                <td>{p.wins}</td>
                                <td>{p.winRate}%</td>
                                {!compact && <td>{p.totalGames}</td>}
                                {!compact && <td>{p.avgPlacement ?? "—"}</td>}
                                <td>{p.netResult >= 0 ? `+${p.netResult}` : p.netResult}€</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {compact && (
                <Link href="/leaderboard">
                    <div className="btn btn--full">View full leaderboard</div>
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
