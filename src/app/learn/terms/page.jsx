import { getTerms } from "./terms.data.js";
import GlossarySearch from "./glossary-search.jsx";
import { getT } from "@/i18n/server.js";

const MESSAGES = {
  en: {
    title: "Poker Glossary",
    intro1: "It seems there's a poker slang term for everything that could possibly happen in a game, but don't worry – our definitive guide to poker terminology is here to help you make sense of it all!",
    intro2: "You can use this page as a reference to look up any poker phrases you come across that you're unfamiliar with, or why not learn some new poker lingo to break out at your next home game?",
  },
  fr: {
    title: "Glossaire du poker",
    intro1: "Il semble y avoir un terme d'argot pour tout ce qui peut arriver pendant une partie, mais pas de panique – notre guide de référence du vocabulaire du poker est là pour t'aider à t'y retrouver !",
    intro2: "Utilise cette page pour chercher les expressions de poker que tu ne connais pas, ou pourquoi ne pas apprendre un nouveau jargon à sortir à ta prochaine soirée entre amis ?",
  },
};

// Composant serveur : intro et liste complète présentes dans le HTML (lisibles sans JS),
// la recherche filtre ensuite côté client.
export default async function LearnTermsPage() {
  const { t, locale } = await getT(MESSAGES);
  return (
    <section className="learn-page">
      <h1>{t("title")}</h1>
      <div className="divider"></div>

      {/* Recherche en premier (visible sans défiler sur téléphone) ; l'intro s'efface pendant
          une recherche pour que les résultats suivent directement la barre.
          Clé sur l'<article> : sans elle, React 19 (dev) signale à tort une "liste sans clé"
          pour un élément créé côté serveur puis placé parmi les enfants d'un composant client. */}
      <GlossarySearch
        terms={getTerms(locale)}
        intro={
          <article key="glossary-intro">
            <p>{t("intro1")}</p>
            <p>{t("intro2")}</p>
          </article>
        }
      />
    </section>
  );
}
