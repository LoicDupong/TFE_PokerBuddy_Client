"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import useAuthStore from "@/stores/useAuthStore.js";
import { useTexts } from "@/components/admin/admin.utils.js";

// Textes de la section admin (extraction FR/EN en vague 3)
const LAYOUT_MESSAGES = {
    en: {
        title: "Admin",
        loading: "Loading…",
        restrictedTitle: "Admin area",
        restrictedBody: "This section is reserved for administrators. Your account does not have access to it.",
        home: "Back to home",
        nav: "Admin sections",
        sections: [
            { href: "/admin", label: "Dashboard" },
            { href: "/admin/users", label: "Users" },
            { href: "/admin/games", label: "Games" },
            { href: "/admin/support", label: "Support" },
            { href: "/admin/audit", label: "Audit log" },
        ],
    },
    fr: {
        title: "Admin",
        loading: "Chargement…",
        restrictedTitle: "Espace admin",
        restrictedBody: "Cette section est réservée aux administrateurs. Ton compte n'y a pas accès.",
        home: "Retour à l'accueil",
        nav: "Sections de l'admin",
        sections: [
            { href: "/admin", label: "Tableau de bord" },
            { href: "/admin/users", label: "Utilisateurs" },
            { href: "/admin/games", label: "Parties" },
            { href: "/admin/support", label: "Support" },
            { href: "/admin/audit", label: "Journal d'audit" },
        ],
    },
};

// Garde client pour l'UX uniquement : chaque route /api/admin reste protégée par le serveur (401/403)
export default function AdminLayout({ children }) {
    const LAYOUT_TEXT = useTexts(LAYOUT_MESSAGES);
    const user = useAuthStore((state) => state.user);
    const isReady = useAuthStore((state) => state.isReady);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (isReady && !user) router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
    }, [isReady, user, router, pathname]);

    // Le user provisoire tiré du token n'a pas encore de rôle : on attend /auth/me
    const roleKnown = Boolean(user) && user.role !== undefined;
    if (!isReady || !user || !roleKnown) return <p>{LAYOUT_TEXT.loading}</p>;

    if (user.role !== "admin") {
        return (
            <div className="admin">
                <h1>{LAYOUT_TEXT.restrictedTitle}</h1>
                <div className="admin__notice" role="alert">
                    <p>{LAYOUT_TEXT.restrictedBody}</p>
                    <Link href="/" className="btn btn--small admin__btn">{LAYOUT_TEXT.home}</Link>
                </div>
            </div>
        );
    }

    const isActive = (href) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

    return (
        <div className="admin">
            <h1 className="admin__title">{LAYOUT_TEXT.title}</h1>
            <nav className="admin__tabs" aria-label={LAYOUT_TEXT.nav}>
                {LAYOUT_TEXT.sections.map(({ href, label }) => (
                    <Link key={href} href={href} className={`admin__tab${isActive(href) ? " admin__tab--active" : ""}`} aria-current={isActive(href) ? "page" : undefined}>
                        {label}
                    </Link>
                ))}
            </nav>
            {children}
        </div>
    );
}
