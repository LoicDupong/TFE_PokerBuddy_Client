import { create } from "zustand";
import api from "../lib/api"; // axios setup

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,

  // Hydrate depuis les données reçues du back (loginAction)
  setAuth: (user, token) => {
    localStorage.setItem("token", token);
    set({ user, token });
  },

  // Charger l’utilisateur connecté (GET /auth/me)
  fetchMe: async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      set({ user: res.data.user, token });
    } catch (error) {
      console.error("FetchMe error:", error);
      get().logout();
    }
  },

  // Déconnexion
  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null });
  },
}));

export default useAuthStore;
