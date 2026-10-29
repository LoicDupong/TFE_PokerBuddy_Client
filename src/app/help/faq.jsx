// Questions fréquentes : <details> natif (clavier et lecteurs d'écran gérés par le navigateur)
const FAQ_TEXT = {
    title: "Quick answers",
    items: [
        {
            question: "How do I invite friends to a game?",
            answer: "Open your game and use the invite section: add a PokerBuddy friend, or share the invite link so guests can answer without an account.",
        },
        {
            question: "I forgot my password",
            answer: "Go to the log in page and choose \"Forgot password\". We'll email you a link that works for 30 minutes.",
        },
        {
            question: "How do rebuys, add-ons and bounties work?",
            answer: "The host sets them up when creating the game, then records them from the game page during play. The prize pool and each player's result update automatically.",
        },
        {
            question: "Can I change my username or delete my account?",
            answer: "Yes, both are in your profile settings. Deleting your account is permanent: games you host that are not finished are cancelled.",
        },
        {
            question: "Can I install PokerBuddy on my phone?",
            answer: "Yes. Use \"Add to Home Screen\" in your browser menu, and PokerBuddy opens like a regular app.",
        },
    ],
};

export default function Faq() {
    return (
        <section className="help__section" aria-labelledby="help-faq-title">
            <h2 id="help-faq-title" className="help__title">{FAQ_TEXT.title}</h2>
            <div className="help__faq">
                {FAQ_TEXT.items.map((item) => (
                    <details key={item.question} className="help__faq-item">
                        <summary>{item.question}</summary>
                        <p>{item.answer}</p>
                    </details>
                ))}
            </div>
        </section>
    );
}
