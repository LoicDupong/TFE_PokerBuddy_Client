"use client";

import leaderboardService from "@/services/leaderboard.service.js";
import Link from "next/link.js";
import { useEffect, useState } from "react";
import useAuthStore from "@/stores/useAuthStore";
import { useGameT } from "@/utils/game-labels.utils.js";
import { useDisplayName } from "@/utils/player-name.utils.js";

export default function LeaderboardDisplay({ compact = false }) {
    const { t, intlLocale } = useGameT();
    const displayName = useDisplayName();
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
    if (loading) return <p>{t("loadingLb")}</p>;
    if (players.length === 0) return <p>{t("noFriendsStats")}</p>;

    return (
        <div>
            <div className={`leaderboard__table${compact ? "" : " leaderboard__table--full"}`}>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>{t("player")}</th>
                            <th className="col--secondary">{t("wins")}</th>
                            <th>{t("winrate")}</th>
                            {!compact && <th className="col--secondary">{t("games")}</th>}
                            {!compact && <th className="col--secondary">{t("avgPlace")}</th>}
                            <th>{t("net")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {players.map((p) => (
                            <tr key={p.id} className={p.id === currentUser?.id ? "leaderboard__row--me" : undefined}>
                                <td>{p.rank}</td>
                                <td>
                                    <Link href={`/profile/${p.id}`} className={`leaderboard__player-link${p.rank === 1 ? " red" : ""}`}>
                                        {displayName(p.username)}
                                    </Link>
                                    {p.id === currentUser?.id && <span className="leaderboard__you">{t("you")}</span>}
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
                    {t("fullLb")}
                </Link>
            )}
            {!compact && pages > 1 && (
                <div className="pagination">
                    <button className="btn btn--small" disabled={page === 1} onClick={() => setPage(p => p - 1)}>{t("prev")}</button>
                    <span>{page} / {pages}</span>
                    <button className="btn btn--small" disabled={page === pages} onClick={() => setPage(p => p + 1)}>{t("next")}</button>
                </div>
            )}
        </div>
    );
}
