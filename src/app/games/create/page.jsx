import GameAddForm from "@/features/game/game-add-form.jsx";
import { getT } from "@/i18n/server.js";

const MESSAGES = {
  en: { title: "Create a game", subtitle: "Set up your next home game" },
  fr: { title: "Créer une partie", subtitle: "Prépare ta prochaine soirée poker" },
};

export default async function CreateGamePage() {
  const { t } = await getT(MESSAGES);
  return (
    <>
      <h1 className="title">{t("title")}</h1>
      <h2 className="subtitle">{t("subtitle")}</h2>
      <section className="section section--form">
        <GameAddForm/>
      </section>
    </>
  );
}
