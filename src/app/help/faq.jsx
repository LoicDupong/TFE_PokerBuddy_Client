"use client";

import { useT } from "@/i18n/i18n-provider.jsx";
import { HELP_MESSAGES } from "./help.messages.js";

// Questions fréquentes : <details> natif (clavier et lecteurs d'écran gérés par le navigateur)
const FAQ_COUNT = 5;

export default function Faq() {
    const { t } = useT(HELP_MESSAGES);

    return (
        <section className="help__section" aria-labelledby="help-faq-title">
            <h2 id="help-faq-title" className="help__title">{t("faq.title")}</h2>
            <div className="help__faq">
                {Array.from({ length: FAQ_COUNT }, (_, i) => i + 1).map((n) => (
                    <details key={n} className="help__faq-item">
                        <summary>{t(`faq.q${n}`)}</summary>
                        <p>{t(`faq.a${n}`)}</p>
                    </details>
                ))}
            </div>
        </section>
    );
}
