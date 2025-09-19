// Service Worker for Push Notifications

const CACHE_NAME = 'daydeskr-v1'
const urlsToCache = [
  '/',
  '/offline.html'
]

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache')
        return cache.addAll(urlsToCache)
      })
  )
})

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Fetch event (for offline support)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
      })
      .catch(() => {
        // If both cache and network fail, show offline page
        if (event.request.destination === 'document') {
          return caches.match('/offline.html')
        }
      })
  )
})

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Push event received:', event)
  
  let notificationData = {
    title: 'DayDeskr',
    body: 'You have a new notification',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data: {}
  }
  
  if (event.data) {
    try {
      const payload = event.data.json()
      notificationData = {
        title: payload.title || notificationData.title,
        body: payload.body || notificationData.body,
        icon: payload.icon || notificationData.icon,
        badge: payload.badge || notificationData.badge,
        image: payload.image,
        data: payload.data || {},
        actions: payload.actions || [],
        requireInteraction: payload.requireInteraction || false,
        silent: payload.silent || false,
        tag: payload.tag || 'daydeskr-notification',
        timestamp: Date.now()
      }
    } catch (error) {
      console.error('Error parsing push payload:', error)
      notificationData.body = event.data.text()
    }
  }
  
  const promiseChain = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      image: notificationData.image,
      data: notificationData.data,
      actions: notificationData.actions,
      requireInteraction: notificationData.requireInteraction,
      silent: notificationData.silent,
      tag: notificationData.tag,
      timestamp: notificationData.timestamp
    }
  )
  
  event.waitUntil(promiseChain)
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)
  
  event.notification.close()
  
  const data = event.notification.data || {}
  let targetUrl = '/'
  
  // Determine target URL based on notification data
  if (data.type === 'message' && data.conversation_id) {
    targetUrl = `/conversations/${data.conversation_id}`
  } else if (data.type === 'booking' && data.booking_id) {
    targetUrl = `/bookings/${data.booking_id}`
  } else if (data.url) {
    targetUrl = data.url
  }
  
  // Handle action buttons
  if (event.action) {
    switch (event.action) {
      case 'reply':
        targetUrl = `/conversations/${data.conversation_id}?action=reply`
        break
      case 'view':
        // Use default targetUrl
        break
      case 'dismiss':
        // Just close notification, don't open anything
        return
    }
  }
  
  const promiseChain = clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  })
  .then((clientList) => {
    // Check if there's already a window/tab open with the target URL
    for (const client of clientList) {
      if (client.url.includes(targetUrl) && 'focus' in client) {
        return client.focus()
      }
    }
    
    // If no existing window/tab, open a new one
    if (clients.openWindow) {
      return clients.openWindow(targetUrl)
    }
  })
  
  event.waitUntil(promiseChain)
})

// Notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event)
  
  const data = event.notification.data || {}
  
  // Track notification dismissal if needed
  if (data.notification_id) {
    // Could send analytics or update read status
    console.log('Notification dismissed:', data.notification_id)
  }
})

// Background sync event (for offline message sending)
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event.tag)
  
  if (event.tag === 'background-message-sync') {
    event.waitUntil(syncMessages())
  }
})

// Sync messages when back online
async function syncMessages() {
  try {
    // Get pending messages from IndexedDB or localStorage
    const pendingMessages = await getPendingMessages()
    
    for (const message of pendingMessages) {
      try {
        // Attempt to send the message
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${message.token}`
          },
          body: JSON.stringify(message.data)
        })
        
        if (response.ok) {
          // Remove from pending messages
          await removePendingMessage(message.id)
          console.log('Message synced successfully:', message.id)
        }
      } catch (error) {
        console.error('Failed to sync message:', message.id, error)
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}

// Helper functions for message storage (simplified)
async function getPendingMessages() {
  // In a real implementation, you'd use IndexedDB
  // For now, return empty array
  return []
}

async function removePendingMessage(messageId) {
  // In a real implementation, you'd remove from IndexedDB
  console.log('Removing pending message:', messageId)
}

// Handle push subscription changes
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('Push subscription changed:', event)
  
  const promiseChain = self.registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: event.oldSubscription.options.applicationServerKey
  })
  .then((newSubscription) => {
    // Send new subscription to server
    return fetch('/api/devices/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: JSON.stringify(newSubscription),
        platform: 'web'
      })
    })
  })
  
  event.waitUntil(promiseChain)
})