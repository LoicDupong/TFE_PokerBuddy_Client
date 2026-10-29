"use client";

import "./account-settings.scss";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
    faCalendarXmark,
    faEye,
    faEyeSlash,
    faKey,
    faRightFromBracket,
    faTrashCan,
    faTriangleExclamation,
    faTrophy,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import userService from "@/services/user.service.js";
import useAuthStore from "@/stores/useAuthStore.js";
import useToastStore from "@/stores/useToastStore.js";
import { getPasswordError } from "@/schemas/authSchema.js";

function PasswordField({ id, label, value, onChange, autoComplete, error, inputRef }) {
    const [visible, setVisible] = useState(false);
    return (
        <div className="form__row">
            <label htmlFor={id}>{label}</label>
            <div className="input__container">
                <input
                    ref={inputRef}
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

// Ce que la suppression efface et ce qui reste (politique serveur : utils/account.utils.js)
const DELETE_CONSEQUENCES = [
    { icon: faTrashCan, title: "Erased", text: "Your email, username, avatar, bio, friends list and notifications." },
    { icon: faCalendarXmark, title: "Cancelled", text: "Games you host that haven't been played yet. Invited players are told." },
    { icon: faRightFromBracket, title: "Left", text: "Upcoming games you were invited to." },
    { icon: faTrophy, title: "Kept, without your name", text: "Results of games already played, so your friends' stats and leaderboard stay right. You show up as a deleted player." },
];

// Message affiché pour un échec de suppression (le mauvais mot de passe va sous le champ)
function deleteErrorMessage(res) {
    if (res.code === "LAST_ADMIN") {
        return "You're the last admin. Give the admin role to someone else before deleting your account.";
    }
    return res.error;
}

export default function AccountSettings() {
    const router = useRouter();
    const showToast = useToastStore((s) => s.showToast);
    const logout = useAuthStore((s) => s.logout);
    const updateToken = useAuthStore((s) => s.updateToken);

    const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const dialogRef = useRef(null);
    const deletePasswordRef = useRef(null);
    const [deletePassword, setDeletePassword] = useState("");
    const [deleteError, setDeleteError] = useState(null);
    const [deleteFormError, setDeleteFormError] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const setField = (field) => (e) => setPwd((p) => ({ ...p, [field]: e.target.value }));

    const handlePassword = async (e) => {
        e.preventDefault();
        const next = {};
        if (!pwd.current) next.current = "Current password is required";
        const rule = getPasswordError(pwd.next);
        if (rule) next.next = rule;
        if (pwd.confirm !== pwd.next) next.confirm = "Passwords do not match";
        setErrors(next);
        if (Object.keys(next).length) return;

        setSaving(true);
        const res = await userService.updatePassword(pwd.current, pwd.next);
        setSaving(false);
        if (res.success) {
            // Les autres appareils sont déconnectés ; celui-ci garde la session avec le nouveau token
            if (res.data?.token) updateToken(res.data.token);
            setPwd({ current: "", next: "", confirm: "" });
            showToast("Password updated. Your other devices have been logged out.", "success", 6000);
        } else if (/old password/i.test(res.error)) {
            // Le serveur répond "Old password invalid" : message plus clair, rattaché au bon champ
            setErrors({ current: "Current password is incorrect" });
        } else {
            showToast(res.error);
        }
    };

    const openDeleteDialog = () => {
        setDeletePassword("");
        setDeleteError(null);
        setDeleteFormError(null);
        dialogRef.current?.showModal();
        deletePasswordRef.current?.focus();
    };

    const closeDeleteDialog = () => {
        if (!deleting) dialogRef.current?.close();
    };

    const handleDelete = async (e) => {
        e.preventDefault();
        if (deleting) return;
        if (!deletePassword) {
            setDeleteError("Enter your password to confirm");
            deletePasswordRef.current?.focus();
            return;
        }

        setDeleteError(null);
        setDeleteFormError(null);
        setDeleting(true);
        const res = await userService.deleteMe(deletePassword);

        if (res.success) {
            dialogRef.current?.close();
            logout();
            router.replace("/");
            showToast("Your account has been deleted. Thanks for all the games!", "info", 6000);
            return;
        }

        setDeleting(false);
        if (res.code === "INVALID_PASSWORD") {
            setDeleteError("Incorrect password");
            deletePasswordRef.current?.focus();
        } else {
            setDeleteFormError(deleteErrorMessage(res));
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
                    <p className="account__hint">Your other devices will be logged out.</p>
                    <button type="submit" className="btn btn--user" disabled={saving}>
                        {saving ? "Saving…" : "Update password"}
                    </button>
                </form>
            </div>

            <div className="card account__card account__danger">
                <h3 className="account__subtitle"><FontAwesomeIcon icon={faTriangleExclamation} /> Delete account</h3>
                <p>
                    Erases your profile and friends list and cancels the games you host that haven&apos;t been
                    played yet. Results of games already played stay, without your name.
                </p>
                <button type="button" className="btn btn--danger" onClick={openDeleteDialog} aria-haspopup="dialog">
                    Delete my account
                </button>
            </div>

            {/* <dialog> natif : focus piégé, Échap pour fermer, reste de la page inerte */}
            <dialog
                ref={dialogRef}
                className="delete-dialog"
                aria-labelledby="delete-dialog-title"
                aria-describedby="delete-dialog-desc"
                onCancel={(e) => { if (deleting) e.preventDefault(); }}
            >
                <form className="delete-dialog__form" onSubmit={handleDelete} noValidate>
                    <h2 id="delete-dialog-title" className="delete-dialog__title">
                        <FontAwesomeIcon icon={faTriangleExclamation} aria-hidden="true" /> Delete your account?
                    </h2>
                    <p id="delete-dialog-desc" className="delete-dialog__lead">
                        This can&apos;t be undone. Here&apos;s what happens:
                    </p>

                    <ul className="delete-dialog__list">
                        {DELETE_CONSEQUENCES.map(({ icon, title, text }) => (
                            <li key={title} className="delete-dialog__item">
                                <FontAwesomeIcon icon={icon} className="delete-dialog__icon" aria-hidden="true" />
                                <p><strong>{title}:</strong> {text}</p>
                            </li>
                        ))}
                    </ul>

                    <PasswordField
                        id="delete-password"
                        label="Your password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        autoComplete="current-password"
                        error={deleteError}
                        inputRef={deletePasswordRef}
                    />

                    {deleteFormError && <p className="form__error" role="alert">{deleteFormError}</p>}

                    <div className="delete-dialog__actions">
                        <button type="button" className="btn btn--secondary" onClick={closeDeleteDialog} disabled={deleting}>
                            Keep my account
                        </button>
                        <button type="submit" className="btn btn--danger" disabled={deleting}>
                            {deleting ? "Deleting…" : "Delete my account"}
                        </button>
                    </div>
                </form>
            </dialog>
        </section>
    );
}
