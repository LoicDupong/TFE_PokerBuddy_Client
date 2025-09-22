
import api from "../utils/api"; // axios setup

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

  // 🔹 GET /auth/me
  getMe: async () => {
    try {
      const res = await api.get(`/auth/me`);
      return res.data;
    } catch (error) {
      console.error("getMe error:", error);
      return null;
    }
  },

  // 🔹 PATCH /auth/me
  updateMe: async (formData) => {
    try {
      const data = Object.fromEntries(formData);
      const res = await api.patch(`/auth/me`, {
        username: data.username,
        avatar: data.avatar,
        description: data.description,
      });

      return {
        success: true,
        errorMessage: [],
        data: res.data, // renvoie directement le user mis à jour
      };
    } catch (error) {
      return {
        success: false,
        errorMessage: [error.response?.data?.error || "Update failed"],
        data: null,
      };
    }
  },

  // 🔹 DELETE /auth/me
  deleteMe: async () => {
    try {
      const res = await api.delete(`/auth/me`);
      return {
        success: true,
        data: res.data,
      };
    } catch (error) {
      return {
        success: false,
        errorMessage: [error.response?.data?.error || "Delete failed"],
      };
    }
  },
};

export default userService;
