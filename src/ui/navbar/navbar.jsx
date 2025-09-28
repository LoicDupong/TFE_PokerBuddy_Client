"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faBell, faChevronDown, faChevronUp, faXmark } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link.js";
import Image from "next/image";
import { usePathname } from "next/navigation.js";
import { useEffect, useState } from "react";

import useAuthStore from "@/stores/useAuthStore";


const learnLinks = [
    { href: "/learn/rules", name: "Poker Rules" },
    { href: "/learn/hands", name: "Poker Hands" },
    { href: "/learn/strategy", name: "Poker Strategy" },
    { href: "/learn/terms", name: "Poker Terms" },
];

export default function Navbar() {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);


    const links = [
        { href: "/games", name: "Dashboard" },
        { href: "/games/create", name: "Create Game" },
        { href: "/manager", name: "Game Manager" },
        { href: "/leaderboard", name: "Leaderboard" },
        { href: "/profile", name: "Profile" },
        { href: "/", name: "Logout", action: logout }
    ];

    const baseLinks = [
        { href: "/", name: "Home" },
        { href: "/auth/login", name: "Login" },
        { href: "/manager", name: "Game Manager" },
    ];

    const pathname = usePathname();
    const mobile = 950;

    const [isMobile, setIsMobile] = useState(true);
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
        if (isOpen) {
            document.body.classList.add("no-scroll");
        } else {
            document.body.classList.remove("no-scroll");
        }

        return () => document.body.classList.remove("no-scroll"); // cleanup
    }, [isOpen]);

    // Desktop
    if (!isMobile) {
        return (
            <nav className="nav nav--desktop">
                {user ?
                    links.map(({ href, name, action }) =>
                        action ? (
                            <Link key={name} href={href} onClick={action} className="nav__item">
                                {name}
                            </Link>
                        ) : (
                            <Link
                                key={href}
                                href={href}
                                className={pathname === href ? "active nav__item" : "nav__item"}
                            >
                                {name}
                            </Link>
                        )
                    ) : baseLinks.map(({ href, name, action }) =>
                        action ? (
                            <Link key={name} href={href} onClick={action} className="nav__item">
                                {name}
                            </Link>
                        ) : (
                            <Link
                                key={href}
                                href={href}
                                className={pathname === href ? "active nav__item" : "nav__item"}
                            >
                                {name}
                            </Link>
                        )
                    )}


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
                <Link href={'/profile'} className="notification has-notification">
                    <FontAwesomeIcon icon={faBell} className="nav__icon--notification has-notification" size="xl" />
                </Link>
            </nav>
        );
    }

    // Mobile
    return (
        <nav className="nav">
            {user ?
                (<>
                    <Link href={'/profile'} className="notification has-notification">
                        <FontAwesomeIcon icon={faBell} className="nav__icon--notification" size="xl" />
                    </Link>
                    <div className="nav__toggle" onClick={() => setIsOpen(true)}>
                        <FontAwesomeIcon icon={faBars} className="nav__toggle" size="xl" />
                    </div>
                </>) : (
                    <div className="nav__toggle" onClick={() => setIsOpen(true)}>
                        <FontAwesomeIcon icon={faBars} className="nav__toggle" size="xl" />
                    </div>
                )
            }

            <div className={`nav--mobile ${isOpen ? "open" : ""}`}>
                <Link href={"/"} onClick={() => setIsOpen(false)}>
                    <Image
                        src="/pokerbuddy_logo_light.png"
                        className="logo logo--header"
                        alt="PokerBuddy logo"
                        width={135}
                        height={70}
                        priority
                    />
                </Link>
                <div
                    className={isOpen ? "nav__close" : "nav__toggle"}
                    onClick={() => setIsOpen(false)}
                >
                    <FontAwesomeIcon icon={faXmark} />
                </div>
                {user ? links.map(({ href, name, action }) =>
                    action ? (
                        <Link
                            key={name}
                            href={href}
                            onClick={() => {
                                action();
                                setIsOpen(false);
                            }}
                            className="nav__item"
                        >
                            {name}
                        </Link>
                    ) : (
                        <Link
                            key={href}
                            href={href}
                            className={pathname === href ? "active nav__item" : "nav__item"}
                            onClick={() => setIsOpen(false)}
                        >
                            {name}
                        </Link>
                    )
                ) :
                    baseLinks.map(({ href, name, action }) =>
                        action ? (
                            <Link
                                key={name}
                                href={href}
                                onClick={() => {
                                    action();
                                    setIsOpen(false);
                                }}
                                className="nav__item"
                            >
                                {name}
                            </Link>
                        ) : (
                            <Link
                                key={href}
                                href={href}
                                className={pathname === href ? "active nav__item" : "nav__item"}
                                onClick={() => setIsOpen(false)}
                            >
                                {name}
                            </Link>
                        )
                    )}

                {/* Learn dropdown mobile */}
                <div
                    className="nav__item nav__item--dropdown"
                    onClick={() => setLearnOpen(!learnOpen)}
                >
                    Learn{" "}
                    <FontAwesomeIcon
                        icon={learnOpen ? faChevronUp : faChevronDown}
                        className="nav__icon"
                    />
                </div>
                <div className={`nav__submenu ${learnOpen ? "open" : ""}`}>
                    {learnLinks.map(({ href, name }) => (
                        <Link
                            key={href}
                            href={href}
                            className={pathname === href ? "active nav__subitem" : "nav__subitem"}
                            onClick={() => setIsOpen(false)}
                        >
                            {name}
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
}
