

export default function LearnRulesPage() {
  return (
    <>
      <section className="poker-rules">
        <h1>Poker Rules For Beginners</h1>

        <article>
          <p>
            Looking for a quick rundown on everything you need to know to get started playing poker?
          </p>
          <p>
            The poker rules below are applicable to both ring games and tournaments, as well as to the games
            of Texas Hold’em, Omaha and Royal Poker. Whichever games you find the most fun, you’ll find a
            good grounding right here.
          </p>
          <p>
            And once you’re ready to try it out for yourself, with absolutely no risk and no money required,
            sign up and join a thriving poker community – you just need an email address, nothing more!
          </p>
        </article>

        <article>
          <h2>How A Hand of Poker Plays Out (Texas Hold’em Example)</h2>

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
            Any remaining players reveal their hands. The strongest wins the pot (or it’s split if hands
            are equal). The dealer button then moves one seat left, and the next hand begins.
          </p>
        </article>

        {/* Section 1 */}
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
            join whenever a seat is open. There’s no way to ‘win’ a ring game – each player decides when
            to stop.
          </p>

          <h3>How to Win a Poker Tournament</h3>
          <p>
            In a poker tournament, all players pay the same entry and start with the same chip stack. Play
            continues until only one player remains. Blinds rise at set intervals, forcing action. Prizes
            are shared among the top finishers, with the biggest share going to the winner.
          </p>
        </article>

        {/* Section 2 */}
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
            <strong>No-Limit:</strong> Any amount up to the player’s whole stack.
            <br />
            <strong>Pot-Limit:</strong> The max raise equals the pot size at the time.
          </p>
        </article>

      </section>

    </>
  );
}