"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useAdminText } from "./admin.utils.js";

// Pastille d'état : texte + couleur (jamais la couleur seule). tone : ok | warn | bad | info | muted
export function Badge({ tone = "muted", children }) {
    return <span className={`admin__badge admin__badge--${tone}`}>{children}</span>;
}

export function Pagination({ page, pageSize, total, onPage }) {
    const ADMIN_TEXT = useAdminText();
    const pages = Math.max(1, Math.ceil(total / pageSize));
    return (
        <nav className="admin__pager" aria-label={ADMIN_TEXT.pagination}>
            <button type="button" className="btn btn--small admin__btn" disabled={page <= 1} onClick={() => onPage(page - 1)}>
                {ADMIN_TEXT.previous}
            </button>
            <span className="admin__pager-info" aria-live="polite">{ADMIN_TEXT.pageOf(page, pages)}</span>
            <button type="button" className="btn btn--small admin__btn" disabled={page >= pages} onClick={() => onPage(page + 1)}>
                {ADMIN_TEXT.next}
            </button>
        </nav>
    );
}

// Bloc d'erreur de chargement avec bouton de nouvel essai
export function LoadError({ message, onRetry }) {
    const ADMIN_TEXT = useAdminText();
    return (
        <div className="admin__notice" role="alert">
            <p>{message}</p>
            {onRetry && <button type="button" className="btn btn--small admin__btn" onClick={onRetry}>{ADMIN_TEXT.retry}</button>}
        </div>
    );
}

// Confirmation explicite d'une action sensible, raison facultative. Échap = annuler.
export function ConfirmDialog({ title, children, confirmLabel, danger = false, withReason = false, requireText = null, pending = false, onConfirm, onCancel }) {
    const ADMIN_TEXT = useAdminText();
    const [reason, setReason] = useState("");
    const [typed, setTyped] = useState("");
    const typedId = useId();
    const reasonId = useId();
    const cancelRef = useRef(null);

    useEffect(() => {
        cancelRef.current?.focus();
        const onKey = (e) => { if (e.key === "Escape" && !pending) onCancel(); };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [onCancel, pending]);

    return (
        <div className="modal">
            <div className="modal__overlay" onClick={pending ? undefined : onCancel}></div>
            <div className="modal__content admin__dialog" role="dialog" aria-modal="true" aria-label={title}>
                <h2>{title}</h2>
                <div className="admin__dialog-body">{children}</div>
                {requireText && (
                    <div className="form__row">
                        <label htmlFor={typedId}>{ADMIN_TEXT.typeToConfirm(requireText)}</label>
                        <input id={typedId} type="text" value={typed} autoComplete="off" onChange={(e) => setTyped(e.target.value)} />
                    </div>
                )}
                {withReason && (
                    <div className="form__row">
                        <label htmlFor={reasonId}>{ADMIN_TEXT.reasonLabel}</label>
                        <textarea id={reasonId} rows={3} value={reason} maxLength={ADMIN_TEXT.reasonMax} onChange={(e) => setReason(e.target.value)} />
                    </div>
                )}
                <div className="btn__group admin__dialog-actions">
                    <button type="button" className={`btn admin__btn${danger ? " admin__btn--danger" : " admin__btn--primary"}`} disabled={pending || (requireText !== null && typed.trim() !== requireText)} onClick={() => onConfirm(reason.trim())}>
                        {confirmLabel ?? ADMIN_TEXT.confirm}
                    </button>
                    <button type="button" ref={cancelRef} className="btn admin__btn" disabled={pending} onClick={onCancel}>
                        {ADMIN_TEXT.cancel}
                    </button>
                </div>
            </div>
        </div>
    );
}
