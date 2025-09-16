<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->


    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Welcome Section -->
      <div class="mb-8">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 class="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {{ user?.name?.split(' ')[0] || user?.name }}!
            </h2>
            <p class="text-gray-600">
              Find and book the perfect workspace for your needs.
            </p>
          </div>
          <!-- Quick Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
            <NuxtLink
              to="/browse"
              class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Icon name="lucide:search" class="w-4 h-4 mr-2" />
              Browse Workspaces
            </NuxtLink>
            <NuxtLink
              to="/saved"
              class="inline-flex items-center px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Icon name="lucide:heart" class="w-4 h-4 mr-2" />
              View Saved
            </NuxtLink>

          </div>
        </div>
      </div>

      <!-- Enhanced Quick Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-sm p-6 border hover:shadow-md transition-shadow cursor-pointer group">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Icon name="lucide:calendar" class="w-6 h-6 text-white" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Active Bookings</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.activeBookings }}</p>
              </div>
            </div>
            <Icon name="lucide:arrow-right" class="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <div class="mt-4 pt-4 border-t border-gray-100">
            <p class="text-xs text-gray-500">+2 from last month</p>
          </div>
        </div>
        
        <div class="bg-white rounded-xl shadow-sm p-6 border hover:shadow-md transition-shadow cursor-pointer group">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Icon name="lucide:heart" class="w-6 h-6 text-white" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Saved Spaces</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.favoriteSpaces }}</p>
              </div>
            </div>
            <Icon name="lucide:arrow-right" class="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
          </div>
          <div class="mt-4 pt-4 border-t border-gray-100">
            <p class="text-xs text-gray-500">3 new this week</p>
          </div>
        </div>
        
        <div class="bg-white rounded-xl shadow-sm p-6 border hover:shadow-md transition-shadow cursor-pointer group">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Icon name="lucide:clock" class="w-6 h-6 text-white" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Hours Booked</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.hoursBooked }}</p>
              </div>
            </div>
            <Icon name="lucide:arrow-right" class="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
          </div>
          <div class="mt-4 pt-4 border-t border-gray-100">
            <p class="text-xs text-gray-500">12h this month</p>
          </div>
        </div>
      </div>

      <!-- Personalized Recommendations -->
      <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border border-blue-100">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Recommended for You</h3>
            <p class="text-sm text-gray-600">Based on your booking history and preferences</p>
          </div>
          <Icon name="lucide:sparkles" class="w-6 h-6 text-blue-600" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icon name="lucide:coffee" class="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 class="font-medium text-gray-900">Cozy Coffee Co-working</h4>
                <p class="text-sm text-gray-600">Downtown • $15/hour</p>
                <div class="flex items-center mt-1">
                  <div class="flex text-yellow-400">
                    <Icon name="lucide:star" class="w-4 h-4 fill-current" />
                    <Icon name="lucide:star" class="w-4 h-4 fill-current" />
                    <Icon name="lucide:star" class="w-4 h-4 fill-current" />
                    <Icon name="lucide:star" class="w-4 h-4 fill-current" />
                    <Icon name="lucide:star" class="w-4 h-4 fill-current" />
                  </div>
                  <span class="text-xs text-gray-500 ml-1">4.9 (127)</span>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Icon name="lucide:building" class="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 class="font-medium text-gray-900">Modern Business Hub</h4>
                <p class="text-sm text-gray-600">Business District • $25/hour</p>
                <div class="flex items-center mt-1">
                  <div class="flex text-yellow-400">
                    <Icon name="lucide:star" class="w-4 h-4 fill-current" />
                    <Icon name="lucide:star" class="w-4 h-4 fill-current" />
                    <Icon name="lucide:star" class="w-4 h-4 fill-current" />
                    <Icon name="lucide:star" class="w-4 h-4 fill-current" />
                    <Icon name="lucide:star" class="w-4 h-4" />
                  </div>
                  <span class="text-xs text-gray-500 ml-1">4.7 (89)</span>
                </div>
              </div>
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
                {{ user?.name?.split(' ').map(n => n.charAt(0)).join('') || 'U' }}
              </span>
            </div>
            <h4 class="text-lg font-medium text-gray-900">{{ user?.name || 'User' }}</h4>
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