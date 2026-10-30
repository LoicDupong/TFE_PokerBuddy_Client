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
import { COMMON } from "@/i18n/common.js";
import { useT } from "@/i18n/i18n-provider.jsx";

const MESSAGES = {
  en: {
    ...COMMON.en,
    notFoundTitle: "Game not found",
    notFoundText: "This game doesn't exist anymore or couldn't be loaded.",
    backToGames: "Back to my games",
    inviteFailedMany: (p) => `${p.count} invites failed (${p.first})`,
    invitesSent: "Invitations sent",
    shareText: (p) => `Join my poker night "${p.name}" on PokerBuddy: ${p.url}`,
    joinLink: "Join link",
    confirmRegenerate: "Regenerate the link? The current link will stop working.",
    confirmDisable: "Disable the link? Nobody will be able to join with it.",
    yesRegenerate: "Yes, regenerate",
    yesDisable: "Yes, disable",
    share: "Share",
    copy: "Copy",
    copied: "Copied!",
    regenerate: "Regenerate",
    disable: "Disable",
    generateLink: "Generate join link",
    cancelFailed: "Could not cancel the game, please try again.",
    cancelled: (p) => `Game "${p.name}" cancelled`,
    startManager: "Start Game Manager",
    inviteFriends: "Invite friends",
    confirmCancelGame: "Cancel this game? It will be deleted for all invited players. This cannot be undone.",
    yesCancelGame: "Yes, cancel game",
    keepGame: "Keep game",
    cancelGame: "Cancel game",
    submitResults: "Submit results",
    gameDetails: "Game details",
  },
  fr: {
    ...COMMON.fr,
    notFoundTitle: "Partie introuvable",
    notFoundText: "Cette partie n'existe plus ou n'a pas pu être chargée.",
    backToGames: "Retour à mes parties",
    inviteFailedMany: (p) => `${p.count} invitations ont échoué (${p.first})`,
    invitesSent: "Invitations envoyées",
    shareText: (p) => `Rejoins ma soirée poker « ${p.name} » sur PokerBuddy : ${p.url}`,
    joinLink: "Lien d'invitation",
    confirmRegenerate: "Régénérer le lien ? L'ancien lien ne fonctionnera plus.",
    confirmDisable: "Désactiver le lien ? Plus personne ne pourra rejoindre la partie avec.",
    yesRegenerate: "Oui, régénérer",
    yesDisable: "Oui, désactiver",
    share: "Partager",
    copy: "Copier",
    copied: "Copié !",
    regenerate: "Régénérer",
    disable: "Désactiver",
    generateLink: "Générer un lien d'invitation",
    cancelFailed: "Impossible d'annuler la partie, réessaie.",
    cancelled: (p) => `Partie « ${p.name} » annulée`,
    startManager: "Lancer le Game Manager",
    inviteFriends: "Inviter des amis",
    confirmCancelGame: "Annuler cette partie ? Elle sera supprimée pour tous les joueurs invités. Cette action est irréversible.",
    yesCancelGame: "Oui, annuler la partie",
    keepGame: "Garder la partie",
    cancelGame: "Annuler la partie",
    submitResults: "Saisir les résultats",
    gameDetails: "Détails de la partie",
  },
};

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
  const { t } = useT(MESSAGES);
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
        <h1>{t("notFoundTitle")}</h1>
        <p>{t("notFoundText")}</p>
        <Link href="/games" className="btn btn--secondary">{t("backToGames")}</Link>
      </>
    );
  }
  if (!game || !isReady) return <p>{t("loading")}</p>;
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

    if (failed.length) showToast(failed.length === 1 ? failed[0] : t("inviteFailedMany", { count: failed.length, first: failed[0] }));
    else showToast(t("invitesSent"), "success");

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
        await navigator.share({ text: t("shareText", { name: game.name, url }) });
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
      <h3><FontAwesomeIcon icon={faLink} className="fa-icon" /> {t("joinLink")}</h3>
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
                  ? t("confirmRegenerate")
                  : t("confirmDisable")}
              </p>
              <div className="invite-link__actions">
                <button type="button" className="btn btn--small btn--danger" onClick={handleConfirm}>
                  {confirming === "regenerate" ? t("yesRegenerate") : t("yesDisable")}
                </button>
                <button type="button" className="btn btn--small" onClick={() => setConfirming(null)}>{t("cancel")}</button>
              </div>
            </div>
          ) : (
            <div className="invite-link__actions">
              <button type="button" className="btn btn--small" onClick={handleShare}>
                <FontAwesomeIcon icon={faShareNodes} /> {t("share")}
              </button>
              <button type="button" className="btn btn--small" onClick={handleCopyLink}>
                <FontAwesomeIcon icon={faCopy} /> {copied ? t("copied") : t("copy")}
              </button>
              <button type="button" className="btn btn--small" onClick={() => setConfirming("regenerate")}>
                <FontAwesomeIcon icon={faRotateRight} /> {t("regenerate")}
              </button>
              <button type="button" className="btn btn--small btn--danger" onClick={() => setConfirming("disable")}>
                <FontAwesomeIcon icon={faLinkSlash} /> {t("disable")}
              </button>
            </div>
          )}
        </>
      ) : (
        <button type="button" className="btn btn--small" onClick={handleGenerateCode}>
          <FontAwesomeIcon icon={faLink} /> {t("generateLink")}
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
      showToast(t("cancelFailed"));
      return;
    }
    showToast(t("cancelled", { name: game.name }), "success", 5000);
    router.push("/games");
  };

  // Actions de l'hôte sous les informations : une seule action pleine (rouge), le reste en secondaire
  const HostActions = () => (
    <>
      <div className="game-actions">
        {gameDay ? (
          <Link href={`/manager/preset?gameId=${game.id}`} className="btn"><FontAwesomeIcon icon={faGears} /> {t("startManager")}</Link>
        ) : (
          <button type="button" className="btn" onClick={() => setShowInviteModal(true)}><FontAwesomeIcon icon={faUserPlus} /> {t("inviteFriends")}</button>
        )}
        <Link href={`/games/${id}/edit`} className="btn btn--secondary"><FontAwesomeIcon icon={faPenToSquare} /> {t("edit")}</Link>
        {gameDay && game.status === "pending" && (
          <button type="button" className="btn btn--secondary" onClick={() => setShowInviteModal(true)}><FontAwesomeIcon icon={faUserPlus} /> {t("inviteFriends")}</button>
        )}
      </div>
      {game.status === "pending" && ShareLink()}
      <div className="game-actions game-actions__danger">
        {confirmCancel ? (
          <div className="game-actions__confirm" role="alert">
            <p>{t("confirmCancelGame")}</p>
            <div className="game-actions">
              <button type="button" className="btn btn--danger" disabled={cancelling} onClick={handleCancelGame}>{t("yesCancelGame")}</button>
              <button type="button" className="btn btn--secondary" onClick={() => setConfirmCancel(false)}>{t("keepGame")}</button>
            </div>
          </div>
        ) : (
          <button type="button" className="btn btn--danger" onClick={() => setConfirmCancel(true)}><FontAwesomeIcon icon={faTrash} /> {t("cancelGame")}</button>
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
        <h1>{t("gameDetails")}</h1>
        <PreviousGameDetails
          actions={canSubmitResults && (
            <div className="game-actions">
              <Link href={`/manager/preset?gameId=${game.id}`} className="btn"><FontAwesomeIcon icon={faDice} /> {t("submitResults")}</Link>
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
        <h1>{t("gameDetails")}</h1>
        <Details key={refreshKey} />
        {isHost && HostActions()}
      </>
    );
  }
}
