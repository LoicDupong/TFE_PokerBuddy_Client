'use client';

import "./auth.scss";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faEnvelopeOpenText, faPaperPlane } from "@fortawesome/free-solid-svg-icons";

import { validateForgotPassword } from "@/schemas/authSchema.js";
import { getFieldError } from "@/utils/getFieldError.utils.js";
import userService from "@/services/user.service.js";
import { rememberAuthEmail, takeAuthEmail } from "./auth-handoff.js";

export default function ForgotPasswordForm() {
    const inputId = useId();
    const titleRef = useRef(null);
    const emailRef = useRef(null);

    const [email, setEmail] = useState("");
    const [errorMessage, setErrorMessage] = useState([]);
    const [isPending, setIsPending] = useState(false);
    // Adresse à laquelle le lien a été (peut-être) envoyé : affiche l'écran "regarde tes emails"
    const [sentTo, setSentTo] = useState(null);

    // Email tapé sur la page de login, transmis sans passer par l'URL
    useEffect(() => {
        const prefill = takeAuthEmail();
        if (prefill) setEmail(prefill);
    }, []);

    // Changement d'écran : le focus suit, pour le clavier et les lecteurs d'écran
    const firstRender = useRef(true);
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        if (sentTo) titleRef.current?.focus();
        else emailRef.current?.focus();
    }, [sentTo]);

    async function handleSubmit(e) {
        e.preventDefault();

        const validation = validateForgotPassword({ email });
        if (!validation.ok) {
            setErrorMessage(validation.errors);
            return;
        }

        setErrorMessage([]);
        setIsPending(true);
        const res = await userService.requestPasswordReset(validation.data.email);
        setIsPending(false);

        if (res.success) {
            setSentTo(validation.data.email);
        } else {
            setErrorMessage([{ field: "form", message: res.error }]);
        }
    }

    const emailError = getFieldError(errorMessage, "email");
    const formError = getFieldError(errorMessage, "form");

    if (sentTo) {
        return (
            <section className="auth auth--forgot">
                <h1 className="title title--auth" ref={titleRef} tabIndex={-1}>
                    Check your <span className="red">inbox</span>
                </h1>

                <div className="auth__panel" role="status">
                    <FontAwesomeIcon icon={faEnvelopeOpenText} className="auth__panel-icon" aria-hidden="true" />
                    <div>
                        <p>
                            If an account exists for <strong className="auth__email">{sentTo}</strong>, we&apos;ve
                            just sent it a link to choose a new password.
                        </p>
                        <p className="auth__hint">
                            The link works for 30 minutes. Nothing after a few minutes? Check your spam folder,
                            then try again.
                        </p>
                    </div>
                </div>

                <div className="auth__actions">
                    <Link href="/auth/login" className="btn btn--full" onClick={() => rememberAuthEmail(sentTo)}>
                        Back to log in
                    </Link>
                    <button type="button" className="btn btn--secondary" onClick={() => setSentTo(null)}>
                        Use another email
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className="auth auth--forgot">
            <h1 className="title title--auth" ref={titleRef} tabIndex={-1}>
                Forgot your <span className="red">password?</span>
            </h1>
            <p className="auth__intro">
                Happens to the best bluffers. Enter the email of your account and we&apos;ll send you a link
                to choose a new password.
            </p>

            <form onSubmit={handleSubmit} className="form form--auth" id="forgot-password-form" noValidate>
                <div className="form__row">
                    <label htmlFor={inputId + "email"}>
                        <FontAwesomeIcon icon={faEnvelope} /> Email
                    </label>
                    <input
                        ref={emailRef}
                        type="email"
                        id={inputId + "email"}
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        autoComplete="email"
                        inputMode="email"
                        aria-invalid={!!emailError}
                        aria-describedby={emailError ? inputId + "email-error" : undefined}
                    />
                    {emailError && (
                        <p className="form__error" id={inputId + "email-error"} role="alert">{emailError}</p>
                    )}
                </div>

                <button type="submit" className="btn btn--full btn--auth" disabled={isPending}>
                    <FontAwesomeIcon icon={faPaperPlane} /> {isPending ? "Sending…" : "Send me a link"}
                </button>

                {formError && <p className="form__error" role="alert">{formError}</p>}
            </form>

            <p className="auth__redirect">
                Remembered it?{" "}
                <Link href="/auth/login" className="link" onClick={() => rememberAuthEmail(email)}>
                    Back to log in
                </Link>
            </p>
        </section>
    );
}
