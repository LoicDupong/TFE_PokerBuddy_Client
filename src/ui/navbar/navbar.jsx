"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faBell, faChevronDown, faChevronUp, faXmark } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link.js";
import Image from "next/image";
import { usePathname } from "next/navigation.js";
import { useEffect, useState } from "react";

import useAuthStore from "@/stores/useAuthStore";
import useNotificationStore from "@/stores/useNotificationStore";


const learnLinks = [
    { href: "/learn/rules", name: "Poker Rules" },
    { href: "/learn/hands", name: "Poker Hands" },
    { href: "/learn/strategy", name: "Poker Strategy" },
    { href: "/learn/terms", name: "Poker Terms" },
];

export default function Navbar() {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const { unreadCount, fetchNotifications } = useNotificationStore();

    // Logout est rendu à part : toujours en dernier et visuellement secondaire
    const links = [
        { href: "/games", name: "My Games" },
        { href: "/games/create", name: "Create Game" },
        { href: "/manager", name: "Game Manager" },
        { href: "/leaderboard", name: "Leaderboard" },
        { href: "/profile", name: "Profile" },
    ];

    const baseLinks = [
        { href: "/", name: "Home" },
        { href: "/auth/login", name: "Login" },
        { href: "/manager", name: "Game Manager" },
    ];

    const bellLabel = unreadCount > 0 ? `Notifications (${unreadCount} unread)` : "Notifications";
    const bellClass = `notification${unreadCount > 0 ? " has-notification" : ""}`;

    const pathname = usePathname();
    // Sous 1280px les 7 liens ne tiennent pas sur une ligne à côté du logo : menu burger
    const mobile = 1280;

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

    useEffect(() => {
        if (!user) return;
        fetchNotifications();
        const onFocus = () => fetchNotifications();
        window.addEventListener("focus", onFocus);
        return () => window.removeEventListener("focus", onFocus);
    }, [user, fetchNotifications]);

    useEffect(() => {
        if (isOpen) {
            document.body.classList.add("menu-open");
        } else {
            document.body.classList.remove("menu-open");
        }

        return () => document.body.classList.remove("menu-open"); // cleanup
    }, [isOpen]);

    if (isMobile === null) return <nav className="nav" />;

    const navLinks = user ? links : baseLinks;

    // Desktop
    if (!isMobile) {
        return (
            <nav className="nav nav--desktop" aria-label="Main">
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
                        Learn <FontAwesomeIcon icon={faChevronDown} className="nav__icon" />
                    </span>
                    <div className="nav__submenu">
                        {learnLinks.map(({ href, name }) => (
                            <Link key={href} href={href} className="nav__subitem">
                                {name}
                            </Link>
                        ))}
                    </div>
                </div>
                {user && (
                    <Link href="/" onClick={logout} className="nav__item nav__item--logout">
                        Logout
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
        <nav className="nav" aria-label="Main">
            {user && (
                <Link href={'/notifications'} aria-label={bellLabel} className={bellClass}>
                    <FontAwesomeIcon icon={faBell} className="nav__icon--notification" size="xl" aria-hidden="true" />
                </Link>
            )}
            <button type="button" className="nav__toggle" onClick={() => setIsOpen(true)} aria-label="Open menu" aria-expanded={isOpen}>
                <FontAwesomeIcon icon={faBars} size="xl" aria-hidden="true" />
            </button>

            <div className={`nav--mobile ${isOpen ? "open" : ""}`}>
                {/* Même barre que l'en-tête (logo, cloche, croix à la place du burger) : le logo ne bouge pas */}
                <div className="nav__mobile-top">
                    <Link href={"/"} onClick={() => setIsOpen(false)}>
                        <Image
                            src="/pokerbuddy_logo_light.png"
                            className="logo logo--header"
                            alt="PokerBuddy logo"
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
                        <button type="button" className="nav__close" onClick={() => setIsOpen(false)} aria-label="Close menu">
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
                        Learn{" "}
                        <FontAwesomeIcon
                            icon={learnOpen ? faChevronUp : faChevronDown}
                            className="nav__icon"
                        />
                    </button>
                    <div className={`nav__submenu ${learnOpen ? "open" : ""}`}>
                        {learnLinks.map(({ href, name }) => (
                            <Link
                                key={href}
                                href={href}
                                className={pathname === href ? "active nav__subitem" : "nav__subitem"}
                                aria-current={pathname === href ? "page" : undefined}
                                onClick={() => setIsOpen(false)}
                            >
                                {name}
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
                            Logout
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
