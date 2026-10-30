import PreviousGamesDisplay from '@/components/previous-games-display/previous-games-display.jsx';
import { getLocale } from "@/i18n/server.js";

export default async function GamesPage() {
  const locale = await getLocale();
  return (
    <>
      <h1>{locale === "fr" ? <>Historique <br /><span className="red">des parties</span></> : <>Games <br /><span className="red">History</span></>}</h1>

      <section className="section section--previous-games">
        <PreviousGamesDisplay/>
      </section>
    </>
  );
}
