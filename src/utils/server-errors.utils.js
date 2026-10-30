import { useLocale } from "@/i18n/i18n-provider.jsx";

// L'API répond en anglais. Les messages connus sont traduits ici (clé = message exact de l'API) ;
// un message inconnu est affiché tel quel, en dernier recours.
const FR = {
    "Unauthorized": "Tu dois être connecté pour faire ça.",
    "Access denied": "Accès refusé.",
    "Invalid email or password": "Email ou mot de passe incorrect.",
    "This account has been disabled": "Ce compte a été désactivé.",
    "Email is required": "L'email est obligatoire.",
    "Invalid email address": "Adresse email invalide.",
    "Email already in use": "Cet email est déjà utilisé.",
    "Email or username already in use": "Cet email ou ce pseudo est déjà utilisé.",
    "Username already taken": "Ce pseudo est déjà pris.",
    "Username is required": "Le pseudo est obligatoire.",
    "Username must be at least 3 characters": "Le pseudo doit faire au moins 3 caractères.",
    "Username must be less than 15 characters": "Le pseudo doit faire moins de 15 caractères.",
    "Username can only contain letters and numbers (no spaces or special characters)": "Le pseudo ne peut contenir que des lettres et des chiffres (ni espaces ni caractères spéciaux).",
    "Password must be at least 6 characters": "Le mot de passe doit faire au moins 6 caractères.",
    "Password must contain at least one uppercase letter": "Le mot de passe doit contenir au moins une majuscule.",
    "Password must contain at least one number": "Le mot de passe doit contenir au moins un chiffre.",
    "Password is required": "Le mot de passe est obligatoire.",
    "Incorrect password": "Mot de passe incorrect.",
    "Old password invalid": "L'ancien mot de passe est incorrect.",
    "Invalid or expired link": "Ce lien est invalide ou a expiré.",
    "Bio too long (500 characters max)": "Bio trop longue (500 caractères maximum).",
    "Avatar upload failed, please try again": "L'envoi de l'avatar a échoué, réessaie.",
    "No valid fields to update": "Aucune modification à enregistrer.",
    "User not found": "Utilisateur introuvable.",
    "Game not found": "Partie introuvable.",
    "Invite not found": "Invitation introuvable.",
    "Friendship not found": "Ami introuvable.",
    "Ticket not found": "Ticket introuvable.",
    "Friend request already exists": "Une demande d'ami existe déjà.",
    "You cannot add yourself as a friend": "Tu ne peux pas t'ajouter toi-même en ami.",
    "Invite already responded to": "Tu as déjà répondu à cette invitation.",
    "Not your invite": "Cette invitation n'est pas la tienne.",
    "Not authorized to respond to this invite": "Tu ne peux pas répondre à cette invitation.",
    "This game is full": "Cette partie est complète.",
    "This game is already finished": "Cette partie est déjà terminée.",
    "Game already finished": "Cette partie est déjà terminée.",
    "This game has already started or ended": "Cette partie a déjà commencé ou est terminée.",
    "You are the host of this game": "Tu es l'hôte de cette partie.",
    "Invalid or disabled invite link": "Ce lien d'invitation est invalide ou désactivé.",
    "Invalid or expired guest token": "Ce lien d'invité est invalide ou a expiré.",
    "This name is already taken in this game": "Ce nom est déjà pris dans cette partie.",
    "Name must be between 1 and 30 characters": "Le nom doit faire entre 1 et 30 caractères.",
    "Unsupported locale": "Langue non prise en charge.",
    "Error creating account": "Erreur lors de la création du compte.",
    "Error logging in": "Erreur lors de la connexion.",
    "Error updating profile": "Erreur lors de la mise à jour du profil.",
    "Error updating password": "Erreur lors du changement de mot de passe.",
    "Error resetting password": "Erreur lors de la réinitialisation du mot de passe.",
    "Error deleting account": "Erreur lors de la suppression du compte.",
    "Error fetching leaderboard": "Impossible de charger le classement.",
    "Error sending friend request": "Impossible d'envoyer la demande d'ami.",
    "Error responding to invite": "Impossible de répondre à l'invitation.",
    "Error saving your answer": "Impossible d'enregistrer ta réponse.",
    "Error creating support ticket": "Impossible de créer le ticket.",
    "Error sending message": "Impossible d'envoyer le message.",
    "Password updated successfully": "Mot de passe mis à jour.",
    "Password updated, you can now log in": "Mot de passe mis à jour, tu peux te connecter.",
    "Profile updated": "Profil mis à jour.",
};

const NETWORK = {
    en: "Network error, check your connection and try again",
    fr: "Erreur réseau, vérifie ta connexion et réessaie.",
};

// const serverError = useServerError() ; serverError(res.error) → message dans la langue de l'interface
export function useServerError() {
    const { locale } = useLocale();
    return (message) => {
        if (!message) return "";
        if (locale === "fr") {
            if (message === NETWORK.en) return NETWORK.fr;
            return FR[message] ?? message;
        }
        return message;
    };
}
