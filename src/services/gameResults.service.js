import api from "../utils/api"; // axios setup

const gameResultsService = {
  // 🔹 GET /games/:gameId/results → récupérer les résultats d’une game
  getResults: async (gameId) => {
    try {
      const res = await api.get(`/games/${gameId}/results`);
      return res.data;
    } catch (error) {
      console.error("getResults error:", error);
      return null;
    }
  },

  // 🔹 POST /games/:gameId/results → enregistrer les résultats d’une game
  createResults: async (gameId, results, finishedAt) => {
    try {
      // results attendu = [{ gamePlayerId, rank, prize }, ...]
      const res = await api.post(`/games/${gameId}/results`, {
        results,
        finishedAt, // optionnel
      });

      return {
        success: true,
        data: res.data,
      };
    } catch (error) {
      return {
        success: false,
        errorMessage: [error.response?.data?.error || "Create results failed"],
      };
    }
  },
};

export default gameResultsService;
