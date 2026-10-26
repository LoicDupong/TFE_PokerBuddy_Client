'use server'

// ⚠️ Stockage temporaire en mémoire
// (à remplacer par une vraie persistance en DB Users ↔ Subscriptions)
// L'envoi des notifications (web-push + clé VAPID privée) devra se faire côté API :
// une server action "sendNotification" exportée ici était appelable par n'importe quel visiteur.
let subscriptions = []

export async function subscribeUser(sub) {
  // Vérifie si déjà existant
  const exists = subscriptions.find(s => s.endpoint === sub.endpoint)
  if (!exists) {
    subscriptions.push(sub)
  }
  return { success: true }
}

export async function unsubscribeUser(endpoint) {
  subscriptions = subscriptions.filter(s => s.endpoint !== endpoint)
  return { success: true }
}
