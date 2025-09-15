"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faXmark } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link.js";
import { usePathname } from "next/navigation.js";
import { useEffect, useState } from "react";


const links = [
    { href: '/', name: 'Home' },
    { href: '/games', name: 'Games' },
    { href: '/profile', name: 'Profile' },
    { href: '/leaderboard', name: 'Leaderboard' },
    { href: '/learn', name: 'Learn' },
    { href: '/login', name: 'Login' },
    { href: '/game/create', name: 'Create Game' },
];


export default function Navbar() {
    const pathname = usePathname();
    const mobile = 950

    const [isMobile, setIsMobile] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // fonction de resize
        const handleResize = () => setIsMobile(window.innerWidth <= mobile);
        handleResize(); // init
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Desktop
    if (!isMobile) {
        return (
            <nav className="nav nav--desktop">
                {links.map(({ href, name }) => (
                    <Link key={href} href={href} className="nav__item">
                        {name}
                    </Link>
                ))}
            </nav>
        );
    }


    // Mobile
    return (
        <nav className="nav">
            <div className="nav__toggle" onClick={() => setIsOpen(true)}>
                <FontAwesomeIcon icon={faBars} className="nav__toggle"  size="lg"/>
            </div>
            <div className={`nav--mobile ${isOpen ? "open" : ""}`}>
            <div className="logo">PokerBuddy</div>
                <div className={isOpen ? "nav__close" : "nav__toggle"} onClick={() => setIsOpen(false)}>
                    <FontAwesomeIcon icon={faXmark}/>
                </div>
                {links.map(({ href, name }) => (
                    <Link
                        key={href}
                        href={href}
                        className={pathname === href ? "active nav__item" : "nav__item"}
                        onClick={() => setIsOpen(false)}
                    >
                        {name}
                    </Link>
                ))}
            </div>
        </nav>
    );
}