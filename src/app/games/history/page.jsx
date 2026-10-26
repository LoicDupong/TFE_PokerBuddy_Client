import PreviousGamesDisplay from '@/components/previous-games-display/previous-games-display.jsx';

export default function GamesPage() {
  return (
    <>
      <h1>Games <br /><span className="red">History</span></h1>

      <section className="section section--previous-games">
        <PreviousGamesDisplay/>
      </section>
    </>
  );
}
