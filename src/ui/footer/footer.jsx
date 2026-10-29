"use client";
import { usePathname } from "next/navigation.js";
import Link from "next/link.js";
import Image from "next/image";
import useAuthStore from "@/stores/useAuthStore";

export default function Footer() {
    const pathname = usePathname();
    const user = useAuthStore((state) => state.user);
    if (pathname === "/manager") return null;

    return (
        <footer className="footer">
            <div className="footer__inner">
                <div className="footer__brand">
                    {/* Variante claire (lisible sur le marine) ; nom du lien porté par aria-label,
                        image décorative (alt vide) pour éviter une double annonce */}
                    <Link href="/" className="footer__logo" aria-label="PokerBuddy home">
                        <Image
                            src="/pokerbuddy_logo_light.png"
                            alt=""
                            width={88}
                            height={40}
                            className="footer__logo-img"
                        />
                    </Link>
                    <p className="footer__tagline">Home poker nights, made simple.</p>
                </div>

                <nav className="footer__nav" aria-label="Footer">
                    {/* Pages privées : visibles seulement une fois connecté */}
                    {user && <Link href="/games">My Games</Link>}
                    {user && <Link href="/leaderboard">Leaderboard</Link>}
                    <Link href="/learn">Learn</Link>
                    <Link href="/help">Help</Link>
                    {user && <Link href="/profile">Profile</Link>}
                </nav>

                <div className="footer__credit">
                    <p>Made by <a href="https://github.com/LoicDupong" target="_blank" rel="noopener noreferrer" className="footer__link">Loïc Dupong</a></p>
                    <p className="footer__copy">© {new Date().getFullYear()} PokerBuddy</p>
                </div>
            </div>
        </footer>
    );
}
