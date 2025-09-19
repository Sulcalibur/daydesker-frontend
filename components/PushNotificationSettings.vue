<template>
  <div class="push-notification-settings">
    <div class="settings-header">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        Push Notifications
      </h3>
      <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
        Manage your notification preferences and devices
      </p>
    </div>

    <!-- Browser Support Check -->
    <div v-if="!isSupported" class="alert alert-warning">
      <AlertTriangle class="w-5 h-5" />
      <div>
        <h4 class="font-medium">Not Supported</h4>
        <p class="text-sm">Push notifications are not supported in this browser.</p>
      </div>
    </div>

    <!-- Permission Status -->
    <div v-else class="permission-status">
      <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div class="flex items-center space-x-3">
          <div class="status-icon">
            <Bell v-if="hasPermission" class="w-5 h-5 text-green-600" />
            <BellOff v-else-if="isBlocked" class="w-5 h-5 text-red-600" />
            <AlertCircle v-else class="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <h4 class="font-medium text-gray-900 dark:text-white">
              {{ permissionStatusText }}
            </h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ permissionStatusDescription }}
            </p>
          </div>
        </div>
        
        <div class="flex space-x-2">
          <button
            v-if="canRegister"
            @click="handleEnableNotifications"
            :disabled="isLoading"
            class="btn btn-primary"
          >
            <Loader2 v-if="isLoading" class="w-4 h-4 animate-spin" />
            <Bell v-else class="w-4 h-4" />
            Enable Notifications
          </button>
          
          <button
            v-if="hasPermission && !isRegistered"
            @click="registerDevice"
            :disabled="isLoading"
            class="btn btn-primary"
          >
            <Loader2 v-if="isLoading" class="w-4 h-4 animate-spin" />
            <Smartphone v-else class="w-4 h-4" />
            Register Device
          </button>
          
          <button
            v-if="hasPermission"
            @click="sendTestNotification"
            :disabled="isLoading"
            class="btn btn-secondary"
          >
            <Send class="w-4 h-4" />
            Test
          </button>
        </div>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="alert alert-error">
      <AlertTriangle class="w-5 h-5" />
      <div>
        <h4 class="font-medium">Error</h4>
        <p class="text-sm">{{ error }}</p>
      </div>
    </div>

    <!-- Registered Devices -->
    <div v-if="hasPermission && devices.length > 0" class="registered-devices">
      <h4 class="font-medium text-gray-900 dark:text-white mb-3">
        Registered Devices ({{ devices.length }})
      </h4>
      
      <div class="space-y-3">
        <div
          v-for="device in devices"
          :key="device.id"
          class="device-item flex items-center justify-between p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
        >
          <div class="flex items-center space-x-3">
            <div class="device-icon">
              <Smartphone v-if="device.platform === 'android' || device.platform === 'ios'" class="w-5 h-5 text-gray-600" />
              <Monitor v-else class="w-5 h-5 text-gray-600" />
            </div>
            
            <div>
              <h5 class="font-medium text-gray-900 dark:text-white">
                {{ device.device_name || 'Unknown Device' }}
              </h5>
              <div class="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <span>{{ device.device_model }}</span>
                <span>&bull;</span>
                <span class="capitalize">{{ device.platform }}</span>
                <span>&bull;</span>
                <span :class="device.is_active ? 'text-green-600' : 'text-red-600'">
                  {{ device.is_active ? 'Active' : 'Inactive' }}
                </span>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Last used: {{ formatDate(device.last_used_at) }}
              </p>
            </div>
          </div>
          
          <button
            @click="handleUnregisterDevice(device)"
            :disabled="isLoading"
            class="btn btn-danger btn-sm"
          >
            <Trash2 class="w-4 h-4" />
            Remove
          </button>
        </div>
      </div>
    </div>

    <!-- Notification History -->
    <div v-if="hasPermission" class="notification-history">
      <div class="flex items-center justify-between mb-3">
        <h4 class="font-medium text-gray-900 dark:text-white">
          Recent Notifications
          <span v-if="unreadCount > 0" class="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
            {{ unreadCount }} unread
          </span>
        </h4>
        
        <div class="flex space-x-2">
          <button
            v-if="unreadCount > 0"
            @click="markAllAsRead"
            class="btn btn-secondary btn-sm"
          >
            <CheckCheck class="w-4 h-4" />
            Mark All Read
          </button>
          
          <button
            @click="loadNotificationHistory"
            class="btn btn-secondary btn-sm"
          >
            <RefreshCw class="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>
      
      <div v-if="notifications.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
        <Bell class="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No notifications yet</p>
      </div>
      
      <div v-else class="space-y-2 max-h-64 overflow-y-auto">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          :class="[
            'notification-item p-3 border rounded-lg cursor-pointer transition-colors',
            notification.status === 'read'
              ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
          ]"
          @click="handleNotificationClick(notification)"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h5 class="font-medium text-gray-900 dark:text-white text-sm">
                {{ notification.title }}
              </h5>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {{ notification.body }}
              </p>
              <div class="flex items-center space-x-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span class="capitalize">{{ notification.type }}</span>
                <span>&bull;</span>
                <span>{{ formatDate(notification.created_at) }}</span>
                <span v-if="notification.status !== 'read'" class="text-blue-600 dark:text-blue-400">
                  &bull; Unread
                </span>
              </div>
            </div>
            
            <div class="flex items-center space-x-1 ml-3">
              <button
                v-if="notification.status !== 'read'"
                @click.stop="markAsRead(notification.id)"
                class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="Mark as read"
              >
                <Check class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Browser Instructions -->
    <div v-if="isBlocked" class="browser-instructions">
      <div class="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <h4 class="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
          Notifications Blocked
        </h4>
        <p class="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
          You've blocked notifications for this site. To enable them:
        </p>
        <ol class="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 ml-4 list-decimal">
          <li>Click the lock icon in your browser's address bar</li>
          <li>Change notifications from "Block" to "Allow"</li>
          <li>Refresh this page</li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Bell,
  BellOff,
  AlertTriangle,
  AlertCircle,
  Loader2,
  Smartphone,
  Monitor,
  Send,
  Trash2,
  CheckCheck,
  RefreshCw,
  Check
} from 'lucide-vue-next'
import { usePushNotifications } from '~/composables/usePushNotifications'
import type { DeviceToken, PushNotification } from '~/services/pushNotificationService'

