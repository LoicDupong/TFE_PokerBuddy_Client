"use client";

import { useCallback, useEffect, useId, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";

import adminSupportService from "@/services/adminSupport.service.js";
import useToastStore from "@/stores/useToastStore.js";
import { Badge, LoadError } from "@/components/admin/admin-ui.jsx";
import { ticketTone, useAdminFormat, useAdminText, useTexts } from "@/components/admin/admin.utils.js";
import { displayPlayerName } from "@/utils/game.utils.js";
import { useLocale } from "@/i18n/i18n-provider.jsx";

const TICKET_MESSAGES = {
    en: {
        back: "Support",
        notFound: "This ticket does not exist.",
        loadError: "Could not load this ticket.",
        from: (name) => `From ${name}`,
        staff: "Support",
        statusTitle: "Status",
        reply: "Reply",
        replyHint: "The member is notified of your reply. Do not share anything private here.",
        send: "Send reply",
        sending: "Sending…",
        empty: "Write a reply first.",
        sent: "Reply sent.",
        statusChanged: "Status updated.",
    },
    fr: {
        back: "Support",
        notFound: "Ce ticket n'existe pas.",
        loadError: "Impossible de charger ce ticket.",
        from: (name) => `De ${name}`,
        staff: "Support",
        statusTitle: "Statut",
        reply: "Réponse",
        replyHint: "Le membre est prévenu de ta réponse. Ne partage rien de privé ici.",
        send: "Envoyer la réponse",
        sending: "Envoi…",
        empty: "Écris d'abord une réponse.",
        sent: "Réponse envoyée.",
        statusChanged: "Statut mis à jour.",
    },
};

const MESSAGE_MAX = 4000;

export default function AdminTicketPage() {
    const TICKET_TEXT = useTexts(TICKET_MESSAGES);
    const ADMIN_TEXT = useAdminText();
    const { formatDateTime } = useAdminFormat();
    const { locale } = useLocale();
    const { id } = useParams();
    const replyId = useId();
    const showToast = useToastStore((state) => state.showToast);
    const [ticket, setTicket] = useState(null);
    const [state, setState] = useState("loading");
    const [reply, setReply] = useState("");
    const [replyError, setReplyError] = useState(null);
    const [pending, setPending] = useState(false);
    const [attempt, setAttempt] = useState(0);

    const load = useCallback(async () => {
        const res = await adminSupportService.getTicket(id);
        if (res.success) { setTicket(res.data); setState("ready"); }
        else setState(res.notFound ? "notFound" : "error");
    }, [id]);

    useEffect(() => { load(); }, [load, attempt]);

    async function handleSend(e) {
        e.preventDefault();
        if (pending) return;
        if (!reply.trim()) { setReplyError(TICKET_TEXT.empty); return; }
        setReplyError(null);
        setPending(true);
        const res = await adminSupportService.reply(id, reply.trim());
        setPending(false);
        if (!res.success) { showToast(res.forbidden ? ADMIN_TEXT.forbidden : res.error, "error"); return; }
        setTicket((current) => ({
            ...current,
            status: res.data.ticket.status,
            lastMessageAt: res.data.ticket.lastMessageAt,
            messages: [...current.messages, res.data.message],
        }));
        setReply("");
        showToast(TICKET_TEXT.sent, "success");
    }

    async function handleStatus(status) {
        if (pending || status === ticket.status) return;
        setPending(true);
        const res = await adminSupportService.setStatus(id, status);
        setPending(false);
        if (!res.success) { showToast(res.forbidden ? ADMIN_TEXT.forbidden : res.error, "error"); return; }
        setTicket((current) => ({ ...current, status: res.data.status }));
        showToast(TICKET_TEXT.statusChanged, "success");
    }

    if (state === "loading") return <p>{ADMIN_TEXT.loading}</p>;
    if (state === "notFound") {
        return (
            <section className="admin__section">
                <p className="admin__hint">{TICKET_TEXT.notFound}</p>
                <Link href="/admin/support" className="admin__back">← {TICKET_TEXT.back}</Link>
            </section>
        );
    }
    if (state === "error") return <LoadError message={TICKET_TEXT.loadError} onRetry={() => { setState("loading"); setAttempt((n) => n + 1); }} />;

    return (
        <section className="admin__section">
            <Link href="/admin/support" className="admin__back">← {TICKET_TEXT.back}</Link>
            <h2>{ticket.subject}</h2>
            <p className="admin__hint">
                <Badge tone={ticketTone[ticket.status]}>{ADMIN_TEXT.ticketStatuses[ticket.status]}</Badge>{" "}
                {ADMIN_TEXT.ticketCategories[ticket.category] ?? ticket.category} ·{" "}
                {ticket.user ? <Link href={`/admin/users/${ticket.user.id}`}>{TICKET_TEXT.from(displayPlayerName(ticket.user.username, locale))}</Link> : null}
            </p>

            <div className="admin__statuses" role="group" aria-label={TICKET_TEXT.statusTitle}>
                {Object.entries(ADMIN_TEXT.ticketStatuses).map(([value, label]) => (
                    <button
                        key={value}
                        type="button"
                        className={`btn admin__btn${ticket.status === value ? " admin__btn--primary" : ""}`}
                        aria-pressed={ticket.status === value}
                        disabled={pending}
                        onClick={() => handleStatus(value)}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <ol className="admin__thread" aria-label={ticket.subject}>
                {ticket.messages.map((m) => (
                    <li key={m.id} className={`admin__message${m.isStaff ? " admin__message--staff" : ""}`}>
                        <p className="admin__message-head">
                            <strong>{m.isStaff ? `${TICKET_TEXT.staff}${m.author ? ` (${displayPlayerName(m.author.username, locale)})` : ""}` : displayPlayerName(m.author?.username ?? ticket.user?.username, locale)}</strong>
                            <time dateTime={m.createdAt}>{formatDateTime(m.createdAt)}</time>
                        </p>
                        {/* Texte brut : React échappe le contenu, pre-wrap garde les retours à la ligne */}
                        <p className="admin__message-body">{m.body}</p>
                    </li>
                ))}
            </ol>

            <form className="form admin__form" onSubmit={handleSend} noValidate>
                <div className="form__row">
                    <label htmlFor={replyId}>{TICKET_TEXT.reply}</label>
                    <textarea
                        id={replyId}
                        rows={4}
                        value={reply}
                        maxLength={MESSAGE_MAX}
                        aria-invalid={Boolean(replyError)}
                        onChange={(e) => setReply(e.target.value)}
                    />
                    {replyError && <p className="form__error" role="alert">{replyError}</p>}
                    <p className="admin__hint">{TICKET_TEXT.replyHint}</p>
                </div>
                <button type="submit" className="btn admin__btn admin__btn--primary" disabled={pending}>
                    <FontAwesomeIcon icon={faPaperPlane} aria-hidden="true" /> {pending ? TICKET_TEXT.sending : TICKET_TEXT.send}
                </button>
            </form>
        </section>
    );
}
