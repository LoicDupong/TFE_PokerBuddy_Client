"use client";
import { usePathname } from "next/navigation.js";

export default function Footer(){
    const pathname = usePathname();
    const hidden = pathname === "/manager";
    
    return(
        <footer className={hidden ? "hidden" : ""}>
            <small className="gray">This is my footer ♠ <br />  Made by <a href="https://github.com/LoicDupong" target="_blank" className="social">Loïc Dupong</a></small>
        </footer>
    )
}