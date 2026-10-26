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

export default function ProfileByIdPage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const [message, setMessage] = useState("");
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
    setMessage("");

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

  if (notFound) return <p>User not found.</p>;
  if (!user) return <p>Loading...</p>;


  async function handleAddFriend() {
    try {
      const res = await friendService.sendRequest(id);
      if (res.success) {
        // S'il m'avait déjà envoyé une demande, le serveur l'accepte directement
        if (res.data.invite?.status === "accepted") {
          setMessage("✅ You are now friends!");
          setFriendStatus("friends");
        } else {
          setMessage("✅ Friend request sent !");
          setFriendStatus("sent");
        }
      } else if (/already exists/i.test(res.errorMessage?.[0] ?? "")) {
        setMessage("Friend request already sent.");
        setFriendStatus("sent");
      } else {
        setMessage(`❌ ${res.errorMessage?.[0] || "Friend request failed"}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Error sending friend request");
    }
  }

  async function handleConfirmRemove() {
    setRemoving(true);
    const res = await friendService.removeFriend(id);
    setRemoving(false);
    if (res.success) {
      router.push('/profile');
    } else {
      showToast(res.errorMessage?.[0] || "Could not remove friend.");
    }
  }


  return (
    <>
      <h1>
        <span className="red">{user.username}</span> Profile
      </h1>
      <section className="section section__user">
        <div className="cards">
          <div className="card user">
            <div className="user__avatar">
              {user.avatar
                ? <img src={serverUrl(user.avatar)} alt="User avatar" />
                : <FontAwesomeIcon icon={faUser} size="xl" className="icon--avatar" />
              }
            </div>
            <div className="user__infos">
              <h2 className="title title--user red">{user.username}</h2>
            </div>
            <div className="user__description">
              <p>{user.description || "No description provided."}</p>
            </div>
            <div className="user__stats">
              <div className="user__stat">
                <h2 className="title title--stat">{user.stats?.totalGames || 0}</h2>
                <p className="subtitle">Games Played</p>
              </div>
              <div className="user__stat">
                <h2 className="title title--stat">
                  {user.stats.winRate ? `${user.stats.winRate}%` : "0%"}
                </h2>
                <p className="subtitle">Win Rate</p>
              </div>
            </div>
            {friendStatus === "friends" && (
              <div className="btn btn--user" onClick={() => setShowConfirmModal(true)}>
                <FontAwesomeIcon icon={faUserMinus} /> Remove Friend
              </div>
            )}
            {friendStatus !== "sent" && friendStatus !== "friends" && (
              <div className="btn btn--user" onClick={handleAddFriend}>
                <FontAwesomeIcon icon={faUserPlus} /> Add Friend
              </div>
            )}
            {message && <p>{message}</p>}
          </div>
        </div>
      </section>

      {showConfirmModal && (
        <div className="modal">
          <div className="modal__overlay" onClick={() => setShowConfirmModal(false)}></div>
          <div className="modal__content">
            <h2>Remove friend?</h2>
            <p>Are you sure you want to remove <strong>{user.username}</strong> from your friends?</p>
            <div className="btn__group">
              <button className="btn btn--primary" onClick={handleConfirmRemove} disabled={removing}>
                Confirm
              </button>
              <button className="btn" onClick={() => setShowConfirmModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
