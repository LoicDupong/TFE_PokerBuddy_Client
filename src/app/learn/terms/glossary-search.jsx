"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useT } from "@/i18n/i18n-provider.jsx";

const MESSAGES = {
    en: {
        termCount: (p) => (p.n === 1 ? "1 term" : `${p.n} terms`),
        noMatch: (p) => `No term matches “${p.q}”`,
        matches: (p) => (p.n === 1 ? `1 term matches “${p.q}”` : `${p.n} terms match “${p.q}”`),
        searchLabel: "Search the glossary",
        placeholder: "Try “bluff” or “pot odds”",
        clear: "Clear search",
        emptyTitle: (p) => `No term matches “${p.q}”.`,
        emptyHint: "Check the spelling or try a shorter word.",
    },
    fr: {
        termCount: (p) => (p.n <= 1 ? `${p.n} terme` : `${p.n} termes`),
        noMatch: (p) => `Aucun terme ne correspond à « ${p.q} »`,
        matches: (p) => (p.n === 1 ? `1 terme correspond à « ${p.q} »` : `${p.n} termes correspondent à « ${p.q} »`),
        searchLabel: "Rechercher dans le glossaire",
        placeholder: "Essaie « bluff » ou « cotes du pot »",
        clear: "Effacer la recherche",
        emptyTitle: (p) => `Aucun terme ne correspond à « ${p.q} ».`,
        emptyHint: "Vérifie l'orthographe ou essaie un mot plus court.",
    },
};

// Texte normalisé pour la recherche (minuscules, sans accents via NFD, tirets = espaces,
// espaces regroupés) + correspondance index normalisé → index d'origine, pour surligner
// le passage trouvé dans le texte original.
function normalizeWithMap(text) {
    let normalized = "";
    const map = [];
    for (let i = 0; i < text.length; i++) {
        const base = text[i].normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
        for (const ch of base) {
            const c = /[\s\-‐-―]/.test(ch) ? " " : ch;
            if (c === " " && (normalized === "" || normalized.endsWith(" "))) continue;
            normalized += c;
            map.push(i);
        }
    }
    return { normalized, map };
}

const normalizeQuery = (query) => normalizeWithMap(query).normalized.trim();

// Plage [début, fin[ du texte original correspondant à la requête, ou null
function findRange(indexed, query) {
    const at = indexed.normalized.indexOf(query);
    if (at === -1) return null;
    return [indexed.map[at], indexed.map[at + query.length - 1] + 1];
}

function Highlight({ text, range }) {
    if (!range) return text;
    const [start, end] = range;
    return (
        <>
            {text.slice(0, start)}
            <mark className="glossary__mark">{text.slice(start, end)}</mark>
            {text.slice(end)}
        </>
    );
}

function countLabel(t, count, query) {
    if (!query) return t("termCount", { n: count });
    if (count === 0) return t("noMatch", { q: query });
    return t("matches", { n: count, q: query });
}

export default function GlossarySearch({ terms, intro = null }) {
    const { t } = useT(MESSAGES);
    const [query, setQuery] = useState("");
    const [announcement, setAnnouncement] = useState("");
    const inputRef = useRef(null);

    // Index calculé une seule fois (les termes sont statiques)
    const indexed = useMemo(
        () => terms.map((t) => ({ ...t, name: normalizeWithMap(t.term), body: normalizeWithMap(t.definition), alt: normalizeWithMap(t.altTerm || "") })),
        [terms]
    );

    const q = normalizeQuery(query);
    const displayQuery = query.trim();

    const results = useMemo(() => {
        if (!q) return indexed.map((t) => ({ ...t, nameRange: null, bodyRange: null }));
        const matches = [];
        for (const t of indexed) {
            const nameRange = findRange(t.name, q);
            const bodyRange = findRange(t.body, q);
            // Terme équivalent dans l'autre langue : trouvé sans surlignage (on cherche en FR comme en EN)
            const altMatch = !nameRange && findRange(t.alt, q);
            if (!nameRange && !bodyRange && !altMatch) continue;
            // Priorité au nom : début du nom, puis nom ou équivalent, puis définition seule (tri stable = ordre alphabétique conservé)
            const rank = nameRange ? (nameRange[0] === 0 ? 0 : 1) : altMatch ? 1 : 2;
            matches.push({ ...t, nameRange, bodyRange, rank });
        }
        return matches.sort((a, b) => a.rank - b.rank);
    }, [indexed, q]);

    const label = countLabel(t, results.length, q ? displayQuery : "");

    // Annonce aux lecteurs d'écran après une courte pause de frappe (pas une annonce par touche)
    useEffect(() => {
        if (!q) {
            setAnnouncement("");
            return;
        }
        const id = setTimeout(() => setAnnouncement(label), 400);
        return () => clearTimeout(id);
    }, [q, label]);

    const clear = () => {
        setQuery("");
        inputRef.current?.focus();
    };

    return (
        <div className="glossary">
            <form
                className="glossary__search"
                role="search"
                onSubmit={(e) => {
                    e.preventDefault();
                    // Mobile : Entrée ferme le clavier pour laisser voir les résultats
                    inputRef.current?.blur();
                }}
            >
                <label htmlFor="glossary-search" className="glossary__label">
                    {t("searchLabel")}
                </label>
                <div className="glossary__field">
                    <FontAwesomeIcon icon={faMagnifyingGlass} className="glossary__icon" />
                    <input
                        ref={inputRef}
                        id="glossary-search"
                        type="search"
                        className="glossary__input"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Escape" && query) {
                                e.preventDefault();
                                setQuery("");
                            }
                        }}
                        placeholder={t("placeholder")}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="none"
                        spellCheck={false}
                        enterKeyHint="search"
                        aria-describedby="glossary-count"
                    />
                    {query && (
                        <button type="button" className="glossary__clear" onClick={clear} aria-label={t("clear")}>
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                    )}
                </div>
                {/* Sans résultat, le message est déjà dans l'état vide : pas de doublon visuel */}
                <p id="glossary-count" className="glossary__count">
                    {results.length > 0 ? label : ""}
                </p>
            </form>

            <p className="sr-only" role="status" aria-live="polite">
                {announcement}
            </p>

            {!q && intro}

            {results.length > 0 ? (
                <article>
                    <ul className="glossary__list">
                        {results.map((t) => (
                            <li key={t.term}>
                                <h3>
                                    <Highlight text={t.term} range={t.nameRange} />
                                </h3>
                                <p>
                                    <Highlight text={t.definition} range={t.bodyRange} />
                                </p>
                            </li>
                        ))}
                    </ul>
                </article>
            ) : (
                <div className="glossary__empty">
                    <p>{t("emptyTitle", { q: displayQuery })}</p>
                    <p>{t("emptyHint")}</p>
                    <button type="button" className="btn btn--secondary glossary__reset" onClick={clear}>
                        {t("clear")}
                    </button>
                </div>
            )}
        </div>
    );
}
