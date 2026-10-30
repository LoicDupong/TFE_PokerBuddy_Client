"use client";

import { useT } from "@/i18n/i18n-provider.jsx";

const MESSAGES = {
    en: { title: "Friend", red: "Invites", loading: "Loading invites..." },
    fr: { title: "Demandes", red: "d'amis", loading: "Chargement des demandes..." },
};

export default function FriendInvitesSkeleton() {
    const { t } = useT(MESSAGES);
    return (
        <section className="section section__invites">
            <h2>
                {t("title")} <span className="red">{t("red")}</span>
            </h2>
            <div className="cards cards--invites collapsed">
                <p>{t("loading")}</p>
            </div>
        </section>
    );
}
