'use client';

import Link from "next/link";
import { useId, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faEye, faEyeSlash, faLock, faUserPlus, faUser } from "@fortawesome/free-solid-svg-icons";
import { useRouter, useSearchParams } from "next/navigation";

import { validateRegister } from "@/schemas/authSchema.js";
import { getFieldError } from "@/utils/getFieldError.utils.js";
import { getSafeRedirect } from "@/utils/redirect.utils.js";
import useAuthStore from "@/stores/useAuthStore";

export default function RegisterForm() {
    const register = useAuthStore((state) => state.register);
    const setAuth = useAuthStore((state) => state.setAuth);

    const inputId = useId();
    const router = useRouter();
    // Page d'origine (ex: lien d'invitation /join/…) où revenir après l'inscription
    const searchParams = useSearchParams();
    const redirect = getSafeRedirect(searchParams.get("redirect"));
    // Jeton invité : rattache sa réponse à la partie au nouveau compte
    const claim = searchParams.get("claim");

    const [errorMessage, setErrorMessage] = useState([]);
    const [isPending, setIsPending] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    async function handleRegister(e) {
        e.preventDefault();
        setIsPending(true);

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        // ✅ Validation avec Zod
        const validation = validateRegister(data);
        if (!validation.ok) {
            setErrorMessage(validation.errors);
            setIsPending(false);
            return;
        }

        // ✅ Appel API via store
        const res = await register(
            validation.data.username,
            validation.data.email,
            validation.data.password,
            claim
        );

        if (res.success) {
            const { user, token } = res.data;
            // Le register renvoie déjà un token : l'utilisateur est connecté
            setAuth(user, token);
            router.push(redirect || "/");
        } else {
            setErrorMessage([{ field: "form", message: res.error?.error || "Registration failed" }]);
        }

        setIsPending(false);
    }

    // Message d'erreur + attributs a11y d'un champ (comme login-form)
    const errorId = (field) => inputId + field + "-error";
    const errProps = (field) => {
        const invalid = !!getFieldError(errorMessage, field);
        return {
            "aria-invalid": invalid,
            "aria-describedby": invalid ? errorId(field) : undefined,
        };
    };
    const fieldError = (field) => {
        const message = getFieldError(errorMessage, field);
        return message && <p className="form__error" id={errorId(field)} role="alert">{message}</p>;
    };

    return (
        <section className="auth auth--register">
            <h1 className="title title--auth">
                Create <br /><span className="red">new account</span>
            </h1>

            <form onSubmit={handleRegister} className="form form--auth" id="register-form" noValidate>
                <div className="form__row">
                    <label htmlFor={inputId + "username"}>
                        <FontAwesomeIcon icon={faUser} /> Username
                    </label>
                    <input
                        type="text"
                        id={inputId + "username"}
                        name="username"
                        placeholder="Choose a username"
                        autoComplete="username"
                        {...errProps("username")}
                    />
                    {fieldError("username")}
                </div>

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
                        {...errProps("email")}
                    />
                    {fieldError("email")}
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
                            autoComplete="new-password"
                            className="input--with-toggle"
                            {...errProps("password")}
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
                    {fieldError("password")}
                </div>

                <div className="form__row">
                    <label htmlFor={inputId + "confirmPassword"}>
                        <FontAwesomeIcon icon={faLock} /> Confirm password
                    </label>
                    <input
                        type={showPassword ? "text" : "password"}
                        id={inputId + "confirmPassword"}
                        name="confirmPassword"
                        placeholder="Confirm your password"
                        autoComplete="new-password"
                        {...errProps("confirmPassword")}
                    />
                    {fieldError("confirmPassword")}
                </div>

                <button type="submit" className="btn btn--full btn--auth" disabled={isPending}>
                    <FontAwesomeIcon icon={faUserPlus} /> {isPending ? "Registering…" : "Register"}
                </button>

                {/* Erreur globale */}
                {getFieldError(errorMessage, "form") && (
                    <p className="form__error" role="alert">{getFieldError(errorMessage, "form")}</p>
                )}
            </form>

            <p className="auth__redirect">
                Already have an account?{" "}
                <Link
                    href={redirect ? `/auth/login?redirect=${encodeURIComponent(redirect)}` : "/auth/login"}
                    className="link"
                >
                    Log in
                </Link>
            </p>
        </section>
    );
}
