<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-4">
            <button
              @click="goBack"
              class="text-gray-600 hover:text-gray-900"
            >
              <Icon name="lucide:arrow-left" class="w-5 h-5" />
            </button>
            <h1 class="text-xl font-semibold text-gray-900">Profile Settings</h1>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600">{{ user?.email }}</span>
            <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span class="text-white text-sm font-medium">
                {{ user?.name?.split(' ').map(n => n.charAt(0)).join('') || 'U' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-xl shadow-sm border">
        <!-- Profile Header -->
        <div class="p-6 border-b">
          <div class="flex items-center space-x-6">
            <div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span class="text-white text-2xl font-bold">
                {{ user?.name?.split(' ').map(n => n.charAt(0)).join('') || 'U' }}
              </span>
            </div>
            <div>
              <h2 class="text-2xl font-bold text-gray-900">{{ user?.name || 'User' }}</h2>
              <p class="text-gray-600">{{ user?.email }}</p>
              <div class="flex items-center mt-2">
                <span
                  :class="{
                    'bg-blue-100 text-blue-800': user?.user_type === 'seeker',
                    'bg-green-100 text-green-800': user?.user_type === 'provider'
                  }"
                  class="px-3 py-1 text-sm font-medium rounded-full"
                >
                  {{ user?.user_type === 'seeker' ? 'Desk Seeker' : 'Workspace Provider' }}
                </span>
                <span
                  v-if="user?.is_verified"
                  class="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center"
                >
                  <Icon name="lucide:check-circle" class="w-3 h-3 mr-1" />
                  Verified
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Profile Form -->
        <div class="p-6">
          <form @submit.prevent="updateProfile" class="space-y-8">
            <!-- Personal Information -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    v-model="profileForm.first_name"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    :class="{ 'border-red-300': errors.first_name }"
                  />
                  <p v-if="errors.first_name" class="mt-1 text-sm text-red-600">{{ errors.first_name }}</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    v-model="profileForm.last_name"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    :class="{ 'border-red-300': errors.last_name }"
                  />
                  <p v-if="errors.last_name" class="mt-1 text-sm text-red-600">{{ errors.last_name }}</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    v-model="profileForm.email"
                    type="email"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    :class="{ 'border-red-300': errors.email }"
                  />
                  <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    v-model="profileForm.phone"
                    type="tel"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    :class="{ 'border-red-300': errors.phone }"
                  />
                  <p v-if="errors.phone" class="mt-1 text-sm text-red-600">{{ errors.phone }}</p>
                </div>
              </div>
            </div>

            <!-- Provider-specific fields -->
            <div v-if="user?.user_type === 'provider'">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
              <div class="space-y-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                  <input
                    v-model="profileForm.company_name"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    :class="{ 'border-red-300': errors.company_name }"
                  />
                  <p v-if="errors.company_name" class="mt-1 text-sm text-red-600">{{ errors.company_name }}</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea
                    v-model="profileForm.bio"
                    rows="4"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    :class="{ 'border-red-300': errors.bio }"
                    placeholder="Tell us about your business and workspace offerings..."
                  ></textarea>
                  <p v-if="errors.bio" class="mt-1 text-sm text-red-600">{{ errors.bio }}</p>
                </div>
              </div>
            </div>

            <!-- Password Change -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
              <div class="space-y-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <input
                    v-model="passwordForm.current_password"
                    type="password"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    :class="{ 'border-red-300': errors.current_password }"
                  />
                  <p v-if="errors.current_password" class="mt-1 text-sm text-red-600">{{ errors.current_password }}</p>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <input
                      v-model="passwordForm.new_password"
                      type="password"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      :class="{ 'border-red-300': errors.new_password }"
                    />
                    <p v-if="errors.new_password" class="mt-1 text-sm text-red-600">{{ errors.new_password }}</p>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <input
                      v-model="passwordForm.confirm_password"
                      type="password"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      :class="{ 'border-red-300': errors.confirm_password }"
                    />
                    <p v-if="errors.confirm_password" class="mt-1 text-sm text-red-600">{{ errors.confirm_password }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Account Settings -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
              <div class="space-y-4">
                <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 class="font-medium text-gray-900">Email Notifications</h4>
                    <p class="text-sm text-gray-600">Receive notifications about bookings and updates</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      v-model="profileForm.email_notifications"
                      type="checkbox"
                      class="sr-only peer"
                    />
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 class="font-medium text-gray-900">SMS Notifications</h4>
                    <p class="text-sm text-gray-600">Receive SMS alerts for urgent updates</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      v-model="profileForm.sms_notifications"
                      type="checkbox"
                      class="sr-only peer"
                    />
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="flex justify-between items-center pt-6 border-t">
              <button
                type="button"
                @click="goBack"
                class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <div class="flex space-x-4">
                <button
                  v-if="hasPasswordChanges"
                  type="button"
                  @click="updatePassword"
                  :disabled="isLoading"
                  class="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
                >
                  <Icon v-if="isLoading" name="lucide:loader-2" class="w-4 h-4 animate-spin inline mr-2" />
                  Update Password
                </button>
                <button
                  type="submit"
                  :disabled="isLoading"
                  class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Icon v-if="isLoading" name="lucide:loader-2" class="w-4 h-4 animate-spin inline mr-2" />
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="mt-8 bg-white rounded-xl shadow-sm border border-red-200">
        <div class="p-6">
          <h3 class="text-lg font-semibold text-red-900 mb-4">Danger Zone</h3>
          <div class="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
            <div>
              <h4 class="font-medium text-red-900">Delete Account</h4>
              <p class="text-sm text-red-700">Permanently delete your account and all associated data</p>
            </div>
            <button
              @click="showDeleteConfirm = true"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl max-w-md w-full p-6">
        <div class="flex items-center mb-4">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <Icon name="lucide:alert-triangle" class="w-6 h-6 text-red-600" />
          </div>
          <h3 class="ml-4 text-lg font-semibold text-gray-900">Delete Account</h3>
        </div>
        <p class="text-gray-600 mb-6">
          Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data.
        </p>
        <div class="flex justify-end space-x-4">
          <button
            @click="showDeleteConfirm = false"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            @click="deleteAccount"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { User } from '~/types'

definePageMeta({
  middleware: 'auth'
})

const { user, updateProfile: updateUserProfile } = useAuth()
const router = useRouter()

const isLoading = ref(false)
const showDeleteConfirm = ref(false)
const errors = ref<Record<string, string>>({})

// Profile form data
const profileForm = ref<Partial<User>>({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  company_name: '',
  bio: '',
  email_notifications: true,
  sms_notifications: false
})

// Password form data
const passwordForm = ref({
  current_password: '',
  new_password: '',
  confirm_password: ''
})

// Initialize form with user data
watchEffect(() => {
  if (user.value) {
    profileForm.value = {
      first_name: user.value.first_name || '',
      last_name: user.value.last_name || '',
      email: user.value.email || '',
      phone: user.value.phone || '',
      company_name: user.value.company_name || '',
      bio: user.value.bio || '',
      email_notifications: user.value.email_notifications ?? true,
      sms_notifications: user.value.sms_notifications ?? false
    }
  }
})

// Check if password form has changes
const hasPasswordChanges = computed(() => {
  return passwordForm.value.current_password || passwordForm.value.new_password || passwordForm.value.confirm_password
})

const validateForm = () => {
  errors.value = {}
  
  if (!profileForm.value.first_name?.trim()) {
    errors.value.first_name = 'First name is required'
  }
  
  if (!profileForm.value.last_name?.trim()) {
    errors.value.last_name = 'Last name is required'
  }
  
  if (!profileForm.value.email?.trim()) {
    errors.value.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.value.email)) {
    errors.value.email = 'Please enter a valid email address'
  }
  
  return Object.keys(errors.value).length === 0
}

const validatePasswordForm = () => {
  const passwordErrors: Record<string, string> = {}
  
  if (!passwordForm.value.current_password) {
    passwordErrors.current_password = 'Current password is required'
  }
  
  if (!passwordForm.value.new_password) {
    passwordErrors.new_password = 'New password is required'
  } else if (passwordForm.value.new_password.length < 8) {
    passwordErrors.new_password = 'Password must be at least 8 characters'
  }
  
  if (passwordForm.value.new_password !== passwordForm.value.confirm_password) {
    passwordErrors.confirm_password = 'Passwords do not match'
  }
  
  errors.value = { ...errors.value, ...passwordErrors }
  return Object.keys(passwordErrors).length === 0
}

const updateProfile = async () => {
  if (!validateForm()) return
  
  isLoading.value = true
  try {
    await updateUserProfile(profileForm.value)
    // Show success message
    console.log('Profile updated successfully')
  } catch (error) {
    console.error('Failed to update profile:', error)
    // Handle error
  } finally {
    isLoading.value = false
  }
}

const updatePassword = async () => {
  if (!validatePasswordForm()) return
  
  isLoading.value = true
  try {
    // Implement password update API call
    console.log('Password updated successfully')
    // Clear password form
    passwordForm.value = {
      current_password: '',
      new_password: '',
      confirm_password: ''
    }
  } catch (error) {
    console.error('Failed to update password:', error)
    // Handle error
  } finally {
    isLoading.value = false
  }
}

const deleteAccount = async () => {
  try {
    // Implement account deletion API call
    console.log('Account deleted')
    await navigateTo('/auth/login')
  } catch (error) {
    console.error('Failed to delete account:', error)
  }
}

const goBack = () => {
  if (user.value?.user_type === 'provider') {
    router.push('/dashboard/provider')
  } else {
    router.push('/dashboard/seeker')
  }
}
</script>