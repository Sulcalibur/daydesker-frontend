<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading State -->
    <div v-if="pending" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="animate-pulse">
        <!-- Image Gallery Skeleton -->
        <div class="h-96 bg-gray-200 rounded-lg mb-8"></div>
        
        <!-- Content Skeleton -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2">
            <div class="h-8 bg-gray-200 rounded mb-4"></div>
            <div class="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
            <div class="h-4 bg-gray-200 rounded mb-8 w-1/2"></div>
            <div class="space-y-4">
              <div class="h-4 bg-gray-200 rounded"></div>
              <div class="h-4 bg-gray-200 rounded w-5/6"></div>
              <div class="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
          <div>
            <div class="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="text-center">
        <div class="text-red-600 mb-4">
          <ExclamationTriangleIcon class="h-16 w-16 mx-auto" />
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-4">Workspace Not Found</h1>
        <p class="text-gray-600 mb-8">
          {{ error.statusCode === 404 ? 'This workspace does not exist or has been removed.' : 'Unable to load workspace details.' }}
        </p>
        <div class="space-x-4">
          <button
            @click="$router.go(-1)"
            class="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Go Back
          </button>
          <NuxtLink
            to="/"
            class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Browse Workspaces
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else-if="workspace" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Breadcrumb -->
      <nav class="mb-8" aria-label="Breadcrumb">
        <ol class="flex items-center space-x-2 text-sm text-gray-500">
          <li>
            <NuxtLink to="/" class="hover:text-blue-600">Workspaces</NuxtLink>
          </li>
          <ChevronRightIcon class="w-4 h-4" />
          <li class="text-gray-900 font-medium truncate">{{ workspace?.name || 'Loading...' }}</li>
        </ol>
      </nav>

      <!-- Image Gallery -->
      <div class="mb-8">
        <ClientOnly>
          <!-- Main Image -->
          <div class="relative h-96 md:h-[28rem] rounded-lg overflow-hidden cursor-pointer group" @click="currentImageIndex = currentImageIndex < workspace.images?.length - 1 ? currentImageIndex + 1 : 0">
            <img
              :src="mainImage"
              :alt="workspace?.name || 'Workspace'"
              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              @error="handleImageError"
            />
          
          <!-- Gradient overlay -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
          
          <!-- Image Counter -->
          <div
            v-if="workspace.images.length > 0"
            class="absolute top-4 right-4 px-3 py-1 bg-black/70 text-white text-sm rounded-md backdrop-blur-sm"
          >
            {{ currentImageIndex + 1 }} / {{ workspace.images.length }}
          </div>
          
          <!-- Navigation Arrows -->
          <button
            v-if="workspace.images.length > 1"
            @click.stop="currentImageIndex = currentImageIndex > 0 ? currentImageIndex - 1 : workspace.images.length - 1"
            class="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
          >
            <ChevronLeftIcon class="w-5 h-5" />
          </button>
          <button
            v-if="workspace.images.length > 1"
            @click.stop="currentImageIndex = currentImageIndex < workspace.images.length - 1 ? currentImageIndex + 1 : 0"
            class="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
          >
            <ChevronRightIcon class="w-5 h-5" />
          </button>
        </div>
        
        <!-- Thumbnail Strip -->
        <div v-if="workspace.images.length > 1" class="flex gap-3 mt-4 overflow-x-auto pb-2">
          <div
            v-for="(image, index) in workspace.images"
            :key="index"
            class="relative flex-shrink-0 cursor-pointer transition-all duration-200 hover:opacity-80"
            @click="currentImageIndex = index"
          >
            <img
              :src="image"
              :alt="`${workspace.name} - Image ${index + 1}`"
              :class="[
                'w-20 h-16 object-cover rounded-md',
                currentImageIndex === index ? 'ring-2 ring-blue-500' : ''
              ]"
              @error="handleImageError"
            />
          </div>
        </div>
        <template #fallback>
          <div class="h-96 md:h-[28rem] bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
            <span class="text-gray-500">Loading gallery...</span>
          </div>
        </template>
        </ClientOnly>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column - Main Info -->
        <div class="lg:col-span-2">
          <!-- Header -->
          <div class="mb-8">
            <div class="flex items-center gap-3 mb-4">
              <span class="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                {{ getWorkspaceTypeLabel(workspace.type) }}
              </span>
              <span
                v-if="workspace.provider.is_verified"
                class="flex items-center px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full"
              >
                <CheckBadgeIcon class="w-4 h-4 mr-1" />
                Verified Provider
              </span>
            </div>

            <h1 class="text-3xl font-bold text-gray-900 mb-4">{{ workspace.name }}</h1>
            
            <div class="flex items-center text-gray-600 mb-4">
              <MapPinIcon class="w-5 h-5 mr-2" />
              <span>{{ formatAddress(workspace.address, workspace.city, workspace.state, workspace.country, workspace.postal_code) }}</span>
            </div>

            <div class="flex items-center gap-4 text-gray-600">
              <div class="flex items-center">
                <UsersIcon class="w-5 h-5 mr-2" />
                <span>{{ formatCapacity(workspace.capacity) }}</span>
              </div>
              <div class="flex items-center">
                <Icon name="heroicons:star-solid" class="w-5 h-5 text-yellow-400 mr-1" />
                <span class="font-semibold text-gray-900">{{ workspace.rating }}</span>
                <ClientOnly>
                  <span class="text-sm ml-1">({{ Math.floor(Math.random() * 50) + 10 }} reviews)</span>
                  <template #fallback>
                    <span class="text-sm ml-1">(25 reviews)</span>
                  </template>
                </ClientOnly>
              </div>
            </div>
          </div>

          <!-- Description -->
          <div v-if="workspace.description" class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">About this workspace</h2>
            <p class="text-gray-600 leading-relaxed">{{ workspace.description }}</p>
          </div>

          <!-- Amenities -->
          <div v-if="parsedAmenities.length > 0" class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Amenities</h2>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div
                v-for="amenity in parsedAmenities"
                :key="amenity"
                class="flex items-center text-gray-600"
              >
                <CheckIcon class="w-4 h-4 mr-2 text-green-600" />
                <span>{{ amenity }}</span>
              </div>
            </div>
          </div>

          <!-- Provider Info -->
          <div class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Hosted by</h2>
            <div class="flex items-start space-x-4 p-6 bg-white rounded-lg border border-gray-200">
              <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                {{ getInitials(workspace.provider.business_name) }}
              </div>
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900">{{ workspace.provider.business_name }}</h3>
                <p v-if="workspace.provider.description" class="text-gray-600 mt-1">
                  {{ workspace.provider.description }}
                </p>
                <div class="flex items-center mt-2 space-x-4">
                  <span
                    v-if="workspace.provider.is_verified"
                    class="flex items-center text-sm text-green-600"
                  >
                    <CheckBadgeIcon class="w-4 h-4 mr-1" />
                    Verified
                  </span>
                  <a
                    v-if="workspace.provider.website"
                    :href="workspace.provider.website"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Visit Website
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column - Booking Card -->
        <div class="lg:col-span-1">
          <div class="sticky top-8">
            <div class="bg-white rounded-lg border border-gray-200 p-6">
              <div class="mb-6">
                <div class="text-3xl font-bold text-gray-900 mb-2">
                  £{{ workspace.hourly_rate }}
                  <span class="text-lg font-normal text-gray-600">/hour</span>
                </div>
                <div v-if="workspace.daily_rate" class="text-gray-600">
                  £{{ workspace.daily_rate }}/day
                </div>
                <div v-if="workspace.monthly_rate" class="text-gray-600">
                  £{{ workspace.monthly_rate }}/month
                </div>
              </div>

              <!-- Booking Form Placeholder -->
              <div class="space-y-4 mb-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Check-in Date</label>
                  <input
                    type="date"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                  <select class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>1 hour</option>
                    <option>2 hours</option>
                    <option>4 hours</option>
                    <option>Full day</option>
                    <option>Custom</option>
                  </select>
                </div>
              </div>

              <button
                class="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-md transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                @click="handleBookingClick"
              >
                Request to Book
              </button>

              <p class="text-xs text-gray-500 mt-4 text-center">
                You won't be charged until your booking is confirmed
              </p>

              <!-- Contact Info -->
              <div v-if="workspace.provider.phone" class="mt-6 pt-6 border-t border-gray-200">
                <a
                  :href="`tel:${workspace.provider.phone}`"
                  class="flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  <PhoneIcon class="w-4 h-4 mr-2" />
                  {{ workspace.provider.phone }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  MapPinIcon,
  UsersIcon,
  CheckIcon,
  CheckBadgeIcon,
  PhoneIcon,
  ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline'
import type { Workspace } from '~/types'

// Define page options
definePageMeta({
  mode: 'spa' // Disable SSR for this page to avoid hydration issues
})

// Get workspace ID from route
const route = useRoute()
const workspaceId = parseInt(route.params.id as string)

// Mock workspaces data (same as homepage)
const mockWorkspaces = [
  {
    id: 1,
    name: "Canary Wharf Business Hub",
    description: "Premium coworking space in the heart of London's financial district with stunning river views and top-tier amenities. Perfect for professionals who need a prestigious address and world-class facilities. Our space features floor-to-ceiling windows overlooking the Thames, state-of-the-art meeting rooms, and a dedicated concierge service to handle all your business needs.",
    type: "coworking_space",
    capacity: 80,
    hourly_rate: 35,
    daily_rate: 250,
    monthly_rate: 4500,
    address: "25 Canada Square",
    city: "London",
    country: "United Kingdom",
    postal_code: "E14 5LQ",
    amenities: ["High-speed WiFi", "Meeting Rooms", "Thames Views", "24/7 Access", "Concierge", "Reception", "Printing", "Coffee Bar", "Phone Booths", "Event Space"],
    images: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop"
    ],
    provider: {
      business_name: "Prime Workspace",
      description: "Leading provider of premium business spaces in London's financial district.",
      website: "https://primeworkspace.co.uk",
      phone: "+44 20 7946 0958",
      is_verified: true
    },
    rating: 4.9,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z"
  },
  {
    id: 2,
    name: "Shoreditch Creative Studio",
    description: "Trendy creative workspace in East London's artistic quarter, perfect for designers and digital agencies. This converted Victorian warehouse combines historic character with cutting-edge technology. Natural light floods through original factory windows, inspiring creativity and productivity. The space fosters collaboration while providing quiet zones for focused work.",
    type: "private_office",
    capacity: 12,
    hourly_rate: 28,
    daily_rate: 200,
    monthly_rate: 3200,
    address: "15 Brick Lane",
    city: "London",
    country: "United Kingdom",
    postal_code: "E1 6QL",
    amenities: ["Natural Light", "Art Gallery", "Podcast Studio", "Flexible Layout", "Bike Storage", "Kitchen", "Breakout Areas", "High-speed WiFi", "Printing"],
    images: [
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1544547986-22104c0fa30c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop"
    ],
    provider: {
      business_name: "East London Creative",
      description: "Specialising in creative workspaces for London's digital and artistic communities.",
      website: "https://eastlondoncreative.com",
      phone: "+44 20 7123 4567",
      is_verified: true
    },
    rating: 4.8,
    created_at: "2024-01-14T09:00:00Z",
    updated_at: "2024-01-14T09:00:00Z"
  },
  {
    id: 3,
    name: "Edinburgh Royal Mile Office",
    description: "Historic meeting room with modern facilities on Edinburgh's famous Royal Mile, ideal for client presentations and important business meetings. Located in a beautifully restored Georgian building with views of Edinburgh Castle, this space combines Scottish heritage with contemporary business amenities. The perfect setting for impressing clients and conducting high-level negotiations.",
    type: "meeting_room",
    capacity: 16,
    hourly_rate: 45,
    daily_rate: 320,
    address: "120 High Street",
    city: "Edinburgh",
    country: "United Kingdom",
    postal_code: "EH1 1QS",
    amenities: ["AV Equipment", "Castle Views", "Historic Building", "Catering Service", "Whiteboard", "Projector", "Video Conferencing", "Air Conditioning"],
    images: [
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1571624436279-b272afd650ac?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1582653291997-079a1c04e5a1?w=800&h=600&fit=crop"
    ],
    provider: {
      business_name: "Scottish Business Centres",
      description: "Premium business facilities across Scotland's major cities.",
      website: "https://scottishbusinesscentres.co.uk",
      phone: "+44 131 543 9876",
      is_verified: true
    },
    rating: 4.9,
    created_at: "2024-01-13T08:00:00Z",
    updated_at: "2024-01-13T08:00:00Z"
  },
  {
    id: 4,
    name: "Manchester Northern Quarter Desk",
    description: "Vibrant hot desk space in Manchester's creative quarter with excellent transport links and buzzing atmosphere. Located in the heart of the Northern Quarter's creative scene, surrounded by independent coffee shops, record stores, and art galleries. This dynamic workspace attracts freelancers, entrepreneurs, and remote workers from across the North West.",
    type: "desk",
    capacity: 1,
    hourly_rate: 12,
    daily_rate: 65,
    monthly_rate: 950,
    address: "45 Oldham Street",
    city: "Manchester",
    country: "United Kingdom",
    postal_code: "M1 1JG",
    amenities: ["24/7 Access", "High-speed WiFi", "Coffee Shop", "Networking Events", "Phone Booths", "Printing", "Lockers", "Kitchen Access"],
    images: [
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1521791055366-0d553872125f?w=800&h=600&fit=crop"
    ],
    provider: {
      business_name: "NQ Workspace",
      description: "Manchester's premier creative workspace provider in the Northern Quarter.",
      website: "https://nqworkspace.com",
      phone: "+44 161 123 4567",
      is_verified: true
    },
    rating: 4.7,
    created_at: "2024-01-12T07:00:00Z",
    updated_at: "2024-01-12T07:00:00Z"
  },
  {
    id: 5,
    name: "Birmingham Jewellery Quarter Study",
    description: "Quiet, focused workspace in Birmingham's historic Jewellery Quarter, perfect for concentrated work and study sessions. This peaceful environment is ideal for writers, researchers, and professionals who need distraction-free surroundings. Located in a beautifully converted Victorian workshop with original features and modern amenities.",
    type: "desk",
    capacity: 1,
    hourly_rate: 10,
    daily_rate: 55,
    monthly_rate: 750,
    address: "78 Vyse Street",
    city: "Birmingham",
    country: "United Kingdom",
    postal_code: "B18 6HA",
    amenities: ["Silent Environment", "Comfortable Seating", "Natural Light", "Tea & Coffee", "Individual Study Pods", "WiFi", "Printing Access"],
    images: [
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop"
    ],
    provider: {
      business_name: "Midlands Quiet Spaces",
      description: "Providing peaceful work environments across the West Midlands.",
      phone: "+44 121 456 7890",
      is_verified: true
    },
    rating: 4.6,
    created_at: "2024-01-11T06:00:00Z",
    updated_at: "2024-01-11T06:00:00Z"
  },
  {
    id: 6,
    name: "Bristol Tech Incubator",
    description: "State-of-the-art private office in Bristol's tech hub with startup community and mentorship opportunities. This innovation-focused workspace is home to some of the South West's most promising tech startups. Benefit from regular networking events, investor meetups, and access to experienced mentors who can help grow your business.",
    type: "private_office",
    capacity: 20,
    hourly_rate: 32,
    daily_rate: 230,
    monthly_rate: 3800,
    address: "1 Temple Way",
    city: "Bristol",
    country: "United Kingdom",
    postal_code: "BS1 6DG",
    amenities: ["Startup Community", "Mentorship", "High-spec IT", "Kitchen Facilities", "Event Space", "Investor Network", "24/7 Access", "Meeting Rooms"],
    images: [
      "https://images.unsplash.com/photo-1497366412874-3415097a27e7?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1577962917302-cd874c99d7d1?w=800&h=600&fit=crop"
    ],
    provider: {
      business_name: "Bristol Innovation Hub",
      description: "Supporting tech startups and scale-ups across the South West region.",
      website: "https://bristolinnovationhub.com",
      phone: "+44 117 987 6543",
      is_verified: true
    },
    rating: 4.8,
    created_at: "2024-01-10T05:00:00Z",
    updated_at: "2024-01-10T05:00:00Z"
  }
  // Add more workspaces as needed for testing other IDs
]

