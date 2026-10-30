"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import adminService from "@/services/admin.service.js";
import useAuthStore from "@/stores/useAuthStore.js";
import useToastStore from "@/stores/useToastStore.js";
import { Badge, ConfirmDialog, LoadError } from "@/components/admin/admin-ui.jsx";
import { ADMIN_TEXT, accountTone, formatDate, formatDateTime } from "@/components/admin/admin.utils.js";
import { displayPlayerName } from "@/utils/game.utils.js";

const USER_TEXT = {
    back: "Users",
    notFound: "This user does not exist.",
    loadError: "Could not load this user.",
    facts: {
        email: "Email",
        joined: "Joined",
        role: "Role",
        gamesHosted: "Games hosted",
        gamesPlayed: "Games played",
        friends: "Friends",
        disabledAt: "Disabled on",
        disabledReason: "Reason",
        deletedAt: "Deleted on",
    },
    actionsTitle: "Actions",
    self: "This is your own account: you cannot disable or delete it.",
    deletedNote: "This account has been deleted. No action is available.",
    makeAdmin: "Make admin",
    removeAdmin: "Remove admin role",
    disable: "Disable account",
    enable: "Re-enable account",
    revoke: "Revoke sessions",
    remove: "Delete account",
    dialogs: {
        makeAdmin: (name) => `Give ${name} administrator rights? They will be able to manage all accounts and games.`,
        removeAdmin: (name) => `Remove administrator rights from ${name}? They will be signed out everywhere.`,
        removeAdminSelf: "You are about to remove your own administrator rights. You will lose access to this section and be signed out.",
        disable: (name) => `Disable the account of ${name}? They will be signed out everywhere and will not be able to log in until you re-enable it.`,
        enable: (name) => `Re-enable the account of ${name}? Their previous sessions stay invalid: they will need to log in again.`,
        revoke: (name) => `Sign ${name} out of every device? They will need to log in again.`,
        revokeSelf: "Sign yourself out of every other device? This device stays signed in.",
        remove: (name) => `Permanently delete the account of ${name}? Their unfinished games are cancelled, their friendships and notifications are removed, and finished games keep a "Deleted player" entry. This cannot be undone.`,
    },
    confirmLabels: { role: "Change role", disable: "Disable", enable: "Re-enable", revoke: "Revoke sessions", remove: "Delete permanently" },
    toasts: {
        role: "Role updated.",
        disable: "Account disabled.",
        enable: "Account re-enabled.",
        revoke: "Sessions revoked.",
        revokeSelf: "Your other devices were signed out.",
        remove: (games) => (games > 0 ? `Account deleted. ${games} unfinished game(s) cancelled.` : "Account deleted."),
        unchanged: "Nothing changed: the account was already in this state.",
    },
};

