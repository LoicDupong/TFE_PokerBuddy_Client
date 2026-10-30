'use client';

import "./auth.scss";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faEye, faEyeSlash, faLock, faSignInAlt } from "@fortawesome/free-solid-svg-icons";
import { useRouter, useSearchParams } from "next/navigation";

import { validateLogin } from "@/schemas/authSchema.js";
import { getFieldError } from "@/utils/getFieldError.utils.js";
import { getSafeRedirect } from "@/utils/redirect.utils.js";
import useAuthStore from "@/stores/useAuthStore";
import { rememberAuthEmail, takeAuthEmail } from "./auth-handoff.js";
import { useT, useLocale } from "@/i18n/i18n-provider.jsx";
import { AUTH_MESSAGES } from "./auth.messages.js";
import { useServerError } from "@/utils/server-errors.utils.js";

export default function LoginForm() {
    const { t } = useT(AUTH_MESSAGES);
    const { locale } = useLocale();
    const serverError = useServerError();
    const inputId = useId();
    const router = useRouter();
    const searchParams = useSearchParams();
    // Page d'origine (ex: lien d'invitation /join/…) où revenir après le login
    const redirect = getSafeRedirect(searchParams.get("redirect"));
    // Arrivée depuis la page "nouveau mot de passe"
    const passwordWasReset = searchParams.get("reset") === "success";

    const login = useAuthStore((state) => state.login);
    const setAuth = useAuthStore((state) => state.setAuth);

    const emailRef = useRef(null);
    const passwordRef = useRef(null);

    const [errorMessage, setErrorMessage] = useState([]);
    const [isPending, setIsPending] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Email transmis par le parcours "mot de passe oublié" : pré-rempli, le curseur va au mot de passe
    useEffect(() => {
        const email = takeAuthEmail();
        if (email && emailRef.current && !emailRef.current.value) {
            emailRef.current.value = email;
            passwordRef.current?.focus();
        }
    }, []);

    async function handleLogin(e) {
        e.preventDefault();
        setIsPending(true);

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        // ✅ Validation avec Zod
        const validation = validateLogin(data, locale);
        if (!validation.ok) {
            setErrorMessage(validation.errors);
            setIsPending(false);
            return;
        }

        // ✅ API call via store
        const res = await login(validation.data.email, validation.data.password);

        if (res.success) {
            const { user, token } = res.data;
            setAuth(user, token);
            router.push(redirect || "/");
        } else {
            setErrorMessage([{ field: "form", message: serverError(res.error?.error) || t("loginFailed") }]);
        }

        setIsPending(false);
    }

    return (
        <section className="auth auth--login">
            <h1 className="title title--auth">{t("loginTitle")}</h1>

            {passwordWasReset && (
                <p className="form__alert form__alert--success auth__notice" role="status">
                    {t("resetDone")}
                </p>
            )}

            <form onSubmit={handleLogin} className="form form--auth" id="login-form" noValidate>
                <div className="form__row">
                    <label htmlFor={inputId + "email"}>
                        <FontAwesomeIcon icon={faEnvelope} /> {t("email")}
                    </label>
                    <input
                        ref={emailRef}
                        type="email"
                        id={inputId + "email"}
                        name="email"
                        placeholder={t("emailPh")}
                        autoComplete="email"
                        aria-invalid={!!getFieldError(errorMessage, "email")}
                        aria-describedby={getFieldError(errorMessage, "email") ? inputId + "email-error" : undefined}
                    />
                    {getFieldError(errorMessage, "email") && (
                        <p className="form__error" id={inputId + "email-error"} role="alert">{getFieldError(errorMessage, "email")}</p>
                    )}
                </div>

                <div className="form__row">
                    <label htmlFor={inputId + "password"}>
                        <FontAwesomeIcon icon={faLock} /> {t("password")}
                    </label>
                    <div className="input__container">
                        <input
                            ref={passwordRef}
                            type={showPassword ? "text" : "password"}
                            id={inputId + "password"}
                            name="password"
                            placeholder={t("passwordPh")}
                            autoComplete="current-password"
                            aria-invalid={!!getFieldError(errorMessage, "password")}
                            aria-describedby={getFieldError(errorMessage, "password") ? inputId + "password-error" : undefined}
                            className="input--with-toggle"
                        />
                        <button
                            type="button"
                            className="input__toggle"
                            onClick={() => setShowPassword((v) => !v)}
                            aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                            aria-pressed={showPassword}
                        >
                            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} aria-hidden="true" />
                        </button>
                    </div>
                    {getFieldError(errorMessage, "password") && (
                        <p className="form__error" id={inputId + "password-error"} role="alert">{getFieldError(errorMessage, "password")}</p>
                    )}
                    {/* L'email déjà tapé suit vers la page "mot de passe oublié" (sans passer par l'URL) */}
                    <Link
                        href="/auth/forgot-password"
                        className="link auth__forgot"
                        onClick={() => rememberAuthEmail(emailRef.current?.value)}
                    >
                        {t("forgotLink")}
                    </Link>
                </div>

                <button type="submit" className="btn btn--full btn--auth" disabled={isPending}>
                    <FontAwesomeIcon icon={faSignInAlt} /> {isPending ? t("loginPending") : t("loginTitle")}
                </button>

                {/* Erreur globale */}
                {getFieldError(errorMessage, "form") && (
                    <p className="form__error" role="alert">{getFieldError(errorMessage, "form")}</p>
                )}
            </form>

            <p className="auth__redirect">
                {t("noAccount")}{" "}
                <Link
                    href={redirect ? `/auth/register?redirect=${encodeURIComponent(redirect)}` : "/auth/register"}
                    className="link"
                >
                    {t("register")}
                </Link>
            </p>
        </section>
    );
}
