"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { faEye, faEyeSlash, faKey, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import userService from "@/services/user.service.js";
import useAuthStore from "@/stores/useAuthStore.js";
import useToastStore from "@/stores/useToastStore.js";

// Mêmes règles que l'inscription (schemas/authSchema.js)
function validateNewPassword(value) {
    if (value.length < 6) return "Password must be at least 6 characters";
    if (!/[A-Z]/.test(value)) return "Password must contain at least one uppercase letter";
    if (!/[0-9]/.test(value)) return "Password must contain at least one number";
    return null;
}

function PasswordField({ id, label, value, onChange, autoComplete, error }) {
    const [visible, setVisible] = useState(false);
    return (
        <div className="form__row">
            <label htmlFor={id}>{label}</label>
            <div className="input__container">
                <input
                    type={visible ? "text" : "password"}
                    id={id}
                    value={value}
                    onChange={onChange}
                    autoComplete={autoComplete}
                    className="input--with-toggle"
                    aria-invalid={!!error}
                    aria-describedby={error ? `${id}-error` : undefined}
                />
                <button
                    type="button"
                    className="input__toggle"
                    onClick={() => setVisible((v) => !v)}
                    aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
                    aria-pressed={visible}
                >
                    <FontAwesomeIcon icon={visible ? faEyeSlash : faEye} aria-hidden="true" />
                </button>
            </div>
            {error && <p className="form__error" id={`${id}-error`} role="alert">{error}</p>}
        </div>
    );
}

export default function AccountSettings({ username }) {
    const router = useRouter();
    const showToast = useToastStore((s) => s.showToast);
    const logout = useAuthStore((s) => s.logout);

    const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const [confirming, setConfirming] = useState(false);
    const [typed, setTyped] = useState("");
    const [deleting, setDeleting] = useState(false);

    const setField = (field) => (e) => setPwd((p) => ({ ...p, [field]: e.target.value }));

    const handlePassword = async (e) => {
        e.preventDefault();
        const next = {};
        if (!pwd.current) next.current = "Current password is required";
        const rule = validateNewPassword(pwd.next);
        if (rule) next.next = rule;
        if (pwd.confirm !== pwd.next) next.confirm = "Passwords do not match";
        setErrors(next);
        if (Object.keys(next).length) return;

        setSaving(true);
        const res = await userService.updatePassword(pwd.current, pwd.next);
        setSaving(false);
        if (res.success) {
            setPwd({ current: "", next: "", confirm: "" });
            showToast("Password updated", "success", 5000);
        } else {
            // Le serveur répond "Old password invalid" : message plus clair, rattaché au bon champ
            const msg = res.errorMessage[0];
            if (/old password/i.test(msg)) setErrors({ current: "Current password is incorrect" });
            else showToast(msg);
        }
    };

    const handleDelete = async () => {
        if (typed !== username || deleting) return;
        setDeleting(true);
        const res = await userService.deleteMe();
        if (res.success) {
            logout();
            router.replace("/");
            showToast("Your account has been deleted", "info", 6000);
        } else {
            setDeleting(false);
            showToast(res.errorMessage?.[0] || "Could not delete the account");
        }
    };

    return (
        <section className="section section__account" aria-labelledby="account-title">
            <h2 id="account-title">Account</h2>

            <div className="card account__card">
                <form className="form" onSubmit={handlePassword} noValidate>
                    <h3 className="account__subtitle"><FontAwesomeIcon icon={faKey} /> Change password</h3>
                    <PasswordField id="pwd-current" label="Current password" value={pwd.current}
                        onChange={setField("current")} autoComplete="current-password" error={errors.current} />
                    <PasswordField id="pwd-new" label="New password" value={pwd.next}
                        onChange={setField("next")} autoComplete="new-password" error={errors.next} />
                    <PasswordField id="pwd-confirm" label="Confirm new password" value={pwd.confirm}
                        onChange={setField("confirm")} autoComplete="new-password" error={errors.confirm} />
                    <button type="submit" className="btn btn--user" disabled={saving}>
                        {saving ? "Saving…" : "Update password"}
                    </button>
                </form>
            </div>

            <div className="card account__card account__danger">
                <h3 className="account__subtitle"><FontAwesomeIcon icon={faTriangleExclamation} /> Delete account</h3>
                <p>
                    Your profile, avatar and bio are erased and you can no longer log in.
                    Results you played stay in your friends&apos; games.
                </p>
                {!confirming ? (
                    <button type="button" className="btn btn--danger" onClick={() => setConfirming(true)}>
                        Delete my account
                    </button>
                ) : (
                    <div className="account__confirm">
                        <label htmlFor="delete-confirm">
                            Type <strong>{username}</strong> to confirm. This cannot be undone.
                        </label>
                        <input
                            id="delete-confirm"
                            type="text"
                            value={typed}
                            onChange={(e) => setTyped(e.target.value)}
                            autoComplete="off"
                            autoCapitalize="off"
                            className="input"
                        />
                        <div className="btn__container">
                            <button type="button" className="btn btn--danger" disabled={typed !== username || deleting} onClick={handleDelete}>
                                {deleting ? "Deleting…" : "Permanently delete"}
                            </button>
                            <button type="button" className="btn btn--user" onClick={() => { setConfirming(false); setTyped(""); }}>
                                Keep my account
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
