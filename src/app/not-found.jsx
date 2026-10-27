import Link from "next/link.js";

export const metadata = { title: "Page not found | PokerBuddy" };

export default function NotFound() {
    return (
        <section className="not-found">
            <p className="not-found__code" aria-hidden="true">404</p>
            <h1><span className="red">Page</span> not found</h1>
            <p>This page doesn&apos;t exist.</p>
            <Link href="/" className="btn">Back to home</Link>
        </section>
    );
}
