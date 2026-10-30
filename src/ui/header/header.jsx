"use client";

import Image from "next/image";
import Navbar from "../navbar/navbar.jsx";
import Link from "next/link.js";
import { usePathname } from "next/navigation.js";
import { useT } from "@/i18n/i18n-provider.jsx";

const MESSAGES = { en: { logo: "PokerBuddy logo" }, fr: { logo: "Logo PokerBuddy" } };

export default function Header() {
    const pathname = usePathname();
    const { t } = useT(MESSAGES);
    const hidden = pathname === "/manager";

    return (
        <header className={hidden ? "hidden" : ""}>
            <Link href={'/'}>

                <Image src="/pokerbuddy_logo_light.png"
                    className="logo logo--header"
                    alt={t("logo")}
                    width={145}
                    height={70}
                    priority />
            </Link>
            <Navbar />

        </header>
    )
}