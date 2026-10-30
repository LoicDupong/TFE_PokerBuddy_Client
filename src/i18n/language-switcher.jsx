"use client";

import { LOCALES } from "./config.js";
import { useLocale } from "./i18n-provider.jsx";

const LABELS = { en: "English", fr: "Français" };

// onChange : synchronisation facultative (ex. préférence du compte côté serveur pour les emails)
export default function LanguageSwitcher({ className = "", onChange }) {
    const { locale, setLocale } = useLocale();

    return (
        <div className={`language-switcher ${className}`} role="group" aria-label="Language / Langue">
            {LOCALES.map((code) => (
                <button
                    key={code}
                    type="button"
                    lang={code}
                    className={`language-switcher__option${code === locale ? " is-active" : ""}`}
                    aria-pressed={code === locale}
                    title={LABELS[code]}
                    onClick={() => {
                        if (code === locale) return;
                        setLocale(code);
                        onChange?.(code);
                    }}
                >
                    {code.toUpperCase()}
                </button>
            ))}
        </div>
    );
}
