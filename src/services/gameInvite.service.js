
import api from "../utils/api"; // axios setup

const gameInviteService = {
  // 🔹 POST /games/:id/invite → inviter user ou guest
  invite: async (gameId, { userId, guestName }) => {
    try {
      const res = await api.post(`/games/${gameId}/invite`, {
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

  // 🔹 GET /games/:id/invite → liste des invites
  getInvites: async (gameId) => {
    try {
      const res = await api.get(`/games/${gameId}/invite`);
      return res.data;
    } catch (error) {
      console.error("getInvites error:", error);
      return null;
    }
  },

  // 🔹 PATCH /games/:id/confirm → confirmer l’invite d’un user connecté
  confirm: async (gameId) => {
    try {
      const res = await api.patch(`/games/${gameId}/confirm`);

      return {
        success: true,
        data: res.data,
      };
    } catch (error) {
      return {
        success: false,
        errorMessage: [error.response?.data?.error || "Confirm invite failed"],
      };
    }
  },
};

export default gameInviteService;
