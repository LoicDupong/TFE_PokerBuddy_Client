'use client';

import Link from "next/link";
import { useId, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faSignInAlt } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";

import { validateLogin } from "@/schemas/authSchema.js";
import { getFieldError } from "@/utils/getFieldError.utils.js";
import useAuthStore from "@/stores/useAuthStore";

export default function LoginForm() {
    const inputId = useId();
    const router = useRouter();

    const login = useAuthStore((state) => state.login);
    const setAuth = useAuthStore((state) => state.setAuth);

    const [errorMessage, setErrorMessage] = useState([]);
    const [isPending, setIsPending] = useState(false);

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
            router.push("/");
        } else {
            setErrorMessage([{ field: "form", message: res.error?.error || "Login failed" }]);
        }

        setIsPending(false);
    }

    return (
        <section className="auth auth--login">
            <h1 className="title title--auth">Login</h1>

            <form onSubmit={handleLogin} className="form form--auth" id="login-form">
                <div className="form__row">
                    <label htmlFor={inputId + "email"}>
                        <FontAwesomeIcon icon={faEnvelope} /> Email
                    </label>
                    <input
                        type="email"
                        id={inputId + "email"}
                        name="email"
                        placeholder="Enter your email"
                        required
                    />
                    {getFieldError(errorMessage, "email") && (
                        <p className="form__error">{getFieldError(errorMessage, "email")}</p>
                    )}
                </div>

                <div className="form__row">
                    <label htmlFor={inputId + "password"}>
                        <FontAwesomeIcon icon={faLock} /> Password
                    </label>
                    <input
                        type="password"
                        id={inputId + "password"}
                        name="password"
                        placeholder="Enter your password"
                        required
                    />
                    {getFieldError(errorMessage, "password") && (
                        <p className="form__error">{getFieldError(errorMessage, "password")}</p>
                    )}
                </div>

                <button type="submit" className="btn btn--full btn--auth" disabled={isPending}>
                    <FontAwesomeIcon icon={faSignInAlt} /> {isPending ? "Logging in…" : "Login"}
                </button>

                {/* Erreur globale */}
                {getFieldError(errorMessage, "form") && (
                    <p className="form__error">{getFieldError(errorMessage, "form")}</p>
                )}
            </form>

            <p className="auth__redirect">
                Don’t have an account?{" "}
                <Link href="/auth/register" className="link">
                    Register here
                </Link>
            </p>
        </section>
    );
}
