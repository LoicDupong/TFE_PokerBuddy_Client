"use client";

import { useState } from "react";
import { faXmark, faUserPlus, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import userService from "@/services/user.service.js";
import friendService from "@/services/friend.service.js";

export default function FriendInvite({ onClose }) {
    const [username, setUsername] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    // 🔍 Cherche un user par username
    const searchUser = async () => {
        if (!username.trim()) return;
        setLoading(true);

        const users = await userService.searchByUsername(username);
        setResults(users);
        setLoading(false);
    };

    console.log("results", results);
    


    // ➕ Envoie une demande d’ami
    const addFriend = async (friendId) => {
        const res = await friendService.sendRequest(friendId);
        if (res.success) {
            alert("Friend request sent!");
            setResults(results.filter((u) => u.id !== friendId)); // retire de la liste
        } else {
            alert(res.errorMessage[0]);
        }
    };

    return (
        <div className="modal">
            <div className="modal__overlay" onClick={onClose}></div>
            <div className="modal__content">
                <button className="modal__close" onClick={onClose}>
                    <FontAwesomeIcon icon={faXmark} />
                </button>

                <h2 className="modal__title">Add a Friend</h2>

                {/* 🔹 Input recherche */}
                <div className="form__row">
                    <label htmlFor="username">Search by username</label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter username"
                    />
                    <button className="btn btn--primary" onClick={searchUser}>
                        Search
                    </button>
                </div>

                {/* 🔹 Résultats */}
                <div className="section section__results">
                    {loading && <p>Searching...</p>}
                    {!loading && results.length === 0 && (
                        <p>No users found. Try another username.</p>
                    )}
                    {results.map((u) => (
                        <div key={u.id} className="card card--invite-friend">
                            <div className="card__body">
                                <div className="user__avatar user--friend__avatar">
                                    {u.avatar ? (
                                        <img src={u.avatar} alt={u.username} />
                                    ) : (
                                        <FontAwesomeIcon
                                            icon={faUser}
                                            size="xl"
                                            className="icon--avatar"
                                        />
                                    )}
                                </div>
                                <div className="user__infos">
                                    <h2 className="title title--friend">{u.username}</h2>
                                </div>
                            </div>
                            <button
                                className="btn btn--small btn--primary"
                                onClick={() => addFriend(u.id)}
                            >
                                <FontAwesomeIcon icon={faUserPlus} /> Add
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
