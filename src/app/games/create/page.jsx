import GameAddForm from "@/features/game/game-add-form.jsx";

export default function CreateGamePage() {
  return (
    <>
      <h1 className="title">Create new Poker Game</h1>
      <h2 className="subtitle">Set up your next home game session</h2>
      <section className="section section--form">
        <GameAddForm/>
      </section>
    </>
  );
}