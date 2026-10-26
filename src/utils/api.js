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

// Déconnexion automatique sur token expiré
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url ?? "";
    const isAuthEndpoint = url.startsWith("/auth/login") || url.startsWith("/auth/register");

    if (error.response?.status === 401 && !isAuthEndpoint) {
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
