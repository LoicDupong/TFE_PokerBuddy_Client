import api from "../utils/api";

// File de tickets du support côté admin (voir admin.service.js pour la forme des réponses)
const failure = (error, fallback) => ({
    success: false,
    error: error.response?.data?.error || fallback,
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

const clean = (params = {}) => Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v != null));

const adminSupportService = {
    listTickets: (params) => call(() => api.get("/admin/support/tickets", { params: clean(params) }), "Could not load tickets"),
    getTicket: (id) => call(() => api.get(`/admin/support/tickets/${id}`), "Could not load this ticket", (d) => d.ticket),
    // data : { message, ticket } (un ticket "new" passe à "in_progress")
    reply: (id, message) => call(() => api.post(`/admin/support/tickets/${id}/messages`, { message }), "Could not send the reply"),
    setStatus: (id, status) => call(() => api.patch(`/admin/support/tickets/${id}`, { status }), "Could not update the ticket", (d) => d.ticket),
};

export default adminSupportService;
