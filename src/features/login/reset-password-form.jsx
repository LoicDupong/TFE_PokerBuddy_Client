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
        const validation = validateResetPassword(data);
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
            setErrorMessage([{ field: "form", message: res.error }]);
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
                    This link <span className="red">no longer works</span>
                </h1>

                <div className="auth__panel auth__panel--warning" role="alert">
                    <FontAwesomeIcon icon={faLink} className="auth__panel-icon" aria-hidden="true" />
                    <div>
                        <p>It has expired or has already been used. Reset links work for 30 minutes, and only once.</p>
                        <p className="auth__hint">Ask for a new one and use the most recent email you receive.</p>
                    </div>
                </div>

                <div className="auth__actions">
                    <Link href="/auth/forgot-password" className="btn btn--full">Send me a new link</Link>
                </div>

                <p className="auth__redirect">
                    Remembered your password? <Link href="/auth/login" className="link">Log in</Link>
                </p>
            </section>
        );
    }

    return (
        <section className="auth auth--reset">
            <h1 className="title title--auth" ref={titleRef} tabIndex={-1}>
                Choose a <span className="red">new password</span>
            </h1>
            <p className="auth__intro">
                Once it&apos;s saved, every device logged in to your account is logged out. You&apos;ll log in
                again with the new one.
            </p>

            <form onSubmit={handleSubmit} className="form form--auth" id="reset-password-form" noValidate>
                <div className="form__row">
                    <label htmlFor={inputId + "password"}>
                        <FontAwesomeIcon icon={faLock} /> New password
                    </label>
                    <p className="auth__hint" id={inputId + "password-rules"}>
                        At least 6 characters, with an uppercase letter and a number.
                    </p>
                    <div className="input__container">
                        <input
                            type={showPassword ? "text" : "password"}
                            id={inputId + "password"}
                            name="password"
                            placeholder="Enter a new password"
                            autoComplete="new-password"
                            className="input--with-toggle"
                            aria-invalid={!!getFieldError(errorMessage, "password")}
                            aria-describedby={describedBy("password", inputId + "password-rules")}
                        />
                        <button
                            type="button"
                            className="input__toggle"
                            onClick={() => setShowPassword((v) => !v)}
                            aria-label={showPassword ? "Hide passwords" : "Show passwords"}
                            aria-pressed={showPassword}
                        >
                            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} aria-hidden="true" />
                        </button>
                    </div>
                    {fieldError("password")}
                </div>

                <div className="form__row">
                    <label htmlFor={inputId + "confirmPassword"}>
                        <FontAwesomeIcon icon={faLock} /> Confirm new password
                    </label>
                    <input
                        type={showPassword ? "text" : "password"}
                        id={inputId + "confirmPassword"}
                        name="confirmPassword"
                        placeholder="Type it again"
                        autoComplete="new-password"
                        aria-invalid={!!getFieldError(errorMessage, "confirmPassword")}
                        aria-describedby={describedBy("confirmPassword")}
                    />
                    {fieldError("confirmPassword")}
                </div>

                <button type="submit" className="btn btn--full btn--auth" disabled={isPending || token === undefined}>
                    <FontAwesomeIcon icon={faFloppyDisk} /> {isPending ? "Saving…" : "Save my new password"}
                </button>

                {getFieldError(errorMessage, "form") && (
                    <p className="form__error" role="alert">{getFieldError(errorMessage, "form")}</p>
                )}
            </form>
        </section>
    );
}
