import api from "../utils/api"; // axios setup

const gameInviteService = {
  // 🔹 POST /games/:id/invites → inviter user ou guest
  invite: async (gameId, { userId, guestName }) => {
    try {
      const res = await api.post(`/games/${gameId}/invites`, {
        userId,
        guestName,
      });

      return {
        success: true,
        data: res.data,
      };
    } catch (error) {
      return {
        success: false,
        errorMessage: [error.response?.data?.error || "Invitation failed"],
      };
    }
  },

  // 🔹 GET /games/:id/invites → liste des invites
  getInvites: async (gameId) => {
    try {
      const res = await api.get(`/games/${gameId}/invites`);
      return res.data;
    } catch (error) {
      console.error("getInvites error:", error);
      return null;
    }
  },

  getMyInvites: async () => {
    try {
      const res = await api.get(`/games/invites/me`);      
      return res.data.invites;
    } catch (error) {
      console.error("getMyInvites error:", error);
      return null;
    }
  },

  // 🔹 PATCH /invites/:inviteId/respond
  respond: async (inviteId, action = "accepted") => {
    try {
      const res = await api.patch(`/games/invites/${inviteId}`, {
        status: action, // "accepted" | "refused"
      });

      return {
        success: true,
        data: res.data,
      };
    } catch (error) {
      return {
        success: false,
        errorMessage: [error.response?.data?.error || "Responding to invite failed"],
      };
    }
  },

};

export default gameInviteService;
