self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      // Icônes réellement présentes dans /public
      icon: data.icon || '/web-app-manifest-192x192.png',
      badge: '/web-app-manifest-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2',
      },
    }
    event.waitUntil(self.registration.showNotification(data.title, options))
  }
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  // Relatif au site du service worker (et non localhost) : fonctionne aussi en prod
  event.waitUntil(clients.openWindow('/'))
})

// * Ajouter ici des push webSocket de mon server pour envoyé des notifs en fonction d'un event
