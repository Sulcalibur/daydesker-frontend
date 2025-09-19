<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation Header -->
    <header class="bg-white border-b border-gray-200">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div class="w-full py-6 flex items-center justify-between border-b border-indigo-500 lg:border-none">
          <NuxtLink
            to="/"
            class="text-2xl font-bold text-blue-600 hover:text-blue-700"
          >
            DayDeskr
          </NuxtLink>

          <!-- Main Navigation -->
          <nav v-if="isAuthenticated" class="hidden md:flex items-center space-x-8">
              <NuxtLink 
                to="/browse" 
                class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                :class="{ 'text-blue-600 bg-blue-50': $route.path.startsWith('/browse') }"
              >
                Browse
              </NuxtLink>
              <NuxtLink 
                to="/saved" 
                class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                :class="{ 'text-blue-600 bg-blue-50': $route.path.startsWith('/saved') }"
              >
                Saved
              </NuxtLink>
              <NuxtLink 
                to="/trips" 
                class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                :class="{ 'text-blue-600 bg-blue-50': $route.path.startsWith('/trips') }"
              >
                Trips
              </NuxtLink>
              <NuxtLink 
                to="/messages" 
                class="relative text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                :class="{ 'text-blue-600 bg-blue-50': $route.path.startsWith('/messages') }"
              >
                Messages
                <!-- Notification Badge -->
                <span v-if="displayBadge" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {{ totalUnreadCount }}
                </span>
              </NuxtLink>
          </nav>

          <div class="ml-10 space-x-4">
            <!-- Right side - Authentication Links -->
            <div class="flex items-center space-x-4">
              <ClientOnly>
                <template v-if="!isAuthenticated">
                  <NuxtLink 
                    to="/auth/login" 
                    class="text-base font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200"
                  >
                    Sign In
                  </NuxtLink>
                  <NuxtLink 
                    to="/auth/select-type" 
                    class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    Register
                  </NuxtLink>
                </template>
                <template #fallback>
                  <!-- Fallback for SSR -->
                  <NuxtLink 
                    to="/auth/login" 
                    class="text-base font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200"
                  >
                    Sign In
                  </NuxtLink>
                  <NuxtLink 
                    to="/auth/select-type" 
                    class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    Register
                  </NuxtLink>
                </template>
              </ClientOnly>
              <ClientOnly>
                <template v-if="isAuthenticated">
                <div class="relative" ref="userMenuRef">
                  <button 
                    @click="toggleUserMenu" 
                    class="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors duration-200"
                  >
                    <!-- Enhanced Avatar with Profile Picture Support -->
                    <div class="relative">
                      <div v-if="user?.profilePicture" class="w-8 h-8 rounded-full overflow-hidden">
                        <img :src="user.profilePicture" :alt="user.name" class="w-full h-full object-cover">
                      </div>
                      <div v-else class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span class="text-sm font-medium text-white">{{ user?.name?.charAt(0).toUpperCase() || 'U' }}</span>
                      </div>
                      <!-- Online Status Indicator -->
                      <span class="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white"></span>
                    </div>
                    <span class="font-medium">{{ user?.name || 'User' }}</span>
                    <ChevronDownIcon class="w-4 h-4" />
                  </button>
                  
                  <!-- User Dropdown Menu -->
                  <div 
                    v-show="showUserMenu" 
                    class="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg py-2 z-50 border border-gray-100"
                  >
                    <!-- User Info Section -->
                    <div class="px-4 py-3 border-b border-gray-100">
                      <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span class="text-white font-semibold text-sm">{{ user?.name?.charAt(0) || 'U' }}</span>
                        </div>
                        <div>
                          <p class="text-sm font-medium text-gray-900">{{ user?.name || 'User' }}</p>
                          <p class="text-xs text-gray-500">{{ user?.email }}</p>
                        </div>
                      </div>
                    </div>

                    <!-- Main Menu Items -->
                    <div class="py-1">
                      <NuxtLink :to="authStore.getDashboardRoute()" class="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors" @click="closeUserMenu">
                        <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                        </svg>
                        Dashboard
                      </NuxtLink>
                      
                      <NuxtLink to="/profile" class="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors" @click="closeUserMenu">
                        <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                        Profile
                      </NuxtLink>
                      
                      <NuxtLink to="/bookings" class="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors" @click="closeUserMenu">
                        <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        My Bookings
                      </NuxtLink>
                      
                      <NuxtLink to="/wishlists" class="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors" @click="closeUserMenu">
                        <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                        </svg>
                        Wishlists
                      </NuxtLink>
                      
                      <NuxtLink to="/messages" class="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors" @click="closeUserMenu">
                        <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                        </svg>
                        Messages
                      </NuxtLink>
                    </div>

                    <div class="border-t border-gray-100 py-1">
                      <NuxtLink to="/account/settings" class="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors" @click="closeUserMenu">
                        <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        Account Settings
                      </NuxtLink>
                      
                      <NuxtLink to="/help" class="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors" @click="closeUserMenu">
                        <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Help Center
                      </NuxtLink>
                    </div>

                    <!-- Become a Host Section -->
                    <div class="border-t border-gray-100 py-1">
                      <NuxtLink to="/become-host" class="flex items-center px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors" @click="closeUserMenu">
                        <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                        </svg>
                        Become a Host
                      </NuxtLink>
                    </div>

                    <div class="border-t border-gray-100 py-1">
                      <button 
                        @click="handleLogout" 
                        class="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                        </svg>
                        Log out
                      </button>
                    </div>
                  </div>
                </div>
                </template>
              </ClientOnly>
            </div>
          </div>
        </div>

        <!-- Mobile menu button -->
        <div class="md:hidden flex items-center space-x-2">
          <!-- Mobile Auth Links -->
          <ClientOnly>
            <template v-if="!isAuthenticated">
              <NuxtLink 
                to="/auth/login" 
                class="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                Sign In
              </NuxtLink>
              <NuxtLink 
                to="/auth/select-type" 
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
          </ClientOnly>
          
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
      
      <!-- Mobile menu overlay -->
      <div 
        v-if="mobileMenuOpen" 
        class="fixed inset-0 z-50 md:hidden"
        @click="mobileMenuOpen = false"
      >
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
        
        <!-- Mobile menu panel -->
        <div 
          class="fixed top-0 right-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out"
          @click.stop
        >
          <!-- Mobile menu header -->
          <div class="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Menu</h2>
            <button 
              @click="mobileMenuOpen = false"
              class="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Mobile menu content -->
          <div class="flex-1 overflow-y-auto">
            <!-- User section (if authenticated) -->
            <ClientOnly>
              <div v-if="isAuthenticated" class="p-4 border-b border-gray-200">
                <div class="flex items-center space-x-3">
                  <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span class="text-white font-semibold">{{ user?.name?.charAt(0) || 'U' }}</span>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ user?.name || 'User' }}</p>
                    <p class="text-sm text-gray-500">{{ user?.email }}</p>
                  </div>
                </div>
              </div>

              <!-- Main navigation -->
              <div v-if="isAuthenticated" class="py-2">
                <NuxtLink 
                  to="/browse" 
                  class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  @click="mobileMenuOpen = false"
                >
                  <svg class="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                  Browse Workspaces
                </NuxtLink>
                
                <NuxtLink 
                  to="/saved" 
                  class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  @click="mobileMenuOpen = false"
                >
                  <svg class="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                  Saved
                </NuxtLink>
                
                <NuxtLink 
                  to="/trips" 
                  class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  @click="mobileMenuOpen = false"
                >
                  <svg class="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  My Trips
                </NuxtLink>
                
                <NuxtLink 
                  to="/messages" 
                  class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  @click="mobileMenuOpen = false"
                >
                  <svg class="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                  </svg>
                  Messages
                </NuxtLink>
              </div>

              <!-- Authenticated user options -->
              <div v-if="isAuthenticated" class="border-t border-gray-200 py-2">
                <NuxtLink 
                  to="/profile" 
                  class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  @click="mobileMenuOpen = false"
                >
                  <svg class="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  Profile
                </NuxtLink>
                
                <NuxtLink 
                  to="/account/settings" 
                  class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  @click="mobileMenuOpen = false"
                >
                  <svg class="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  Account Settings
                </NuxtLink>
                
                <NuxtLink 
                  to="/become-host" 
                  class="flex items-center px-4 py-3 text-gray-900 font-medium hover:bg-gray-50 transition-colors"
                  @click="mobileMenuOpen = false"
                >
                  <svg class="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                  Become a Host
                </NuxtLink>
                
                <button 
                  @click="handleLogout" 
                  class="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                >
                  <svg class="w-5 h-5 mr-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                  </svg>
                  Sign Out
                </button>
              </div>
            </ClientOnly>

            <!-- Guest options -->
            <ClientOnly>
              <div v-if="!isAuthenticated" class="border-t border-gray-200 py-2">
              <NuxtLink 
                to="/auth/login" 
                class="flex items-center px-4 py-3 text-blue-600 hover:bg-blue-50 transition-colors"
                @click="mobileMenuOpen = false"
              >
                <svg class="w-5 h-5 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                Sign In
              </NuxtLink>
              
              <NuxtLink 
                to="/auth/select-type" 
                class="flex items-center px-4 py-3 text-blue-600 hover:bg-blue-50 transition-colors"
                @click="mobileMenuOpen = false"
              >
                <svg class="w-5 h-5 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                </svg>
                Sign Up
              </NuxtLink>
              </div>
            </ClientOnly>
          </div>
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
          <div class="text-center space-y-2">
            <p class="text-base text-gray-400">
              &copy; {{ currentYear }} DayDeskr. All rights reserved.
            </p>
            <p class="text-sm text-gray-400">
              Made with ❤️ whilst in 🇵🇹
            </p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { ChevronDownIcon } from '@heroicons/vue/24/outline'
