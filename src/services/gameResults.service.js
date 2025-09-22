
import api from "../utils/api"; // axios setup

const gameResultsService = {
  // 🔹 GET /results → liste des résultats (par user connecté ou toutes les games finies selon backend)
  getResults: async () => {
    try {
      const res = await api.get("/results");
      return res.data;
    } catch (error) {
      console.error("getResults error:", error);
      return null;
    }
  },

  // 🔹 POST /results → enregistrer résultats d'une game finie
  createResults: async (gameId, results) => {
    try {
      // results attendu = [{ gamePlayerId, rank, prize }, ...]
      const res = await api.post("/results", {
        gameId,
        results,
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
