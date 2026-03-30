import axios from "axios";
import useAuthStore from "@/stores/useAuthStore";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// 👉 Debug : affiche la baseURL en console quand ton app démarre
console.log("📡 API baseURL:", api.defaults.baseURL);

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
    }

    return Promise.reject(error);
  }
);

export default api;
