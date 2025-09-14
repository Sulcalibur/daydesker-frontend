<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
    <!-- Image Carousel -->
    <div class="relative h-48 bg-gray-200">
      <div
        v-if="workspace.images.length > 0"
        class="relative w-full h-full"
      >
        <img
          :src="currentImage"
          :alt="workspace.name"
          class="w-full h-full object-cover"
          @error="handleImageError"
        />
        
        <!-- Image Navigation -->
        <div
          v-if="workspace.images.length > 1"
          class="absolute inset-0 flex items-center justify-between p-2 opacity-0 hover:opacity-100 transition-opacity"
        >
          <button
            @click.stop="previousImage"
            class="p-1 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70"
          >
            <ChevronLeftIcon class="w-4 h-4" />
          </button>
          <button
            @click.stop="nextImage"
            class="p-1 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70"
          >
            <ChevronRightIcon class="w-4 h-4" />
          </button>
        </div>

        <!-- Image Dots -->
        <div
          v-if="workspace.images.length > 1"
          class="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1"
        >
          <button
            v-for="(image, index) in workspace.images"
            :key="index"
            @click.stop="currentImageIndex = index"
            :class="[
              'w-2 h-2 rounded-full transition-colors',
              index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
            ]"
          />
        </div>
      </div>

      <!-- Placeholder for no images -->
      <div
        v-else
        class="w-full h-full flex items-center justify-center"
      >
        <BuildingOffice2Icon class="w-16 h-16 text-gray-400" />
      </div>

      <!-- Workspace Type Badge -->
      <div class="absolute top-2 left-2">
        <span class="px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded-md">
          {{ getWorkspaceTypeLabel(workspace.type) }}
        </span>
      </div>

      <!-- Provider Verification Badge -->
      <div
        v-if="workspace.provider.is_verified"
        class="absolute top-2 right-2"
      >
        <span class="flex items-center px-2 py-1 text-xs font-medium bg-green-600 text-white rounded-md">
          <CheckBadgeIcon class="w-3 h-3 mr-1" />
          Verified
        </span>
      </div>
    </div>

    <!-- Content -->
    <div class="p-6">
      <!-- Header -->
      <div class="mb-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
          {{ workspace.name }}
        </h3>
        <p class="text-sm text-gray-600 flex items-center">
          <MapPinIcon class="w-4 h-4 mr-1 flex-shrink-0" />
          {{ workspace.city }}, {{ workspace.country }}
        </p>
      </div>

      <!-- Description -->
      <p
        v-if="workspace.description"
        class="text-sm text-gray-600 mb-4 line-clamp-2"
      >
        {{ workspace.description }}
      </p>

      <!-- Capacity -->
      <div class="flex items-center text-sm text-gray-600 mb-4">
        <UsersIcon class="w-4 h-4 mr-1" />
        {{ formatCapacity(workspace.capacity) }}
      </div>

      <!-- Amenities Preview -->
      <div
        v-if="parsedAmenities.length > 0"
        class="mb-4"
      >
        <div class="flex flex-wrap gap-1">
          <span
            v-for="amenity in parsedAmenities.slice(0, 3)"
            :key="amenity"
            class="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
          >
            {{ amenity }}
          </span>
          <span
            v-if="parsedAmenities.length > 3"
            class="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
          >
            +{{ parsedAmenities.length - 3 }} more
          </span>
        </div>
      </div>

      <!-- Provider Info -->
      <div class="flex items-center text-sm text-gray-600 mb-4">
        <div class="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium mr-2">
          {{ getInitials(workspace.provider.business_name) }}
        </div>
        <span class="truncate">{{ workspace.provider.business_name }}</span>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between pt-4 border-t border-gray-100">
        <!-- Pricing -->
        <div class="text-left">
          <div class="text-xl font-bold text-gray-900">
            {{ formatCurrency(workspace.hourly_rate) }}
            <span class="text-sm font-normal text-gray-600">/hour</span>
          </div>
          <div
            v-if="workspace.daily_rate"
            class="text-sm text-gray-600"
          >
            {{ formatCurrency(workspace.daily_rate) }}/day
          </div>
        </div>

        <!-- Action Button -->
        <button
          @click="navigateToWorkspace"
          class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MapPinIcon,
  UsersIcon,
  BuildingOffice2Icon,
  CheckBadgeIcon,
} from '@heroicons/vue/24/outline'
import type { Workspace } from '~/types'

interface Props {
  workspace: Workspace
}

const props = defineProps<Props>()

// Utils
const {
  formatCurrency,
  formatCapacity,
  getWorkspaceTypeLabel,
  parseAmenities,
  getInitials,
} = await import('~/utils')

// State
const currentImageIndex = ref(0)

// Computed
const parsedAmenities = computed(() => parseAmenities(props.workspace.amenities))

const currentImage = computed(() => {
  const images = props.workspace.images
  if (images.length === 0) return ''
  return images[currentImageIndex.value] || images[0]
})

// Methods
const previousImage = () => {
  if (props.workspace.images.length <= 1) return
  currentImageIndex.value = currentImageIndex.value === 0
    ? props.workspace.images.length - 1
    : currentImageIndex.value - 1
}

const nextImage = () => {
  if (props.workspace.images.length <= 1) return
  currentImageIndex.value = (currentImageIndex.value + 1) % props.workspace.images.length
}

const handleImageError = (event: Event) => {
  // Hide broken image
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

const navigateToWorkspace = () => {
  navigateTo(`/workspaces/${props.workspace.id}`)
}

// Auto-rotate images if multiple images exist
let imageRotationInterval: NodeJS.Timeout | null = null

onMounted(() => {
  if (props.workspace.images.length > 1) {
    imageRotationInterval = setInterval(() => {
      nextImage()
    }, 4000) // Change image every 4 seconds
  }
})

onUnmounted(() => {
  if (imageRotationInterval) {
    clearInterval(imageRotationInterval)
  }
})

// Pause rotation on hover
const pauseRotation = () => {
  if (imageRotationInterval) {
    clearInterval(imageRotationInterval)
    imageRotationInterval = null
  }
}

const resumeRotation = () => {
  if (props.workspace.images.length > 1 && !imageRotationInterval) {
    imageRotationInterval = setInterval(() => {
      nextImage()
    }, 4000)
  }
}
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>