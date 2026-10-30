'use client';

import "./auth.scss";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faFloppyDisk, faLink, faLock } from "@fortawesome/free-solid-svg-icons";

import { validateResetPassword } from "@/schemas/authSchema.js";
import { getFieldError } from "@/utils/getFieldError.utils.js";
import userService from "@/services/user.service.js";
import useAuthStore from "@/stores/useAuthStore";
import { rememberAuthEmail } from "./auth-handoff.js";
import { useT, useLocale } from "@/i18n/i18n-provider.jsx";
import { AUTH_MESSAGES } from "./auth.messages.js";
import { useServerError } from "@/utils/server-errors.utils.js";

// Lit le jeton dans l'URL puis l'en retire aussitôt : il ne reste ni dans l'historique,
// ni dans les outils d'analytics, ni dans un éventuel referrer. Gardé en mémoire seulement.
function readTokenAndCleanUrl() {
    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");
    if (token !== null) {
        url.searchParams.delete("token");
        window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
    }
    return token || null;
}

export default function ResetPasswordForm() {
    const { t } = useT(AUTH_MESSAGES);
    const { locale } = useLocale();
    const serverError = useServerError();
    const inputId = useId();
    const router = useRouter();
    const titleRef = useRef(null);

    // undefined : pas encore lu (rendu serveur) ; null : absent de l'URL
    const [token, setToken] = useState(undefined);
    const [linkInvalid, setLinkInvalid] = useState(false);
    const [errorMessage, setErrorMessage] = useState([]);
    const [isPending, setIsPending] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const value = readTokenAndCleanUrl();
        setToken(value);
        if (!value) setLinkInvalid(true);
    }, []);

    useEffect(() => {
        if (linkInvalid) titleRef.current?.focus();
    }, [linkInvalid]);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!token || isPending) return;

        const data = Object.fromEntries(new FormData(e.target));
        const validation = validateResetPassword(data, locale);
        if (!validation.ok) {
            setErrorMessage(validation.errors);
            return;
        }

        setErrorMessage([]);
        setIsPending(true);
        const res = await userService.resetPassword(token, validation.data.password);

        if (res.success) {
            // Toutes les sessions du compte viennent d'être révoquées : on nettoie celle de cet appareil
            if (useAuthStore.getState().token) useAuthStore.getState().logout();
            rememberAuthEmail(res.data?.email);
            router.replace("/auth/login?reset=success");
            return;
        }

        setIsPending(false);
        if (res.code === "INVALID_RESET_TOKEN") {
            setToken(null);
            setLinkInvalid(true);
        } else {
            setErrorMessage([{ field: "form", message: serverError(res.error) }]);
        }
    }

    const errorId = (field) => inputId + field + "-error";
    const fieldError = (field) => {
        const message = getFieldError(errorMessage, field);
        return message && <p className="form__error" id={errorId(field)} role="alert">{message}</p>;
    };
    const describedBy = (field, ...extra) =>
        [...extra, getFieldError(errorMessage, field) ? errorId(field) : null].filter(Boolean).join(" ") || undefined;

    if (linkInvalid) {
        return (
            <section className="auth auth--reset">
                <h1 className="title title--auth" ref={titleRef} tabIndex={-1}>
                    {t("brokenTitle")} <span className="red">{t("brokenRed")}</span>
                </h1>

                <div className="auth__panel auth__panel--warning" role="alert">
                    <FontAwesomeIcon icon={faLink} className="auth__panel-icon" aria-hidden="true" />
                    <div>
                        <p>{t("brokenText")}</p>
                        <p className="auth__hint">{t("brokenHint")}</p>
                    </div>
                </div>

                <div className="auth__actions">
                    <Link href="/auth/forgot-password" className="btn btn--full">{t("newLink")}</Link>
                </div>

                <p className="auth__redirect">
                    {t("rememberedPwd")} <Link href="/auth/login" className="link">{t("logIn")}</Link>
                </p>
            </section>
        );
    }

    return (
        <section className="auth auth--reset">
            <h1 className="title title--auth" ref={titleRef} tabIndex={-1}>
                {t("chooseTitle")} <span className="red">{t("chooseRed")}</span>
            </h1>
            <p className="auth__intro">
                {t("chooseIntro")}
            </p>

            <form onSubmit={handleSubmit} className="form form--auth" id="reset-password-form" noValidate>
                <div className="form__row">
                    <label htmlFor={inputId + "password"}>
                        <FontAwesomeIcon icon={faLock} /> {t("newPassword")}
                    </label>
                    <p className="auth__hint" id={inputId + "password-rules"}>
                        {t("rules")}
                    </p>
                    <div className="input__container">
                        <input
                            type={showPassword ? "text" : "password"}
                            id={inputId + "password"}
                            name="password"
                            placeholder={t("newPh")}
                            autoComplete="new-password"
                            className="input--with-toggle"
                            aria-invalid={!!getFieldError(errorMessage, "password")}
                            aria-describedby={describedBy("password", inputId + "password-rules")}
                        />
                        <button
                            type="button"
                            className="input__toggle"
                            onClick={() => setShowPassword((v) => !v)}
                            aria-label={showPassword ? t("hidePasswords") : t("showPasswords")}
                            aria-pressed={showPassword}
                        >
                            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} aria-hidden="true" />
                        </button>
                    </div>
                    {fieldError("password")}
                </div>

                <div className="form__row">
                    <label htmlFor={inputId + "confirmPassword"}>
                        <FontAwesomeIcon icon={faLock} /> {t("confirmNew")}
                    </label>
                    <input
                        type={showPassword ? "text" : "password"}
                        id={inputId + "confirmPassword"}
                        name="confirmPassword"
                        placeholder={t("againPh")}
                        autoComplete="new-password"
                        aria-invalid={!!getFieldError(errorMessage, "confirmPassword")}
                        aria-describedby={describedBy("confirmPassword")}
                    />
                    {fieldError("confirmPassword")}
                </div>

                <button type="submit" className="btn btn--full btn--auth" disabled={isPending || token === undefined}>
                    <FontAwesomeIcon icon={faFloppyDisk} /> {isPending ? t("saving") : t("saveNew")}
                </button>

                {getFieldError(errorMessage, "form") && (
                    <p className="form__error" role="alert">{getFieldError(errorMessage, "form")}</p>
                )}
            </form>
        </section>
    );
}