// Use push notifications composable
const {
  isSupported,
  isRegistered,
  isLoading,
  error,
  hasPermission,
  needsPermission,
  isBlocked,
  canRegister,
  devices,
  notifications,
  unreadCount,
  requestPermission,
  registerDevice,
  unregisterDevice,
  sendTestNotification,
  loadNotificationHistory,
  markAsRead,
  markAllAsRead
} = usePushNotifications()

// Computed properties
const permissionStatusText = computed(() => {
  if (hasPermission.value) {
    return isRegistered.value ? 'Notifications Enabled' : 'Permission Granted'
  }
  if (isBlocked.value) {
    return 'Notifications Blocked'
  }
  return 'Notifications Disabled'
})

const permissionStatusDescription = computed(() => {
  if (hasPermission.value) {
    return isRegistered.value 
      ? 'You will receive push notifications for new messages and updates'
      : 'Click "Register Device" to start receiving notifications'
  }
  if (isBlocked.value) {
    return 'You have blocked notifications for this site'
  }
  return 'Enable notifications to stay updated with new messages'
})

// Methods
const handleEnableNotifications = async () => {
  const granted = await requestPermission()
  if (granted) {
    await registerDevice()
  }
}

const handleUnregisterDevice = async (device: DeviceToken) => {
  if (confirm('Are you sure you want to remove this device?')) {
    await unregisterDevice(device.token)
  }
}

const handleNotificationClick = async (notification: PushNotification) => {
  // Mark as read if not already read
  if (notification.status !== 'read') {
    await markAsRead(notification.id)
  }
  
  // Navigate based on notification type
  if (notification.type === 'message' && notification.data?.conversation_id) {
    await navigateTo(`/conversations/${notification.data.conversation_id}`)
  }
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  
  if (diffInHours < 1) {
    const minutes = Math.floor(diffInHours * 60)
    return `${minutes}m ago`
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`
  } else {
    const days = Math.floor(diffInHours / 24)
    return `${days}d ago`
  }
}
</script>

<style scoped>
.push-notification-settings {
  @apply space-y-6;
}

.alert {
  @apply flex items-start space-x-3 p-4 rounded-lg;
}

.alert-warning {
  @apply bg-yellow-50 border border-yellow-200 text-yellow-800;
}

.alert-error {
  @apply bg-red-50 border border-red-200 text-red-800;
}

.btn {
  @apply inline-flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500;
}

.btn-secondary {
  @apply bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500;
}

.btn-danger {
  @apply bg-red-600 text-white hover:bg-red-700 focus:ring-red-500;
}

.btn-sm {
  @apply px-2 py-1 text-xs;
}

.btn:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.dark .btn-secondary {
  @apply bg-gray-700 text-gray-300 hover:bg-gray-600;
}

.dark .alert-warning {
  @apply bg-yellow-900/20 border-yellow-800 text-yellow-200;
}

.dark .alert-error {
  @apply bg-red-900/20 border-red-800 text-red-200;
}
</style>