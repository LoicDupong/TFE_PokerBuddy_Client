
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
      if (formData.description) form.append("description", formData.description);
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

  // 🔹 DELETE /user/me
  deleteMe: async () => {
    try {
      const res = await api.delete(`/user/me`);
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
