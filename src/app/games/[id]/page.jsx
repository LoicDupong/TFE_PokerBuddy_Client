"use client";

import ActiveGameDetails from "@/components/active-game-display/active-game-details.jsx";
import PreviousGameDetails from "@/components/previous-games-display/previous-games-details.jsx";
import UpcomingGamesDetails from "@/components/upcoming-games-display/upcoming-games-details.jsx";
import gameService from "@/services/game.service.js";
import useAuthStore from "@/stores/useAuthStore.js";
import { faPenToSquare, faUserPlus, faGears, faDice, faLink, faCopy, faRotateRight, faLinkSlash, faShareNodes, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link.js";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import GameInvite from "@/features/invite/game-invite.jsx";
import gameInviteService from "@/services/gameInvite.service.js";
import useToastStore from "@/stores/useToastStore.js";
import { isSameLocalDay } from "@/utils/date.utils.js";

export default function GameDetailsPage() {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [invites, setInvites] = useState({ friends: [], guests: [] });
  const [inviteCode, setInviteCode] = useState(null);
  const [copied, setCopied] = useState(false);
  // Action en attente de confirmation dans le bloc lien : "regenerate" | "disable" | null
  const [confirming, setConfirming] = useState(null);
  const [notFound, setNotFound] = useState(false);
  // Annulation de la partie : confirmation en ligne (pas de window.confirm)
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
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
        <Link href="/games" className="btn btn--secondary">Back to my games</Link>
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

  const handleConfirm = async () => {
    const action = confirming;
    setConfirming(null);
    if (action === "regenerate") await handleGenerateCode();
    else await handleDisableCode();
  };

  // Partage natif (WhatsApp, etc.) quand dispo, sinon copie du lien
  const handleShare = async () => {
    const url = `${window.location.origin}/join/${inviteCode}`;
    if (navigator.share) {
      try {
        await navigator.share({ text: `Join my poker night "${game.name}" on PokerBuddy: ${url}` });
      } catch { /* partage annulé par l'utilisateur */ }
      return;
    }
    handleCopyLink();
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
          {confirming ? (
            <div className="invite-link__confirm" role="alert">
              <p>
                {confirming === "regenerate"
                  ? "Regenerate the link? The current link will stop working."
                  : "Disable the link? Nobody will be able to join with it."}
              </p>
              <div className="invite-link__actions">
                <button type="button" className="btn btn--small btn--danger" onClick={handleConfirm}>
                  {confirming === "regenerate" ? "Yes, regenerate" : "Yes, disable"}
                </button>
                <button type="button" className="btn btn--small" onClick={() => setConfirming(null)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className="invite-link__actions">
              <button type="button" className="btn btn--small" onClick={handleShare}>
                <FontAwesomeIcon icon={faShareNodes} /> Share
              </button>
              <button type="button" className="btn btn--small" onClick={handleCopyLink}>
                <FontAwesomeIcon icon={faCopy} /> {copied ? "Copied!" : "Copy"}
              </button>
              <button type="button" className="btn btn--small" onClick={() => setConfirming("regenerate")}>
                <FontAwesomeIcon icon={faRotateRight} /> Regenerate
              </button>
              <button type="button" className="btn btn--small btn--danger" onClick={() => setConfirming("disable")}>
                <FontAwesomeIcon icon={faLinkSlash} /> Disable
              </button>
            </div>
          )}
        </>
      ) : (
        <button type="button" className="btn btn--small" onClick={handleGenerateCode}>
          <FontAwesomeIcon icon={faLink} /> Generate join link
        </button>
      )}
    </div>
  );

  const isHost = user.id === game.host.id;
  // Jour de partie (ou déjà démarrée) : le Game Manager devient l'action principale de l'hôte
  const gameDay = game.status === "active" || isSameLocalDay(game.dateStart) || new Date(game.dateStart) <= new Date();

  const handleCancelGame = async () => {
    if (cancelling) return;
    setCancelling(true);
    const res = await gameService.delete(id);
    setCancelling(false);
    if (!res.success) {
      showToast(res.errorMessage?.[0] || "Could not cancel the game, please try again.");
      return;
    }
    showToast(`Game "${game.name}" cancelled`, "success", 5000);
    router.push("/games");
  };

  // Actions de l'hôte sous les informations : une seule action pleine (rouge), le reste en secondaire
  const HostActions = () => (
    <>
      <div className="game-actions">
        {gameDay ? (
          <Link href={`/manager/preset?gameId=${game.id}`} className="btn"><FontAwesomeIcon icon={faGears} /> Start Game Manager</Link>
        ) : (
          <button type="button" className="btn" onClick={() => setShowInviteModal(true)}><FontAwesomeIcon icon={faUserPlus} /> Invite friends</button>
        )}
        <Link href={`/games/${id}/edit`} className="btn btn--secondary"><FontAwesomeIcon icon={faPenToSquare} /> Edit</Link>
        {gameDay && game.status === "pending" && (
          <button type="button" className="btn btn--secondary" onClick={() => setShowInviteModal(true)}><FontAwesomeIcon icon={faUserPlus} /> Invite friends</button>
        )}
      </div>
      {game.status === "pending" && ShareLink()}
      <div className="game-actions game-actions__danger">
        {confirmCancel ? (
          <div className="game-actions__confirm" role="alert">
            <p>Cancel this game? It will be deleted for all invited players. This cannot be undone.</p>
            <div className="game-actions">
              <button type="button" className="btn btn--danger" disabled={cancelling} onClick={handleCancelGame}>Yes, cancel game</button>
              <button type="button" className="btn btn--secondary" onClick={() => setConfirmCancel(false)}>Keep game</button>
            </div>
          </div>
        ) : (
          <button type="button" className="btn btn--danger" onClick={() => setConfirmCancel(true)}><FontAwesomeIcon icon={faTrash} /> Cancel game</button>
        )}
      </div>
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

  // Même en-tête pour l'hôte et les invités ; les informations d'abord, les actions ensuite
  if (game.status === "finished") {
    // Partie close sans résultats (ancien passage auto après 24 h) : l'hôte peut encore les saisir
    const canSubmitResults = isHost && (game.results?.length ?? 0) === 0;
    return (
      <>
        <h1>Game details</h1>
        <PreviousGameDetails
          actions={canSubmitResults && (
            <div className="game-actions">
              <Link href={`/manager/preset?gameId=${game.id}`} className="btn"><FontAwesomeIcon icon={faDice} /> Submit results</Link>
            </div>
          )}
        />
      </>
    );
  }

  if (game.status === "pending" || game.status === "active") {
    const Details = game.status === "active" ? ActiveGameDetails : UpcomingGamesDetails;
    return (
      <>
        <h1>Game details</h1>
        <Details key={refreshKey} />
        {isHost && HostActions()}
      </>
    );
  }
}
