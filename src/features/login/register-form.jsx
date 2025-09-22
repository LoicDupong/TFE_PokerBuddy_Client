'use client';

import Link from "next/link.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faUserPlus, faUser } from "@fortawesome/free-solid-svg-icons";

import { useActionState, useId } from "react";
import { registerAction } from "@/actions/register.action.js";
import { redirect } from "next/navigation";
import { getFieldError } from "@/utils/getFieldError.utils.js";

import useAuthStore from "@/stores/useAuthStore";

export default function RegisterForm() {
    const inputId = useId();

    const setAuth = useAuthStore((state) => state.setAuth);

    const initialState = { success: false, message: '', data: null };
    const [state, handleRegister, isPending] = useActionState(registerAction, initialState);

    // Redirection si succès
    if (state?.success) {
        const { user, token } = state.data; 
        setAuth(user, token)
        redirect("/profile");
    }

    return (
        <section className="auth auth--register">
            <h1 className="title title--auth">
                Create <br /><span className="red">new account</span>
            </h1>

            <form action={handleRegister} className="form form--auth" id="register-form">
                <div className="form__row">
                    <label htmlFor={inputId + "username"}>
                        <FontAwesomeIcon icon={faUser} /> Username
                    </label>
                    <input
                        type="text"
                        id={inputId + "username"}
                        name="username"
                        placeholder="Choose a username"
                        defaultValue={state?.data?.username || ""}
                        required
                    />
                    {getFieldError(state?.errorMessage, "username") && (
                        <p className="form__error">{getFieldError(state?.errorMessage, "username")}</p>
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
                        defaultValue={state?.data?.email || ""}
                        required
                    />
                    {getFieldError(state?.errorMessage, "email") && (
                        <p className="form__error">{getFieldError(state?.errorMessage, "email")}</p>
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
                    {getFieldError(state?.errorMessage, "password") && (
                        <p className="form__error">{getFieldError(state?.errorMessage, "password")}</p>
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
                    {getFieldError(state?.errorMessage, "confirmPassword") && (
                        <p className="form__error">{getFieldError(state?.errorMessage, "confirmPassword")}</p>
                    )}
                </div>

                <button type="submit" className="btn btn--full btn--auth" disabled={isPending}>
                    <FontAwesomeIcon icon={faUserPlus} /> {isPending ? "Registering…" : "Register"}
                </button>
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
