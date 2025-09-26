import api from "../utils/api"; // axios setup

const friendService = {
  // 🔹 GET /friends → liste des amis (et demandes)
  getFriends: async () => {
    try {
      const res = await api.get("/friends");
      return res.data;
    } catch (error) {
      console.error("getFriends error:", error);
      return null;
    }
  },

  getInvites: async () => {
    try {
      const res = await api.get("/friends/invite");
      return res.data.invites;
    } catch (error) {
      console.error("getInvites error:", error);
      return null;
    }
  },

  // 🔹 POST /friends → envoyer une demande d’ami
  sendRequest: async (friendId) => {
    try {
      const res = await api.post("/friends/invite", { friendId });
      return {
        success: true,
        data: res.data,
      };
    } catch (error) {
      return {
        success: false,
        errorMessage: [
          error.response?.data?.error || "Friend request failed",
        ],
      };
    }
  },

  // 🔹 PATCH /friends/:id/ → accepter/refuser une demande
  respond: async (requestId, action) => {
    try {
      const res = await api.patch(`/friends/invite/${requestId}`, { action });
      return {
        success: true,
        data: res.data,
      };
    } catch (error) {
      return {
        success: false,
        errorMessage: [
          error.response?.data?.error || "Accept request failed",
        ],
      };
    }
  },


  // 🔹 DELETE /friends/:id → supprimer un ami
  removeFriend: async (friendId) => {
    try {
      const res = await api.delete(`/friends/${friendId}`);
      return {
        success: true,
        data: res.data,
      };
    } catch (error) {
      return {
        success: false,
        errorMessage: [
          error.response?.data?.error || "Remove friend failed",
        ],
      };
    }
  },
};

export default friendService;