// Get workspace from mock data or API
const workspace = computed(() => {
  if (!workspaceId || isNaN(workspaceId)) return null
  return mockWorkspaces.find(w => w.id === workspaceId) || null
})

// Simulate loading and error states
const pending = ref(false)
const error = computed(() => {
  if (!workspaceId || isNaN(workspaceId)) {
    return { statusCode: 404, message: 'Invalid workspace ID' }
  }
  if (!workspace.value) {
    return { statusCode: 404, message: 'Workspace not found' }
  }
  return null
})

// Helper functions
const formatCapacity = (capacity: number) => {
  return capacity === 1 ? '1 person' : `${capacity} people`
}

const getWorkspaceTypeLabel = (type: string) => {
  const labels = {
    desk: 'Hot Desk',
    meeting_room: 'Meeting Room',
    private_office: 'Private Office',
    coworking_space: 'Coworking Space'
  }
  return labels[type as keyof typeof labels] || type
}

const parseAmenities = (amenities: string | string[]) => {
  if (Array.isArray(amenities)) return amenities
  if (!amenities) return []
  return amenities
}

const getInitials = (name: string) => {
  return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2)
}

const handleBookingClick = () => {
  // This could navigate to a booking form or open a modal
  // For now, we'll show an alert as a placeholder
  alert(`Booking request initiated for ${workspace.value?.name}. This would typically open a booking form or redirect to a payment page.`)
  
  // In a real implementation, you might:
  // - Navigate to a booking page: navigateTo(`/workspaces/${workspaceId}/book`)
  // - Open a booking modal
  // - Send data to a booking API
  // - Track the booking event in analytics
}

