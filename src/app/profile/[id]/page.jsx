"use client";

import { faUser, faUserMinus, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import userService from "@/services/user.service.js";
import friendService from "@/services/friend.service.js";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/useAuthStore.js";
import useToastStore from "@/stores/useToastStore.js";
import { serverUrl } from "@/utils/media.js";
import { useT } from "@/i18n/i18n-provider.jsx";
import { PROFILE_MESSAGES } from "@/app/profile/profile.messages.js";
import { useDisplayName } from "@/utils/player-name.utils.js";
import { useServerError } from "@/utils/server-errors.utils.js";

export default function ProfileByIdPage() {
  const { t } = useT(PROFILE_MESSAGES);
  const displayName = useDisplayName();
  const serverError = useServerError();
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const [friendStatus, setFriendStatus] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [removing, setRemoving] = useState(false);

  const currentUserId = useAuthStore((state) => state.user?.id);
  const { showToast } = useToastStore();

  // si la page by Id == l'id du user actuellement connecté => redirect
  useEffect(() => {
    if (currentUserId && id === currentUserId) router.replace('/profile');
  }, [id, currentUserId, router]);

  useEffect(() => {
    // Nouveau profil : rien ne doit rester du profil précédent (navigation entre profils)
    setUser(null);
    setNotFound(false);
    setFriendStatus(null);

    (async () => {
      const data = await userService.getUserById(id);
      if (!data?.user) {
        setNotFound(true);
        return;
      }
      setUser(data.user);

      const friendData = await friendService.getFriends();
      if (friendData?.friends) {
        const isFriend = friendData.friends.some(
          (f) => f.User?.id === id || f.FriendUser?.id === id
        );
        if (isFriend) setFriendStatus("friends");
      }
    })();
  }, [id]);

  if (notFound) return <p>{t("notFound")}</p>;
  if (!user) return <p>{t("loading")}</p>;


  // Retour en popup : une ligne sous le bouton passait inaperçue
  async function handleAddFriend() {
    const res = await friendService.sendRequest(id);
    if (res.success) {
      // S'il m'avait déjà envoyé une demande, le serveur l'accepte directement
      if (res.data.invite?.status === "accepted") {
        showToast(`✅ ${t("nowFriends", { name: displayName(user.username) })}`, "success", 5000);
        setFriendStatus("friends");
      } else {
        showToast(`✅ ${t("requestSent")}`, "success", 5000);
        setFriendStatus("sent");
      }
    } else if (/already exists/i.test(res.errorMessage?.[0] ?? "")) {
      showToast(t("alreadySent"), "info", 5000);
      setFriendStatus("sent");
    } else {
      showToast(serverError(res.errorMessage?.[0]) || t("requestFailed"));
    }
  }

  async function handleConfirmRemove() {
    setRemoving(true);
    const res = await friendService.removeFriend(id);
    setRemoving(false);
    if (res.success) {
      router.push('/profile');
    } else {
      showToast(t("removeFailed"));
    }
  }


  return (
    <>
      <h1>
        <span className="red">{displayName(user.username)}</span> {t("profile")}
      </h1>
      <section className="section section__user">
        <div className="cards">
          <div className="card user">
            <div className="user__avatar">
              {user.avatar
                ? <img src={serverUrl(user.avatar)} alt={t("avatarAlt")} />
                : <FontAwesomeIcon icon={faUser} size="xl" className="icon--avatar" />
              }
            </div>
            <div className="user__infos">
              <h2 className="title title--user red">{displayName(user.username)}</h2>
            </div>
            <div className="user__description">
              <p>{user.description || t("noDescription")}</p>
            </div>
            <div className="user__stats">
              <div className="user__stat">
                <h2 className="title title--stat">{user.stats?.totalGames || 0}</h2>
                <p className="subtitle">{t("gamesPlayed")}</p>
              </div>
              <div className="user__stat">
                <h2 className="title title--stat">
                  {user.stats.winRate ? `${user.stats.winRate}%` : "0%"}
                </h2>
                <p className="subtitle">{t("winRate")}</p>
              </div>
            </div>
            {friendStatus === "friends" && (
              <button type="button" className="btn btn--user" onClick={() => setShowConfirmModal(true)}>
                <FontAwesomeIcon icon={faUserMinus} /> {t("removeFriend")}
              </button>
            )}
            {friendStatus !== "sent" && friendStatus !== "friends" && (
              <button type="button" className="btn btn--user" onClick={handleAddFriend}>
                <FontAwesomeIcon icon={faUserPlus} /> {t("addFriend")}
              </button>
            )}
            {friendStatus === "sent" && <p className="gray user__request">{t("requestSentShort")}</p>}
          </div>
        </div>
      </section>

      {showConfirmModal && (
        <div className="modal">
          <div className="modal__overlay" onClick={() => setShowConfirmModal(false)}></div>
          <div className="modal__content">
            <h2>{t("removeTitle")}</h2>
            <p>{t("removeText", { name: "\u0000" }).split("\u0000").flatMap((part, i) => i === 0 ? [part] : [<strong key="n">{displayName(user.username)}</strong>, part])}</p>
            <div className="btn__group">
              <button className="btn btn--primary" onClick={handleConfirmRemove} disabled={removing}>
                {t("confirm")}
              </button>
              <button className="btn" onClick={() => setShowConfirmModal(false)}>
                {t("cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
