import Image from "next/image";
import HANDS from "./hands.data.js";
import HandExample from "./hand-example.jsx";

export default function LearnHandsPage() {
  return (
    <>
      <section className="poker-hands">
        <h1>Poker Hand Rankings</h1>
        <div className="divider"></div>
        <div className="img--chart-wrapper">
          <Image src="/poker-hands-chart.avif"
            className="img img--chart"
            alt="Poker hand rankings chart"
            fill
            priority
            style={{ objectFit: "contain", objectPosition: "left top" }}
          />
        </div>
    
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

        {/* Légende commune aux visuels */}
        <p className="hand-legend">Bright cards make the hand; faded cards are kickers, used only to break ties.</p>

        {HANDS.map((hand) => (
          <article key={hand.position} className="hand-rank">
            <div className="hand-rank__header">
              <h2>#{hand.position} – {hand.name}</h2>
              <HandExample cards={hand.cards} made={hand.made} label={hand.label} />
            </div>
            {hand.paragraphs.map((text) => (
              <p key={text}>{text}</p>
            ))}
          </article>
        ))}
      </section>

    </>
  );
}
