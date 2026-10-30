import { useT } from "@/i18n/i18n-provider.jsx";

// Textes partagés par les écrans généraux (accueil, notifications, listes de parties, join)
const MESSAGES = {
    en: {
        accepted: 'Accepted "{name}"',
        refused: 'Refused "{name}"',
        status: { pending: "Upcoming", active: "Live", finished: "Finished" },
    },
    fr: {
        accepted: "Tu as accepté « {name} »",
        refused: "Tu as refusé « {name} »",
        status: { pending: "À venir", active: "En cours", finished: "Terminée" },
    },
};

// const inviteToast = useInviteResponseToast() ; showToast(...inviteToast("accepted", game.name))
export function useInviteResponseToast() {
    const { t } = useT(MESSAGES);
    return (action, gameName) => action === "accepted"
        ? [`✅ ${t("accepted", { name: gameName })}`, "success", 5000]
        : [t("refused", { name: gameName }), "info", 5000];
}

export function useGameStatusLabel() {
    const { t } = useT(MESSAGES);
    return (status) => (MESSAGES.en.status[status] ? t(`status.${status}`) : status);
}
