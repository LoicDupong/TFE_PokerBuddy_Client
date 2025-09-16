import Image from "next/image";
import Navbar from "../navbar/navbar.jsx";
import Link from "next/link.js";

export default function Header() {
    return (
        <header>
            <Link href={'/'}>
                <Image src="/pokerbuddy_logo_temp.png"
                    className="logo logo--header"
                    alt="PokerBuddy logo"
                    width={80}
                    height={80}
                    priority />
            </Link>
            <Navbar />

        </header>
    )
}