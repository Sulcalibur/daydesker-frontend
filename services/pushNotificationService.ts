import { $fetch } from 'ofetch'

export interface DeviceToken {
  id: number
  token: string
  platform: 'web' | 'ios' | 'android'
  device_name?: string
  device_model?: string
  os_version?: string
  app_version?: string
  push_enabled: boolean
  is_active: boolean
  last_used_at: string
  created_at: string
  updated_at: string
}

export interface PushNotification {
  id: number
  title: string
  body: string
  type: string
  data: Record<string, any>
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read'
  sent_at?: string
  delivered_at?: string
  read_at?: string
  created_at: string
}

export interface NotificationPermission {
  granted: boolean
  denied: boolean
  default: boolean
}

class PushNotificationService {
  private registration: ServiceWorkerRegistration | null = null
  private vapidPublicKey = 'YOUR_VAPID_PUBLIC_KEY' // Replace with actual VAPID key

  /**
   * Initialize push notification service
   */
  async initialize(): Promise<boolean> {
    if (!this.isSupported()) {
      console.warn('Push notifications are not supported in this browser')
      return false
    }

    try {
      // Register service worker
      this.registration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker registered successfully')
      return true
    } catch (error) {
      console.error('Service Worker registration failed:', error)
      return false
    }
  }

  /**
   * Check if push notifications are supported
   */
  isSupported(): boolean {
    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    )
  }

  /**
   * Get current notification permission status
   */
  getPermissionStatus(): NotificationPermission {
    const permission = Notification.permission
    return {
      granted: permission === 'granted',
      denied: permission === 'denied',
      default: permission === 'default'
    }
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      return false
    }

    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  /**
   * Subscribe to push notifications
   */
  async subscribe(): Promise<PushSubscription | null> {
    if (!this.registration) {
      await this.initialize()
    }

    if (!this.registration) {
      throw new Error('Service Worker not registered')
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      })

      return subscription
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error)
      return null
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(): Promise<boolean> {
    if (!this.registration) {
      return false
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription()
      if (subscription) {
        await subscription.unsubscribe()
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error)
      return false
    }
  }

  /**
   * Register device token with backend
   */
  async registerDevice(): Promise<DeviceToken | null> {
    try {
      const hasPermission = await this.requestPermission()
      if (!hasPermission) {
        throw new Error('Notification permission denied')
      }

      const subscription = await this.subscribe()
      if (!subscription) {
        throw new Error('Failed to create push subscription')
      }

      // Get device information
      const deviceInfo = this.getDeviceInfo()
      
      const response = await $fetch<DeviceToken>('/api/devices/register', {
        method: 'POST',
        body: {
          token: JSON.stringify(subscription),
          platform: 'web',
          device_name: deviceInfo.deviceName,
          device_model: deviceInfo.deviceModel,
          os_version: deviceInfo.osVersion,
          app_version: deviceInfo.appVersion,
          push_enabled: true
        }
      })

      console.log('Device registered successfully:', response)
      return response
    } catch (error) {
      console.error('Failed to register device:', error)
      return null
    }
  }

  /**
   * Unregister device token from backend
   */
  async unregisterDevice(token: string): Promise<boolean> {
    try {
      await $fetch(`/api/devices/${encodeURIComponent(token)}`, {
        method: 'DELETE'
      })

      // Also unsubscribe from browser
      await this.unsubscribe()
      
      console.log('Device unregistered successfully')
      return true
    } catch (error) {
      console.error('Failed to unregister device:', error)
      return false
    }
  }

  /**
   * Get user's registered devices
   */
  async getUserDevices(): Promise<DeviceToken[]> {
    try {
      const response = await $fetch<DeviceToken[]>('/api/devices')
      return response
    } catch (error) {
      console.error('Failed to get user devices:', error)
      return []
    }
  }

  /**
   * Send test notification
   */
  async sendTestNotification(): Promise<boolean> {
    try {
      await $fetch('/api/notifications/test', {
        method: 'POST',
        body: {
          title: 'Test Notification',
          body: 'This is a test notification from DayDeskr'
        }
      })
      return true
    } catch (error) {
      console.error('Failed to send test notification:', error)
      return false
    }
  }

  /**
   * Get notification history
   */
  async getNotificationHistory(page = 1, limit = 20): Promise<{
    data: PushNotification[]
    total: number
    current_page: number
    last_page: number
  }> {
    try {
      const response = await $fetch('/api/notifications/history', {
        query: { page, limit }
      })
      return response
    } catch (error) {
      console.error('Failed to get notification history:', error)
      return {
        data: [],
        total: 0,
        current_page: 1,
        last_page: 1
      }
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: number): Promise<boolean> {
    try {
      await $fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH'
      })
      return true
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      return false
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<boolean> {
    try {
      await $fetch('/api/notifications/read-all', {
        method: 'PATCH'
      })
      return true
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
      return false
    }
  }

  /**
   * Show local notification (fallback)
   */
  showLocalNotification(title: string, body: string, data?: any): void {
    if (!this.getPermissionStatus().granted) {
      return
    }

    const notification = new Notification(title, {
      body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data,
      requireInteraction: true
    })

    notification.onclick = (event) => {
      event.preventDefault()
      window.focus()
      notification.close()
      
      // Handle notification click based on data
      if (data?.type === 'message' && data?.conversation_id) {
        // Navigate to conversation
        window.location.href = `/conversations/${data.conversation_id}`
      }
    }
  }

  /**
   * Get device information
   */
  private getDeviceInfo() {
    const userAgent = navigator.userAgent
    const platform = navigator.platform
    
    return {
      deviceName: this.getDeviceName(userAgent, platform),
      deviceModel: this.getBrowserName(userAgent),
      osVersion: this.getOSVersion(userAgent, platform),
      appVersion: '1.0.0' // Replace with actual app version
    }
  }

  private getDeviceName(userAgent: string, platform: string): string {
    if (platform.includes('Mac')) return 'Mac'
    if (platform.includes('Win')) return 'Windows PC'
    if (platform.includes('Linux')) return 'Linux PC'
    if (userAgent.includes('Mobile')) return 'Mobile Device'
    return 'Desktop'
  }

  private getBrowserName(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome'
    if (userAgent.includes('Firefox')) return 'Firefox'
    if (userAgent.includes('Safari')) return 'Safari'
    if (userAgent.includes('Edge')) return 'Edge'
    return 'Unknown Browser'
  }

  private getOSVersion(userAgent: string, platform: string): string {
    const match = userAgent.match(/\(([^)]+)\)/)
    return match ? match[1] : platform
  }

  /**
   * Convert VAPID key to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }
}

export const pushNotificationService = new PushNotificationService()
export default pushNotificationService