"use client";

import { Fragment } from "react";
import Link from "next/link.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faUser } from "@fortawesome/free-solid-svg-icons";
import { serverUrl } from "@/utils/media.js";
import "./friend-card.scss";

// Pseudos collés (CamelCase, chiffres) : on autorise le retour à la ligne entre les "mots"
// plutôt qu'au milieu d'un mot ("BluffMaster|Supreme" et non "BluffMasterSu|preme").
function breakableName(name = "") {
    const parts = name.split(/(?<=[a-z])(?=[A-Z0-9])|(?<=[0-9])(?=[A-Za-z])/);
    return parts.map((part, i) => (
        <Fragment key={i}>
            {i > 0 && <wbr />}
            {part}
        </Fragment>
    ));
}

function FriendCardBody({ user, status, selected }) {
    return (
        <>
            {/* Avatar décoratif : le pseudo est écrit juste à côté (pas de double annonce) */}
            <span className="friend-card__avatar">
                {user.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element -- avatar distant (Cloudinary ou API), taille fixe
                    <img src={serverUrl(user.avatar)} alt="" loading="lazy" />
                ) : (
                    <FontAwesomeIcon icon={faUser} />
                )}
            </span>
            <span className="friend-card__text">
                {/* title : nom complet au survol quand il est tronqué (le texte complet reste lu par les lecteurs d'écran) */}
                <span className="friend-card__name" title={user.username}>
                    {breakableName(user.username)}
                </span>
                {status && <span className="friend-card__status">{status}</span>}
            </span>
            {selected && (
                <span className="friend-card__check" aria-hidden="true">
                    <FontAwesomeIcon icon={faCheck} />
                </span>
            )}
        </>
    );
}

/**
 * Carte d'ami partagée (profil, demandes d'amis, recherche, invitation à une partie).
 *
 * - layout "tile" : vignette verticale pour les grilles d'amis ; "row" : ligne avec actions à droite.
 * - href : toute la carte est un lien (profil).
 * - onToggle : toute la carte est un bouton à bascule (aria-pressed = selected).
 * - actions : boutons placés à côté de l'identité (jamais imbriqués dans un lien ou un bouton).
 *
 * À placer dans un <li> d'une liste `.friend-grid` pour bénéficier de la grille homogène.
 */
export default function FriendCard({
    user,
    layout = "tile",
    href,
    onToggle,
    selected = false,
    disabled = false,
    status,
    actions,
}) {
    const className = [
        "friend-card",
        `friend-card--${layout}`,
        (href || onToggle) && "friend-card--interactive",
        selected && "friend-card--selected",
        disabled && "friend-card--disabled",
    ]
        .filter(Boolean)
        .join(" ");

    const body = <FriendCardBody user={user} status={status} selected={selected} />;

    if (href) {
        return (
            <Link href={href} className={className}>
                {body}
            </Link>
        );
    }

    if (onToggle) {
        return (
            <button
                type="button"
                className={className}
                aria-pressed={selected}
                disabled={disabled}
                onClick={() => onToggle(user)}
            >
                {body}
            </button>
        );
    }

    return (
        <div className={className}>
            {body}
            {actions && <div className="friend-card__actions">{actions}</div>}
        </div>
    );
}
