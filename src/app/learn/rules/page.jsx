import { getLocale } from "@/i18n/server.js";

// Contenu pédagogique : un arbre JSX par langue (liens et gras dans le texte)
const CONTENT = {
  en: () => (
    <>
      <h1>Poker Rules For Beginners</h1>
      <div className="divider"></div>

      <article>
        <p>
          Looking for a quick rundown on everything you need to know to get started playing poker?
        </p>
        <p>
          The poker rules below are applicable to both ring games and tournaments, as well as to the games
          of Texas Hold&apos;em, Omaha and Royal Poker. Whichever games you find the most fun, you&apos;ll find a
          good grounding right here.
        </p>
        <p>
          And once you&apos;re ready to try it out for yourself, with absolutely no risk and no money required,
          sign up and join a thriving poker community – you just need an email address, nothing more!
        </p>
      </article>

      <article>
        <h2>How A Hand of Poker Plays Out (Texas Hold&apos;em Example)</h2>

        <h3>The Deal</h3>
        <p>
          Each player gets two hole cards. The small blind and big blind are posted by the two players
          left of the dealer button.
        </p>

        <h3>Betting Round 1</h3>
        <p>
          Starting left of the big blind, players must call, raise, or fold. Blinds count as bets.
        </p>

        <h3>The Flop</h3>
        <p>
          Three community cards are dealt face up. All players may use them to form their best hand.
        </p>

        <h3>Betting Round 2</h3>
        <p>
          Starts left of the button. With no forced bet, players may check until someone bets.
        </p>

        <h3>The Turn</h3>
        <p>A fourth community card is dealt face up.</p>

        <h3>Betting Round 3</h3>
        <p>Another round of betting occurs, as before.</p>

        <h3>The River</h3>
        <p>
          The fifth and final community card is dealt. Players now have 7 total cards to make their best
          5-card hand.
        </p>

        <h3>Betting Round 4</h3>
        <p>
          The final betting round occurs. All remaining players know their best possible hand.
        </p>

        <h3>The Showdown</h3>
        <p>
          Any remaining players reveal their hands. The strongest wins the pot (or it&apos;s split if hands
          are equal). The dealer button then moves one seat left, and the next hand begins.
        </p>
      </article>

      <article>
        <h2>How to Win a Poker Hand, Game or Tournament</h2>
        <p>
          Individual poker game rules may vary, but all poker games are broken down into hands – a round
          of gameplay that starts with the deal, and ends when either all cards are revealed and the pot
          is awarded to the strongest poker hand, or when only one player remains after all others fold.
        </p>
        <p>There are two main ways to play poker: ring games and tournaments.</p>

        <h3>How to Win a Poker Ring Game</h3>
        <p>
          A ring game is ongoing with no set end point. Players may leave whenever they wish, and may
          join whenever a seat is open. There&apos;s no way to &apos;win&apos; a ring game – each player decides when
          to stop.
        </p>

        <h3>How to Win a Poker Tournament</h3>
        <p>
          In a poker tournament, all players pay the same entry and start with the same chip stack. Play
          continues until only one player remains. Blinds rise at set intervals, forcing action. Prizes
          are shared among the top finishers, with the biggest share going to the winner.
        </p>
      </article>

      <article>
        <h2>Blinds, Betting and Position</h2>

        <h3>What Are Blinds in Poker?</h3>
        <p>
          Most poker hands begin with two players posting blinds – mandatory bets to create a pot. The
          dealer position is marked by a button that moves one seat left each hand. The small blind sits
          immediately left of the button, and the big blind is left of the small blind.
        </p>
        <p>
          Each player must call, raise, or fold against the big blind. If all fold, the big blind wins
          uncontested. If players call, the big blind may check or raise.
        </p>

        <h3>How Betting Works in Poker</h3>
        <ul>
          <li>Action proceeds clockwise, starting from the first player left of the button.</li>
          <li>To stay in the hand, players must at least match the highest bet.</li>
          <li>If no active bet exists, players may check.</li>
          <li>A player short on chips may go all-in.</li>
          <li>The minimum raise equals the previous bet; the maximum depends on game type.</li>
        </ul>

        <h3>Know Your Limits</h3>
        <p>
          <strong>Limit:</strong> Bets use fixed small/big units.
          <br />
          <strong>No-Limit:</strong> Any amount up to the player&apos;s whole stack.
          <br />
          <strong>Pot-Limit:</strong> The max raise equals the pot size at the time.
        </p>
      </article>
    </>
  ),
  fr: () => (
    <>
      <h1>Les règles du poker pour débutants</h1>
      <div className="divider"></div>

      <article>
        <p>
          Tu cherches un résumé rapide de tout ce qu&apos;il faut savoir pour te lancer au poker ?
        </p>
        <p>
          Les règles ci-dessous valent aussi bien pour les cash games que pour les tournois, et pour
          le Texas Hold&apos;em, l&apos;Omaha ou le Royal Poker. Quelle que soit la variante que tu préfères,
          tu trouveras ici de bonnes bases.
        </p>
        <p>
          Et quand tu seras prêt à t&apos;y essayer, sans aucun risque et sans dépenser un centime,
          inscris-toi et rejoins une communauté de joueurs dynamique – il suffit d&apos;une adresse email !
        </p>
      </article>

      <article>
        <h2>Le déroulement d&apos;une main (exemple au Texas Hold&apos;em)</h2>

        <h3>La distribution</h3>
        <p>
          Chaque joueur reçoit deux cartes privées. La petite blind et la grosse blind sont postées par les deux
          joueurs à gauche du bouton du donneur.
        </p>

        <h3>Premier tour de mise</h3>
        <p>
          En partant de la gauche de la grosse blind, chaque joueur doit suivre, relancer ou se coucher.
          Les blinds comptent comme des mises.
        </p>

        <h3>Le flop</h3>
        <p>
          Trois cartes communes sont posées face visible. Tous les joueurs peuvent les utiliser pour former leur meilleure main.
        </p>

        <h3>Deuxième tour de mise</h3>
        <p>
          Il commence à gauche du bouton. Sans mise obligatoire, les joueurs peuvent checker jusqu&apos;à ce que quelqu&apos;un mise.
        </p>

        <h3>Le turn</h3>
        <p>Une quatrième carte commune est posée face visible.</p>

        <h3>Troisième tour de mise</h3>
        <p>Un nouveau tour de mise a lieu, comme avant.</p>

        <h3>La river</h3>
        <p>
          La cinquième et dernière carte commune est posée. Les joueurs disposent maintenant de 7 cartes pour former
          leur meilleure main de 5 cartes.
        </p>

        <h3>Quatrième tour de mise</h3>
        <p>
          Le dernier tour de mise a lieu. Tous les joueurs restants connaissent leur meilleure main possible.
        </p>

        <h3>L&apos;abattage</h3>
        <p>
          Les joueurs restants dévoilent leurs cartes. La main la plus forte remporte le pot (ou il est partagé en cas
          d&apos;égalité). Le bouton avance ensuite d&apos;un siège vers la gauche et la main suivante commence.
        </p>
      </article>

      <article>
        <h2>Comment gagner une main, une partie ou un tournoi</h2>
        <p>
          Les règles varient d&apos;une variante à l&apos;autre, mais tout le poker se découpe en mains – un tour de jeu
          qui commence par la distribution et se termine soit quand toutes les cartes sont dévoilées et que le pot
          revient à la meilleure main, soit quand il ne reste qu&apos;un joueur parce que tous les autres se sont couchés.
        </p>
        <p>Il existe deux grandes façons de jouer au poker : le cash game et le tournoi.</p>

        <h3>Gagner en cash game</h3>
        <p>
          Un cash game se joue sans fin prévue. Les joueurs peuvent partir quand ils veulent et s&apos;asseoir dès qu&apos;une
          place se libère. On ne « gagne » pas vraiment un cash game – chacun décide quand s&apos;arrêter.
        </p>

        <h3>Gagner un tournoi</h3>
        <p>
          Dans un tournoi, tous les joueurs paient le même droit d&apos;entrée et démarrent avec le même tapis. Le jeu
          continue jusqu&apos;à ce qu&apos;il ne reste qu&apos;un joueur. Les blinds augmentent à intervalles réguliers pour
          forcer l&apos;action. Les gains sont partagés entre les premiers du classement, la plus grosse part allant au vainqueur.
        </p>
      </article>

      <article>
        <h2>Blinds, mises et position</h2>

        <h3>Que sont les blinds au poker ?</h3>
        <p>
          La plupart des mains commencent par deux joueurs qui postent les blinds – des mises obligatoires pour créer un
          pot. La position du donneur est marquée par un bouton qui avance d&apos;un siège vers la gauche à chaque main.
          La petite blind se trouve juste à gauche du bouton, et la grosse blind à gauche de la petite blind.
        </p>
        <p>
          Chaque joueur doit suivre, relancer ou se coucher face à la grosse blind. Si tout le monde se couche, la grosse
          blind remporte le pot sans combat. Si des joueurs suivent, la grosse blind peut checker ou relancer.
        </p>

        <h3>Comment fonctionnent les mises</h3>
        <ul>
          <li>Le jeu tourne dans le sens des aiguilles d&apos;une montre, en commençant par le premier joueur à gauche du bouton.</li>
          <li>Pour rester dans la main, il faut au moins égaler la plus haute mise.</li>
          <li>S&apos;il n&apos;y a pas de mise en cours, on peut checker.</li>
          <li>Un joueur à court de jetons peut aller à tapis (all-in).</li>
          <li>La relance minimum égale la mise précédente ; le maximum dépend du type de jeu.</li>
        </ul>

        <h3>Connaître les structures de mise</h3>
        <p>
          <strong>Limit :</strong> les mises se font en unités fixes (petites et grosses).
          <br />
          <strong>No-Limit :</strong> n&apos;importe quel montant, jusqu&apos;à tout son tapis.
          <br />
          <strong>Pot-Limit :</strong> la relance maximum égale la taille du pot à ce moment-là.
        </p>
      </article>
    </>
  ),
};

export default async function LearnRulesPage() {
  const locale = await getLocale();
  const Content = CONTENT[locale];
  return (
    <section className="learn-page">
      <Content />
    </section>
  );
}
