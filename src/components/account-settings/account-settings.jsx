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
import { useT } from "@/i18n/i18n-provider.jsx";
import LanguageSwitcher from "@/i18n/language-switcher.jsx";
import { useServerError } from "@/utils/server-errors.utils.js";

const MESSAGES = {
    en: {
        account: "Account", language: "Language", languageHint: "Used for the app and for the emails we send you.",
        changePassword: "Change password", current: "Current password", newPwd: "New password", confirm: "Confirm new password",
        logoutHint: "Your other devices will be logged out.", saving: "Saving…", update: "Update password",
        show: "Show {label}", hide: "Hide {label}",
        deleteTitle: "Delete account",
        deleteLead: "Erases your profile and friends list and cancels the games you host that haven't been played yet. Results of games already played stay, without your name.",
        deleteBtn: "Delete my account", deleteDialog: "Delete your account?",
        cantUndo: "This can't be undone. Here's what happens:",
        erased: "Erased", erasedText: "Your email, username, avatar, bio, friends list and notifications.",
        cancelled: "Cancelled", cancelledText: "Games you host that haven't been played yet. Invited players are told.",
        left: "Left", leftText: "Upcoming games you were invited to.",
        kept: "Kept, without your name", keptText: "Results of games already played, so your friends' stats and leaderboard stay right. You show up as a deleted player.",
        yourPassword: "Your password", keep: "Keep my account", deleting: "Deleting…",
        lastAdmin: "You're the last admin. Give the admin role to someone else before deleting your account.",
        currentRequired: "Current password is required", mismatch: "Passwords do not match",
        updated: "Password updated. Your other devices have been logged out.",
        currentWrong: "Current password is incorrect", enterPwd: "Enter your password to confirm", incorrect: "Incorrect password",
        deleted: "Your account has been deleted. Thanks for all the games!",
    },
    fr: {
        account: "Compte", language: "Langue", languageHint: "Utilisée pour l'application et pour les emails que nous t'envoyons.",
        changePassword: "Changer de mot de passe", current: "Mot de passe actuel", newPwd: "Nouveau mot de passe", confirm: "Confirmer le nouveau mot de passe",
        logoutHint: "Tes autres appareils seront déconnectés.", saving: "Enregistrement…", update: "Mettre à jour le mot de passe",
        show: "Afficher : {label}", hide: "Masquer : {label}",
        deleteTitle: "Supprimer le compte",
        deleteLead: "Efface ton profil et ta liste d'amis, et annule les parties que tu organises qui n'ont pas encore eu lieu. Les résultats des parties déjà jouées restent, sans ton nom.",
        deleteBtn: "Supprimer mon compte", deleteDialog: "Supprimer ton compte ?",
        cantUndo: "C'est définitif. Voici ce qui se passe :",
        erased: "Effacé", erasedText: "Ton email, ton pseudo, ton avatar, ta bio, ta liste d'amis et tes notifications.",
        cancelled: "Annulées", cancelledText: "Les parties que tu organises et qui n'ont pas encore eu lieu. Les joueurs invités sont prévenus.",
        left: "Quittées", leftText: "Les parties à venir auxquelles tu étais invité.",
        kept: "Conservés, sans ton nom", keptText: "Les résultats des parties déjà jouées, pour que les stats et le classement de tes amis restent justes. Tu apparais comme joueur supprimé.",
        yourPassword: "Ton mot de passe", keep: "Garder mon compte", deleting: "Suppression…",
        lastAdmin: "Tu es le dernier admin. Donne le rôle d'admin à quelqu'un d'autre avant de supprimer ton compte.",
        currentRequired: "Le mot de passe actuel est obligatoire", mismatch: "Les mots de passe ne correspondent pas",
        updated: "Mot de passe mis à jour. Tes autres appareils ont été déconnectés.",
        currentWrong: "Le mot de passe actuel est incorrect", enterPwd: "Saisis ton mot de passe pour confirmer", incorrect: "Mot de passe incorrect",
        deleted: "Ton compte a été supprimé. Merci pour toutes ces parties !",
    },
};

function PasswordField({ id, label, value, onChange, autoComplete, error, inputRef }) {
    const { t } = useT(MESSAGES);
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
                    aria-label={t(visible ? "hide" : "show", { label: label.toLowerCase() })}
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
    { icon: faTrashCan, key: "erased" },
    { icon: faCalendarXmark, key: "cancelled" },
    { icon: faRightFromBracket, key: "left" },
    { icon: faTrophy, key: "kept" },
];

