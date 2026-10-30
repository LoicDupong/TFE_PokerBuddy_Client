// Textes de l'aide (FAQ, formulaire de contact, suivi des demandes)
export const HELP_MESSAGES = {
    en: {
        page: {
            title: "Help", intro: "Find a quick answer, or send us a message.", myRequests: "My requests",
            loginPrompt: "Log in to contact us and follow your requests.", login: "Log in",
        },
        faq: {
            title: "Quick answers",
            q1: "How do I invite friends to a game?",
            a1: "Open your game and use the invite section: add a PokerBuddy friend, or share the invite link so guests can answer without an account.",
            q2: "I forgot my password",
            a2: "Go to the log in page and choose \"Forgot password\". We'll email you a link that works for 30 minutes.",
            q3: "How do rebuys, add-ons and bounties work?",
            a3: "The host sets them up when creating the game, then records them from the game page during play. The prize pool and each player's result update automatically.",
            q4: "Can I change my username or delete my account?",
            a4: "Yes, both are in your profile settings. Deleting your account is permanent: games you host that are not finished are cancelled.",
            q5: "Can I install PokerBuddy on my phone?",
            a5: "Yes. Use \"Add to Home Screen\" in your browser menu, and PokerBuddy opens like a regular app.",
        },
        form: {
            title: "Contact us", intro: "Tell us what happened and we'll get back to you here. You'll get a notification when we reply.",
            category: "What is it about?", subject: "Subject", subjectPlaceholder: "A few words to sum it up",
            message: "Details", messagePlaceholder: "What were you doing, and what did you expect to happen?",
            submit: "Send request", sending: "Sending…", sent: "Request sent. We'll reply here.",
            errors: { subject: "Please add a subject", message: "Please describe your request" },
        },
        list: {
            title: "My requests", newRequest: "New request", loading: "Loading…", empty: "You haven't sent any request yet.",
            contact: "Contact us", retry: "Try again", loadError: "Could not load your requests.",
        },
        thread: {
            loading: "Loading…", notFound: "Request not found", notFoundHint: "This request doesn't exist or isn't yours.",
            back: "Back to my requests", loadError: "Could not load this request.", retry: "Try again", you: "You",
            staff: "PokerBuddy support", reply: "Your reply", send: "Send reply", sending: "Sending…",
            resolvedHint: "This request is marked as resolved. Sending a reply will reopen it.", emptyReply: "Please write a message first",
        },
        categories: {
            bug: "Something is broken", account: "My account", game: "A game or its results",
            suggestion: "An idea or suggestion", other: "Something else",
        },
        statuses: { new: "Sent", in_progress: "In progress", resolved: "Resolved" },
    },
    fr: {
        page: {
            title: "Aide", intro: "Trouve une réponse rapide, ou envoie-nous un message.", myRequests: "Mes demandes",
            loginPrompt: "Connecte-toi pour nous contacter et suivre tes demandes.", login: "Connexion",
        },
        faq: {
            title: "Réponses rapides",
            q1: "Comment inviter des amis à une partie ?",
            a1: "Ouvre ta partie et utilise la section d'invitation : ajoute un ami PokerBuddy, ou partage le lien d'invitation pour que des invités répondent sans compte.",
            q2: "J'ai oublié mon mot de passe",
            a2: "Va sur la page de connexion et choisis « Mot de passe oublié ». On t'envoie par email un lien valable 30 minutes.",
            q3: "Comment fonctionnent les rebuys, les add-ons et les bounties ?",
            a3: "L'hôte les configure à la création de la partie, puis les enregistre depuis la page de la partie pendant le jeu. La cagnotte et le résultat de chaque joueur se mettent à jour automatiquement.",
            q4: "Puis-je changer de pseudo ou supprimer mon compte ?",
            a4: "Oui, les deux se font dans les réglages de ton profil. La suppression du compte est définitive : les parties que tu organises et qui ne sont pas terminées sont annulées.",
            q5: "Puis-je installer PokerBuddy sur mon téléphone ?",
            a5: "Oui. Utilise « Sur l'écran d'accueil » dans le menu de ton navigateur, et PokerBuddy s'ouvre comme une vraie appli.",
        },
        form: {
            title: "Nous contacter", intro: "Dis-nous ce qui s'est passé, on te répond ici. Tu recevras une notification à notre réponse.",
            category: "De quoi s'agit-il ?", subject: "Sujet", subjectPlaceholder: "Quelques mots pour résumer",
            message: "Détails", messagePlaceholder: "Que faisais-tu, et qu'est-ce que tu attendais ?",
            submit: "Envoyer la demande", sending: "Envoi…", sent: "Demande envoyée. On te répond ici.",
            errors: { subject: "Ajoute un sujet", message: "Décris ta demande" },
        },
        list: {
            title: "Mes demandes", newRequest: "Nouvelle demande", loading: "Chargement…", empty: "Tu n'as encore envoyé aucune demande.",
            contact: "Nous contacter", retry: "Réessayer", loadError: "Impossible de charger tes demandes.",
        },
        thread: {
            loading: "Chargement…", notFound: "Demande introuvable", notFoundHint: "Cette demande n'existe pas ou ce n'est pas la tienne.",
            back: "Retour à mes demandes", loadError: "Impossible de charger cette demande.", retry: "Réessayer", you: "Toi",
            staff: "Support PokerBuddy", reply: "Ta réponse", send: "Envoyer la réponse", sending: "Envoi…",
            resolvedHint: "Cette demande est marquée comme résolue. Envoyer une réponse la rouvrira.", emptyReply: "Écris d'abord un message",
        },
        categories: {
            bug: "Quelque chose ne marche pas", account: "Mon compte", game: "Une partie ou ses résultats",
            suggestion: "Une idée ou une suggestion", other: "Autre chose",
        },
        statuses: { new: "Envoyée", in_progress: "En cours", resolved: "Résolue" },
    },
};
