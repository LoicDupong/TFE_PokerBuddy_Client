"use client";

import { useEffect, useState } from "react";
import gameResultsService from "@/services/gameResults.service";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faGripLines } from "@fortawesome/free-solid-svg-icons";
import {
    DragDropContext,
    Droppable,
    Draggable,
} from "@hello-pangea/dnd";

export default function EndGameModal({
    gameId,
    players,
    payoutDistribution = [{ place: 1, percent: 100 }], // ex: [{place:1,percent:70},{place:2,percent:20},{place:3,percent:10}]
    buyIn = 0,
    onClose,
}) {
    const [finishedAt, setFinishedAt] = useState(new Date().toISOString());
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const prizePool = buyIn * (players?.length || 0);

    // 🔹 Pré-remplissage des prizes
    useEffect(() => {
        if (!players || players.length === 0) return;

        const prefilled = players.map((p, idx) => {
            const dist = payoutDistribution.find((d) => d.place === idx + 1);
            const percent = dist ? dist.percent : 0;
            return {
                gamePlayerId: p.id,
                name: p.user ? p.user.username : p.name,
                prize: Math.round((prizePool * percent) / 100),
            };
        });

        setResults(prefilled);
    }, [players, payoutDistribution, prizePool]);

    // Gestion drag & drop
    // Gestion drag & drop
    const handleDragEnd = (result) => {
        if (!result.destination) return;
        const reordered = Array.from(results);
        const [moved] = reordered.splice(result.source.index, 1);
        reordered.splice(result.destination.index, 0, moved);

        // 🔹 Recalcul des prizes en fonction du nouveau classement
        const recalculated = reordered.map((player, idx) => {
            const dist = payoutDistribution.find((d) => d.place === idx + 1);
            const percent = dist ? dist.percent : 0;
            return {
                ...player,
                prize: Math.round((prizePool * percent) / 100),
            };
        });

        setResults(recalculated);
    };


    // Modifier un prize manuellement
    const handlePrizeChange = (index, value) => {
        setResults((prev) =>
            prev.map((r, i) => (i === index ? { ...r, prize: Number(value) } : r))
        );
    };

    const totalPrizes = results.reduce((sum, r) => sum + (Number(r.prize) || 0), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const payload = results.map((player, index) => ({
            gamePlayerId: player.gamePlayerId,
            rank: index + 1, // ordre dans la liste = classement
            prize: parseInt(player.prize, 10) || 0,
        }));

        const res = await gameResultsService.createResults(
            gameId,
            payload,
            finishedAt
        );

        if (res.success) {
            onClose();
        } else {
            setError(res.errorMessage);
        }

        setLoading(false);
    };

    return (
        <div className="modal">
            <div className="modal__overlay" onClick={onClose} />
            <div className="modal__content">
                <button onClick={onClose} className="modal__close">
                    <FontAwesomeIcon icon={faTimes} />
                </button>

                <h2 className="modal__title">
                    <span className="red">End</span> Game
                </h2>

                <form onSubmit={handleSubmit} className="modal__form">
                    <label>
                        Finished At:
                        <input
                            type="datetime-local"
                            value={new Date(finishedAt).toISOString().slice(0, 16)}
                            onChange={(e) =>
                                setFinishedAt(new Date(e.target.value).toISOString())
                            }
                        />
                    </label>

                    <p style={{ margin: "1rem 0", fontWeight: "bold" }}>
                        Prize Pool: {prizePool} € — Distributed:{" "}
                        <span
                            style={{
                                color: totalPrizes === prizePool ? "green" : "red",
                            }}
                        >
                            {totalPrizes} €
                        </span>
                    </p>

                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="players">
                            {(provided) => (
                                <div
                                    className="results-list"
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                >
                                    {results.map((player, index) => (
                                        <Draggable
                                            key={player.gamePlayerId}
                                            draggableId={player.gamePlayerId}
                                            index={index}
                                        >
                                            {(provided) => (
                                                <div
                                                    className="results-row"
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                >
                                                    <span
                                                        className="drag-handle"
                                                        {...provided.dragHandleProps}
                                                    >
                                                        <FontAwesomeIcon icon={faGripLines} />
                                                    </span>
                                                    <span className="player-name">
                                                        #{index + 1} - {player.name}
                                                    </span>
                                                    <input
                                                        type="number"
                                                        placeholder="Prize"
                                                        value={player.prize}
                                                        onChange={(e) =>
                                                            handlePrizeChange(
                                                                index,
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>

                    {error && <p className="error">{error}</p>}
                    <button type="submit" disabled={loading} className="btn btn--primary">
                        {loading ? "Saving..." : "Save Results & Finish"}
                    </button>
                </form>
            </div>
        </div>
    );
}
