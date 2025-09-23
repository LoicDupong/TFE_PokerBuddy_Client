"use client";

import Image from "next/image";
import Navbar from "../navbar/navbar.jsx";
import Link from "next/link.js";
import { usePathname } from "next/navigation.js";

export default function Header() {
    const pathname = usePathname();
    const hidden = pathname === "/manager";

    return (
        <header className={hidden ? "hidden" : ""}>
            <Link href={'/'}>

                <Image src="/pokerbuddy_logo_light.png"
                    className="logo logo--header"
                    alt="PokerBuddy logo"
                    width={145}
                    height={70}
                    priority />
            </Link>
            <Navbar />

        </header>
    )
}