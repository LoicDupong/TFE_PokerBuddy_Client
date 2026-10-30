import { getT } from "@/i18n/server.js";

const MESSAGES = { en: { loading: "Loading..." }, fr: { loading: "Chargement..." } };

export default async function Loading() {
  const { t } = await getT(MESSAGES);
  return (
    <div className="loader-overlay">
      <div className="loader"></div>
      <p style={{ color: "white", marginTop: "1rem" }}>{t("loading")}</p>
    </div>
  );
}
