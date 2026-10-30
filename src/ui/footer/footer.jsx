"use client";
import { usePathname } from "next/navigation.js";
import Link from "next/link.js";
import Image from "next/image";
import useAuthStore from "@/stores/useAuthStore";
import { useT } from "@/i18n/i18n-provider.jsx";
import LanguageSwitcher from "@/i18n/language-switcher.jsx";
import userService from "@/services/user.service.js";

const MESSAGES = {
    en: {
        home: "PokerBuddy home",
        tagline: "Home poker nights, made simple.",
        nav: "Footer",
        games: "My Games",
        leaderboard: "Leaderboard",
        learn: "Learn",
        help: "Help",
        profile: "Profile",
        madeBy: "Made by",
    },
    fr: {
        home: "Accueil PokerBuddy",
        tagline: "Vos soirées poker entre amis, en toute simplicité.",
        nav: "Pied de page",
        games: "Mes parties",
        leaderboard: "Classement",
        learn: "Apprendre",
        help: "Aide",
        profile: "Profil",
        madeBy: "Réalisé par",
    },
};

export default function Footer() {
    const pathname = usePathname();
    const user = useAuthStore((state) => state.user);
    const { t } = useT(MESSAGES);
    if (pathname === "/manager") return null;

    return (
        <footer className="footer">
            <div className="footer__inner">
                <div className="footer__brand">
                    {/* Variante claire (lisible sur le marine) ; nom du lien porté par aria-label,
                        image décorative (alt vide) pour éviter une double annonce */}
                    <Link href="/" className="footer__logo" aria-label={t("home")}>
                        <Image
                            src="/pokerbuddy_logo_light.png"
                            alt=""
                            width={88}
                            height={40}
                            className="footer__logo-img"
                        />
                    </Link>
                    <p className="footer__tagline">{t("tagline")}</p>
                </div>

                <nav className="footer__nav" aria-label={t("nav")}>
                    {/* Pages privées : visibles seulement une fois connecté */}
                    {user && <Link href="/games">{t("games")}</Link>}
                    {user && <Link href="/leaderboard">{t("leaderboard")}</Link>}
                    <Link href="/learn">{t("learn")}</Link>
                    <Link href="/help">{t("help")}</Link>
                    {user && <Link href="/profile">{t("profile")}</Link>}
                </nav>

                <div className="footer__credit">
                    <LanguageSwitcher className="footer__language" onChange={(code) => { if (user) userService.updateLocale(code); }} />
                    <p>{t("madeBy")} <a href="https://github.com/LoicDupong" target="_blank" rel="noopener noreferrer" className="footer__link">Loïc Dupong</a></p>
                    <p className="footer__copy">© {new Date().getFullYear()} PokerBuddy</p>
                </div>
            </div>
        </footer>
    );
}
