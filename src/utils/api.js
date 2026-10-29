import axios from "axios";
import useAuthStore from "@/stores/useAuthStore";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Pages réservées aux membres : une session expirée y renvoie vers le login
const PROTECTED_PATHS = ["/games", "/profile", "/notifications", "/leaderboard"];

// Ajout du JWT si dispo
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Endpoints publics : un 401 y signifie "identifiants refusés", pas "session expirée"
const PUBLIC_AUTH_ENDPOINTS = ["/auth/login", "/auth/register", "/auth/forgot-password", "/auth/reset-password"];

// Token envoyé avec une requête (AxiosHeaders ou objet simple)
const sentToken = (config) => {
  const headers = config?.headers;
  const value = typeof headers?.get === "function" ? headers.get("Authorization") : headers?.Authorization;
  return typeof value === "string" ? value.replace(/^Bearer\s+/i, "") : null;
};

// Déconnexion automatique sur token expiré
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url ?? "";
    const isAuthEndpoint = PUBLIC_AUTH_ENDPOINTS.some((path) => url.startsWith(path));

    // Requête partie avec l'ancien token alors qu'un nouveau a été enregistré entre-temps
    // (changement de mot de passe) : ce 401 ne concerne pas la session actuelle
    const token = sentToken(error.config);
    const current = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const staleToken = Boolean(token && current && token !== current);

    if (error.response?.status === 401 && !isAuthEndpoint && !staleToken) {
      useAuthStore.getState().logout();

      // Sinon la page reste bloquée sur "Loading..." ; on revient ici après la reconnexion
      const pathname = typeof window !== "undefined" ? window.location.pathname : "";
      if (PROTECTED_PATHS.some((path) => pathname.startsWith(path))) {
        window.location.assign(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
