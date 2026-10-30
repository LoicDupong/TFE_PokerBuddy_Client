"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";

import supportService from "@/services/support.service.js";
import useToastStore from "@/stores/useToastStore.js";
import { HELP_TEXT, formatDateTime, useRequireMember } from "../../help.utils.js";
import { useT } from "@/i18n/i18n-provider.jsx";
import { useServerError } from "@/utils/server-errors.utils.js";
import { HELP_MESSAGES } from "../../help.messages.js";

export default function TicketThreadPage() {
    const { t, intlLocale } = useT(HELP_MESSAGES);
    const serverError = useServerError();
    const { id } = useParams();
    const { allowed } = useRequireMember();
    const replyId = useId();
    const [ticket, setTicket] = useState(null);
    const [state, setState] = useState("loading"); // loading | ready | notFound | error
    const [reply, setReply] = useState("");
    const [replyError, setReplyError] = useState("");
    const [isPending, setIsPending] = useState(false);
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        if (!allowed) return;
        let cancelled = false;
        (async () => {
            const res = await supportService.getTicket(id);
            if (cancelled) return;
            if (res.success) { setTicket(res.data); setState("ready"); }
            else setState(res.notFound ? "notFound" : "error");
        })();
        return () => { cancelled = true; };
    }, [allowed, id, attempt]);

    async function handleSend(e) {
        e.preventDefault();
        if (isPending) return;
        if (!reply.trim()) { setReplyError(t("thread.emptyReply")); return; }
        setReplyError("");

        setIsPending(true);
        const res = await supportService.sendMessage(id, reply);
        setIsPending(false);
        if (!res.success) {
            useToastStore.getState().showToast(serverError(res.error), "error");
            return;
        }
        setTicket((current) => ({
            ...current,
            status: res.data.ticket.status,
            lastMessageAt: res.data.ticket.lastMessageAt,
            messages: [...current.messages, res.data.message],
        }));
        setReply("");
    }

    if (!allowed || state === "loading") return <p>{t("thread.loading")}</p>;

    if (state === "notFound") {
        return (
            <div className="help">
                <h1>{t("thread.notFound")}</h1>
                <p className="help__hint">{t("thread.notFoundHint")}</p>
                <Link href="/help/tickets" className="btn btn--secondary">{t("thread.back")}</Link>
            </div>
        );
    }
    if (state === "error") {
        return (
            <div className="help">
                <p role="alert">{t("thread.loadError")}</p>
                <button type="button" className="btn btn--small" onClick={() => { setState("loading"); setAttempt((n) => n + 1); }}>
                    {t("thread.retry")}
                </button>
            </div>
        );
    }

    return (
        <div className="help">
            <header className="help__header">
                <Link href="/help/tickets" className="help__back">← {t("thread.back")}</Link>
                <h1 className="help__thread-title">{ticket.subject}</h1>
                <p className="help__ticket-meta">
                    <span className={`help__badge help__badge--${ticket.status}`}>{t(`statuses.${ticket.status}`)}</span>
                    {" "}{t(`categories.${ticket.category}`)}
                </p>
            </header>

            <ol className="help__thread" aria-label={ticket.subject}>
                {ticket.messages.map((message) => (
                    <li key={message.id} className={`help__message${message.isStaff ? " help__message--staff" : ""}`}>
                        <p className="help__message-head">
                            <strong>{message.isStaff ? t("thread.staff") : t("thread.you")}</strong>
                            <time dateTime={message.createdAt}>{formatDateTime(message.createdAt, intlLocale)}</time>
                        </p>
                        {/* Texte brut : pre-wrap garde les retours à la ligne, React échappe le contenu */}
                        <p className="help__message-body">{message.body}</p>
                    </li>
                ))}
            </ol>

            <form className="form help__form" onSubmit={handleSend} noValidate>
                {ticket.status === "resolved" && <p className="help__hint">{t("thread.resolvedHint")}</p>}
                <div className="form__row">
                    <label htmlFor={replyId}>{t("thread.reply")}</label>
                    <textarea
                        id={replyId}
                        rows={4}
                        value={reply}
                        maxLength={HELP_TEXT.messageMax}
                        aria-invalid={Boolean(replyError)}
                        aria-describedby={replyError ? `${replyId}-error` : undefined}
                        onChange={(e) => setReply(e.target.value)}
                    />
                    {replyError && <p id={`${replyId}-error`} className="form__error" role="alert">{replyError}</p>}
                </div>
                <button type="submit" className="btn btn--secondary help__submit" disabled={isPending}>
                    <FontAwesomeIcon icon={faPaperPlane} aria-hidden="true" /> {isPending ? t("thread.sending") : t("thread.send")}
                </button>
            </form>
        </div>
    );
}
