// Glossaire : données statiques, aucune requête API. Chaque entrée porte les deux langues.
// Rendu côté serveur dans page.jsx (liste de la langue courante, triée par ordre alphabétique),
// filtré côté client par glossary-search.jsx (la recherche couvre aussi le terme de l'autre langue).
const ENTRIES = [
    { en: ["Action", "A player's turn to act during a betting round; also describes betting activity in a hand."], fr: ["Action", "Le tour de parole d'un joueur pendant un tour de mise ; désigne aussi l'activité de mise dans une main."] },
    { en: ["Add-on", "In tournaments, an optional extra buy-in of chips, usually at the end of the rebuy period."], fr: ["Add-on", "En tournoi, un achat de jetons supplémentaire facultatif, généralement à la fin de la période de rebuy."] },
    { en: ["All-in", "When a player bets all their remaining chips."], fr: ["All-in (tapis)", "Quand un joueur mise tous ses jetons restants."] },
    { en: ["Ante", "A forced bet that all players must post before the deal, often in tournaments or stud."], fr: ["Ante", "Une mise obligatoire que tous les joueurs doivent poser avant la distribution, souvent en tournoi ou au stud."] },
    { en: ["ATC", "Stands for \"Any Two Cards\" – used to describe very loose players."], fr: ["ATC", "Pour « Any Two Cards » (n'importe quelles deux cartes) – décrit les joueurs très loose."] },
    { en: ["Backdoor", "A draw that requires both turn and river cards to complete (e.g., backdoor flush draw)."], fr: ["Backdoor", "Un tirage qui demande à la fois le turn et la river pour se compléter (par exemple un tirage couleur backdoor)."] },
    { en: ["Bad Beat", "When a strong favorite hand loses against improbable odds."], fr: ["Bad beat", "Quand une main grande favorite perd contre toute probabilité."] },
    { en: ["Bankroll", "The money a player has dedicated to playing poker."], fr: ["Bankroll", "L'argent qu'un joueur consacre au poker."] },
    { en: ["Bet", "To place chips in the pot, forcing others to match in order to continue."], fr: ["Mise (bet)", "Poser des jetons dans le pot, obligeant les autres à égaler pour continuer."] },
    { en: ["Big Blind", "The larger of the two forced bets, posted by the player left of the small blind."], fr: ["Grosse blind", "La plus grosse des deux mises obligatoires, posée par le joueur à gauche de la petite blind."] },
    { en: ["Blind", "Mandatory bets (small blind, big blind) to stimulate action in flop games."], fr: ["Blind", "Mises obligatoires (petite blind, grosse blind) pour stimuler l'action dans les jeux à flop."] },
    { en: ["Bluff", "Betting or raising with a weak hand to force opponents to fold stronger hands."], fr: ["Bluff", "Miser ou relancer avec une main faible pour pousser les adversaires à coucher de meilleures mains."] },
    { en: ["Board", "The community cards dealt face-up in the center of the table."], fr: ["Board (table)", "Les cartes communes posées face visible au centre de la table."] },
    { en: ["Bubble", "The position just before the money in a tournament (one place short of being paid)."], fr: ["Bulle (bubble)", "La position juste avant les places payées dans un tournoi (à une place d'être payé)."] },
    { en: ["Button", "The dealer position, which rotates clockwise each hand and acts last post-flop."], fr: ["Bouton (button)", "La position du donneur, qui tourne dans le sens des aiguilles d'une montre à chaque main et parle en dernier après le flop."] },
    { en: ["Buy-in", "The amount of money or chips required to enter a cash game or tournament."], fr: ["Buy-in", "Le montant d'argent ou de jetons nécessaire pour entrer dans un cash game ou un tournoi."] },
    { en: ["Call", "To match the current bet made by another player."], fr: ["Suivre (call)", "Égaler la mise en cours d'un autre joueur."] },
    { en: ["Check", "To decline to bet when no bet has yet been made in the current round."], fr: ["Check (parole)", "Passer son tour sans miser quand personne n'a encore misé dans le tour en cours."] },
    { en: ["Community Cards", "Cards dealt face-up on the table that all players can use to form their hand."], fr: ["Cartes communes", "Cartes posées face visible sur la table que tous les joueurs peuvent utiliser pour former leur main."] },
    { en: ["Continuation Bet (C-Bet)", "A bet made by the pre-flop aggressor on the flop, regardless of whether they improved."], fr: ["Mise de continuation (c-bet)", "Une mise faite au flop par l'agresseur d'avant-flop, qu'il ait amélioré sa main ou non."] },
    { en: ["Cry Call", "Calling a bet while suspecting you're beaten, but unable to fold."], fr: ["Cry call", "Suivre une mise en soupçonnant qu'on est battu, sans parvenir à se coucher."] },
    { en: ["Dealer", "The player (or staff) who distributes the cards; position rotates each hand."], fr: ["Donneur (dealer)", "Le joueur (ou le croupier) qui distribue les cartes ; la position tourne à chaque main."] },
    { en: ["Draw", "A hand that needs specific future cards to improve (flush draw, straight draw, etc.)."], fr: ["Tirage (draw)", "Une main qui a besoin de cartes précises à venir pour s'améliorer (tirage couleur, tirage quinte, etc.)."] },
    { en: ["Equity", "The percentage chance of winning the pot based on your current hand and situation."], fr: ["Équité (equity)", "Le pourcentage de chances de gagner le pot selon ta main et la situation actuelles."] },
    { en: ["Fold", "To discard your cards and forfeit any claim to the pot."], fr: ["Se coucher (fold)", "Jeter ses cartes et renoncer à toute prétention sur le pot."] },
    { en: ["Freeroll", "A tournament with no buy-in cost, usually with real or play money prizes."], fr: ["Freeroll", "Un tournoi sans frais d'inscription, généralement avec des gains en argent réel ou fictif."] },
    { en: ["Full House", "A five-card hand with three cards of one rank and two of another (e.g., 888KK)."], fr: ["Full", "Une main de cinq cartes avec trois cartes d'un rang et deux d'un autre (par exemple 888RR)."] },
    { en: ["Grinder", "A player who plays many hands/sessions for small profit, relying on volume."], fr: ["Grinder", "Un joueur qui enchaîne beaucoup de mains et de sessions pour de petits profits, en misant sur le volume."] },
    { en: ["Gutshot", "An inside straight draw needing one specific card to complete."], fr: ["Gutshot", "Un tirage quinte ventral qui n'a besoin que d'une carte précise pour se compléter."] },
    { en: ["Hand", "The cards a player holds; also refers to a single round of play."], fr: ["Main (hand)", "Les cartes qu'un joueur détient ; désigne aussi un tour de jeu complet."] },
    { en: ["Heads-up", "A situation or match between only two players."], fr: ["Heads-up (en tête à tête)", "Une situation ou un match entre deux joueurs seulement."] },
    { en: ["Implied Odds", "Consideration of potential future winnings when deciding whether to call."], fr: ["Cotes implicites", "La prise en compte des gains potentiels futurs au moment de décider de suivre ou non."] },
    { en: ["Kicker", "A side card used to break ties between hands of equal rank."], fr: ["Kicker", "Une carte d'accompagnement qui sert à départager des mains de même rang."] },
    { en: ["Limp", "To just call the big blind pre-flop instead of raising."], fr: ["Limp", "Se contenter de suivre la grosse blind avant le flop au lieu de relancer."] },
    { en: ["Loose", "A playing style involving entering many pots with a wide range of hands."], fr: ["Loose", "Un style de jeu qui consiste à entrer dans beaucoup de pots avec un large éventail de mains."] },
    { en: ["Muck", "Discarding a hand without showing it; the pile of folded cards."], fr: ["Muck", "Jeter sa main sans la montrer ; désigne aussi la pile des cartes couchées."] },
    { en: ["Nuts", "The best possible hand given the board."], fr: ["Nuts", "La meilleure main possible compte tenu du board."] },
    { en: ["Outs", "Cards remaining in the deck that will improve your hand to likely winner."], fr: ["Outs", "Les cartes restant dans le paquet qui amélioreront ta main au point d'en faire probablement la gagnante."] },
    { en: ["Overpair", "A pocket pair higher than any community cards on the board."], fr: ["Overpair (paire supérieure)", "Une paire en main plus haute que toutes les cartes communes du board."] },
    { en: ["Pocket Cards", "The private cards dealt face-down to each player."], fr: ["Cartes privées (pocket)", "Les cartes distribuées face cachée à chaque joueur."] },
    { en: ["Pot", "The total amount of chips wagered during a hand."], fr: ["Pot", "Le total des jetons misés pendant une main."] },
    { en: ["Pot Odds", "The ratio between the current pot size and the cost of a contemplated call."], fr: ["Cotes du pot (pot odds)", "Le rapport entre la taille du pot actuel et le coût du call envisagé."] },
    { en: ["Quads", "Four of a kind."], fr: ["Carré (quads)", "Quatre cartes de même rang."] },
    { en: ["Rake", "A small percentage of each pot taken by the house (site/casino)."], fr: ["Rake (commission)", "Un petit pourcentage de chaque pot prélevé par la maison (site ou casino)."] },
    { en: ["Range", "The spectrum of possible hands a player might hold in a situation."], fr: ["Range", "L'éventail des mains qu'un joueur peut détenir dans une situation donnée."] },
    { en: ["River", "The fifth and final community card dealt."], fr: ["River", "La cinquième et dernière carte commune."] },
    { en: ["Satellite", "A qualifying tournament awarding entry to a larger event."], fr: ["Satellite", "Un tournoi qualificatif qui offre l'entrée à un événement plus important."] },
    { en: ["Set", "Three of a kind made with a pocket pair plus one on the board."], fr: ["Set", "Un brelan fait avec une paire en main plus une carte du board."] },
    { en: ["Shove", "To go all-in by pushing your entire stack into the pot."], fr: ["Shove", "Aller à tapis en poussant tout son tapis dans le pot."] },
    { en: ["Slow Play", "Playing a strong hand passively to lure opponents into betting."], fr: ["Slow play", "Jouer une main forte passivement pour inciter les adversaires à miser."] },
    { en: ["Small Blind", "The smaller of the two forced bets, posted left of the dealer button."], fr: ["Petite blind", "La plus petite des deux mises obligatoires, posée à gauche du bouton du donneur."] },
    { en: ["Split Pot", "When two or more players tie with the same hand, and the pot is divided."], fr: ["Pot partagé (split pot)", "Quand deux joueurs ou plus ont la même main et que le pot est divisé."] },
    { en: ["Stack", "The amount of chips a player has in play."], fr: ["Tapis (stack)", "La quantité de jetons qu'un joueur a en jeu."] },
    { en: ["Straddle", "An optional blind bet posted before cards are dealt, usually double the big blind."], fr: ["Straddle", "Une blind facultative posée avant la distribution, généralement le double de la grosse blind."] },
    { en: ["Straight", "Five cards of sequential rank, not all of the same suit."], fr: ["Quinte (straight)", "Cinq cartes de rangs consécutifs, pas toutes de la même couleur."] },
    { en: ["Straight Flush", "Five consecutive cards of the same suit."], fr: ["Quinte flush", "Cinq cartes consécutives de la même couleur."] },
    { en: ["Tell", "A physical or behavioral clue that may give away information about a hand."], fr: ["Tell", "Un indice physique ou comportemental qui peut trahir des informations sur une main."] },
    { en: ["Three-bet", "A re-raise of the initial raise in a betting round."], fr: ["3-bet", "Une relance de la relance initiale dans un tour de mise."] },
    { en: ["Tilt", "Playing emotionally or recklessly after losing a big pot or suffering a bad beat."], fr: ["Tilt", "Jouer sous le coup de l'émotion ou de façon imprudente après avoir perdu un gros pot ou subi un bad beat."] },
    { en: ["Top Pair", "A pair made with the highest community card on the board and one hole card."], fr: ["Top paire (top pair)", "Une paire faite avec la carte commune la plus haute du board et une carte privée."] },
    { en: ["Turn", "The fourth community card dealt."], fr: ["Turn", "La quatrième carte commune."] },
    { en: ["Under the Gun (UTG)", "The first position to act pre-flop, immediately left of the big blind."], fr: ["Under the gun (UTG)", "La première position à parler avant le flop, juste à gauche de la grosse blind."] },
    { en: ["Value Bet", "A bet designed to get called by worse hands to maximize profit."], fr: ["Value bet", "Une mise conçue pour être suivie par de moins bonnes mains afin de maximiser le profit."] },
    { en: ["WSOP", "World Series of Poker, the largest and most prestigious live poker series."], fr: ["WSOP", "World Series of Poker, la plus grande et la plus prestigieuse série de tournois de poker en live."] },
];

// Liste de la langue demandée ; l'autre langue sert à la recherche (terme équivalent)
export function getTerms(locale) {
    const other = locale === "fr" ? "en" : "fr";
    const collator = new Intl.Collator(locale === "fr" ? "fr" : "en", { sensitivity: "base", ignorePunctuation: true });
    const list = ENTRIES.map((entry) => ({
        term: entry[locale][0],
        definition: entry[locale][1],
        altTerm: entry[other][0],
    }));
    // L'ordre anglais d'origine est déjà alphabétique ; le français est trié (les termes ont changé)
    return locale === "fr" ? list.sort((a, b) => collator.compare(a.term, b.term)) : list;
}

export default ENTRIES;
