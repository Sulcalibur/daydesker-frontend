<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-gray-900">DayDeskr</h1>
            <span class="ml-4 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
              Workspace Provider
            </span>
          </div>
          <div class="flex items-center space-x-4">
            <button
              @click="showProfile = true"
              class="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
            >
              <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span class="text-white text-sm font-medium">
                  {{ user?.name?.split(' ').map(n => n.charAt(0)).join('') || 'U' }}
                </span>
              </div>
              <span class="hidden sm:block">{{ user?.name || 'User' }}</span>
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
          Welcome back, {{ user?.name?.split(' ')[0] || user?.name }}!
        </h2>
        <p class="text-gray-600">
          Manage your workspaces and bookings from your dashboard.
        </p>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-sm p-6 border">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon name="lucide:building" class="w-6 h-6 text-blue-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Workspaces</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.totalWorkspaces }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl shadow-sm p-6 border">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Icon name="lucide:calendar-check" class="w-6 h-6 text-green-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Active Bookings</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.activeBookings }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl shadow-sm p-6 border">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Icon name="lucide:dollar-sign" class="w-6 h-6 text-yellow-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p class="text-2xl font-bold text-gray-900">${{ stats.monthlyRevenue }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl shadow-sm p-6 border">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Icon name="lucide:star" class="w-6 h-6 text-purple-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Avg Rating</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.avgRating }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap gap-4 mb-8">
        <button
          @click="showAddWorkspace = true"
          class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Icon name="lucide:plus" class="w-5 h-5" />
          <span>Add Workspace</span>
        </button>
        <button class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <Icon name="lucide:bar-chart" class="w-5 h-5" />
          <span>View Analytics</span>
        </button>
        <button class="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2">
          <Icon name="lucide:settings" class="w-5 h-5" />
          <span>Settings</span>
        </button>
      </div>

      <!-- Workspaces Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- My Workspaces -->
        <div class="bg-white rounded-xl shadow-sm border">
          <div class="p-6 border-b">
            <h3 class="text-lg font-semibold text-gray-900">My Workspaces</h3>
          </div>
          <div class="p-6">
            <div v-if="workspaces.length === 0" class="text-center py-8">
              <Icon name="lucide:building-2" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p class="text-gray-500">No workspaces yet</p>
              <p class="text-sm text-gray-400">Add your first workspace to get started</p>
            </div>
            <div v-else class="space-y-4">
              <div
                v-for="workspace in workspaces"
                :key="workspace.id"
                class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h4 class="font-medium text-gray-900 mb-1">{{ workspace.name }}</h4>
                    <p class="text-sm text-gray-600 mb-2">{{ workspace.location }}</p>
                    <div class="flex items-center space-x-4 text-sm text-gray-500">
                      <span class="flex items-center">
                        <Icon name="lucide:users" class="w-4 h-4 mr-1" />
                        {{ workspace.capacity }} people
                      </span>
                      <span class="flex items-center">
                        <Icon name="lucide:dollar-sign" class="w-4 h-4 mr-1" />
                        ${{ workspace.price }}/day
                      </span>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span
                      :class="{
                        'bg-green-100 text-green-800': workspace.status === 'active',
                        'bg-yellow-100 text-yellow-800': workspace.status === 'pending',
                        'bg-red-100 text-red-800': workspace.status === 'inactive'
                      }"
                      class="px-2 py-1 text-xs font-medium rounded-full"
                    >
                      {{ workspace.status }}
                    </span>
                    <button class="text-gray-400 hover:text-gray-600">
                      <Icon name="lucide:more-horizontal" class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
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
              <p class="text-sm text-gray-400">Bookings will appear here once customers book your spaces</p>
            </div>
            <div v-else class="space-y-4">
              <div
                v-for="booking in recentBookings"
                :key="booking.id"
                class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h4 class="font-medium text-gray-900 mb-1">{{ booking.customer_name }}</h4>
                    <p class="text-sm text-gray-600 mb-1">{{ booking.workspace_name }}</p>
                    <p class="text-sm text-gray-500">{{ booking.date }} • {{ booking.duration }}</p>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="text-sm font-medium text-gray-900">${{ booking.amount }}</span>
                    <span
                      :class="{
                        'bg-green-100 text-green-800': booking.status === 'confirmed',
                        'bg-yellow-100 text-yellow-800': booking.status === 'pending',
                        'bg-blue-100 text-blue-800': booking.status === 'completed'
                      }"
                      class="px-2 py-1 text-xs font-medium rounded-full"
                    >
                      {{ booking.status }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Add Workspace Modal -->
    <div v-if="showAddWorkspace" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold text-gray-900">Add New Workspace</h3>
            <button @click="showAddWorkspace = false" class="text-gray-400 hover:text-gray-600">
              <Icon name="lucide:x" class="w-5 h-5" />
            </button>
          </div>
        </div>
        <div class="p-6">
          <form @submit.prevent="addWorkspace" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Workspace Name</label>
                <input
                  v-model="newWorkspace.name"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter workspace name"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  v-model="newWorkspace.location"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter location"
                />
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
                <input
                  v-model="newWorkspace.capacity"
                  type="number"
                  required
                  min="1"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Number of people"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Price per Day</label>
                <input
                  v-model="newWorkspace.price"
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Price in USD"
                />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                v-model="newWorkspace.description"
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Describe your workspace..."
              ></textarea>
            </div>
            <div class="flex justify-end space-x-4">
              <button
                type="button"
                @click="showAddWorkspace = false"
                class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Add Workspace
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

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
            <div class="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-white text-xl font-medium">
                {{ user?.name?.split(' ').map(n => n.charAt(0)).join('') || 'U' }}
              </span>
            </div>
            <h4 class="text-lg font-medium text-gray-900">{{ user?.name || 'User' }}</h4>
            <p class="text-gray-600">{{ user?.email }}</p>
            <p class="text-sm text-gray-500">{{ user?.company_name }}</p>
          </div>
          <div class="border-t pt-4">
            <NuxtLink
              to="/profile"
              @click="showProfile = false"
              class="block w-full text-center bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
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
  middleware: ['auth', 'provider']
})

