'use client';

import Link from "next/link";
import { useId, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faEye, faEyeSlash, faLock, faSignInAlt } from "@fortawesome/free-solid-svg-icons";
import { useRouter, useSearchParams } from "next/navigation";

import { validateLogin } from "@/schemas/authSchema.js";
import { getFieldError } from "@/utils/getFieldError.utils.js";
import { getSafeRedirect } from "@/utils/redirect.utils.js";
import useAuthStore from "@/stores/useAuthStore";

export default function LoginForm() {
    const inputId = useId();
    const router = useRouter();
    // Page d'origine (ex: lien d'invitation /join/…) où revenir après le login
    const redirect = getSafeRedirect(useSearchParams().get("redirect"));

    const login = useAuthStore((state) => state.login);
    const setAuth = useAuthStore((state) => state.setAuth);

    const [errorMessage, setErrorMessage] = useState([]);
    const [isPending, setIsPending] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    async function handleLogin(e) {
        e.preventDefault();
        setIsPending(true);

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        // ✅ Validation avec Zod
        const validation = validateLogin(data);
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
            setErrorMessage([{ field: "form", message: res.error?.error || "Login failed" }]);
        }

        setIsPending(false);
    }

    return (
        <section className="auth auth--login">
            <h1 className="title title--auth">Login</h1>

            <form onSubmit={handleLogin} className="form form--auth" id="login-form" noValidate>
                <div className="form__row">
                    <label htmlFor={inputId + "email"}>
                        <FontAwesomeIcon icon={faEnvelope} /> Email
                    </label>
                    <input
                        type="email"
                        id={inputId + "email"}
                        name="email"
                        placeholder="Enter your email"
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
                        <FontAwesomeIcon icon={faLock} /> Password
                    </label>
                    <div className="input__container">
                        <input
                            type={showPassword ? "text" : "password"}
                            id={inputId + "password"}
                            name="password"
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            aria-invalid={!!getFieldError(errorMessage, "password")}
                            aria-describedby={getFieldError(errorMessage, "password") ? inputId + "password-error" : undefined}
                            className="input--with-toggle"
                        />
                        <button
                            type="button"
                            className="input__toggle"
                            onClick={() => setShowPassword((v) => !v)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            aria-pressed={showPassword}
                        >
                            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} aria-hidden="true" />
                        </button>
                    </div>
                    {getFieldError(errorMessage, "password") && (
                        <p className="form__error" id={inputId + "password-error"} role="alert">{getFieldError(errorMessage, "password")}</p>
                    )}
                </div>

                <button type="submit" className="btn btn--full btn--auth" disabled={isPending}>
                    <FontAwesomeIcon icon={faSignInAlt} /> {isPending ? "Logging in…" : "Login"}
                </button>

                {/* Erreur globale */}
                {getFieldError(errorMessage, "form") && (
                    <p className="form__error" role="alert">{getFieldError(errorMessage, "form")}</p>
                )}
            </form>

            <p className="auth__redirect">
                Don’t have an account?{" "}
                <Link
                    href={redirect ? `/auth/register?redirect=${encodeURIComponent(redirect)}` : "/auth/register"}
                    className="link"
                >
                    Register here
                </Link>
            </p>
        </section>
    );
}
