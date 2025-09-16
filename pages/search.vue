<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// Search parameters from URL
const searchQuery = ref(route.query.search as string || '');
const workspaceType = ref(route.query.type as string || '');
const selectedDate = ref(route.query.date as string || '');

// Search state
const isLoading = ref(false);
const searchResults = ref([]);
const currentPage = ref(1);
const itemsPerPage = 12;

// Mock workspace data (same structure as index.vue)
const mockWorkspaces = [
  {
    id: 1,
    name: 'Coworking Nazaré',
    location: 'Nazaré, Portugal',
    type: 'desk',
    price: 25,
    rating: 4.8,
    reviews: 124,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
    amenities: ['WiFi', 'Coffee', 'Parking'],
    capacity: 50,
    available: true
  },
  {
    id: 2,
    name: 'Surf & Work Nazaré',
    location: 'Nazaré, Portugal',
    type: 'desk',
    price: 30,
    rating: 4.9,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&h=300&fit=crop',
    amenities: ['WiFi', 'Ocean View', 'Surf Boards'],
    capacity: 25,
    available: true
  },
  {
    id: 3,
    name: 'Creative Hub Nazaré',
    location: 'Nazaré, Portugal',
    type: 'meeting-room',
    price: 45,
    rating: 4.7,
    reviews: 67,
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
    amenities: ['WiFi', 'Projector', 'Whiteboard'],
    capacity: 12,
    available: true
  }
];

// Computed properties
const filteredResults = computed(() => {
  let results = mockWorkspaces;
  
  // Filter by location
  if (searchQuery.value) {
    results = results.filter(workspace => 
      workspace.location.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      workspace.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }
  
  // Filter by type
  if (workspaceType.value) {
    results = results.filter(workspace => workspace.type === workspaceType.value);
  }
  
  return results;
});

const paginatedResults = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredResults.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredResults.value.length / itemsPerPage);
});

// Methods
function updateSearch() {
  const query = {
    search: searchQuery.value || undefined,
    type: workspaceType.value || undefined,
    date: selectedDate.value || undefined
  };
  
  router.push({ path: '/search', query });
}

function getWorkspaceIcon(type: string) {
  const icons = {
    'desk': '💻',
    'meeting-room': '🏢',
    'private-office': '🏠',
    'event-space': '🎉'
  };
  return icons[type] || '💼';
}

function getBadgeClass(rating: number) {
  if (rating >= 4.5) return 'bg-green-100 text-green-800';
  if (rating >= 4.0) return 'bg-blue-100 text-blue-800';
  if (rating >= 3.5) return 'bg-yellow-100 text-yellow-800';
  return 'bg-gray-100 text-gray-800';
}

function formatCapacity(capacity: number) {
  return capacity > 99 ? '99+' : capacity.toString();
}

function getInitials(name: string) {
  return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
}

function handleImageError(event: Event) {
  const target = event.target as HTMLImageElement;
  target.style.display = 'none';
  const fallback = target.nextElementSibling as HTMLElement;
  if (fallback) fallback.style.display = 'flex';
}

function goToWorkspace(id: number) {
  router.push(`/workspaces/${id}`);
}

// Initialize search on mount
onMounted(() => {
  searchResults.value = filteredResults.value;
});

