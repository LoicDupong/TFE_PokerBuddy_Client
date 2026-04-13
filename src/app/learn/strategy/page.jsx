import Link from "next/link.js";

export default function LearnStrategyPage() {
  return (
    <section className="learn-page">
      <h1>Strategy Guide</h1>
      <div className="divider"></div>

      <article>
        <p>
          Every poker player wants to improve and to win more pots, but not everyone has the time,
          the patience or the ability to think deeply about poker strategy.
        </p>
        <p>
          That&apos;s why we&apos;ve condensed some of the most important elements of poker strategy into a single page,
          where players can <strong>learn the fundamentals of solid poker play without becoming overwhelmed</strong>.
          We&apos;ll focus on <strong>Texas Hold&apos;em</strong>, but many of these principles apply to other poker games too.
          Let&apos;s break it down into four key points.
        </p>
      </article>

      <article>
        <h2>Your Starting Cards are Important</h2>
        <p>Probably the most important question you&apos;ll ask yourself in any given pot is:</p>
        <p><i>&quot;Should I play this hand?&quot;</i></p>
        <p>
          It doesn&apos;t matter what game you&apos;re playing, from <strong>Texas Hold&apos;em</strong>
          to <strong>Omaha</strong>, <strong>Royal Poker</strong> or any other variant,
          the decision of whether or not to play a hand is one that will have a major impact on your success as a player.
          Simply put, <strong>the more often you hold better cards than your opponents, the more pots you&apos;ll win</strong> in the long run.
        </p>
        <p>
          The good news is that folding is always free, but how do you know which are the better hands to play?
          There are always exceptions to the rule, but generally <strong>the most playable hands in Hold&apos;em</strong>
          fall into the following groups:
        </p>

        <h3>Pairs</h3>
        <p>
          When you start with a pair already made, you&apos;re statistically ahead of any hand that doesn&apos;t have a higher pair.
          <strong> Premium pairs</strong> like aces and kings are usually best played aggressively,
          while <strong>lower pairs</strong> have more value if you can see a cheap flop and have the chance to make a set (three-of-a-kind).
        </p>

        <h3>Aces and High Cards</h3>
        <p>
          Hands with <strong>unpaired high cards</strong> like AK or AQ are sometimes good enough to win a pot without improving,
          especially short-handed, and if they do connect with the flop you&apos;re likely to have made a strong hand.
          However if they don&apos;t improve, and if your opponents are showing strength,
          you may need to fold these nice-looking hands.
        </p>

        <h3>Connectors</h3>
        <p>
          Hands like TJ, 78 or 56 can be profitable if you can see a flop with them
          <strong> without committing a lot of chips</strong>, especially if they are suited.
          Being able to make a straight or a flush, combined with how few opponents will expect you to hold such cards,
          can lead to winning some very big pots with cards like these.
        </p>
      </article>

      <article>
        <h2>Position is Power</h2>
        <p>
          Players at a poker table can be thought of as being seated in one of three positions: early, middle and late.
          This is <strong>in relation to the dealer position</strong>, which is the last player to act on most betting rounds
          and so is considered the very latest of the late positions, while the small blind – first to act on most betting rounds – is the earliest position.
        </p>
        <p>
          A player in late position has an <strong>inherent advantage over all players who act before them</strong>,
          as they are able to make their decisions having already seen what their opponents have chosen to do.
          This advantage is so significant that the dealer position changes after every hand,
          so the advantage of late position is constantly shifting and all players are able to exploit it.
        </p>
        <p>And how do you exploit it? Play more hands.</p>
        <p>
          With less chance of being raised, and with the benefit of knowing how your opponents have acted when given the chance to bet,
          late position often allows you to <strong>
            play <Link href="/learn/hands">weaker poker hands</Link> that you wouldn&apos;t play from early position
          </strong>.
          This poker strategy is known as <strong>&apos;widening your range&apos;</strong>,
          and can help you win more pots and maintain a more unpredictable table image.
        </p>
      </article>

      <article>
        <h2>Know Your Odds and Outs</h2>
        <p>
          Whether you&apos;re a ring game player looking to improve your bottom line,
          or you&apos;re honing a sit &apos;n&apos; go strategy to increase your tournament ROI,
          an <strong>understanding of pot odds</strong> is an important weapon in your arsenal.
        </p>
        <p>
          Where this usually comes into play is when you believe you are losing to a stronger hand,
          but will win the pot if a certain card is dealt. Let&apos;s say your opponent bets,
          and you have this common question to consider:
        </p>
        <p><i>&quot;Should I call, hoping to hit the card which will win me the pot?&quot;</i></p>
        <p>
          There&apos;s actually a fairly simple way to figure out the answer to this question,
          and while it does involve a small amount of math you certainly don&apos;t need to be a genius to do it!
        </p>
        <p>
          Firstly, you need to count <strong>the number of cards that you believe will win you the pot</strong>.
          Let&apos;s say that on the turn you have four clubs and need one more to make a flush,
          otherwise you&apos;re confident you&apos;ll lose the pot.
          There are 13 clubs in the deck, of which you have 4, leaving 9 clubs left to hit.
          These 9 cards are known as your <strong>&apos;outs&apos;</strong>.
        </p>
        <p>
          Next, work out the <strong>number of unseen cards left in the deck</strong>.
          In a game of Hold&apos;em, on the turn, you can see 6 cards (your two hole cards plus the four community cards),
          leaving 46 cards in the deck that are unseen.
        </p>
        <p>
          Of these 46 cards 9 are your outs and will win you the hand, leaving 37 cards which won&apos;t.
          The ratio of &apos;bad&apos; cards to &apos;good&apos; cards in this scenario is <strong>37 to 9</strong>,
          or very close to <strong>4 to 1</strong>. This means the probability of hitting your winning card is around 20%.
        </p>
        <p>
          So, should you call the bet? This is where <strong>&apos;pot odds&apos;</strong> comes into play –
          <strong>the ratio of chips in the pot to the chips you need to put in to call</strong>.
          If this ratio is higher than the &apos;bad&apos; to &apos;good&apos; cards ratio, above, then you should call. If it&apos;s lower, you should fold.
        </p>
        <p>
          With 4 clubs in your hand and 9 outs which will win you the pot, imagine your opponent bets 100 chips into a pot already containing 100 chips.
          The ratio of the pot (200 chips) to the amount you have to put in (100 chips) is only <strong>2 to 1</strong> –
          lower than the <strong>4 to 1</strong> chance you have of hitting your out and winning the pot. That&apos;s a clear <strong>fold</strong>.
        </p>
        <p>
          Now, imagine the same scenario, but this time the pot contains 4,900 chips and your opponent bets 100 chips.
          The ratio of the pot (5,000) to the amount you have to put in (100 chips) is now <strong>50 to 1</strong> –
          much higher than the <strong>4 to 1</strong> chance you have of winning. That&apos;s a clear <strong>call</strong>!
        </p>
      </article>

      <article>
        <h2>Reading Players and Ranges</h2>
        <p>
          Many traditional poker strategy guides in the past might focus on reading your opponent&apos;s body language,
          looking for tells like shaking hands or shifty looks to get a read on them and figure out if they&apos;re bluffing or not.
        </p>
        <p>
          But that doesn&apos;t mean it&apos;s impossible to read your opponents. Pay attention to how your opponents play
          when you&apos;re not in a hand, and you&apos;re sure to start to <strong>notice patterns</strong>.
        </p>
        <p>
          Has one player shown down <strong>multiple weak hands</strong>, paid to stay in with <strong>unlikely draws</strong>,
          and made big calls without big hands to go with them?
          Play your good hands more aggressively against this type of player and you&apos;re likely to get paid off,
          but be careful trying to bluff them – they might just decide to call without a good hand…and beat you!
        </p>
        <p>
          At the other end of the spectrum, you may notice players who <strong>rarely enter a pot</strong> at all,
          who apparently wait for <strong>only good hands</strong>, and who only press their advantage when they are sure they have an unbeatable hand.
          When facing these players you should play more hands, more aggressively,
          as you&apos;re likely to be able to push them off all but their very best hands.
        </p>
        <p>
          By categorizing players in this way you&apos;ll soon get an idea for the type of hands different players are willing to play,
          and how they&apos;ll play them. This will help you put your opponent on a <strong>&apos;range&apos;</strong> –
          a collection of card combinations that they would play the way they have.
        </p>
        <p>
          The looser the player, the wider their range, so if a very tight player raises from early position,
          you can be fairly certain they have a strong hand.
          Likewise, players that limp pre-flop are unlikely to have super-strong hands that they would usually raise with to protect.
        </p>
      </article>

      <article>
        <h2>Develop Your Own Poker Strategy</h2>
        <p>
          One of the great things about poker is how everyone plays it differently,
          so you should take the points above as general guidelines – you&apos;ll always find players who surprise you
          with unorthodox approaches or unusual tactics.
          Tournaments, formats, variations and players can change from game to game, and context is always important.
        </p>
        <p>
          That said, if you take these points on board as you gain experience at the tables,
          you&apos;ll be well-prepared to <strong>grow as a player</strong> and see your <strong>results improve</strong> too.
        </p>
        <p>
          Use this advice to form the foundations of your own poker strategy, and go crush it at the tables!
        </p>
      </article>

    </section>
  );
}
