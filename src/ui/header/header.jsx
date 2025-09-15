import Image from "next/image";
import Navbar from "../navbar/navbar.jsx";

export default function Header() {
    return (
        <header>
            <Image src="/pokerbuddy_logo_temp.png"
                className="logo logo--header"
                alt="PokerBuddy logo"
                width={100}
                height={100}
                priority />
            <Navbar />

        </header>
    )
}