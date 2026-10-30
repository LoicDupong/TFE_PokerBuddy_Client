"use client";

import { useT } from "@/i18n/i18n-provider.jsx";
import { COMMON } from "@/i18n/common.js";

// Chargement : bloc neutre, jamais un message "vide" (les états vides sont dans les displays)
export default function ActiveGameSkeleton() {
  const { t } = useT(COMMON);
  return <div className="skeleton" role="status" aria-busy="true" aria-label={t("loading")}></div>;
}
