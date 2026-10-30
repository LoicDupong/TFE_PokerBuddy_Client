"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faBell, faChevronDown, faChevronUp, faXmark } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link.js";
import Image from "next/image";
import { usePathname } from "next/navigation.js";
import { useEffect, useState } from "react";

import useAuthStore from "@/stores/useAuthStore";
import useNotificationStore, { useNotificationSync } from "@/stores/useNotificationStore";
import { useT } from "@/i18n/i18n-provider.jsx";


const MESSAGES = {
    en: {
        games: "My Games", create: "Create Game", manager: "Game Manager", leaderboard: "Leaderboard",
        profile: "Profile", admin: "Admin", home: "Home", login: "Login", logout: "Logout", learn: "Learn",
        rules: "Poker Rules", hands: "Poker Hands", strategy: "Poker Strategy", terms: "Poker Terms",
        main: "Main", openMenu: "Open menu", closeMenu: "Close menu", logo: "PokerBuddy logo",
        notifications: "Notifications",
        notificationsUnread: (p) => `Notifications (${p.count} unread)`,
    },
    fr: {
        games: "Mes parties", create: "Créer une partie", manager: "Game Manager", leaderboard: "Classement",
        profile: "Profil", admin: "Admin", home: "Accueil", login: "Connexion", logout: "Déconnexion", learn: "Apprendre",
        rules: "Règles du poker", hands: "Mains de poker", strategy: "Stratégie", terms: "Lexique du poker",
        main: "Principale", openMenu: "Ouvrir le menu", closeMenu: "Fermer le menu", logo: "Logo PokerBuddy",
        notifications: "Notifications",
        notificationsUnread: (p) => `Notifications (${p.count} non lue${p.count > 1 ? "s" : ""})`,
    },
};

const learnLinks = [
    { href: "/learn/rules", key: "rules" },
    { href: "/learn/hands", key: "hands" },
    { href: "/learn/strategy", key: "strategy" },
    { href: "/learn/terms", key: "terms" },
];

