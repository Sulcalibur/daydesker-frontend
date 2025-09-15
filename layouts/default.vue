<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation Header -->
    <header class="bg-white border-b border-gray-200">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div class="w-full py-6 flex items-center justify-between border-b border-indigo-500 lg:border-none">
          <div class="flex items-center">
            <NuxtLink
              to="/"
              class="text-2xl font-bold text-blue-600 hover:text-blue-700"
            >
              DayDeskr
            </NuxtLink>
          </div>

          <div class="ml-10 space-x-4">
            <!-- Right side - Authentication Links -->
            <div class="flex items-center space-x-4">
              <template v-if="!isAuthenticated">
                <NuxtLink 
                  to="/auth/login" 
                  class="text-base font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200"
                >
                  Sign In
                </NuxtLink>
                <NuxtLink 
                  to="/auth/register" 
                  class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Register
                </NuxtLink>
              </template>
              <template v-else>
                <div class="relative" ref="userMenuRef">
                  <button 
                    @click="toggleUserMenu" 
                    class="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors duration-200"
                  >
                    <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span class="text-white text-sm font-medium">
                        {{ user?.name?.charAt(0).toUpperCase() || 'U' }}
                      </span>
                    </div>
                    <span class="font-medium">{{ user?.name || 'User' }}</span>
                    <ChevronDownIcon class="w-4 h-4" />
                  </button>
                  
                  <!-- User Dropdown Menu -->
                  <div 
                    v-show="showUserMenu" 
                    class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                  >
                    <NuxtLink 
                      to="/dashboard" 
                      class="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      @click="closeUserMenu"
                    >
                      Dashboard
                    </NuxtLink>
                    <NuxtLink 
                      to="/profile" 
                      class="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      @click="closeUserMenu"
                    >
                      Profile
                    </NuxtLink>
                    <hr class="my-2 border-gray-200">
                    <button 
                      @click="handleLogout" 
                      class="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors duration-200"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Mobile menu button -->
        <div class="md:hidden flex items-center space-x-2">
          <!-- Mobile Auth Links -->
          <template v-if="!isAuthenticated">
            <NuxtLink 
              to="/auth/login" 
              class="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200"
            >
              Sign In
            </NuxtLink>
            <NuxtLink 
              to="/auth/register" 
              class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Register
            </NuxtLink>
          </template>
          <template v-else>
            <button 
              @click="toggleUserMenu" 
              class="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors duration-200"
            >
              <div class="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <span class="text-white text-xs font-medium">
                  {{ user?.name?.charAt(0).toUpperCase() || 'U' }}
                </span>
              </div>
            </button>
          </template>
          
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900 ml-2"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                v-if="!mobileMenuOpen"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
              <path
                v-else
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </nav>
      
      <!-- Mobile Menu -->
      <div v-show="mobileMenuOpen" class="md:hidden bg-white border-t border-gray-200">
        <div class="px-4 py-4 space-y-4">
          <NuxtLink
            to="/"
            class="block text-base font-medium text-gray-500 hover:text-gray-900"
            active-class="text-blue-600"
            @click="mobileMenuOpen = false"
          >
            Browse Workspaces
          </NuxtLink>
          
          <template v-if="isAuthenticated">
            <hr class="border-gray-200">
            <NuxtLink
              to="/dashboard"
              class="block text-base font-medium text-gray-500 hover:text-gray-900"
              active-class="text-blue-600"
              @click="mobileMenuOpen = false"
            >
              Dashboard
            </NuxtLink>
            <NuxtLink
              to="/profile"
              class="block text-base font-medium text-gray-500 hover:text-gray-900"
              active-class="text-blue-600"
              @click="mobileMenuOpen = false"
            >
              Profile
            </NuxtLink>
            <button
              @click="handleLogout"
              class="block w-full text-left text-base font-medium text-red-600 hover:text-red-700"
            >
              Sign Out
            </button>
          </template>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main>
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 mt-16">
      <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div class="col-span-2">
            <div class="text-2xl font-bold text-blue-600 mb-4">DayDeskr</div>
            <p class="text-gray-600 mb-4">
              Find and book flexible workspaces, meeting rooms, and offices in your area.
            </p>
          </div>

          <div>
            <h3 class="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">
              Company
            </h3>
            <ul class="space-y-3">
              <li>
                <span class="text-base text-gray-500">About</span>
              </li>
              <li>
                <span class="text-base text-gray-500">Contact</span>
              </li>
              <li>
                <span class="text-base text-gray-500">Privacy</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 class="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">
              Support
            </h3>
            <ul class="space-y-3">
              <li>
                <span class="text-base text-gray-500">Help Center</span>
              </li>
              <li>
                <span class="text-base text-gray-500">Guidelines</span>
              </li>
            </ul>
          </div>
        </div>

        <div class="mt-8 border-t border-gray-200 pt-8">
          <p class="text-base text-gray-400 text-center">
            &copy; 2024 DayDeskr. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ChevronDownIcon } from '@heroicons/vue/24/outline'
import { useAuth } from '~/composables/useAuth'

// Authentication state
const { isAuthenticated, user, logout } = useAuth()

// UI state
const showUserMenu = ref(false)
const mobileMenuOpen = ref(false)
const userMenuRef = ref<HTMLElement | null>(null)

// User menu handlers
function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value
}

function closeUserMenu() {
  showUserMenu.value = false
}

// Logout handler
async function handleLogout() {
  try {
    await logout()
    closeUserMenu()
    mobileMenuOpen.value = false
    await navigateTo('/auth/login')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

// Click outside handler for user menu
function handleClickOutside(event: Event) {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target as Node)) {
    closeUserMenu()
  }
}

// Lifecycle hooks
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>