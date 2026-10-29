"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";

import supportService from "@/services/support.service.js";
import useToastStore from "@/stores/useToastStore.js";
import { HELP_TEXT, formatDateTime, useRequireMember } from "../../help.utils.js";

const THREAD_TEXT = {
    loading: "Loading…",
    notFound: "Request not found",
    notFoundHint: "This request doesn't exist or isn't yours.",
    back: "Back to my requests",
    loadError: "Could not load this request.",
    retry: "Try again",
    you: "You",
    staff: "PokerBuddy support",
    reply: "Your reply",
    send: "Send reply",
    sending: "Sending…",
    resolvedHint: "This request is marked as resolved. Sending a reply will reopen it.",
    emptyReply: "Please write a message first",
};

export default function TicketThreadPage() {
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
        if (!reply.trim()) { setReplyError(THREAD_TEXT.emptyReply); return; }
        setReplyError("");

        setIsPending(true);
        const res = await supportService.sendMessage(id, reply);
        setIsPending(false);
        if (!res.success) {
            useToastStore.getState().showToast(res.error, "error");
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

    if (!allowed || state === "loading") return <p>{THREAD_TEXT.loading}</p>;

    if (state === "notFound") {
        return (
            <div className="help">
                <h1>{THREAD_TEXT.notFound}</h1>
                <p className="help__hint">{THREAD_TEXT.notFoundHint}</p>
                <Link href="/help/tickets" className="btn btn--secondary">{THREAD_TEXT.back}</Link>
            </div>
        );
    }
    if (state === "error") {
        return (
            <div className="help">
                <p role="alert">{THREAD_TEXT.loadError}</p>
                <button type="button" className="btn btn--small" onClick={() => { setState("loading"); setAttempt((n) => n + 1); }}>
                    {THREAD_TEXT.retry}
                </button>
            </div>
        );
    }

    return (
        <div className="help">
            <header className="help__header">
                <Link href="/help/tickets" className="help__back">← {THREAD_TEXT.back}</Link>
                <h1 className="help__thread-title">{ticket.subject}</h1>
                <p className="help__ticket-meta">
                    <span className={`help__badge help__badge--${ticket.status}`}>{HELP_TEXT.statuses[ticket.status]}</span>
                    {" "}{HELP_TEXT.categories[ticket.category]}
                </p>
            </header>

            <ol className="help__thread" aria-label={ticket.subject}>
                {ticket.messages.map((message) => (
                    <li key={message.id} className={`help__message${message.isStaff ? " help__message--staff" : ""}`}>
                        <p className="help__message-head">
                            <strong>{message.isStaff ? THREAD_TEXT.staff : THREAD_TEXT.you}</strong>
                            <time dateTime={message.createdAt}>{formatDateTime(message.createdAt)}</time>
                        </p>
                        {/* Texte brut : pre-wrap garde les retours à la ligne, React échappe le contenu */}
                        <p className="help__message-body">{message.body}</p>
                    </li>
                ))}
            </ol>

            <form className="form help__form" onSubmit={handleSend} noValidate>
                {ticket.status === "resolved" && <p className="help__hint">{THREAD_TEXT.resolvedHint}</p>}
                <div className="form__row">
                    <label htmlFor={replyId}>{THREAD_TEXT.reply}</label>
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
                    <FontAwesomeIcon icon={faPaperPlane} aria-hidden="true" /> {isPending ? THREAD_TEXT.sending : THREAD_TEXT.send}
                </button>
            </form>
        </div>
    );
}
