'use client'

import { useState, useEffect } from 'react'
import { subscribeUser, unsubscribeUser } from '@/services/pwa/pwa.service'
import urlBase64ToUint8Array from '@/utils/urlBase64ToUint8Array.js'

export default function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState(null)

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      registerServiceWorker()
    }
  }, [])

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    })
    const sub = await registration.pushManager.getSubscription()
    setSubscription(sub)
  }

  async function subscribeToPush() {
    const registration = await navigator.serviceWorker.ready
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      ),
    })
    setSubscription(sub)
    await subscribeUser(sub)
  }

  async function unsubscribeFromPush() {
    const endpoint = subscription?.endpoint
    await subscription?.unsubscribe()
    setSubscription(null)
    await unsubscribeUser(endpoint)
  }

  if (!isSupported) return <p>Push notifications not supported.</p>

  return (
    <div>
      <h3>Push Notifications</h3>
      {subscription ? (
        <>
          <p>You are subscribed.</p>
          <button onClick={unsubscribeFromPush}>Unsubscribe</button>
        </>
      ) : (
        <button onClick={subscribeToPush}>Subscribe</button>
      )}
    </div>
  )
}
