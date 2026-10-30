import { getT } from "@/i18n/server.js";

const MESSAGES = {
    en: { title: "Choose a new password | PokerBuddy" },
    fr: { title: "Choisis un nouveau mot de passe | PokerBuddy" },
};

// La page reçoit le jeton dans son URL : jamais de referrer vers d'autres sites, jamais indexée
export async function generateMetadata() {
    const { t } = await getT(MESSAGES);
    return { title: t("title"), referrer: "no-referrer", robots: { index: false, follow: false } };
}

export default function ResetPasswordLayout({ children }) {
  return children;
}
