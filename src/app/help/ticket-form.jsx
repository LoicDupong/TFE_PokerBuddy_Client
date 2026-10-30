"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";

import supportService from "@/services/support.service.js";
import useToastStore from "@/stores/useToastStore.js";
import { HELP_TEXT } from "./help.utils.js";

const FORM_TEXT = {
    title: "Contact us",
    intro: "Tell us what happened and we'll get back to you here. You'll get a notification when we reply.",
    category: "What is it about?",
    subject: "Subject",
    subjectPlaceholder: "A few words to sum it up",
    message: "Details",
    messagePlaceholder: "What were you doing, and what did you expect to happen?",
    submit: "Send request",
    sending: "Sending…",
    sent: "Request sent. We'll reply here.",
    errors: {
        subject: "Please add a subject",
        message: "Please describe your request",
    },
};

export default function TicketForm() {
    const ids = { category: useId(), subject: useId(), message: useId() };
    const router = useRouter();
    const [category, setCategory] = useState("bug");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState({});
    const [isPending, setIsPending] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        if (isPending) return;

        const next = {};
        if (!subject.trim()) next.subject = FORM_TEXT.errors.subject;
        if (!message.trim()) next.message = FORM_TEXT.errors.message;
        setErrors(next);
        if (Object.keys(next).length) return;

        setIsPending(true);
        const res = await supportService.createTicket({ category, subject, message });
        setIsPending(false);

        if (!res.success) {
            useToastStore.getState().showToast(res.error, "error");
            return;
        }
        useToastStore.getState().showToast(FORM_TEXT.sent, "success");
        router.push(`/help/tickets/${res.data.id}`);
    }

    return (
        <section className="help__section" aria-labelledby="help-contact-title">
            <h2 id="help-contact-title" className="help__title">{FORM_TEXT.title}</h2>
            <p className="help__hint">{FORM_TEXT.intro}</p>

            <form className="form help__form" onSubmit={handleSubmit} noValidate>
                <div className="form__row">
                    <label htmlFor={ids.category}>{FORM_TEXT.category}</label>
                    <select id={ids.category} value={category} onChange={(e) => setCategory(e.target.value)}>
                        {Object.entries(HELP_TEXT.categories).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </div>

                <div className="form__row">
                    <label htmlFor={ids.subject}>{FORM_TEXT.subject}</label>
                    <input
                        id={ids.subject}
                        type="text"
                        value={subject}
                        maxLength={HELP_TEXT.subjectMax}
                        placeholder={FORM_TEXT.subjectPlaceholder}
                        aria-invalid={Boolean(errors.subject)}
                        aria-describedby={errors.subject ? `${ids.subject}-error` : undefined}
                        onChange={(e) => setSubject(e.target.value)}
                    />
                    {errors.subject && <p id={`${ids.subject}-error`} className="form__error" role="alert">{errors.subject}</p>}
                </div>

                <div className="form__row">
                    <label htmlFor={ids.message}>{FORM_TEXT.message}</label>
                    <textarea
                        id={ids.message}
                        rows={6}
                        value={message}
                        maxLength={HELP_TEXT.messageMax}
                        placeholder={FORM_TEXT.messagePlaceholder}
                        aria-invalid={Boolean(errors.message)}
                        aria-describedby={errors.message ? `${ids.message}-error` : undefined}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    {errors.message && <p id={`${ids.message}-error`} className="form__error" role="alert">{errors.message}</p>}
                </div>

                <button type="submit" className="btn btn--secondary help__submit" disabled={isPending}>
                    <FontAwesomeIcon icon={faPaperPlane} aria-hidden="true" /> {isPending ? FORM_TEXT.sending : FORM_TEXT.submit}
                </button>
            </form>
        </section>
    );
}