import { useAuth } from '~/composables/useAuth'
import { useNotifications } from '~/composables/useNotifications'
import { useAuthStore } from '~/stores/auth'

// Authentication state
const { isAuthenticated, user, logout } = useAuth()
const authStore = useAuthStore()

// Notification state
const { displayBadge, totalUnreadCount, initializeNotifications } = useNotifications()

// Computed
const currentYear = computed(() => {
  return new Date().getFullYear()
})

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
  // Comprehensive null checks to prevent DOM manipulation errors
  if (!event.target || !userMenuRef.value) {
    return
  }
  
  // Ensure the target is a valid Node and userMenuRef has contains method
  const target = event.target as Node
  if (target && userMenuRef.value.contains && typeof userMenuRef.value.contains === 'function') {
    try {
      if (!userMenuRef.value.contains(target)) {
        closeUserMenu()
      }
    } catch (error) {
      // Silently handle any DOM access errors during hydration
      console.warn('DOM access error in handleClickOutside:', error)
    }
  }
}

// Lifecycle hooks
onMounted(() => {
  // Only add event listeners on client side to prevent SSR issues
  if (process.client) {
    // Use nextTick to ensure DOM is fully rendered
    nextTick(() => {
      try {
        document.addEventListener('click', handleClickOutside)
      } catch (error) {
        console.warn('Failed to add click event listener:', error)
      }
    })
  }
  
  // Initialize notifications when component mounts
  try {
    initializeNotifications()
  } catch (error) {
    console.warn('Failed to initialize notifications:', error)
  }
})

onUnmounted(() => {
  // Only remove event listeners on client side
  if (process.client) {
    try {
      document.removeEventListener('click', handleClickOutside)
    } catch (error) {
      console.warn('Failed to remove click event listener:', error)
    }
  }
})
</script>