export default function Navbar() {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const unreadCount = useNotificationStore((state) => state.unreadCount);
    const { t, locale } = useT(MESSAGES);

    // Logout est rendu à part : toujours en dernier et visuellement secondaire
    const links = [
        { href: "/games", name: t("games") },
        { href: "/games/create", name: t("create") },
        { href: "/manager", name: t("manager") },
        { href: "/leaderboard", name: t("leaderboard") },
        { href: "/profile", name: t("profile") },
    ];

    const baseLinks = [
        { href: "/", name: t("home") },
        { href: "/auth/login", name: t("login") },
        { href: "/manager", name: t("manager") },
    ];

    const bellLabel = unreadCount > 0 ? t("notificationsUnread", { count: unreadCount }) : t("notifications");
    const bellClass = `notification${unreadCount > 0 ? " has-notification" : ""}`;

    const pathname = usePathname();
    // Sous 1280px les 7 liens ne tiennent pas sur une ligne à côté du logo : menu burger
    // (le français est plus long : le burger prend le relais un peu plus tôt)
    const mobile = locale === "fr" ? 1360 : 1280;

    // null tant que la largeur n'est pas connue : évite d'afficher la nav mobile un instant sur desktop
    const [isMobile, setIsMobile] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [learnOpen, setLearnOpen] = useState(false);


    useEffect(() => {
        // fonction de resize
        const handleResize = () => setIsMobile(window.innerWidth <= mobile);
        handleResize(); // init
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Notifications récupérées au montage, au focus, au retour sur l'onglet et toutes les 60 s
    // (onglet visible) : boucle partagée avec les toasts, une seule requête à la fois
    useNotificationSync(user?.id);

    useEffect(() => {
        if (isOpen) {
            document.body.classList.add("menu-open");
        } else {
            document.body.classList.remove("menu-open");
        }

        return () => document.body.classList.remove("menu-open"); // cleanup
    }, [isOpen]);

    if (isMobile === null) return <nav className="nav" />;

    // Lien Admin : confort d'affichage seulement, l'API refuse de toute façon un non-admin
    const navLinks = user ? (user.role === "admin" ? [...links, { href: "/admin", name: t("admin") }] : links) : baseLinks;

    // Desktop
    if (!isMobile) {
        return (
            <nav className="nav nav--desktop" aria-label={t("main")}>
                {navLinks.map(({ href, name }) => (
                    <Link
                        key={href}
                        href={href}
                        className={pathname === href ? "active nav__item" : "nav__item"}
                    >
                        {name}
                    </Link>
                ))}

                {/* Learn dropdown desktop */}
                <div className="nav__dropdown">
                    <span className="nav__item nav__item--dropdown">
                        {t("learn")} <FontAwesomeIcon icon={faChevronDown} className="nav__icon" />
                    </span>
                    <div className="nav__submenu">
                        {learnLinks.map(({ href, key }) => (
                            <Link key={href} href={href} className="nav__subitem">
                                {t(key)}
                            </Link>
                        ))}
                    </div>
                </div>
                {user && (
                    <Link href="/" onClick={logout} className="nav__item nav__item--logout">
                        {t("logout")}
                    </Link>
                )}
                {/* Pas de has-notification sur l'icône : le point est déjà sur le lien */}
                <Link href={'/notifications'} aria-label={bellLabel} className={bellClass}>
                    <FontAwesomeIcon icon={faBell} className="nav__icon--notification" size="xl" aria-hidden="true" />
                </Link>
            </nav>
        );
    }

    // Mobile
    return (
        <nav className="nav" aria-label={t("main")}>
            {user && (
                <Link href={'/notifications'} aria-label={bellLabel} className={bellClass}>
                    <FontAwesomeIcon icon={faBell} className="nav__icon--notification" size="xl" aria-hidden="true" />
                </Link>
            )}
            <button type="button" className="nav__toggle" onClick={() => setIsOpen(true)} aria-label={t("openMenu")} aria-expanded={isOpen}>
                <FontAwesomeIcon icon={faBars} size="xl" aria-hidden="true" />
            </button>

            <div className={`nav--mobile ${isOpen ? "open" : ""}`}>
                {/* Même barre que l'en-tête (logo, cloche, croix à la place du burger) : le logo ne bouge pas */}
                <div className="nav__mobile-top">
                    <Link href={"/"} onClick={() => setIsOpen(false)}>
                        <Image
                            src="/pokerbuddy_logo_light.png"
                            className="logo logo--header"
                            alt={t("logo")}
                            width={145}
                            height={70}
                            priority
                        />
                    </Link>
                    <div className="nav__mobile-actions">
                        {user && (
                            <Link href={'/notifications'} aria-label={bellLabel} className={bellClass} onClick={() => setIsOpen(false)}>
                                <FontAwesomeIcon icon={faBell} className="nav__icon--notification" size="xl" aria-hidden="true" />
                            </Link>
                        )}
                        <button type="button" className="nav__close" onClick={() => setIsOpen(false)} aria-label={t("closeMenu")}>
                            <FontAwesomeIcon icon={faXmark} aria-hidden="true" />
                        </button>
                    </div>
                </div>

                <div className="nav__mobile-links">
                    {navLinks.map(({ href, name }) => (
                        <Link
                            key={href}
                            href={href}
                            className={pathname === href ? "active nav__item" : "nav__item"}
                            aria-current={pathname === href ? "page" : undefined}
                            onClick={() => setIsOpen(false)}
                        >
                            {name}
                        </Link>
                    ))}

                    {/* Learn dropdown mobile */}
                    <button
                        type="button"
                        className="nav__item nav__item--dropdown"
                        onClick={() => setLearnOpen(!learnOpen)}
                        aria-expanded={learnOpen}
                    >
                        {t("learn")}{" "}
                        <FontAwesomeIcon
                            icon={learnOpen ? faChevronUp : faChevronDown}
                            className="nav__icon"
                        />
                    </button>
                    <div className={`nav__submenu ${learnOpen ? "open" : ""}`}>
                        {learnLinks.map(({ href, key }) => (
                            <Link
                                key={href}
                                href={href}
                                className={pathname === href ? "active nav__subitem" : "nav__subitem"}
                                aria-current={pathname === href ? "page" : undefined}
                                onClick={() => setIsOpen(false)}
                            >
                                {t(key)}
                            </Link>
                        ))}
                    </div>

                    {user && (
                        <Link
                            href="/"
                            onClick={() => {
                                logout();
                                setIsOpen(false);
                            }}
                            className="nav__item nav__item--logout"
                        >
                            {t("logout")}
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
