"use client";
import { usePathname } from "next/navigation.js";
import Link from "next/link.js";

export default function Footer() {
    const pathname = usePathname();
    if (pathname === "/manager") return null;

    return (
        <footer className="footer">
            <div className="footer__inner">
                <div className="footer__brand">
                    <span className="footer__logo">♠ PokerBuddy</span>
                    <p className="footer__tagline">Home poker nights, made simple.</p>
                </div>

                <nav className="footer__nav">
                    <Link href="/games">My Games</Link>
                    <Link href="/leaderboard">Leaderboard</Link>
                    <Link href="/learn">Learn</Link>
                    <Link href="/profile">Profile</Link>
                </nav>

                <div className="footer__credit">
                    <p>Made by <a href="https://github.com/LoicDupong" target="_blank" rel="noopener noreferrer" className="footer__link">Loïc Dupong</a></p>
                    <p className="footer__copy">© {new Date().getFullYear()} PokerBuddy</p>
                </div>
            </div>
        </footer>
    );
}
