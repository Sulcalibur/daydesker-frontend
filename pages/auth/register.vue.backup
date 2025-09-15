<script setup lang="ts">
import { ref } from 'vue'
import { navigateTo } from '#app'

// Define user types
type UserType = 'desk_seeker' | 'workspace_provider'

// State
const selectedUserType = ref<UserType | null>(null)
const isLoading = ref(false)

// Methods
function selectUserType(type: UserType) {
  selectedUserType.value = type
}

async function proceedToRegistration() {
  if (!selectedUserType.value) return
  
  isLoading.value = true
  
  try {
    if (selectedUserType.value === 'desk_seeker') {
      await navigateTo('/auth/register/seeker')
    } else {
      await navigateTo('/auth/register/provider')
    }
  } catch (error) {
    console.error('Navigation error:', error)
  } finally {
    isLoading.value = false
  }
}

// Meta
useHead({
  title: 'Register - DayDeskr',
  meta: [
    { name: 'description', content: 'Choose your account type to get started with DayDeskr' }
  ]
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="flex justify-center">
        <NuxtLink to="/" class="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
          DayDeskr
        </NuxtLink>
      </div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Create your account
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Choose how you'll use DayDeskr
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <div class="space-y-6">
          <!-- User Type Selection -->
          <div class="space-y-4">
            <label class="text-base font-medium text-gray-900">
              I want to:
            </label>
            <div class="space-y-3">
              <!-- Desk Seeker Option -->
              <div 
                @click="selectUserType('desk_seeker')"
                :class="[
                  'relative rounded-lg border p-4 cursor-pointer transition-all duration-200',
                  selectedUserType === 'desk_seeker'
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                ]"
              >
                <div class="flex items-start">
                  <div class="flex items-center h-5">
                    <input
                      type="radio"
                      name="user-type"
                      value="desk_seeker"
                      :checked="selectedUserType === 'desk_seeker'"
                      class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                      readonly
                    >
                  </div>
                  <div class="ml-3">
                    <div class="text-sm font-medium text-gray-900">
                      Find a workspace
                    </div>
                    <div class="text-sm text-gray-500">
                      I'm looking for a desk or workspace to rent
                    </div>
                  </div>
                </div>
              </div>

              <!-- Workspace Provider Option -->
              <div 
                @click="selectUserType('workspace_provider')"
                :class="[
                  'relative rounded-lg border p-4 cursor-pointer transition-all duration-200',
                  selectedUserType === 'workspace_provider'
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                ]"
              >
                <div class="flex items-start">
                  <div class="flex items-center h-5">
                    <input
                      type="radio"
                      name="user-type"
                      value="workspace_provider"
                      :checked="selectedUserType === 'workspace_provider'"
                      class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                      readonly
                    >
                  </div>
                  <div class="ml-3">
                    <div class="text-sm font-medium text-gray-900">
                      List my workspace
                    </div>
                    <div class="text-sm text-gray-500">
                      I have a workspace to rent out
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Continue Button -->
          <div>
            <button
              @click="proceedToRegistration"
              :disabled="!selectedUserType || isLoading"
              :class="[
                'w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors duration-200',
                selectedUserType && !isLoading
                  ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  : 'bg-gray-300 cursor-not-allowed'
              ]"
            >
              <span v-if="isLoading" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
              <span v-else>
                Continue
              </span>
            </button>
          </div>

          <!-- Navigation Links -->
          <div class="flex items-center justify-between text-sm">
            <NuxtLink 
              to="/auth/login" 
              class="text-blue-600 hover:text-blue-500 transition-colors"
            >
              Already have an account? Sign in
            </NuxtLink>
            <NuxtLink 
              to="/" 
              class="text-gray-600 hover:text-gray-500 transition-colors"
            >
              Back to home
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Additional custom styles if needed */
</style>