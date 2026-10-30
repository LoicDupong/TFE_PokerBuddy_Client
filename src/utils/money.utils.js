// Montants d'argent : les nouveaux flux (finances de partie) sont en centimes entiers.
// Un seul endroit pour afficher, lire et répartir un montant.
import { currencySymbol } from "@/utils/game.utils.js";

/** 1250 → "12,50 €" (toujours 2 décimales, virgule décimale, espace insécable avant le symbole) */
// Avec `intlLocale` (useT) : format Intl de la langue (en-GB "€12.50", fr-BE "12,50 €") ; sans : format historique
export function formatCents(cents, currency = "EUR", intlLocale) {
    const value = Math.round(Number(cents) || 0);
    if (intlLocale) {
        return new Intl.NumberFormat(intlLocale, { style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value / 100);
    }
    const sign = value < 0 ? "-" : "";
    const abs = Math.abs(value);
    const whole = String(Math.floor(abs / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    const decimals = String(abs % 100).padStart(2, "0");
    return `${sign}${whole},${decimals} ${currencySymbol(currency)}`;
}

/** Idem avec un signe explicite pour les nets : "+3,00 €" / "-2,00 €" / "0,00 €" */
export function formatSignedCents(cents, currency = "EUR", intlLocale) {
    const text = formatCents(cents, currency, intlLocale);
    return Number(cents) > 0 ? `+${text}` : text;
}

/**
 * Saisie utilisateur → centimes entiers, par analyse de la chaîne (jamais × 100 en flottant).
 * Accepte "12", "12.5", "12,50". Renvoie null si vide ou invalide (négatif, 3 décimales, texte).
 */
export function parseAmountToCents(input) {
    const text = String(input ?? "").trim().replace(",", ".");
    if (!/^\d+(\.\d{1,2})?$/.test(text)) return null;
    const [whole, frac = ""] = text.split(".");
    return Number(whole) * 100 + Number(frac.padEnd(2, "0"));
}

/** 1250 → "12.50", 1200 → "12" : valeur de départ d'un champ de saisie */
export function centsToInput(cents) {
    const value = Math.round(Number(cents) || 0);
    const whole = Math.floor(value / 100);
    const frac = value % 100;
    return frac === 0 ? String(whole) : `${whole}.${String(frac).padStart(2, "0").replace(/0$/, "")}`;
}

/**
 * Même règle que le serveur : floor par place, centimes restants un par un aux premières places
 * (seulement si les pourcentages font 100).
 */
export function splitByPercents(totalCents, percents) {
    const shares = percents.map((p) => Math.floor((totalCents * (Number(p) || 0)) / 100));
    const sum = percents.reduce((s, p) => s + (Number(p) || 0), 0);
    if (sum === 100) {
        let rest = totalCents - shares.reduce((s, v) => s + v, 0);
        for (let i = 0; rest > 0 && shares.length > 0; i = (i + 1) % shares.length) {
            if (!(Number(percents[i]) > 0)) continue;
            shares[i] += 1;
            rest -= 1;
        }
    }
    return shares;
}

/** Aperçu PKO du formulaire : une entrée de `cents` donne combien au prize pool / à la bounty */
export function splitBounty(cents, bountyPercent) {
    const bounty = Math.floor((cents * bountyPercent) / 100);
    return { bounty, prize: cents - bounty };
}