// Watch for route changes
watch(() => route.query, (newQuery) => {
  searchQuery.value = newQuery.search as string || '';
  workspaceType.value = newQuery.type as string || '';
  selectedDate.value = newQuery.date as string || '';
}, { immediate: true });
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Search Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div class="flex-1">
            <h1 class="text-2xl font-bold text-gray-900 mb-2">Search Results</h1>
            <p class="text-gray-600">
              <span v-if="searchQuery">Showing results for "{{ searchQuery }}"</span>
              <span v-else>Browse all workspaces</span>
              <span v-if="filteredResults.length > 0" class="ml-2">
                ({{ filteredResults.length }} {{ filteredResults.length === 1 ? 'result' : 'results' }})
              </span>
            </p>
          </div>
          
          <!-- Search Filters -->
          <div class="flex flex-col sm:flex-row gap-4">
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Where?"
                class="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                @input="updateSearch"
              >
            </div>
            
            <select
              v-model="workspaceType"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @change="updateSearch"
            >
              <option value="">All Types</option>
              <option value="desk">Desk</option>
              <option value="meeting-room">Meeting Room</option>
              <option value="private-office">Private Office</option>
              <option value="event-space">Event Space</option>
            </select>
            
            <input
              v-model="selectedDate"
              type="date"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @change="updateSearch"
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Search Results -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Searching workspaces...</p>
      </div>

      <!-- No Results -->
      <div v-else-if="filteredResults.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">🔍</div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">No workspaces found</h3>
        <p class="text-gray-600 mb-6">
          <span v-if="searchQuery">We couldn't find any workspaces matching "{{ searchQuery }}"</span>
          <span v-else>No workspaces match your current filters</span>
        </p>
        <button
          @click="router.push('/')"
          class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to Home
        </button>
      </div>

      <!-- Results Grid -->
      <div v-else>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div
            v-for="workspace in paginatedResults"
            :key="workspace.id"
            class="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
            @click="goToWorkspace(workspace.id)"
          >
            <div class="relative">
              <img
                :src="workspace.image"
                :alt="workspace.name"
                class="w-full h-48 object-cover rounded-t-xl group-hover:scale-105 transition-transform duration-300"
                @error="handleImageError"
              >
              <div
                class="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-xl hidden items-center justify-center"
              >
                <span class="text-white text-2xl font-bold">{{ getInitials(workspace.name) }}</span>
              </div>
              <div class="absolute top-3 right-3">
                <span :class="getBadgeClass(workspace.rating)" class="px-2 py-1 rounded-full text-xs font-medium">
                  ⭐ {{ workspace.rating }}
                </span>
              </div>
            </div>
            
            <div class="p-4">
              <div class="flex items-start justify-between mb-2">
                <h3 class="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {{ workspace.name }}
                </h3>
                <span class="text-lg">{{ getWorkspaceIcon(workspace.type) }}</span>
              </div>
              
              <p class="text-sm text-gray-600 mb-3">{{ workspace.location }}</p>
              
              <div class="flex items-center justify-between mb-3">
                <span class="text-lg font-bold text-gray-900">
                  €{{ workspace.price }}<span class="text-sm font-normal text-gray-500">/day</span>
                </span>
                <span class="text-xs text-gray-500">
                  {{ formatCapacity(workspace.capacity) }} people
                </span>
              </div>
              
              <div class="flex flex-wrap gap-1 mb-3">
                <span
                  v-for="amenity in workspace.amenities.slice(0, 3)"
                  :key="amenity"
                  class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  {{ amenity }}
                </span>
                <span
                  v-if="workspace.amenities.length > 3"
                  class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  +{{ workspace.amenities.length - 3 }}
                </span>
              </div>
              
              <div class="flex items-center justify-between">
                <span class="text-xs text-gray-500">{{ workspace.reviews }} reviews</span>
                <span
                  :class="workspace.available ? 'text-green-600' : 'text-red-600'"
                  class="text-xs font-medium"
                >
                  {{ workspace.available ? 'Available' : 'Booked' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex justify-center mt-8">
          <nav class="flex items-center space-x-2">
            <button
              :disabled="currentPage === 1"
              @click="currentPage--"
              class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <span
              v-for="page in totalPages"
              :key="page"
              :class="{
                'bg-blue-600 text-white': page === currentPage,
                'bg-white text-gray-700 hover:bg-gray-50': page !== currentPage
              }"
              class="px-3 py-2 text-sm font-medium border border-gray-300 rounded-md cursor-pointer"
              @click="currentPage = page"
            >
              {{ page }}
            </span>
            
            <button
              :disabled="currentPage === totalPages"
              @click="currentPage++"
              class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Additional custom styles if needed */
</style>