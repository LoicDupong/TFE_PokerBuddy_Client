"use client";

import { useEffect, useState } from "react";

// Textes communs de l'interface admin (extraction FR/EN en vague 3)
export const ADMIN_TEXT = {
    loading: "Loading…",
    retry: "Try again",
    previous: "Previous",
    next: "Next",
    pageOf: (page, pages) => `Page ${page} of ${pages}`,
    results: (total) => (total === 1 ? "1 result" : `${total} results`),
    noResults: "Nothing matches these filters.",
    cancel: "Cancel",
    confirm: "Confirm",
    reasonLabel: "Reason (optional)",
    reasonMax: 500,
    typeToConfirm: (text) => `Type "${text}" to confirm`,
    forbidden: "Your account is not allowed to do this.",
    accountStatuses: { active: "Active", disabled: "Disabled", deleted: "Deleted" },
    gameStatuses: { pending: "Upcoming", active: "Live", finished: "Finished", cancelled: "Cancelled" },
    ticketStatuses: { new: "New", in_progress: "In progress", resolved: "Resolved" },
    ticketCategories: {
        bug: "Something is broken",
        account: "Account",
        game: "Game or results",
        suggestion: "Suggestion",
        other: "Other",
    },
    roles: { user: "Member", admin: "Admin" },
};

// Couleur des pastilles (toujours accompagnée du texte)
export const accountTone = { active: "ok", disabled: "warn", deleted: "muted" };
export const gameTone = { pending: "info", active: "ok", finished: "muted", cancelled: "bad" };
export const ticketTone = { new: "info", in_progress: "warn", resolved: "ok" };

export const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—");
export const formatDateTime = (iso) => (iso
    ? new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "—");

// Montant en centimes -> "12.50"
export const formatCents = (cents) => ((cents || 0) / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Valeur qui ne suit la saisie qu'après une pause : évite une requête par frappe
export function useDebounced(value, delay = 350) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(id);
    }, [value, delay]);
    return debounced;
}
