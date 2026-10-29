// Email transmis d'une page d'auth à l'autre (login → mot de passe oublié → login) pour éviter
// de le retaper, sans le mettre dans l'URL (historique, analytics, referrer).
// sessionStorage : limité à l'onglet, lu une seule fois. Peut être bloqué (navigation privée) : best effort.
const KEY = "pokerbuddy:auth-email";

export function rememberAuthEmail(email) {
    try {
        const value = typeof email === "string" ? email.trim() : "";
        if (value) sessionStorage.setItem(KEY, value);
        else sessionStorage.removeItem(KEY);
    } catch {
        // stockage indisponible : l'utilisateur retapera son email
    }
}

export function takeAuthEmail() {
    try {
        const value = sessionStorage.getItem(KEY) ?? "";
        sessionStorage.removeItem(KEY);
        return value;
    } catch {
        return "";
    }
}
