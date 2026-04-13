import Link from "next/link.js";

export default function LearnPage() {
  return (
    <section className="learn-hub">
      <h1>Learn Poker</h1>
      <div className="divider"></div>
      <p className="learn-hub__intro">
        Whether you&apos;re a complete beginner or looking to sharpen your game, explore the guides below.
      </p>
      <div className="learn-hub__grid">
        <Link href="/learn/hands" className="learn-hub__card">
          <h2>Hand Rankings</h2>
          <p>Learn the 10 poker hands, from Royal Flush down to High Card.</p>
        </Link>
        <Link href="/learn/rules" className="learn-hub__card">
          <h2>Rules &amp; Gameplay</h2>
          <p>How a hand plays out, blinds, betting rounds, and winning conditions.</p>
        </Link>
        <Link href="/learn/strategy" className="learn-hub__card">
          <h2>Strategy Guide</h2>
          <p>Starting hands, position, pot odds, and how to read your opponents.</p>
        </Link>
        <Link href="/learn/terms" className="learn-hub__card">
          <h2>Poker Glossary</h2>
          <p>An A–Z reference of poker terms and slang for every situation.</p>
        </Link>
      </div>
    </section>
  );
}
