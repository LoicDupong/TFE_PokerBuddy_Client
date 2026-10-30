// Les 10 mains du poker, de la plus forte à la plus faible.
// cards : exemple en notation courte (rang + couleur s/h/d/c, T = 10), cartes de la combinaison
// d'abord ; made : nombre de cartes (en tête) qui forment la combinaison, les suivantes sont des kickers.
// en / fr : nom, label (description lue par les lecteurs d'écran à la place du visuel) et paragraphes.
const HANDS = [
    {
        position: 1,
        cards: "Ts Js Qs Ks As",
        made: 5,
        en: {
            name: "Royal Flush",
            label: "Ten, jack, queen, king and ace of spades.",
            paragraphs: [
                "A straight flush is five cards in sequential order, all of the same suit. As this straight flush is all the way to the ace, it is known as a royal flush and is an unbeatable high hand.",
            ],
        },
        fr: {
            name: "Quinte flush royale",
            label: "Dix, valet, dame, roi et as de pique.",
            paragraphs: [
                "Une quinte flush, ce sont cinq cartes qui se suivent, toutes de la même couleur. Quand cette quinte flush monte jusqu'à l'as, on parle de quinte flush royale : c'est une main imbattable.",
            ],
        },
    },
    {
        position: 2,
        cards: "4h 5h 6h 7h 8h",
        made: 5,
        en: {
            name: "Straight Flush",
            label: "Four, five, six, seven and eight of hearts.",
            paragraphs: [
                "A straight flush that stops short of the ace is still one of the strongest hands in almost every poker game. It’s called a straight flush because it meets the requirements of both a flush and a straight.",
            ],
        },
        fr: {
            name: "Quinte flush",
            label: "Quatre, cinq, six, sept et huit de cœur.",
            paragraphs: [
                "Une quinte flush qui s'arrête avant l'as reste l'une des mains les plus fortes dans presque toutes les variantes de poker. On l'appelle ainsi parce qu'elle réunit les conditions d'une couleur et d'une quinte.",
            ],
        },
    },
    {
        position: 3,
        cards: "9h 9c 9s 9d Jh",
        made: 4,
        en: {
            name: "Four of a Kind",
            label: "Four nines (hearts, clubs, spades, diamonds) with the jack of hearts as kicker.",
            paragraphs: [
                "Also known as quads, four of a kind is just what it sounds like: four cards of the same rank, plus any other card. In the case of a tie, the player with the higher ranked quads wins.",
                "In flop games, or games using wildcards, more than one player may make the same set of quads, in which case the unmatched fifth card (the kicker) is used to determine the winner.",
            ],
        },
        fr: {
            name: "Carré",
            label: "Quatre neuf (cœur, trèfle, pique, carreau) avec le valet de cœur comme kicker.",
            paragraphs: [
                "Le carré (« quads » en anglais) est exactement ce que son nom indique : quatre cartes de même rang, plus une carte quelconque. En cas d'égalité, le joueur avec le carré le plus haut l'emporte.",
                "Dans les jeux à cartes communes, ou avec des jokers, plusieurs joueurs peuvent avoir le même carré : la cinquième carte, le kicker, départage alors les joueurs.",
            ],
        },
    },
    {
        position: 4,
        cards: "Qd Qh Qs Kd Ks",
        made: 5,
        en: {
            name: "Full House",
            label: "Three queens (diamonds, hearts, spades) and two kings (diamonds, spades).",
            paragraphs: [
                "Also known as a boat, a full house consists of three-of-a-kind plus a pair. In case of a tie, the highest ranked three-of-a-kind wins. If they are equal, the highest accompanying pair wins.",
            ],
        },
        fr: {
            name: "Full",
            label: "Trois dames (carreau, cœur, pique) et deux rois (carreau, pique).",
            paragraphs: [
                "Le full (« full house » en anglais) est composé d'un brelan plus une paire. En cas d'égalité, le brelan le plus haut l'emporte. S'ils sont égaux, c'est la paire la plus haute qui départage.",
            ],
        },
    },
    {
        position: 5,
        cards: "Qd Td 6d 5d 2d",
        made: 5,
        en: {
            name: "Flush",
            label: "Queen, ten, six, five and two of diamonds.",
            paragraphs: [
                "Five cards of the same suit make a flush. What differentiates one flush from another is the rank of the highest card. An ace-high flush is the strongest flush.",
            ],
        },
        fr: {
            name: "Couleur",
            label: "Dame, dix, six, cinq et deux de carreau.",
            paragraphs: [
                "Cinq cartes de la même couleur forment une couleur (« flush »). Ce qui distingue deux couleurs, c'est le rang de leur carte la plus haute. La couleur à l'as est la plus forte.",
            ],
        },
    },
    {
        position: 6,
        cards: "3h 4s 5s 6d 7s",
        made: 5,
        en: {
            name: "Straight",
            label: "Three of hearts, four of spades, five of spades, six of diamonds and seven of spades.",
            paragraphs: [
                "Five cards in sequence – of any suits – make a straight. The highest card in the straight determines the winner in case of a tie.",
                "Note: an ace may be high (A-K-Q-J-T) or low (A-2-3-4-5).",
            ],
        },
        fr: {
            name: "Quinte",
            label: "Trois de cœur, quatre de pique, cinq de pique, six de carreau et sept de pique.",
            paragraphs: [
                "Cinq cartes qui se suivent, de n'importe quelles couleurs, forment une quinte (« straight »). En cas d'égalité, la carte la plus haute de la quinte détermine le gagnant.",
                "À noter : l'as peut être haut (A-R-D-V-10) ou bas (A-2-3-4-5).",
            ],
        },
    },
    {
        position: 7,
        cards: "5c 5h 5s 9h 2d",
        made: 3,
        en: {
            name: "Three-of-a-Kind",
            label: "Three fives (clubs, hearts, spades) with the nine of hearts and two of diamonds as kickers.",
            paragraphs: [
                "Three cards of the same rank plus two unrelated cards. Known as a set (if you hold the pair + one on the board) or trips (if one in your hand matches a pair on the board).",
            ],
        },
        fr: {
            name: "Brelan",
            label: "Trois cinq (trèfle, cœur, pique) avec le neuf de cœur et le deux de carreau comme kickers.",
            paragraphs: [
                "Trois cartes de même rang plus deux cartes sans rapport. On parle de « set » si tu as la paire en main et la troisième carte sur la table, ou de « trips » si une seule de tes cartes complète une paire de la table.",
            ],
        },
    },
    {
        position: 8,
        cards: "7h 7s 3d 3c Jh",
        made: 4,
        en: {
            name: "Two Pair",
            label: "Two sevens (hearts, spades) and two threes (diamonds, clubs) with the jack of hearts as kicker.",
            paragraphs: [
                "A hand containing two pairs plus a fifth card. Ties are broken by the highest pair, then by the second pair, then by the kicker.",
            ],
        },
        fr: {
            name: "Double paire",
            label: "Deux sept (cœur, pique) et deux trois (carreau, trèfle) avec le valet de cœur comme kicker.",
            paragraphs: [
                "Une main qui contient deux paires plus une cinquième carte. Les égalités se départagent par la paire la plus haute, puis par la deuxième paire, puis par le kicker.",
            ],
        },
    },
    {
        position: 9,
        cards: "Ks Kh 9s 5d 2h",
        made: 2,
        en: {
            name: "One Pair",
            label: "Two kings (spades, hearts) with the nine of spades, five of diamonds and two of hearts as kickers.",
            paragraphs: [
                "A single pair of cards with the same rank plus three other unconnected cards. Ties are won by the highest pair, then by kickers if needed.",
            ],
        },
        fr: {
            name: "Paire",
            label: "Deux rois (pique, cœur) avec le neuf de pique, le cinq de carreau et le deux de cœur comme kickers.",
            paragraphs: [
                "Une seule paire de cartes de même rang plus trois autres cartes sans rapport. Les égalités sont gagnées par la paire la plus haute, puis par les kickers si besoin.",
            ],
        },
    },
    {
        position: 10,
        cards: "Ad Jh 8h 6c 5s",
        made: 1,
        en: {
            name: "High Card",
            label: "Ace of diamonds high, with the jack of hearts, eight of hearts, six of clubs and five of spades as kickers.",
            paragraphs: [
                // "6-high" corrigé : 6-5-4-3-2 est une quinte, la main la plus faible est 7-high (7-5-4-3-2)
                "If you don’t make any of the hands above, your hand strength is determined by your highest card. Ace-high is the best, 7-high the weakest. Ties are broken by kickers.",
            ],
        },
        fr: {
            name: "Carte haute",
            label: "As de carreau haut, avec le valet de cœur, le huit de cœur, le six de trèfle et le cinq de pique comme kickers.",
            paragraphs: [
                "Si tu ne fais aucune des mains ci-dessus, la force de ta main dépend de ta carte la plus haute. L'as haut est le meilleur, le 7 haut le plus faible. Les égalités se départagent avec les kickers.",
            ],
        },
    },
];

export default HANDS;