const formatAddress = (address: string, city: string, state?: string, country?: string, postalCode?: string) => {
  const parts = [address, city, state, country, postalCode].filter(Boolean)
  return parts.join(', ')
}

// State
const currentImageIndex = ref(0)

// Computed
const parsedAmenities = computed(() => {
  return workspace.value ? parseAmenities(workspace.value.amenities) : []
})

const mainImage = computed(() => {
  if (!workspace.value || workspace.value.images.length === 0) return ''
  return workspace.value.images[currentImageIndex.value] || workspace.value.images[0]
})

// SEO
useHead(() => {
  if (!workspace.value) {
    return {
      title: 'Workspace - DayDeskr',
    }
  }

  return {
    title: `${workspace.value.name} - DayDeskr`,
    meta: [
      {
        name: 'description',
        content: workspace.value.description || `Book ${workspace.value.name} in ${workspace.value.city}`,
      },
      {
        property: 'og:title',
        content: `${workspace.value.name} - DayDeskr`,
      },
      {
        property: 'og:description',
        content: workspace.value.description || `Book ${workspace.value.name} in ${workspace.value.city}`,
      },
      ...(workspace.value.images.length > 0 ? [{
        property: 'og:image',
        content: workspace.value.images[0],
      }] : []),
    ],
  }
})

// Methods
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

// Validate workspace ID
if (!workspaceId || isNaN(workspaceId)) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Workspace not found'
  })
}
</script>