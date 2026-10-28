"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons";

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

function countLabel(count, query) {
    if (!query) return count === 1 ? "1 term" : `${count} terms`;
    if (count === 0) return `No term matches “${query}”`;
    return count === 1 ? `1 term matches “${query}”` : `${count} terms match “${query}”`;
}

export default function GlossarySearch({ terms, intro = null }) {
    const [query, setQuery] = useState("");
    const [announcement, setAnnouncement] = useState("");
    const inputRef = useRef(null);

    // Index calculé une seule fois (les termes sont statiques)
    const indexed = useMemo(
        () => terms.map((t) => ({ ...t, name: normalizeWithMap(t.term), body: normalizeWithMap(t.definition) })),
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
            if (!nameRange && !bodyRange) continue;
            // Priorité au nom : début du nom, puis nom, puis définition seule (tri stable = ordre alphabétique conservé)
            const rank = nameRange ? (nameRange[0] === 0 ? 0 : 1) : 2;
            matches.push({ ...t, nameRange, bodyRange, rank });
        }
        return matches.sort((a, b) => a.rank - b.rank);
    }, [indexed, q]);

    const label = countLabel(results.length, q ? displayQuery : "");

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
                    Search the glossary
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
                        placeholder="Try “bluff” or “pot odds”"
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="none"
                        spellCheck={false}
                        enterKeyHint="search"
                        aria-describedby="glossary-count"
                    />
                    {query && (
                        <button type="button" className="glossary__clear" onClick={clear} aria-label="Clear search">
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
                    <p>No term matches “{displayQuery}”.</p>
                    <p>Check the spelling or try a shorter word.</p>
                    <button type="button" className="btn btn--secondary glossary__reset" onClick={clear}>
                        Clear search
                    </button>
                </div>
            )}
        </div>
    );
}
