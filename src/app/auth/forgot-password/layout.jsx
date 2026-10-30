import { getT } from "@/i18n/server.js";

const MESSAGES = {
    en: { title: "Forgot your password? | PokerBuddy" },
    fr: { title: "Mot de passe oublié ? | PokerBuddy" },
};

export async function generateMetadata() {
    const { t } = await getT(MESSAGES);
    return { title: t("title"), robots: { index: false, follow: false } };
}

export default function ForgotPasswordLayout({ children }) {
  return children;
}
