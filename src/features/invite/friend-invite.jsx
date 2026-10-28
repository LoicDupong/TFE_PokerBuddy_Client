"use client";

import { useState } from "react";
import { faXmark, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import userService from "@/services/user.service.js";
import friendService from "@/services/friend.service.js";
import useToastStore from "@/stores/useToastStore.js";
import FriendCard from "@/components/friend-card/friend-card.jsx";

export default function FriendInvite({ onClose, friends = [] }) {
    const [username, setUsername] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [sentIds, setSentIds] = useState(new Set());
    const { showToast } = useToastStore();

    // 🔍 Cherche un user par username (bouton ou touche Entrée)
    const searchUser = async (e) => {
        e?.preventDefault();
        if (!username.trim()) return;
        setLoading(true);

        const users = await userService.searchByUsername(username);
        setResults(users || []);
        setSearched(true);
        setLoading(false);
    };



    // ➕ Envoie une demande d’ami
    const addFriend = async (friendId) => {
        const res = await friendService.sendRequest(friendId);
        if (res.success) {
            setSentIds(prev => new Set([...prev, friendId]));
        } else {
            showToast(res.errorMessage?.[0] || "Friend request failed");
        }
    };

    return (
        <div className="modal">
            <div className="modal__overlay" onClick={onClose}></div>
            <div className="modal__content">
                <button type="button" className="modal__close" onClick={onClose} aria-label="Close">
                    <FontAwesomeIcon icon={faXmark} />
                </button>

                <h2 className="modal__title">Add a Friend</h2>

                {/* 🔹 Input recherche */}
                <form className="form__row" role="search" onSubmit={searchUser}>
                    <label htmlFor="username">Search by username</label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter username"
                        autoComplete="off"
                        enterKeyHint="search"
                    />
                    <button type="submit" className="btn btn--primary">
                        Search
                    </button>
                </form>

                {/* 🔹 Résultats */}
                <div className="section section__results">
                    {loading && <p>Searching...</p>}
                    {/* Message affiché seulement après une recherche (et plus à l'ouverture de la modale) */}
                    {!loading && searched && results.length === 0 && (
                        <p>No users found. Try another username.</p>
                    )}
                    {results.length > 0 && (
                        <ul className="friend-grid friend-grid--rows">
                            {results.map((u) => (
                                <li key={u.id}>
                                    <FriendCard
                                        user={u}
                                        layout="row"
                                        actions={
                                            friends.some(f => f.id === u.id) ? (
                                                <button type="button" className="btn btn--small" disabled>
                                                    Friend
                                                </button>
                                            ) : sentIds.has(u.id) ? (
                                                <button type="button" className="btn btn--small" disabled>
                                                    Request Sent
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="btn btn--small btn--primary"
                                                    aria-label={`Add ${u.username} as a friend`}
                                                    onClick={() => addFriend(u.id)}
                                                >
                                                    <FontAwesomeIcon icon={faUserPlus} /> Add
                                                </button>
                                            )
                                        }
                                    />
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