const { user, logout } = useAuth()

const showProfile = ref(false)
const showAddWorkspace = ref(false)

// Mock data - replace with real API calls
const stats = ref({
  totalWorkspaces: 5,
  activeBookings: 12,
  monthlyRevenue: 3450,
  avgRating: 4.8
})

const workspaces = ref([
  {
    id: 1,
    name: 'Downtown Office Suite',
    location: 'New York, NY',
    capacity: 10,
    price: 150,
    status: 'active'
  },
  {
    id: 2,
    name: 'Creative Studio Space',
    location: 'Brooklyn, NY',
    capacity: 6,
    price: 120,
    status: 'active'
  }
])

const recentBookings = ref([
  {
    id: 1,
    customer_name: 'John Smith',
    workspace_name: 'Downtown Office Suite',
    date: 'Dec 15, 2024',
    duration: '9:00 AM - 5:00 PM',
    amount: 150,
    status: 'confirmed'
  },
  {
    id: 2,
    customer_name: 'Sarah Johnson',
    workspace_name: 'Creative Studio Space',
    date: 'Dec 14, 2024',
    duration: '2:00 PM - 6:00 PM',
    amount: 60,
    status: 'completed'
  }
])

const newWorkspace = ref({
  name: '',
  location: '',
  capacity: null,
  price: null,
  description: ''
})

const addWorkspace = () => {
  // Implement add workspace functionality
  console.log('Adding workspace:', newWorkspace.value)
  showAddWorkspace.value = false
  // Reset form
  newWorkspace.value = {
    name: '',
    location: '',
    capacity: null,
    price: null,
    description: ''
  }
}

const handleLogout = async () => {
  await logout()
}
</script>