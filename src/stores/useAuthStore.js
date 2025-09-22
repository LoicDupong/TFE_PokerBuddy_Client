import { create } from "zustand";
import api from "../utils/api"; // axios setup

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,

  // Hydrate depuis les données reçues du back (loginAction)
  setAuth: (user, token) => {
    localStorage.setItem("token", token);
    set({ user, token });
  },

  // 🔹 Login → /auth/login
  login: async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, user } = res.data;

      // Hydrate store + localStorage
      get().setAuth(user, token);

      return { success: true, data: { user, token } };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: error.response?.data || error.message };
    }
  },

  // 🔹 Register → /auth/register
  register: async (username, email, password) => {
    try {
      const res = await api.post("/auth/register", { username, email, password });
      const { token, user } = res.data;

      // Hydrate store + localStorage
      get().setAuth(user, token);

      return { success: true, data: { user, token } };
    } catch (error) {
      console.error("Register error:", error);
      return { success: false, error: error.response?.data || error.message };
    }
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
