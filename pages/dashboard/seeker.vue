<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-gray-900">DayDeskr</h1>
            <span class="ml-4 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              Desk Seeker
            </span>
          </div>
          <div class="flex items-center space-x-4">
            <button
              @click="showProfile = true"
              class="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
            >
              <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span class="text-white text-sm font-medium">
                  {{ user?.first_name?.charAt(0) }}{{ user?.last_name?.charAt(0) }}
                </span>
              </div>
              <span class="hidden sm:block">{{ user?.first_name }} {{ user?.last_name }}</span>
            </button>
            <button
              @click="handleLogout"
              class="text-gray-500 hover:text-gray-700"
            >
              <Icon name="lucide:log-out" class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Welcome Section -->
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {{ user?.first_name }}!
        </h2>
        <p class="text-gray-600">
          Find and book the perfect workspace for your needs.
        </p>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-sm p-6 border">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon name="lucide:calendar" class="w-6 h-6 text-blue-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Active Bookings</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.activeBookings }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl shadow-sm p-6 border">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Icon name="lucide:map-pin" class="w-6 h-6 text-green-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Favorite Spaces</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.favoriteSpaces }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl shadow-sm p-6 border">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Icon name="lucide:clock" class="w-6 h-6 text-purple-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Hours Booked</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.hoursBooked }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Search Section -->
      <div class="bg-white rounded-xl shadow-sm p-6 border mb-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Find Workspaces</h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <input
              v-model="searchFilters.location"
              type="text"
              placeholder="Enter city or address"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              v-model="searchFilters.date"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Duration</label>
            <select
              v-model="searchFilters.duration"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Any duration</option>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          <div class="flex items-end">
            <button
              @click="searchWorkspaces"
              class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Icon name="lucide:search" class="w-4 h-4 inline mr-2" />
              Search
            </button>
          </div>
        </div>
      </div>

      <!-- Recent Bookings -->
      <div class="bg-white rounded-xl shadow-sm border">
        <div class="p-6 border-b">
          <h3 class="text-lg font-semibold text-gray-900">Recent Bookings</h3>
        </div>
        <div class="p-6">
          <div v-if="recentBookings.length === 0" class="text-center py-8">
            <Icon name="lucide:calendar-x" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-500">No bookings yet</p>
            <p class="text-sm text-gray-400">Start by searching for workspaces above</p>
          </div>
          <div v-else class="space-y-4">
            <div
              v-for="booking in recentBookings"
              :key="booking.id"
              class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Icon name="lucide:building" class="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h4 class="font-medium text-gray-900">{{ booking.workspace_name }}</h4>
                  <p class="text-sm text-gray-600">{{ booking.date }} • {{ booking.duration }}</p>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <span
                  :class="{
                    'bg-green-100 text-green-800': booking.status === 'confirmed',
                    'bg-yellow-100 text-yellow-800': booking.status === 'pending',
                    'bg-red-100 text-red-800': booking.status === 'cancelled'
                  }"
                  class="px-2 py-1 text-xs font-medium rounded-full"
                >
                  {{ booking.status }}
                </span>
                <button class="text-gray-400 hover:text-gray-600">
                  <Icon name="lucide:more-horizontal" class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Profile Modal -->
    <div v-if="showProfile" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl max-w-md w-full p-6">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold text-gray-900">Profile</h3>
          <button @click="showProfile = false" class="text-gray-400 hover:text-gray-600">
            <Icon name="lucide:x" class="w-5 h-5" />
          </button>
        </div>
        <div class="space-y-4">
          <div class="text-center">
            <div class="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-white text-xl font-medium">
                {{ user?.first_name?.charAt(0) }}{{ user?.last_name?.charAt(0) }}
              </span>
            </div>
            <h4 class="text-lg font-medium text-gray-900">{{ user?.first_name }} {{ user?.last_name }}</h4>
            <p class="text-gray-600">{{ user?.email }}</p>
          </div>
          <div class="border-t pt-4">
            <NuxtLink
              to="/profile"
              @click="showProfile = false"
              class="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit Profile
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'seeker']
})

const { user, logout } = useAuth()

const showProfile = ref(false)

// Mock data - replace with real API calls
const stats = ref({
  activeBookings: 3,
  favoriteSpaces: 7,
  hoursBooked: 42
})

const searchFilters = ref({
  location: '',
  date: '',
  duration: ''
})

const recentBookings = ref([
  {
    id: 1,
    workspace_name: 'Downtown Coworking Hub',
    date: 'Dec 15, 2024',
    duration: '9:00 AM - 5:00 PM',
    status: 'confirmed'
  },
  {
    id: 2,
    workspace_name: 'Creative Studio Space',
    date: 'Dec 12, 2024',
    duration: '2:00 PM - 6:00 PM',
    status: 'completed'
  }
])

const searchWorkspaces = () => {
  // Implement workspace search functionality
  console.log('Searching workspaces with filters:', searchFilters.value)
}

const handleLogout = async () => {
  await logout()
}
</script>