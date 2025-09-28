import Image from "next/image";

export default function LearnHandsPage() {
  return (
    <>
      <section className="poker-hands">
        <h1>Poker Hand Rankings</h1>
        <div className="divider"></div>
        <Image src="/poker-hands-chart.avif"
          className="img img--chart"
          alt="PokerBuddy logo"
          width={1000}
          height={550}
          priority />
    
        <div className="divider"></div>
        <article>
          <p>
            From Texas Hold’em to Omaha, Royal Hold’em, Stud and many more, there are more varieties of
            poker game out there than we can name.
          </p>
          <p>
            Each may have their own rules, but one thing most of them share is the order of winning poker
            hands – the hierarchy of which hands beats which others.
          </p>
          <p>
            This card explains the specifics of all the poker hands you can make in most poker games, as well
            as which other hands they beat and those to which they’ll lose. If you’re just starting out, we
            recommend bookmarking this page for easy reference.
          </p>
          <p>
            Don’t forget that in the case of a tie the pot will usually be awarded to the hand which uses the
            highest ranking cards. That means a pair of aces beats a pair of kings, that a 9-high straight
            beats a 6-high straight, queens full beats jacks full, and so on.
          </p>
          <p>
            If more than one player has the same hand, such as a pair of kings, then the next highest card in
            their hand – the kicker – will be used to determine the winner. If winning hands are completely
            identical, they tie and split the pot. Suits are never used to determine a winner.
          </p>
          <p>We’ll start with the best poker hand and work our way down the rankings.</p>
        </article>

        <article>
          <h2>#1 – Royal Flush</h2>
          <p>Ts Js Qs Ks As</p>
          <p>
            A straight flush is five cards in sequential order, all of the same suit. As this straight
            flush is all the way to the ace, it is known as a royal flush and is an unbeatable high hand.
          </p>
        </article>

        <article>
          <h2>#2 – Straight Flush</h2>
          <p>4h 5h 6h 7h 8h</p>
          <p>
            A straight flush that stops short of the ace is still one of the strongest hands in almost
            every poker game. It’s called a straight flush because it meets the requirements of both a
            flush and a straight.
          </p>
        </article>

        <article>
          <h2>#3 – Four of a Kind</h2>
          <p>9h 9c 9s 9d Jh</p>
          <p>
            Also known as quads, four of a kind is just what it sounds like: four cards of the same rank,
            plus any other card. In the case of a tie, the player with the higher ranked quads wins.
          </p>
          <p>
            In flop games, or games using wildcards, more than one player may make the same set of quads,
            in which case the unmatched fifth card (the kicker) is used to determine the winner.
          </p>
        </article>

        <article>
          <h2>#4 – Full House</h2>
          <p>Qd Qh Qs Kd Ks</p>
          <p>
            Also known as a boat, a full house consists of three-of-a-kind plus a pair. In case of a tie,
            the highest ranked three-of-a-kind wins. If they are equal, the highest accompanying pair wins.
          </p>
        </article>

        <article>
          <h2>#5 – Flush</h2>
          <p>2d Td Qd 6d 5d</p>
          <p>
            Five cards of the same suit make a flush. What differentiates one flush from another is the rank
            of the highest card. An ace-high flush is the strongest flush.
          </p>
        </article>

        <article>
          <h2>#6 – Straight</h2>
          <p>3h 4s 5s 6d 7s</p>
          <p>
            Five cards in sequence – of any suits – make a straight. The highest card in the straight
            determines the winner in case of a tie.
          </p>
          <p>
            Note: an ace may be high (A-K-Q-J-T) or low (A-2-3-4-5).
          </p>
        </article>

        <article>
          <h2>#7 – Three-of-a-Kind</h2>
          <p>5c 5h 5s 9h 2d</p>
          <p>
            Three cards of the same rank plus two unrelated cards. Known as a set (if you hold the pair +
            one on the board) or trips (if one in your hand matches a pair on the board).
          </p>
        </article>

        <article>
          <h2>#8 – Two Pair</h2>
          <p>7h 7s 3d 3c Jh</p>
          <p>
            A hand containing two pairs plus a fifth card. Ties are broken by the highest pair, then by the
            second pair, then by the kicker.
          </p>
        </article>

        <article>
          <h2>#9 – One Pair</h2>
          <p>Ks Kh 9s 5d 2h</p>
          <p>
            A single pair of cards with the same rank plus three other unconnected cards. Ties are won by
            the highest pair, then by kickers if needed.
          </p>
        </article>

        <article>
          <h2>#10 – High Card</h2>
          <p>Ad Jh 8h 5s 6c</p>
          <p>
            If you don’t make any of the hands above, your hand strength is determined by your highest card.
            Ace-high is the best, 6-high the weakest. Ties are broken by kickers.
          </p>
        </article>
      </section>

    </>
  );
}