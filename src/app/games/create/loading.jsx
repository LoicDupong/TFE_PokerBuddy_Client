import { COMMON } from "@/i18n/common.js";
import { getT } from "@/i18n/server.js";

export default async function Loading() {
  const { t } = await getT(COMMON);
  return (
    <div className="loader-overlay">
      <div className="loader"></div>
      <p style={{ color: "white", marginTop: "1rem" }}>{t("loading")}</p>
    </div>
  );
}
