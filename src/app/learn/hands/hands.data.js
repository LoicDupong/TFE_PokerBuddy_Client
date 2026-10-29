// Les 10 mains du poker, de la plus forte à la plus faible.
// cards : exemple en notation courte (rang + couleur s/h/d/c, T = 10), cartes de la combinaison
// d'abord ; made : nombre de cartes (en tête) qui forment la combinaison, les suivantes sont des kickers.
// label : description lue par les lecteurs d'écran à la place du visuel.
const HANDS = [
    {
        position: 1,
        name: "Royal Flush",
        cards: "Ts Js Qs Ks As",
        made: 5,
        label: "Ten, jack, queen, king and ace of spades.",
        paragraphs: [
            "A straight flush is five cards in sequential order, all of the same suit. As this straight flush is all the way to the ace, it is known as a royal flush and is an unbeatable high hand.",
        ],
    },
    {
        position: 2,
        name: "Straight Flush",
        cards: "4h 5h 6h 7h 8h",
        made: 5,
        label: "Four, five, six, seven and eight of hearts.",
        paragraphs: [
            "A straight flush that stops short of the ace is still one of the strongest hands in almost every poker game. It’s called a straight flush because it meets the requirements of both a flush and a straight.",
        ],
    },
    {
        position: 3,
        name: "Four of a Kind",
        cards: "9h 9c 9s 9d Jh",
        made: 4,
        label: "Four nines (hearts, clubs, spades, diamonds) with the jack of hearts as kicker.",
        paragraphs: [
            "Also known as quads, four of a kind is just what it sounds like: four cards of the same rank, plus any other card. In the case of a tie, the player with the higher ranked quads wins.",
            "In flop games, or games using wildcards, more than one player may make the same set of quads, in which case the unmatched fifth card (the kicker) is used to determine the winner.",
        ],
    },
    {
        position: 4,
        name: "Full House",
        cards: "Qd Qh Qs Kd Ks",
        made: 5,
        label: "Three queens (diamonds, hearts, spades) and two kings (diamonds, spades).",
        paragraphs: [
            "Also known as a boat, a full house consists of three-of-a-kind plus a pair. In case of a tie, the highest ranked three-of-a-kind wins. If they are equal, the highest accompanying pair wins.",
        ],
    },
    {
        position: 5,
        name: "Flush",
        cards: "Qd Td 6d 5d 2d",
        made: 5,
        label: "Queen, ten, six, five and two of diamonds.",
        paragraphs: [
            "Five cards of the same suit make a flush. What differentiates one flush from another is the rank of the highest card. An ace-high flush is the strongest flush.",
        ],
    },
    {
        position: 6,
        name: "Straight",
        cards: "3h 4s 5s 6d 7s",
        made: 5,
        label: "Three of hearts, four of spades, five of spades, six of diamonds and seven of spades.",
        paragraphs: [
            "Five cards in sequence – of any suits – make a straight. The highest card in the straight determines the winner in case of a tie.",
            "Note: an ace may be high (A-K-Q-J-T) or low (A-2-3-4-5).",
        ],
    },
    {
        position: 7,
        name: "Three-of-a-Kind",
        cards: "5c 5h 5s 9h 2d",
        made: 3,
        label: "Three fives (clubs, hearts, spades) with the nine of hearts and two of diamonds as kickers.",
        paragraphs: [
            "Three cards of the same rank plus two unrelated cards. Known as a set (if you hold the pair + one on the board) or trips (if one in your hand matches a pair on the board).",
        ],
    },
    {
        position: 8,
        name: "Two Pair",
        cards: "7h 7s 3d 3c Jh",
        made: 4,
        label: "Two sevens (hearts, spades) and two threes (diamonds, clubs) with the jack of hearts as kicker.",
        paragraphs: [
            "A hand containing two pairs plus a fifth card. Ties are broken by the highest pair, then by the second pair, then by the kicker.",
        ],
    },
    {
        position: 9,
        name: "One Pair",
        cards: "Ks Kh 9s 5d 2h",
        made: 2,
        label: "Two kings (spades, hearts) with the nine of spades, five of diamonds and two of hearts as kickers.",
        paragraphs: [
            "A single pair of cards with the same rank plus three other unconnected cards. Ties are won by the highest pair, then by kickers if needed.",
        ],
    },
    {
        position: 10,
        name: "High Card",
        cards: "Ad Jh 8h 6c 5s",
        made: 1,
        label: "Ace of diamonds high, with the jack of hearts, eight of hearts, six of clubs and five of spades as kickers.",
        paragraphs: [
            // "6-high" corrigé : 6-5-4-3-2 est une quinte, la main la plus faible est 7-high (7-5-4-3-2)
            "If you don’t make any of the hands above, your hand strength is determined by your highest card. Ace-high is the best, 7-high the weakest. Ties are broken by kickers.",
        ],
    },
];

export default HANDS;