export default function AccountSettings() {
    const { t, locale } = useT(MESSAGES);
    const serverError = useServerError();
    const user = useAuthStore((s) => s.user);
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
        if (!pwd.current) next.current = t("currentRequired");
        const rule = getPasswordError(pwd.next, locale);
        if (rule) next.next = rule;
        if (pwd.confirm !== pwd.next) next.confirm = t("mismatch");
        setErrors(next);
        if (Object.keys(next).length) return;

        setSaving(true);
        const res = await userService.updatePassword(pwd.current, pwd.next);
        setSaving(false);
        if (res.success) {
            // Les autres appareils sont déconnectés ; celui-ci garde la session avec le nouveau token
            if (res.data?.token) updateToken(res.data.token);
            setPwd({ current: "", next: "", confirm: "" });
            showToast(t("updated"), "success", 6000);
        } else if (/old password/i.test(res.error)) {
            // Le serveur répond "Old password invalid" : message plus clair, rattaché au bon champ
            setErrors({ current: t("currentWrong") });
        } else {
            showToast(serverError(res.error));
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
            setDeleteError(t("enterPwd"));
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
            showToast(t("deleted"), "info", 6000);
            return;
        }

        setDeleting(false);
        if (res.code === "INVALID_PASSWORD") {
            setDeleteError(t("incorrect"));
            deletePasswordRef.current?.focus();
        } else {
            setDeleteFormError(res.code === "LAST_ADMIN" ? t("lastAdmin") : serverError(res.error));
        }
    };

    return (
        <section className="section section__account" aria-labelledby="account-title">
            <h2 id="account-title">{t("account")}</h2>
            <div className="card account__card">
                <h3 className="account__subtitle">{t("language")}</h3>
                <p className="account__hint">{t("languageHint")}</p>
                <LanguageSwitcher onChange={(code) => { if (user) userService.updateLocale(code); }} />
            </div>

            <div className="card account__card">
                <form className="form" onSubmit={handlePassword} noValidate>
                    <h3 className="account__subtitle"><FontAwesomeIcon icon={faKey} /> {t("changePassword")}</h3>
                    <PasswordField id="pwd-current" label={t("current")} value={pwd.current}
                        onChange={setField("current")} autoComplete="current-password" error={errors.current} />
                    <PasswordField id="pwd-new" label={t("newPwd")} value={pwd.next}
                        onChange={setField("next")} autoComplete="new-password" error={errors.next} />
                    <PasswordField id="pwd-confirm" label={t("confirm")} value={pwd.confirm}
                        onChange={setField("confirm")} autoComplete="new-password" error={errors.confirm} />
                    <p className="account__hint">{t("logoutHint")}</p>
                    <button type="submit" className="btn btn--user" disabled={saving}>
                        {saving ? t("saving") : t("update")}
                    </button>
                </form>
            </div>

            <div className="card account__card account__danger">
                <h3 className="account__subtitle"><FontAwesomeIcon icon={faTriangleExclamation} /> {t("deleteTitle")}</h3>
                <p>{t("deleteLead")}</p>
                <button type="button" className="btn btn--danger" onClick={openDeleteDialog} aria-haspopup="dialog">
                    {t("deleteBtn")}
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
                        <FontAwesomeIcon icon={faTriangleExclamation} aria-hidden="true" /> {t("deleteDialog")}
                    </h2>
                    <p id="delete-dialog-desc" className="delete-dialog__lead">
                        {t("cantUndo")}
                    </p>

                    <ul className="delete-dialog__list">
                        {DELETE_CONSEQUENCES.map(({ icon, key }) => (
                            <li key={key} className="delete-dialog__item">
                                <FontAwesomeIcon icon={icon} className="delete-dialog__icon" aria-hidden="true" />
                                <p><strong>{t(key)}{locale === "fr" ? " " : ""}:</strong> {t(`${key}Text`)}</p>
                            </li>
                        ))}
                    </ul>

                    <PasswordField
                        id="delete-password"
                        label={t("yourPassword")}
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        autoComplete="current-password"
                        error={deleteError}
                        inputRef={deletePasswordRef}
                    />

                    {deleteFormError && <p className="form__error" role="alert">{deleteFormError}</p>}

                    <div className="delete-dialog__actions">
                        <button type="button" className="btn btn--secondary" onClick={closeDeleteDialog} disabled={deleting}>
                            {t("keep")}
                        </button>
                        <button type="submit" className="btn btn--danger" disabled={deleting}>
                            {deleting ? t("deleting") : t("deleteBtn")}
                        </button>
                    </div>
                </form>
            </dialog>
        </section>
    );
}
