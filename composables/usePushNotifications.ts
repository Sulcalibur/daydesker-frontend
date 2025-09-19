import { ref, computed, onMounted, onUnmounted } from 'vue'
import pushNotificationService, { type DeviceToken, type PushNotification, type NotificationPermission } from '~/services/pushNotificationService'

export const usePushNotifications = () => {
  // Reactive state
  const isSupported = ref(false)
  const isInitialized = ref(false)
  const isRegistered = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const permission = ref<NotificationPermission>({
    granted: false,
    denied: false,
    default: true
  })
  const devices = ref<DeviceToken[]>([])
  const notifications = ref<PushNotification[]>([])
  const unreadCount = ref(0)

  // Computed properties
  const canRegister = computed(() => {
    return isSupported.value && !isRegistered.value && !permission.value.denied
  })

  const hasPermission = computed(() => {
    return permission.value.granted
  })

  const needsPermission = computed(() => {
    return permission.value.default
  })

  const isBlocked = computed(() => {
    return permission.value.denied
  })

  /**
   * Initialize push notification service
   */
  const initialize = async (): Promise<boolean> => {
    if (isInitialized.value) {
      return true
    }

    try {
      isLoading.value = true
      error.value = null

      // Check support
      isSupported.value = pushNotificationService.isSupported()
      if (!isSupported.value) {
        error.value = 'Push notifications are not supported in this browser'
        return false
      }

      // Initialize service
      const initialized = await pushNotificationService.initialize()
      if (!initialized) {
        error.value = 'Failed to initialize push notification service'
        return false
      }

      // Get current permission status
      permission.value = pushNotificationService.getPermissionStatus()
      
      // Load user devices if permission is granted
      if (permission.value.granted) {
        await loadUserDevices()
        await loadNotificationHistory()
      }

      isInitialized.value = true
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Request notification permission
   */
  const requestPermission = async (): Promise<boolean> => {
    try {
      isLoading.value = true
      error.value = null

      const granted = await pushNotificationService.requestPermission()
      permission.value = pushNotificationService.getPermissionStatus()
      
      if (granted) {
        await loadUserDevices()
      }

      return granted
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to request permission'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Register device for push notifications
   */
  const registerDevice = async (): Promise<boolean> => {
    try {
      isLoading.value = true
      error.value = null

      const device = await pushNotificationService.registerDevice()
      if (device) {
        isRegistered.value = true
        await loadUserDevices()
        return true
      }

      error.value = 'Failed to register device'
      return false
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to register device'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Unregister device from push notifications
   */
  const unregisterDevice = async (token: string): Promise<boolean> => {
    try {
      isLoading.value = true
      error.value = null

      const success = await pushNotificationService.unregisterDevice(token)
      if (success) {
        isRegistered.value = false
        await loadUserDevices()
        return true
      }

      error.value = 'Failed to unregister device'
      return false
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to unregister device'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Load user's registered devices
   */
  const loadUserDevices = async (): Promise<void> => {
    try {
      const userDevices = await pushNotificationService.getUserDevices()
      devices.value = userDevices
      
      // Check if current device is registered
      isRegistered.value = userDevices.some(device => 
        device.platform === 'web' && device.is_active
      )
    } catch (err) {
      console.error('Failed to load user devices:', err)
    }
  }

  /**
   * Send test notification
   */
  const sendTestNotification = async (): Promise<boolean> => {
    try {
      isLoading.value = true
      error.value = null

      const success = await pushNotificationService.sendTestNotification()
      if (!success) {
        error.value = 'Failed to send test notification'
      }

      return success
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to send test notification'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Load notification history
   */
  const loadNotificationHistory = async (page = 1, limit = 20): Promise<void> => {
    try {
      const response = await pushNotificationService.getNotificationHistory(page, limit)
      notifications.value = response.data
      
      // Count unread notifications
      unreadCount.value = response.data.filter(n => n.status !== 'read').length
    } catch (err) {
      console.error('Failed to load notification history:', err)
    }
  }

  /**
   * Mark notification as read
   */
  const markAsRead = async (notificationId: number): Promise<boolean> => {
    try {
      const success = await pushNotificationService.markAsRead(notificationId)
      if (success) {
        // Update local state
        const notification = notifications.value.find(n => n.id === notificationId)
        if (notification) {
          notification.status = 'read'
          notification.read_at = new Date().toISOString()
        }
        
        // Update unread count
        unreadCount.value = notifications.value.filter(n => n.status !== 'read').length
      }
      return success
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
      return false
    }
  }

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = async (): Promise<boolean> => {
    try {
      const success = await pushNotificationService.markAllAsRead()
      if (success) {
        // Update local state
        notifications.value.forEach(notification => {
          if (notification.status !== 'read') {
            notification.status = 'read'
            notification.read_at = new Date().toISOString()
          }
        })
        
        unreadCount.value = 0
      }
      return success
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err)
      return false
    }
  }

  /**
   * Show local notification (fallback)
   */
  const showLocalNotification = (title: string, body: string, data?: any): void => {
    pushNotificationService.showLocalNotification(title, body, data)
  }

  /**
   * Handle permission change
   */
  const handlePermissionChange = (): void => {
    permission.value = pushNotificationService.getPermissionStatus()
    
    if (permission.value.granted) {
      loadUserDevices()
      loadNotificationHistory()
    } else {
      isRegistered.value = false
      devices.value = []
      notifications.value = []
      unreadCount.value = 0
    }
  }

  /**
   * Listen for permission changes
   */
  const setupPermissionListener = (): void => {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'notifications' as PermissionName })
        .then(permissionStatus => {
          permissionStatus.addEventListener('change', handlePermissionChange)
        })
        .catch(err => {
          console.warn('Failed to setup permission listener:', err)
        })
    }
  }

  /**
   * Setup message listener for real-time notifications
   */
  const setupMessageListener = (): void => {
    // Listen for new messages via WebSocket or EventSource
    // This would integrate with your existing real-time messaging system
    
    // Example: Listen for custom events
    window.addEventListener('new-message', (event: any) => {
      const { message, sender } = event.detail
      
      // Show notification if user doesn't have focus
      if (document.hidden && hasPermission.value) {
        showLocalNotification(
          `New message from ${sender.name}`,
          message.content,
          {
            type: 'message',
            conversation_id: message.conversation_id,
            message_id: message.id
          }
        )
      }
    })
  }

  // Lifecycle hooks
  onMounted(() => {
    initialize()
    setupPermissionListener()
    setupMessageListener()
  })

  onUnmounted(() => {
    // Cleanup listeners if needed
  })

  return {
    // State
    isSupported: readonly(isSupported),
    isInitialized: readonly(isInitialized),
    isRegistered: readonly(isRegistered),
    isLoading: readonly(isLoading),
    error: readonly(error),
    permission: readonly(permission),
    devices: readonly(devices),
    notifications: readonly(notifications),
    unreadCount: readonly(unreadCount),
    
    // Computed
    canRegister,
    hasPermission,
    needsPermission,
    isBlocked,
    
    // Methods
    initialize,
    requestPermission,
    registerDevice,
    unregisterDevice,
    loadUserDevices,
    sendTestNotification,
    loadNotificationHistory,
    markAsRead,
    markAllAsRead,
    showLocalNotification
  }
}

export default usePushNotifications