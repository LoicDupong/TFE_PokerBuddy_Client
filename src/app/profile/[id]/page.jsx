"use client";

import { faUser, faUserMinus, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import userService from "@/services/user.service.js";
import friendService from "@/services/friend.service.js";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/useAuthStore.js";

export default function ProfileByIdPage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);

  const [message, setMessage] = useState("");
  const [friendStatus, setFriendStatus] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [removing, setRemoving] = useState(false);

  const currentUser = useAuthStore((state) => state.user)

  useEffect(() => {
    (async () => {
      const data = await userService.getUserById(id);
      if (data) setUser(data.user);

      const friendData = await friendService.getFriends();
      if (friendData?.friends) {
        const isFriend = friendData.friends.some(
          (f) => f.User?.id === id || f.FriendUser?.id === id
        );
        if (isFriend) setFriendStatus("friends");
      }
    })();
  }, [id]);

  if (!user) return <p>Loading...</p>;


  // si la page by Id == l'id du user actuellement connecté => redirect
  if (id === currentUser.id) {
    router.push('/profile');
  }


  async function handleAddFriend() {
    try {
      const res = await friendService.sendRequest(id);
      if (res.success) {
        setMessage("✅ Friend request sent !");
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
      setFriendStatus(null);
      setShowConfirmModal(false);
    } else {
      alert(res.errorMessage?.[0] || "Could not remove friend.");
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
                ? <img src={`http://localhost:8080${user.avatar}`} alt="User avatar" />
                : <FontAwesomeIcon icon={faUser} size="xl" className="icon--avatar" />
              }
            </div>
            <div className="user__infos">
              <h2 className="title title--user red">{user.username}</h2>
              <p className="subtitle subtitle--email">{user.email}</p>
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
