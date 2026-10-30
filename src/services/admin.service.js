import api from "../utils/api";

// Back-office : comptes, parties, journal d'audit, analytics et support.
// Toutes les méthodes renvoient { success: true, data } ou { success: false, error, forbidden?, notFound?, code? }
// et ne laissent jamais remonter d'exception axios. La sécurité reste côté API (403 = pas admin).
const failure = (error, fallback) => ({
    success: false,
    error: error.response?.data?.error || fallback,
    code: error.response?.data?.code,
    forbidden: error.response?.status === 403,
    notFound: error.response?.status === 404,
});

async function call(request, fallback, pick = (data) => data) {
    try {
        const res = await request();
        return { success: true, data: pick(res.data) };
    } catch (error) {
        if (![403, 404].includes(error.response?.status)) console.error(`${fallback}:`, error);
        return failure(error, fallback);
    }
}

// Retire les paramètres vides pour ne pas envoyer ?q=&status=
const clean = (params = {}) => Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v != null));

const adminService = {
    // Comptes
    listUsers: (params) => call(() => api.get("/admin/users", { params: clean(params) }), "Could not load users"),
    getUser: (id) => call(() => api.get(`/admin/users/${id}`), "Could not load this user", (d) => d.user),
    setRole: (id, role) => call(() => api.patch(`/admin/users/${id}/role`, { role }), "Could not change the role"),
    disableUser: (id, reason) => call(() => api.post(`/admin/users/${id}/disable`, reason ? { reason } : {}), "Could not disable this account"),
    enableUser: (id) => call(() => api.post(`/admin/users/${id}/enable`), "Could not re-enable this account"),
    // data.token présent seulement si la cible est l'admin connecté : à enregistrer dans le store
    revokeSessions: (id) => call(() => api.post(`/admin/users/${id}/revoke-sessions`), "Could not revoke the sessions"),
    deleteUser: (id) => call(() => api.delete(`/admin/users/${id}`), "Could not delete this account"),

    // Parties
    listGames: (params) => call(() => api.get("/admin/games", { params: clean(params) }), "Could not load games"),
    getGame: (id) => call(() => api.get(`/admin/games/${id}`), "Could not load this game", (d) => d.game),
    cancelGame: (id, reason) => call(() => api.post(`/admin/games/${id}/cancel`, reason ? { reason } : {}), "Could not cancel this game"),

    // Journal d'audit
    listAuditLogs: (params) => call(() => api.get("/admin/audit-logs", { params: clean(params) }), "Could not load the audit log"),

    // Analytics
    getOverview: (params) => call(() => api.get("/admin/analytics/overview", { params: clean(params) }), "Could not load the dashboard"),
};

export default adminService;
