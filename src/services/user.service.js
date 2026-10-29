
import api from "../utils/api"; // axios setup

// Échec homogène : message lisible, code métier éventuel ("INVALID_PASSWORD", "LAST_ADMIN"…) et statut HTTP.
// errorMessage : ancien format, gardé pour les appels existants
function toFailure(error, fallback) {
  const status = error.response?.status ?? null;
  const message = error.response?.data?.error
    || (status ? fallback : "Network error, check your connection and try again");
  return { success: false, error: message, code: error.response?.data?.code ?? null, status, errorMessage: [message] };
}

const userService = {
  // 🔹 GET /user/:id
  getUserById: async (id) => {
    try {
      const res = await api.get(`/user/${id}`);
      return res.data; // axios => .data
    } catch (error) {
      console.error("getUserById error:", error);
      return null;
    }
  },

  // 🔹 GET /user/me
  getMe: async () => {
    try {
      const res = await api.get("/user/me");
      return res.data;
    } catch (error) {
      console.error("getMe error:", error);
      return null;
    }
  },

  // 🔹 PATCH /user/me
  updateMe: async (formData) => {
    try {
      const form = new FormData();
      if (formData.username) form.append("username", formData.username);
      // Toujours envoyée : une bio vide efface l'ancienne
      if (formData.description !== undefined) form.append("description", formData.description);
      if (formData.avatar) form.append("avatar", formData.avatar); // File object

      const res = await api.patch(`/user/me`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return {
        success: true,
        errorMessage: [],
        data: res.data,
      };
    } catch (error) {
      return {
        success: false,
        errorMessage: [error.response?.data?.error || "Update failed"],
        data: null,
      };
    }
  },

  // 🔹 DELETE /user/me { password } : le mot de passe est redemandé (réauthentification)
  deleteMe: async (password) => {
    try {
      const res = await api.delete(`/user/me`, { data: { password } });
      return { success: true, data: res.data };
    } catch (error) {
      return toFailure(error, "Could not delete the account, please try again");
    }
  },

  // POST /auth/update-pwd → { message, token } : nouveau token pour cet appareil, les autres sont déconnectés
  updatePassword: async (oldPassword, newPassword) => {
    try {
      const res = await api.post("/auth/update-pwd", { oldPassword, newPassword });
      return { success: true, data: res.data };
    } catch (error) {
      return toFailure(error, "Could not change the password");
    }
  },

  // POST /auth/forgot-password : même réponse que le compte existe ou non
  requestPasswordReset: async (email) => {
    try {
      const res = await api.post("/auth/forgot-password", { email });
      return { success: true, data: res.data };
    } catch (error) {
      return toFailure(error, "Could not send the link, please try again");
    }
  },

  // POST /auth/reset-password → { message, email } ; lien invalide : code "INVALID_RESET_TOKEN"
  resetPassword: async (token, password) => {
    try {
      const res = await api.post("/auth/reset-password", { token, password });
      return { success: true, data: res.data };
    } catch (error) {
      return toFailure(error, "Could not save the new password, please try again");
    }
  },

  searchByUsername: async (username) => {
    try {
      const res = await api.get(`/user/search`, { params: { username } });
      return res.data.users;
    } catch (error) {
      console.error("searchByUsername error:", error);
      return [];
    }
  },
};

export default userService;
