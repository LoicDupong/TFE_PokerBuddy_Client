'use client';

import Link from "next/link";
import { useId, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faUserPlus, faUser } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";

import { validateRegister } from "@/schemas/authSchema.js";
import { getFieldError } from "@/utils/getFieldError.utils.js";
import useAuthStore from "@/stores/useAuthStore";

export default function RegisterForm() {
    const register = useAuthStore((state) => state.register);
    const setAuth = useAuthStore((state) => state.setAuth);

    const inputId = useId();
    const router = useRouter();

    const [errorMessage, setErrorMessage] = useState([]);
    const [isPending, setIsPending] = useState(false);

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
            validation.data.password
        );

        if (res.success) {
            const { user, token } = res.data;
            setAuth(user, token);
            router.push("/login");
        } else {
            setErrorMessage([{ field: "form", message: res.error?.error || "Registration failed" }]);
        }

        setIsPending(false);
    }

    return (
        <section className="auth auth--register">
            <h1 className="title title--auth">
                Create <br /><span className="red">new account</span>
            </h1>

            <form onSubmit={handleRegister} className="form form--auth" id="register-form">
                <div className="form__row">
                    <label htmlFor={inputId + "username"}>
                        <FontAwesomeIcon icon={faUser} /> Username
                    </label>
                    <input
                        type="text"
                        id={inputId + "username"}
                        name="username"
                        placeholder="Choose a username"
                        required
                    />
                    {getFieldError(errorMessage, "username") && (
                        <p className="form__error">{getFieldError(errorMessage, "username")}</p>
                    )}
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

                <div className="form__row">
                    <label htmlFor={inputId + "confirmPassword"}>
                        <FontAwesomeIcon icon={faLock} /> Confirm Password
                    </label>
                    <input
                        type="password"
                        id={inputId + "confirmPassword"}
                        name="confirmPassword"
                        placeholder="Confirm your password"
                        required
                    />
                    {getFieldError(errorMessage, "confirmPassword") && (
                        <p className="form__error">{getFieldError(errorMessage, "confirmPassword")}</p>
                    )}
                </div>

                <button type="submit" className="btn btn--full btn--auth" disabled={isPending}>
                    <FontAwesomeIcon icon={faUserPlus} /> {isPending ? "Registering…" : "Register"}
                </button>

                {/* Erreur globale */}
                {getFieldError(errorMessage, "form") && (
                    <p className="form__error">{getFieldError(errorMessage, "form")}</p>
                )}
            </form>

            <p className="auth__redirect">
                Already have an account?{" "}
                <Link href="/auth/login" className="link">
                    Login here
                </Link>
            </p>
        </section>
    );
}
