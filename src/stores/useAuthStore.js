import { create } from "zustand";
import api from "../utils/api"; // axios setup
import { decodeTokenPayload } from "../utils/jwt.utils";
import usePresetStore from "./usePresetStore";
import useNotificationStore from "./useNotificationStore";

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  // false tant que la session n'a pas été restaurée depuis le localStorage
  isReady: false,

  // Hydrate depuis les données reçues du back
  setAuth: (user, token) => {
    localStorage.setItem("token", token);
    set({ user, token, isReady: true });
  },

  // Nouveau token pour la session en cours (changement de mot de passe : les autres appareils
  // sont déconnectés, celui-ci reste connecté avec ce token)
  updateToken: (token) => {
    localStorage.setItem("token", token);
    set({ token });
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
  register: async (username, email, password, claim) => {
    try {
      const res = await api.post("/auth/register", { username, email, password, ...(claim ? { claim } : {}) });
      const { token, user } = res.data;

      // Hydrate store + localStorage
      get().setAuth(user, token);

      return { success: true, data: { user, token } };
    } catch (error) {
      console.error("Register error:", error);
      return { success: false, error: error.response?.data || error.message };
    }
  },

  // Restaurer la session au chargement de l'app (GET /auth/me)
  fetchMe: async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      set({ isReady: true });
      return;
    }

    const payload = decodeTokenPayload(token);
    if (!payload || payload.exp * 1000 <= Date.now()) {
      get().logout();
      return;
    }

    // User provisoire tiré du token : l'UI ne s'affiche pas "déconnectée"
    // pendant que l'API répond (cold start du serveur)
    set({
      user: get().user ?? { id: payload.id, username: payload.username },
      token,
      isReady: true,
    });

    try {
      const res = await api.get("/auth/me");
      // Le serveur renvoie un token renouvelé (session glissante de 7 jours)
      if (res.data.token) localStorage.setItem("token", res.data.token);
      set({ user: res.data.user, token: res.data.token ?? token });
    } catch (error) {
      // 401 → déjà déconnecté par l'intercepteur ; erreur réseau → on garde la session
      console.error("FetchMe error:", error);
    }
  },

  // Déconnexion
  logout: () => {
    localStorage.removeItem("token");
    // Rien ne doit rester pour le prochain utilisateur de l'appareil (partie liée au preset, notifs)
    usePresetStore.getState().resetPreset();
    useNotificationStore.setState({ notifications: [], unreadCount: 0 });
    set({ user: null, token: null, isReady: true });
  },
}));

export default useAuthStore;
