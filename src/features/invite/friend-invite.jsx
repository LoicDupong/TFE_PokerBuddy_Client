"use client";

import { useState } from "react";
import { faXmark, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import userService from "@/services/user.service.js";
import friendService from "@/services/friend.service.js";
import useToastStore from "@/stores/useToastStore.js";
import FriendCard from "@/components/friend-card/friend-card.jsx";
import { useT } from "@/i18n/i18n-provider.jsx";
import { PROFILE_MESSAGES } from "@/app/profile/profile.messages.js";
import { useDisplayName } from "@/utils/player-name.utils.js";
import { useServerError } from "@/utils/server-errors.utils.js";

export default function FriendInvite({ onClose, friends = [] }) {
    const { t } = useT(PROFILE_MESSAGES);
    const displayName = useDisplayName();
    const serverError = useServerError();
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
            showToast(serverError(res.errorMessage?.[0]) || t("requestFailed"));
        }
    };

    return (
        <div className="modal">
            <div className="modal__overlay" onClick={onClose}></div>
            <div className="modal__content">
                <button type="button" className="modal__close" onClick={onClose} aria-label={t("close")}>
                    <FontAwesomeIcon icon={faXmark} />
                </button>

                <h2 className="modal__title">{t("addAFriend")}</h2>

                {/* 🔹 Input recherche */}
                <form className="form__row" role="search" onSubmit={searchUser}>
                    <label htmlFor="username">{t("search")}</label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder={t("usernamePh")}
                        autoComplete="off"
                        enterKeyHint="search"
                    />
                    <button type="submit" className="btn btn--primary">
                        {t("searchBtn")}
                    </button>
                </form>

                {/* 🔹 Résultats */}
                <div className="section section__results">
                    {loading && <p>{t("searching")}</p>}
                    {/* Message affiché seulement après une recherche (et plus à l'ouverture de la modale) */}
                    {!loading && searched && results.length === 0 && (
                        <p>{t("noUsers")}</p>
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
                                                    {t("friendBtn")}
                                                </button>
                                            ) : sentIds.has(u.id) ? (
                                                <button type="button" className="btn btn--small" disabled>
                                                    {t("sentBtn")}
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="btn btn--small btn--primary"
                                                    aria-label={t("addAs", { name: displayName(u.username) })}
                                                    onClick={() => addFriend(u.id)}
                                                >
                                                    <FontAwesomeIcon icon={faUserPlus} /> {t("add")}
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
