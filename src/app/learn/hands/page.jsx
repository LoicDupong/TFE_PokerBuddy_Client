import Image from "next/image";
import HANDS from "./hands.data.js";
import HandExample from "./hand-example.jsx";
import { getT } from "@/i18n/server.js";

const MESSAGES = {
  en: {
    title: "Poker Hand Rankings",
    chartAlt: "Poker hand rankings chart",
    p1: "From Texas Hold’em to Omaha, Royal Hold’em, Stud and many more, there are more varieties of poker game out there than we can name.",
    p2: "Each may have their own rules, but one thing most of them share is the order of winning poker hands – the hierarchy of which hands beats which others.",
    p3: "This card explains the specifics of all the poker hands you can make in most poker games, as well as which other hands they beat and those to which they’ll lose. If you’re just starting out, we recommend bookmarking this page for easy reference.",
    p4: "Don’t forget that in the case of a tie the pot will usually be awarded to the hand which uses the highest ranking cards. That means a pair of aces beats a pair of kings, that a 9-high straight beats a 6-high straight, queens full beats jacks full, and so on.",
    p5: "If more than one player has the same hand, such as a pair of kings, then the next highest card in their hand – the kicker – will be used to determine the winner. If winning hands are completely identical, they tie and split the pot. Suits are never used to determine a winner.",
    p6: "We’ll start with the best poker hand and work our way down the rankings.",
    legend: "Bright cards make the hand; faded cards are kickers, used only to break ties.",
  },
  fr: {
    title: "Classement des mains de poker",
    chartAlt: "Tableau du classement des mains de poker (en anglais)",
    p1: "Du Texas Hold’em à l’Omaha, en passant par le Royal Hold’em, le Stud et bien d’autres, il existe plus de variantes de poker qu’on ne peut en citer.",
    p2: "Chacune a ses propres règles, mais presque toutes partagent l’ordre des mains gagnantes – la hiérarchie qui dit quelle main bat quelle autre.",
    p3: "Cette fiche détaille toutes les mains que tu peux faire dans la plupart des variantes, ainsi que celles qu’elles battent et celles qui les battent. Si tu débutes, ajoute cette page à tes favoris pour t’y référer facilement.",
    p4: "N’oublie pas qu’en cas d’égalité, le pot revient généralement à la main qui utilise les cartes les plus hautes. Une paire d’as bat donc une paire de rois, une quinte au 9 bat une quinte au 6, un full aux dames par les valets bat un full aux valets par les dames, et ainsi de suite.",
    p5: "Si plusieurs joueurs ont la même main, par exemple une paire de rois, la carte la plus haute suivante de leur main – le kicker – départage les joueurs. Si les mains gagnantes sont strictement identiques, il y a égalité et le pot est partagé. Les couleurs ne servent jamais à départager.",
    p6: "Nous commençons par la meilleure main et descendons dans le classement.",
    legend: "Les cartes vives forment la main ; les cartes estompées sont des kickers, utiles seulement pour départager.",
  },
};

export default async function LearnHandsPage() {
  const { t, locale } = await getT(MESSAGES);
  return (
    <>
      <section className="poker-hands">
        <h1>{t("title")}</h1>
        <div className="divider"></div>
        <div className="img--chart-wrapper">
          <Image src="/poker-hands-chart.avif"
            className="img img--chart"
            alt={t("chartAlt")}
            fill
            priority
            style={{ objectFit: "contain", objectPosition: "left top" }}
          />
        </div>

        <div className="divider"></div>
        <article>
          <p>{t("p1")}</p>
          <p>{t("p2")}</p>
          <p>{t("p3")}</p>
          <p>{t("p4")}</p>
          <p>{t("p5")}</p>
          <p>{t("p6")}</p>
        </article>

        {/* Légende commune aux visuels */}
        <p className="hand-legend">{t("legend")}</p>

        {HANDS.map((hand) => {
          const text = hand[locale];
          return (
            <article key={hand.position} className="hand-rank">
              <div className="hand-rank__header">
                <h2>#{hand.position} – {text.name}</h2>
                <HandExample cards={hand.cards} made={hand.made} label={text.label} />
              </div>
              {text.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </article>
          );
        })}
      </section>
    </>
  );
}
