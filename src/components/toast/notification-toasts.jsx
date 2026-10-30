"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";

import useAuthStore from "@/stores/useAuthStore";
import useNotificationStore, { useNotificationSync } from "@/stores/useNotificationStore";
import {
    NOTIFICATION_MESSAGES, getNotificationIcon, getNotificationLink, getNotificationText, getNotificationTitle,
} from "@/utils/notification.utils";
import { useT } from "@/i18n/i18n-provider.jsx";

const TOASTS_MESSAGES = { en: { list: "New notifications" }, fr: { list: "Nouvelles notifications" } };

// Toast voisin encore affiché (pour y reporter le focus après une fermeture au clavier)
function findNeighbour(item) {
    const siblings = [item?.nextElementSibling, item?.previousElementSibling];
    return siblings.find((el) => el && !el.classList.contains("notification-toast--leaving"));
}

function NotificationToast({ toast }) {
    const { id, notification, leaving } = toast;
    const { t } = useT(NOTIFICATION_MESSAGES);
    const title = getNotificationTitle(notification, t);
    const href = getNotificationLink(notification);

    // Survol à la souris ou focus clavier : le toast reste affiché
    const hold = useRef({ hover: false, focus: false });
    const setHold = (key, value) => {
        hold.current[key] = value;
        const { pauseToast, resumeToast } = useNotificationStore.getState();
        if (hold.current.hover || hold.current.focus) pauseToast(id);
        else resumeToast(id);
    };

    const dismiss = () => useNotificationStore.getState().dismissToast(id);

    const handleClose = (event) => {
        const neighbour = findNeighbour(event.currentTarget.closest(".notification-toast"));
        dismiss();
        // Fermeture au clavier (detail 0) : le focus passe au toast voisin au lieu de retomber en haut de page
        if (event.detail === 0) neighbour?.querySelector(".notification-toast__close")?.focus();
    };

    const content = (
        <>
            <span className="notification-toast__icon" aria-hidden="true">
                <FontAwesomeIcon icon={getNotificationIcon(notification)} />
            </span>
            <span className="notification-toast__text">
                <span className="notification-toast__title">{title}</span>
                <span className="notification-toast__message">{getNotificationText(notification, t)}</span>
            </span>
        </>
    );

    return (
        <li
            className={`notification-toast${leaving ? " notification-toast--leaving" : ""}`}
            onPointerEnter={(e) => { if (e.pointerType === "mouse") setHold("hover", true); }}
            onPointerLeave={(e) => { if (e.pointerType === "mouse") setHold("hover", false); }}
            onFocus={() => setHold("focus", true)}
            onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setHold("focus", false); }}
        >
            {href ? (
                <Link href={href} className="notification-toast__body notification-toast__body--link" onClick={dismiss}>
                    {content}
                </Link>
            ) : (
                <div className="notification-toast__body">{content}</div>
            )}
            <button
                type="button"
                className="notification-toast__close"
                onClick={handleClose}
                aria-label={t("dismiss", { title })}
            >
                <FontAwesomeIcon icon={faXmark} aria-hidden="true" />
            </button>
        </li>
    );
}

export default function NotificationToasts() {
    const userId = useAuthStore((state) => state.user?.id ?? null);
    const toasts = useNotificationStore((state) => state.toasts);
    const pathname = usePathname();
    const { t } = useT(TOASTS_MESSAGES);

    // Même boucle que la cloche (une seule pour toute l'app, voir useNotificationStore)
    useNotificationSync(userId);

    // Game Manager projeté pour toute la table : les notifications personnelles n'y sont pas affichées.
    // Elles restent dans la cloche ; un toast encore valide réapparaît en quittant le manager.
    const suspended = pathname === "/manager";
    const visible = userId && !suspended ? toasts : [];

    // La région live existe toujours (sinon le premier toast n'est pas annoncé) ; jamais de focus volé
    return (
        <div className="notification-toasts" aria-live="polite" aria-relevant="additions">
            {visible.length > 0 && (
                <ul className="notification-toasts__list" aria-label={t("list")}>
                    {visible.map((toast) => (
                        <NotificationToast key={toast.id} toast={toast} />
                    ))}
                </ul>
            )}
        </div>
    );
}
