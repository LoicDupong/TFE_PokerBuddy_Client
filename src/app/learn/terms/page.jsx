import TERMS from "./terms.data.js";
import GlossarySearch from "./glossary-search.jsx";

// Composant serveur : intro et liste complète présentes dans le HTML (lisibles sans JS),
// la recherche filtre ensuite côté client.
export default function LearnTermsPage() {
  return (
    <section className="learn-page">
      <h1>Poker Glossary</h1>
      <div className="divider"></div>

      {/* Recherche en premier (visible sans défiler sur téléphone) ; l'intro s'efface pendant
          une recherche pour que les résultats suivent directement la barre.
          Clé sur l'<article> : sans elle, React 19 (dev) signale à tort une "liste sans clé"
          pour un élément créé côté serveur puis placé parmi les enfants d'un composant client. */}
      <GlossarySearch
        terms={TERMS}
        intro={
          <article key="glossary-intro">
            <p>
              It seems there&apos;s a poker slang term for everything that could possibly happen in a game,
              but don&apos;t worry – our definitive guide to poker terminology is here to help you make sense of it all!
            </p>
            <p>
              You can use this page as a reference to look up any poker phrases you come across that you&apos;re unfamiliar with,
              or why not learn some new poker lingo to break out at your next home game?
            </p>
          </article>
        }
      />
    </section>
  );
}
