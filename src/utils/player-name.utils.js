import { COMMON } from "@/i18n/common.js";
import { useT } from "@/i18n/i18n-provider.jsx";

// Un compte supprimé garde un pseudo technique "deleted_xxxxxxxx" : on ne l'affiche jamais tel quel
const DELETED_NAME = /^deleted_[0-9a-f]{8}$/i;
export const isDeletedPlayerName = (name) => DELETED_NAME.test(String(name || ""));

// const displayName = useDisplayName() ; displayName(user.username) → "Deleted player" / "Joueur supprimé"
export function useDisplayName() {
    const { t } = useT(COMMON);
    return (name) => (isDeletedPlayerName(name) ? t("deletedPlayer") : name);
}
