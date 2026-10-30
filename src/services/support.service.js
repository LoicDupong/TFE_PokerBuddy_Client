import api from "../utils/api";

// Aide et support : tickets de l'utilisateur connecté. Toutes les méthodes renvoient
// { success: true, data } ou { success: false, error } et ne laissent jamais remonter d'exception axios.
const errorOf = (error, fallback) => error.response?.data?.error || fallback;

const supportService = {
    createTicket: async ({ category, subject, message }) => {
        try {
            const res = await api.post("/support/tickets", { category, subject, message });
            return { success: true, data: res.data.ticket };
        } catch (error) {
            console.error("createTicket error:", error);
            return { success: false, error: errorOf(error, "Could not send your request") };
        }
    },

    getMyTickets: async () => {
        try {
            const res = await api.get("/support/tickets");
            return { success: true, data: res.data.tickets };
        } catch (error) {
            console.error("getMyTickets error:", error);
            return { success: false, error: errorOf(error, "Could not load your requests") };
        }
    },

    // notFound : ticket inexistant ou appartenant à quelqu'un d'autre (l'API répond 404 dans les deux cas)
    getTicket: async (id) => {
        try {
            const res = await api.get(`/support/tickets/${id}`);
            return { success: true, data: res.data.ticket };
        } catch (error) {
            if (error.response?.status !== 404) console.error("getTicket error:", error);
            return { success: false, notFound: error.response?.status === 404, error: errorOf(error, "Could not load this request") };
        }
    },

    // data : { message, ticket } — le ticket mis à jour (un ticket résolu repasse à "new")
    sendMessage: async (id, message) => {
        try {
            const res = await api.post(`/support/tickets/${id}/messages`, { message });
            return { success: true, data: res.data };
        } catch (error) {
            console.error("sendMessage error:", error);
            return { success: false, error: errorOf(error, "Could not send your message") };
        }
    },
};

export default supportService;
