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
import useToastStore from "@/stores/useToastStore.js";

export default function GameDetailsPage() {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [invites, setInvites] = useState({ friends: [], guests: [] });
  const [inviteCode, setInviteCode] = useState(null);
  const [copied, setCopied] = useState(false);
  const [notFound, setNotFound] = useState(false);
  // Incrémenté après des invitations : recharge le détail (liste des joueurs)
  const [refreshKey, setRefreshKey] = useState(0);
  const { showToast } = useToastStore();
  const user = useAuthStore((state) => state.user);
  const isReady = useAuthStore((state) => state.isReady);
  const router = useRouter();

  useEffect(() => {
    if (isReady && !user) router.replace('/');
  }, [isReady, user, router]);

  useEffect(() => {
    (async () => {
      const data = await gameService.getById(id);
      if (!data?.game) {
        setNotFound(true);
        return;
      }
      setGame(data.game);
      setInviteCode(data.game.inviteCode || null);
    })();
  }, [id]);

  if (notFound) {
    return (
      <>
        <h1>Game not found</h1>
        <p>This game doesn&apos;t exist anymore or couldn&apos;t be loaded.</p>
        <Link href="/games" className="btn">Back to my games</Link>
      </>
    );
  }
  if (!game || !isReady) return <p>Loading...</p>;
  if (!user) return null;

  const handleInviteConfirm = async () => {
    const failed = [];
    for (const f of invites.friends) {
      const res = await gameInviteService.invite(id, { userId: f.id });
      if (!res.success) failed.push(`${f.name}: ${res.errorMessage[0]}`);
    }
    for (const g of invites.guests) {
      const res = await gameInviteService.invite(id, { guestName: g });
      if (!res.success) failed.push(`${g}: ${res.errorMessage[0]}`);
    }
    setShowInviteModal(false);
    setInvites({ friends: [], guests: [] });

    if (failed.length) showToast(failed.length === 1 ? failed[0] : `${failed.length} invites failed (${failed[0]})`);
    else showToast("Invitations sent", "success");

    // Recharge la partie : les nouveaux invités apparaissent dans la liste
    const data = await gameService.getById(id);
    if (data?.game) setGame(data.game);
    setRefreshKey((k) => k + 1);
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
    // Partie close sans résultats (ancien passage auto après 24 h) : l'hôte peut encore les saisir
    const canSubmitResults = user.id === game.host.id && (game.results?.length ?? 0) === 0;
    return (
      <PreviousGameDetails
        actions={canSubmitResults && (
          <div className="btn__container">
            <div className="btn btn--edit" onClick={() => router.push(`/manager/preset?gameId=${game.id}`)}>
              <FontAwesomeIcon icon={faDice} /> Submit results
            </div>
          </div>
        )}
      />
    );
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
          <UpcomingGamesDetails key={refreshKey} />
          {showInviteModal && (
            <GameInvite
              invites={invites}
              setInvites={setInvites}
              onClose={() => setShowInviteModal(false)}
              onConfirm={handleInviteConfirm}
              invitedIds={game.playerLinks.map((p) => p.userId).filter(Boolean)}
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
