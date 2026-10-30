import Link from "next/link.js";
import { getT } from "@/i18n/server.js";

const MESSAGES = {
  en: {
    title: "Learn Poker",
    intro: "Whether you're a complete beginner or looking to sharpen your game, explore the guides below.",
    handsTitle: "Hand Rankings",
    handsText: "Learn the 10 poker hands, from Royal Flush down to High Card.",
    rulesTitle: "Rules & Gameplay",
    rulesText: "How a hand plays out, blinds, betting rounds, and winning conditions.",
    strategyTitle: "Strategy Guide",
    strategyText: "Starting hands, position, pot odds, and how to read your opponents.",
    termsTitle: "Poker Glossary",
    termsText: "An A–Z reference of poker terms and slang for every situation.",
  },
  fr: {
    title: "Apprendre le poker",
    intro: "Que tu débutes ou que tu veuilles affiner ton jeu, explore les guides ci-dessous.",
    handsTitle: "Classement des mains",
    handsText: "Découvre les 10 mains du poker, de la quinte flush royale à la carte haute.",
    rulesTitle: "Règles et déroulement",
    rulesText: "Le déroulement d'une main, les blinds, les tours de mise et comment gagner.",
    strategyTitle: "Guide de stratégie",
    strategyText: "Mains de départ, position, cotes du pot et lecture de tes adversaires.",
    termsTitle: "Glossaire du poker",
    termsText: "Un lexique de A à Z des termes et de l'argot du poker pour toutes les situations.",
  },
};

export default async function LearnPage() {
  const { t } = await getT(MESSAGES);
  return (
    <section className="learn-hub">
      <h1>{t("title")}</h1>
      <div className="divider"></div>
      <p className="learn-hub__intro">{t("intro")}</p>
      <div className="learn-hub__grid">
        <Link href="/learn/hands" className="learn-hub__card">
          <h2>{t("handsTitle")}</h2>
          <p>{t("handsText")}</p>
        </Link>
        <Link href="/learn/rules" className="learn-hub__card">
          <h2>{t("rulesTitle")}</h2>
          <p>{t("rulesText")}</p>
        </Link>
        <Link href="/learn/strategy" className="learn-hub__card">
          <h2>{t("strategyTitle")}</h2>
          <p>{t("strategyText")}</p>
        </Link>
        <Link href="/learn/terms" className="learn-hub__card">
          <h2>{t("termsTitle")}</h2>
          <p>{t("termsText")}</p>
        </Link>
      </div>
    </section>
  );
}
