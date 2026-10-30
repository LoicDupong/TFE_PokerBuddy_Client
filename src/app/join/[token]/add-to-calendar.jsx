"use client";

import { useEffect, useId, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarPlus, faChevronDown, faFileArrowDown } from "@fortawesome/free-solid-svg-icons";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import joinService from "@/services/join.service";
import { currencySymbol } from "@/utils/game.utils.js";
import { googleCalendarUrl, inviteEventDetails } from "@/utils/calendar.utils.js";
import { useT } from "@/i18n/i18n-provider.jsx";

const MESSAGES = {
    en: { add: "Add to calendar", newTab: " (opens in a new tab)", hint: ".ics file, works with most calendar apps" },
    fr: { add: "Ajouter au calendrier", newTab: " (s'ouvre dans un nouvel onglet)", hint: "fichier .ics, compatible avec la plupart des agendas" },
};

// Bouton « Add to calendar » de la page d'invitation : un petit panneau dépliable (disclosure)
// avec Google Calendar (lien construit ici) et un .ics servi par l'API (Apple, Outlook…)
export default function AddToCalendar({ token, info }) {
    const { t, locale } = useT(MESSAGES);
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);
    const toggleRef = useRef(null);
    const panelId = useId();

    // Fermeture au clic en dehors et avec Échap (le focus revient sur le bouton)
    useEffect(() => {
        if (!open) return;
        const onPointerDown = (e) => {
            if (!rootRef.current?.contains(e.target)) setOpen(false);
        };
        const onKeyDown = (e) => {
            if (e.key !== "Escape") return;
            setOpen(false);
            toggleRef.current?.focus();
        };
        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    // Rendu uniquement côté client (la page attend les infos de l'API) : window est disponible
    const inviteUrl = typeof window !== "undefined" ? `${window.location.origin}/join/${token}` : null;
    const googleUrl = googleCalendarUrl({
        title: info.name,
        start: info.dateStart,
        location: info.location,
        details: inviteEventDetails({
            host: info.host,
            buyIn: info.buyIn,
            currencyLabel: currencySymbol(info.currency),
            inviteUrl,
        }, locale),
    });

    return (
        <div className="calendar-add" ref={rootRef}>
            <button
                ref={toggleRef}
                type="button"
                className="calendar-add__toggle"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpen((value) => !value)}
            >
                <FontAwesomeIcon icon={faCalendarPlus} aria-hidden="true" />
                <span>{t("add")}</span>
                <FontAwesomeIcon icon={faChevronDown} className="calendar-add__chevron" aria-hidden="true" />
            </button>

            <ul id={panelId} className="calendar-add__options" hidden={!open}>
                <li>
                    <a
                        href={googleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="calendar-add__option"
                        onClick={() => setOpen(false)}
                    >
                        <FontAwesomeIcon icon={faGoogle} aria-hidden="true" className="calendar-add__icon" />
                        <span className="calendar-add__label">
                            Google Calendar
                            <span className="sr-only">{t("newTab")}</span>
                        </span>
                    </a>
                </li>
                <li>
                    <a
                        href={joinService.icsUrl(token)}
                        className="calendar-add__option"
                        onClick={() => setOpen(false)}
                    >
                        <FontAwesomeIcon icon={faFileArrowDown} aria-hidden="true" className="calendar-add__icon" />
                        <span className="calendar-add__label">
                            Apple / Outlook
                            <small className="calendar-add__hint">.ics file, works with most calendar apps</small>
                        </span>
                    </a>
                </li>
            </ul>
        </div>
    );
}
