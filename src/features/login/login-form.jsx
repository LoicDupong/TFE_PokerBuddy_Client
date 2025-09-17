'use client';

import Link from "next/link.js";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faSignInAlt } from "@fortawesome/free-solid-svg-icons";

import { useActionState, useId } from "react";
import { loginAction } from "@/actions/login.action.js";
import { redirect } from "next/navigation";
import { getFieldError } from "@/utils/getFieldError.utils.js";

export default function LoginForm() {
    const inputId = useId();

    const initialState = { success: false, message: '', data: null };
    const [state, handleLogin, isPending] = useActionState(loginAction, initialState)

    // Redirection si succès
    if (state?.success) {
        redirect("/");
    }

    return (
        <>
            <section className="auth auth--login">
                <h1 className="title title--auth">Login</h1>

                <form action={handleLogin} className="form form--auth" id="login-form">
                    <div className="form__row">
                        <label htmlFor={inputId + "email"}><FontAwesomeIcon icon={faEnvelope} /> Email</label>
                        <input type="email" id={inputId + "email"} name="email" placeholder="Enter your email" required defaultValue={state?.data?.email || ""}/>
                        {getFieldError(state?.errorMessage, "email") && (
                            <p className="form__error">{getFieldError(state?.errorMessage, "email")}</p>
                        )}
                    </div>

                    <div className="form__row">
                        <label htmlFor={inputId + "password"}><FontAwesomeIcon icon={faLock} /> Password</label>
                        <input type="password" id={inputId + "password"} name="password" placeholder="Enter your password" required />
                        {getFieldError(state?.errorMessage, "password") && (
                            <p className="form__error">{getFieldError(state?.errorMessage, "password")}</p>
                        )}
                    </div>

                    <button type="submit" className="btn btn--full btn--auth" disabled={isPending}><FontAwesomeIcon icon={faSignInAlt} /> Login</button>
                    {/* <div>
                        {state.errorMessage && (
                            <span>{state.errorMessage}</span>
                        )}
                    </div> */}
                </form>

                <p className="auth__redirect">
                    Don’t have an account? <Link href={'/auth/register'} className="link">Register here</Link>
                </p>
            </section>

        </>
    );
}