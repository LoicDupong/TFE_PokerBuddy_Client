"use client";

import ActiveGameDetails from "@/components/active-game-display/active-game-details.jsx";
import PreviousGameDetails from "@/components/previous-games-display/previous-games-details.jsx";
import UpcomingGamesDetails from "@/components/upcoming-games-display/upcoming-games-details.jsx";
import gameService from "@/services/game.service.js";
import useAuthStore from "@/stores/useAuthStore.js";
import { faPenToSquare, faUserPlus, faGears, faDice, faLink, faCopy, faRotateRight, faLinkSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link.js";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import GameInvite from "@/features/invite/game-invite.jsx";
import gameInviteService from "@/services/gameInvite.service.js";

export default function GameDetailsPage() {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [invites, setInvites] = useState({ friends: [], guests: [] });
  const [inviteCode, setInviteCode] = useState(null);
  const [copied, setCopied] = useState(false);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) router.replace('/');
  }, [user]);

  useEffect(() => {
    (async () => {
      const data = await gameService.getById(id);
      setGame(data.game);
      setInviteCode(data.game?.inviteCode || null);
    })();
  }, [id]);

  if (!game) return <p>Loading...</p>;
  if (!user) return null;

  const handleInviteConfirm = async () => {
    for (const f of invites.friends) {
      await gameInviteService.invite(id, { userId: f.id });
    }
    for (const g of invites.guests) {
      await gameInviteService.invite(id, { guestName: g });
    }
    setShowInviteModal(false);
    setInvites({ friends: [], guests: [] });
  };

  const handleGenerateCode = async () => {
    const res = await gameService.generateInviteCode(id);
    if (res.success) setInviteCode(res.inviteCode);
  };

  const handleDisableCode = async () => {
    await gameService.disableInviteCode(id);
    setInviteCode(null);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/join/${inviteCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const ShareLink = () => (
    <div className="invite-link">
      <h3><FontAwesomeIcon icon={faLink} className="fa-icon" /> Join link</h3>
      {inviteCode ? (
        <>
          <input
            readOnly
            value={`${typeof window !== "undefined" ? window.location.origin : ""}/join/${inviteCode}`}
            className="invite-link__url"
            onClick={(e) => e.target.select()}
          />
          <div className="btn__container" style={{ marginTop: "0.5rem" }}>
            <div className="btn btn--small" onClick={handleCopyLink}>
              <FontAwesomeIcon icon={faCopy} /> {copied ? "Copied!" : "Copy"}
            </div>
            <div className="btn btn--small" onClick={handleGenerateCode}>
              <FontAwesomeIcon icon={faRotateRight} /> Regenerate
            </div>
            <div className="btn btn--small btn--danger" onClick={handleDisableCode}>
              <FontAwesomeIcon icon={faLinkSlash} /> Disable
            </div>
          </div>
        </>
      ) : (
        <div className="btn btn--small" onClick={handleGenerateCode}>
          <FontAwesomeIcon icon={faLink} /> Generate join link
        </div>
      )}
    </div>
  );

  if (game.status === "finished") {
    return <PreviousGameDetails />;
  }

  if (game.status === "pending") {
    if (user.id === game.host.id) {
      return (
        <>
          <h1>Game Details</h1>
          <div className="divider"></div>
          <div className="btn__container">
            <Link href={`/games/${id}/edit`}>
              <div className="btn btn--edit">
                <FontAwesomeIcon icon={faPenToSquare} /> Edit
              </div>
            </Link>
            <div className="btn btn--edit btn--invite" onClick={() => setShowInviteModal(true)}>
              <FontAwesomeIcon icon={faUserPlus} /> Invite
            </div>
            <div className="btn btn--edit" onClick={() => router.push(`/manager/preset?gameId=${game.id}`)}>
              <FontAwesomeIcon icon={faDice} /> Manager
            </div>
          </div>
          <ShareLink />
          <UpcomingGamesDetails />
          {showInviteModal && (
            <GameInvite
              invites={invites}
              setInvites={setInvites}
              onClose={() => setShowInviteModal(false)}
              onConfirm={handleInviteConfirm}
            />
          )}
        </>
      );
    }
    return <UpcomingGamesDetails />;
  }

  if (game.status === "active") {
    if (user.id === game.host.id) {
      const handleGameManager = () => {
        router.push(`/manager/preset?gameId=${game.id}`);
      };

      return (
        <>
          <h1>Game Details</h1>
          <div className="divider"></div>
          <div className="btn__container">
            <div className="btn btn--edit" onClick={handleGameManager}>
              <FontAwesomeIcon icon={faGears} /> Game Manager
            </div>
            <Link href={`/games/${id}/edit`}>
              <div className="btn btn--edit">
                <FontAwesomeIcon icon={faPenToSquare} /> Edit Game
              </div>
            </Link>
          </div>
          <ActiveGameDetails />
        </>
      );
    }
    return <ActiveGameDetails />;
  }
}
