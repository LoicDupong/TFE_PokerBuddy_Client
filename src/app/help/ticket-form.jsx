"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";

import supportService from "@/services/support.service.js";
import useToastStore from "@/stores/useToastStore.js";
import { HELP_TEXT } from "./help.utils.js";
import { useT } from "@/i18n/i18n-provider.jsx";
import { HELP_MESSAGES } from "./help.messages.js";
import { useServerError } from "@/utils/server-errors.utils.js";

export default function TicketForm() {
    const { t } = useT(HELP_MESSAGES);
    const serverError = useServerError();
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
        if (!subject.trim()) next.subject = t("form.errors.subject");
        if (!message.trim()) next.message = t("form.errors.message");
        setErrors(next);
        if (Object.keys(next).length) return;

        setIsPending(true);
        const res = await supportService.createTicket({ category, subject, message });
        setIsPending(false);

        if (!res.success) {
            useToastStore.getState().showToast(serverError(res.error), "error");
            return;
        }
        useToastStore.getState().showToast(t("form.sent"), "success");
        router.push(`/help/tickets/${res.data.id}`);
    }

    return (
        <section className="help__section" aria-labelledby="help-contact-title">
            <h2 id="help-contact-title" className="help__title">{t("form.title")}</h2>
            <p className="help__hint">{t("form.intro")}</p>

            <form className="form help__form" onSubmit={handleSubmit} noValidate>
                <div className="form__row">
                    <label htmlFor={ids.category}>{t("form.category")}</label>
                    <select id={ids.category} value={category} onChange={(e) => setCategory(e.target.value)}>
                        {Object.keys(HELP_MESSAGES.en.categories).map((value) => (
                            <option key={value} value={value}>{t(`categories.${value}`)}</option>
                        ))}
                    </select>
                </div>

                <div className="form__row">
                    <label htmlFor={ids.subject}>{t("form.subject")}</label>
                    <input
                        id={ids.subject}
                        type="text"
                        value={subject}
                        maxLength={HELP_TEXT.subjectMax}
                        placeholder={t("form.subjectPlaceholder")}
                        aria-invalid={Boolean(errors.subject)}
                        aria-describedby={errors.subject ? `${ids.subject}-error` : undefined}
                        onChange={(e) => setSubject(e.target.value)}
                    />
                    {errors.subject && <p id={`${ids.subject}-error`} className="form__error" role="alert">{errors.subject}</p>}
                </div>

                <div className="form__row">
                    <label htmlFor={ids.message}>{t("form.message")}</label>
                    <textarea
                        id={ids.message}
                        rows={6}
                        value={message}
                        maxLength={HELP_TEXT.messageMax}
                        placeholder={t("form.messagePlaceholder")}
                        aria-invalid={Boolean(errors.message)}
                        aria-describedby={errors.message ? `${ids.message}-error` : undefined}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    {errors.message && <p id={`${ids.message}-error`} className="form__error" role="alert">{errors.message}</p>}
                </div>

                <button type="submit" className="btn btn--secondary help__submit" disabled={isPending}>
                    <FontAwesomeIcon icon={faPaperPlane} aria-hidden="true" /> {isPending ? t("form.sending") : t("form.submit")}
                </button>
            </form>
        </section>
    );
}
