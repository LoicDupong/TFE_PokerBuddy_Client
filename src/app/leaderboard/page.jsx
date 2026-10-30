import LeaderboardDisplay from "@/components/leaderboard-display/leaderboard-display.jsx";
import { getT } from "@/i18n/server.js";

const MESSAGES = {
    en: { title: "Poker Buddy | Leaderboard" },
    fr: { title: "Poker Buddy | Classement" },
};

export default async function LeaderboardPage() {
    const { t } = await getT(MESSAGES);
    return (
        <>
            <h1>{t("title")}</h1>
            <LeaderboardDisplay/>
        </>
    );
}
