// Mini-visuel de 5 cartes (CSS + SVG inline, aucune image ni bibliothèque).
// Symboles en SVG plutôt qu'en caractères ♥♦ : certains systèmes les affichent en emoji.

const RANKS = { T: "10", J: "J", Q: "Q", K: "K", A: "A" };

const SUITS = {
    s: "M12 2C9 7 4 9 4 14c0 2 2 4 4 4 1 0 2 0 3-1 0 0 .32 2-2 5h6c-2-3-2-5-2-5 1 1 2 1 3 1 2 0 4-2 4-4 0-5-5-7-8-12z",
    h: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35z",
    d: "M12 2l7 10-7 10-7-10z",
    c: "M12 2c2.3 0 4.2 1.9 4.2 4.2 0 1.3-.6 2.5-1.6 3.3.5-.2 1-.3 1.6-.3 2.3 0 4.2 1.9 4.2 4.2s-1.9 4.2-4.2 4.2c-1.3 0-2.5-.6-3.3-1.6L13.5 22h-3l.6-6c-.8 1-2 1.6-3.3 1.6-2.3 0-4.2-1.9-4.2-4.2S5.5 9.2 7.8 9.2c.6 0 1.1.1 1.6.3-1-.8-1.6-2-1.6-3.3C7.8 3.9 9.7 2 12 2z",
};

function SuitIcon({ suit }) {
    return (
        <svg viewBox="0 0 24 24" className="playing-card__suit" focusable="false">
            <path d={SUITS[suit]} fill="currentColor" />
        </svg>
    );
}

export default function HandExample({ cards, made, label }) {
    const list = cards.split(" ");
    return (
        // role="img" + aria-label : une seule description textuelle, les cartes sont décoratives
        <div className="hand-example" role="img" aria-label={label}>
            {list.map((code, i) => {
                const rank = RANKS[code[0]] ?? code[0];
                const suit = code[1];
                const red = suit === "h" || suit === "d";
                const kicker = i >= made;
                return (
                    <span
                        key={code}
                        className={`playing-card${red ? " playing-card--red" : ""}${kicker ? " playing-card--kicker" : ""}`}
                    >
                        <span className="playing-card__rank">{rank}</span>
                        <SuitIcon suit={suit} />
                    </span>
                );
            })}
        </div>
    );
}
