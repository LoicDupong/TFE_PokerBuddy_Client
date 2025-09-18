'use server'

import webpush from 'web-push'

// Configure VAPID (à mettre dans ton .env)
webpush.setVapidDetails(
  'mailto:loicdupong@hotmail.com', // Mets ton email
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

// ⚠️ Stockage temporaire en mémoire
// (à remplacer par une vraie persistance en DB Users ↔ Subscriptions)
let subscriptions = []

export async function subscribeUser(sub) {
  // Vérifie si déjà existant
  const exists = subscriptions.find(s => s.endpoint === sub.endpoint)
  if (!exists) {
    subscriptions.push(sub)
    console.log('✅ New subscription:', sub.endpoint)
  }
  return { success: true }
}

export async function unsubscribeUser(endpoint) {
  subscriptions = subscriptions.filter(s => s.endpoint !== endpoint)
  console.log('❌ Subscription removed:', endpoint)
  return { success: true }
}

export async function sendNotification(message) {
  if (!subscriptions.length) {
    throw new Error('No subscriptions available')
  }

  try {
    await Promise.all(
      subscriptions.map(sub =>
        webpush.sendNotification(
          sub,
          JSON.stringify({
            title: 'PokerBuddy 🃏',
            body: message,
            icon: '/icon.png', 
          })
        )
      )
    )
    return { success: true }
  } catch (error) {
    console.error('Error sending push notification:', error)
    return { success: false, error: 'Failed to send notification' }
  }
}
