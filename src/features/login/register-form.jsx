'use client';

import Link from "next/link";
import { useId, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faEye, faEyeSlash, faLock, faUserPlus, faUser } from "@fortawesome/free-solid-svg-icons";
import { useRouter, useSearchParams } from "next/navigation";

import { validateRegister } from "@/schemas/authSchema.js";
import { useT, useLocale } from "@/i18n/i18n-provider.jsx";
import { AUTH_MESSAGES } from "./auth.messages.js";
import { useServerError } from "@/utils/server-errors.utils.js";
import { getFieldError } from "@/utils/getFieldError.utils.js";
import { getSafeRedirect } from "@/utils/redirect.utils.js";
import useAuthStore from "@/stores/useAuthStore";

export default function RegisterForm() {
    const { t } = useT(AUTH_MESSAGES);
    const { locale } = useLocale();
    const serverError = useServerError();
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
        const validation = validateRegister(data, locale);
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
            claim,
            locale
        );

        if (res.success) {
            const { user, token } = res.data;
            // Le register renvoie déjà un token : l'utilisateur est connecté
            setAuth(user, token);
            router.push(redirect || "/");
        } else {
            setErrorMessage([{ field: "form", message: serverError(res.error?.error) || t("registerFailed") }]);
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
                {t("createTitle")} <br /><span className="red">{t("createRed")}</span>
            </h1>

            <form onSubmit={handleRegister} className="form form--auth" id="register-form" noValidate>
                <div className="form__row">
                    <label htmlFor={inputId + "username"}>
                        <FontAwesomeIcon icon={faUser} /> {t("username")}
                    </label>
                    <input
                        type="text"
                        id={inputId + "username"}
                        name="username"
                        placeholder={t("usernamePh")}
                        autoComplete="username"
                        {...errProps("username")}
                    />
                    {fieldError("username")}
                </div>

                <div className="form__row">
                    <label htmlFor={inputId + "email"}>
                        <FontAwesomeIcon icon={faEnvelope} /> {t("email")}
                    </label>
                    <input
                        type="email"
                        id={inputId + "email"}
                        name="email"
                        placeholder={t("emailPh")}
                        autoComplete="email"
                        {...errProps("email")}
                    />
                    {fieldError("email")}
                </div>

                <div className="form__row">
                    <label htmlFor={inputId + "password"}>
                        <FontAwesomeIcon icon={faLock} /> {t("password")}
                    </label>
                    <div className="input__container">
                        <input
                            type={showPassword ? "text" : "password"}
                            id={inputId + "password"}
                            name="password"
                            placeholder={t("passwordPh")}
                            autoComplete="new-password"
                            className="input--with-toggle"
                            {...errProps("password")}
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
                    {fieldError("password")}
                </div>

                <div className="form__row">
                    <label htmlFor={inputId + "confirmPassword"}>
                        <FontAwesomeIcon icon={faLock} /> {t("confirmPassword")}
                    </label>
                    <input
                        type={showPassword ? "text" : "password"}
                        id={inputId + "confirmPassword"}
                        name="confirmPassword"
                        placeholder={t("confirmPh")}
                        autoComplete="new-password"
                        {...errProps("confirmPassword")}
                    />
                    {fieldError("confirmPassword")}
                </div>

                <button type="submit" className="btn btn--full btn--auth" disabled={isPending}>
                    <FontAwesomeIcon icon={faUserPlus} /> {isPending ? t("registerPending") : t("registerTitle")}
                </button>

                {/* Erreur globale */}
                {getFieldError(errorMessage, "form") && (
                    <p className="form__error" role="alert">{getFieldError(errorMessage, "form")}</p>
                )}
            </form>

            <p className="auth__redirect">
                {t("haveAccount")}{" "}
                <Link
                    href={redirect ? `/auth/login?redirect=${encodeURIComponent(redirect)}` : "/auth/login"}
                    className="link"
                >
                    {t("logIn")}
                </Link>
            </p>
        </section>
    );
}