export default function AdminUserPage() {
    const { id } = useParams();
    const me = useAuthStore((state) => state.user);
    const showToast = useToastStore((state) => state.showToast);
    const [user, setUser] = useState(null);
    const [state, setState] = useState("loading");
    const [dialog, setDialog] = useState(null); // { kind, payload }
    const [pending, setPending] = useState(false);
    const [attempt, setAttempt] = useState(0);

    const load = useCallback(async () => {
        const res = await adminService.getUser(id);
        if (res.success) { setUser(res.data); setState("ready"); }
        else setState(res.notFound ? "notFound" : "error");
    }, [id]);

    useEffect(() => {
        load();
    }, [load, attempt]);

    if (state === "loading") return <p>{ADMIN_TEXT.loading}</p>;
    if (state === "notFound") {
        return (
            <section className="admin__section">
                <p className="admin__hint">{USER_TEXT.notFound}</p>
                <Link href="/admin/users" className="admin__back">← {USER_TEXT.back}</Link>
            </section>
        );
    }
    if (state === "error") return <LoadError message={USER_TEXT.loadError} onRetry={() => { setState("loading"); setAttempt((n) => n + 1); }} />;

    const name = displayPlayerName(user.username);
    const isSelf = me?.id === user.id;
    const isDeleted = user.status === "deleted";
    const isAdmin = user.role === "admin";

    async function run(reason) {
        const { kind } = dialog;
        const payload = kind === "disable" ? reason || undefined : dialog.payload;
        setPending(true);
        let res;
        if (kind === "role") res = await adminService.setRole(user.id, payload);
        else if (kind === "disable") res = await adminService.disableUser(user.id, payload);
        else if (kind === "enable") res = await adminService.enableUser(user.id);
        else if (kind === "revoke") res = await adminService.revokeSessions(user.id);
        else res = await adminService.deleteUser(user.id);
        setPending(false);
        setDialog(null);

        if (!res.success) {
            showToast(res.forbidden ? ADMIN_TEXT.forbidden : res.error, "error");
            return;
        }
        if (res.data.changed === false) showToast(USER_TEXT.toasts.unchanged, "info");
        else if (kind === "remove") showToast(USER_TEXT.toasts.remove(res.data.cancelledGames ?? 0), "success");
        else if (kind === "revoke" && isSelf) showToast(USER_TEXT.toasts.revokeSelf, "success");
        else showToast(USER_TEXT.toasts[kind], "success");

        // Révocation de ses propres sessions : le serveur renvoie le jeton de cette session
        if (kind === "revoke" && res.data.token) useAuthStore.getState().updateToken(res.data.token);
        // Se rétrograder soi-même coupe la session : on déconnecte tout de suite plutôt que d'attendre un 401
        if (kind === "role" && isSelf && payload === "user") { useAuthStore.getState().logout(); return; }
        await load();
    }

    const dialogContent = {
        role: dialog?.payload === "admin"
            ? { title: USER_TEXT.makeAdmin, body: USER_TEXT.dialogs.makeAdmin(name), label: USER_TEXT.confirmLabels.role }
            : { title: USER_TEXT.removeAdmin, body: isSelf ? USER_TEXT.dialogs.removeAdminSelf : USER_TEXT.dialogs.removeAdmin(name), label: USER_TEXT.confirmLabels.role, danger: true },
        disable: { title: USER_TEXT.disable, body: USER_TEXT.dialogs.disable(name), label: USER_TEXT.confirmLabels.disable, danger: true, withReason: true },
        enable: { title: USER_TEXT.enable, body: USER_TEXT.dialogs.enable(name), label: USER_TEXT.confirmLabels.enable },
        revoke: { title: USER_TEXT.revoke, body: isSelf ? USER_TEXT.dialogs.revokeSelf : USER_TEXT.dialogs.revoke(name), label: USER_TEXT.confirmLabels.revoke },
        remove: { title: USER_TEXT.remove, body: USER_TEXT.dialogs.remove(name), label: USER_TEXT.confirmLabels.remove, danger: true, requireText: user.username },
    }[dialog?.kind];

    return (
        <section className="admin__section">
            <Link href="/admin/users" className="admin__back">← {USER_TEXT.back}</Link>
            <h2>{name}</h2>
            <p>
                {isAdmin && <Badge tone="info">{ADMIN_TEXT.roles.admin}</Badge>}{" "}
                <Badge tone={accountTone[user.status]}>{ADMIN_TEXT.accountStatuses[user.status]}</Badge>
            </p>

            <div className="admin__card">
                <dl className="admin__facts">
                    {!isDeleted && <><dt>{USER_TEXT.facts.email}</dt><dd>{user.email}</dd></>}
                    <dt>{USER_TEXT.facts.joined}</dt><dd>{formatDate(user.createdAt)}</dd>
                    <dt>{USER_TEXT.facts.role}</dt><dd>{ADMIN_TEXT.roles[user.role]}</dd>
                    <dt>{USER_TEXT.facts.gamesHosted}</dt><dd>{user.counts?.gamesHosted ?? 0}</dd>
                    <dt>{USER_TEXT.facts.gamesPlayed}</dt><dd>{user.counts?.gamesPlayed ?? 0}</dd>
                    <dt>{USER_TEXT.facts.friends}</dt><dd>{user.counts?.friends ?? 0}</dd>
                    {user.disabledAt && <><dt>{USER_TEXT.facts.disabledAt}</dt><dd>{formatDateTime(user.disabledAt)}</dd></>}
                    {user.disabledReason && <><dt>{USER_TEXT.facts.disabledReason}</dt><dd>{user.disabledReason}</dd></>}
                    {user.deletedAt && <><dt>{USER_TEXT.facts.deletedAt}</dt><dd>{formatDateTime(user.deletedAt)}</dd></>}
                </dl>
            </div>

            <h3>{USER_TEXT.actionsTitle}</h3>
            {isDeleted && <p className="admin__hint">{USER_TEXT.deletedNote}</p>}
            {isSelf && !isDeleted && <p className="admin__hint">{USER_TEXT.self}</p>}
            {!isDeleted && (
                <div className="admin__actions">
                    {isAdmin
                        ? <button type="button" className="btn admin__btn" onClick={() => setDialog({ kind: "role", payload: "user" })}>{USER_TEXT.removeAdmin}</button>
                        : <button type="button" className="btn admin__btn" onClick={() => setDialog({ kind: "role", payload: "admin" })}>{USER_TEXT.makeAdmin}</button>}
                    <button type="button" className="btn admin__btn" onClick={() => setDialog({ kind: "revoke" })}>{USER_TEXT.revoke}</button>
                    {!isSelf && (user.status === "disabled"
                        ? <button type="button" className="btn admin__btn" onClick={() => setDialog({ kind: "enable" })}>{USER_TEXT.enable}</button>
                        : <button type="button" className="btn admin__btn admin__btn--danger" onClick={() => setDialog({ kind: "disable" })}>{USER_TEXT.disable}</button>)}
                    {!isSelf && <button type="button" className="btn admin__btn admin__btn--danger" onClick={() => setDialog({ kind: "remove" })}>{USER_TEXT.remove}</button>}
                </div>
            )}

            {dialog && (
                <ConfirmDialog
                    title={dialogContent.title}
                    confirmLabel={dialogContent.label}
                    danger={dialogContent.danger}
                    withReason={dialogContent.withReason}
                    requireText={dialogContent.requireText ?? null}
                    pending={pending}
                    onCancel={() => setDialog(null)}
                    onConfirm={run}
                >
                    <p>{dialogContent.body}</p>
                </ConfirmDialog>
            )}
        </section>
    );
}
