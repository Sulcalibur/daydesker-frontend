<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
    <!-- Desk Seeker Card -->
    <div
      class="group relative bg-white rounded-2xl shadow-lg border-2 border-gray-200 hover:border-blue-500 transition-all duration-300 cursor-pointer overflow-hidden"
      @click="selectUserType('seeker')"
    >
      <div class="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div class="relative p-8">
        <div class="text-center">
          <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
            <Icon name="lucide:search" class="w-10 h-10 text-blue-600" />
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-4">Desk Seeker</h3>
          <p class="text-gray-600 mb-6 leading-relaxed">
            Looking for the perfect workspace? Find and book desks, meeting rooms, and coworking spaces that match your needs.
          </p>
          
          <!-- Features List -->
          <div class="space-y-3 mb-8">
            <div class="flex items-center text-sm text-gray-700">
              <Icon name="lucide:check-circle" class="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
              <span>Browse available workspaces</span>
            </div>
            <div class="flex items-center text-sm text-gray-700">
              <Icon name="lucide:check-circle" class="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
              <span>Book desks by the hour or day</span>
            </div>
            <div class="flex items-center text-sm text-gray-700">
              <Icon name="lucide:check-circle" class="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
              <span>Access premium amenities</span>
            </div>
            <div class="flex items-center text-sm text-gray-700">
              <Icon name="lucide:check-circle" class="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
              <span>Manage your bookings easily</span>
            </div>
          </div>
          
          <button
            class="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors group-hover:shadow-lg"
            @click.stop="selectUserType('seeker')"
          >
            Get Started as Seeker
            <Icon name="lucide:arrow-right" class="w-4 h-4 ml-2 inline" />
          </button>
        </div>
      </div>
    </div>

    <!-- Workspace Provider Card -->
    <div
      class="group relative bg-white rounded-2xl shadow-lg border-2 border-gray-200 hover:border-green-500 transition-all duration-300 cursor-pointer overflow-hidden"
      @click="selectUserType('provider')"
    >
      <div class="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div class="relative p-8">
        <div class="text-center">
          <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors">
            <Icon name="lucide:building" class="w-10 h-10 text-green-600" />
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-4">Workspace Provider</h3>
          <p class="text-gray-600 mb-6 leading-relaxed">
            Have space to share? List your office, coworking space, or meeting rooms and start earning from your unused space.
          </p>
          
          <!-- Features List -->
          <div class="space-y-3 mb-8">
            <div class="flex items-center text-sm text-gray-700">
              <Icon name="lucide:check-circle" class="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
              <span>List unlimited workspaces</span>
            </div>
            <div class="flex items-center text-sm text-gray-700">
              <Icon name="lucide:check-circle" class="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
              <span>Set your own pricing</span>
            </div>
            <div class="flex items-center text-sm text-gray-700">
              <Icon name="lucide:check-circle" class="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
              <span>Manage bookings & payments</span>
            </div>
            <div class="flex items-center text-sm text-gray-700">
              <Icon name="lucide:check-circle" class="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
              <span>Analytics & insights</span>
            </div>
          </div>
          
          <button
            class="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors group-hover:shadow-lg"
            @click.stop="selectUserType('provider')"
          >
            Get Started as Provider
            <Icon name="lucide:arrow-right" class="w-4 h-4 ml-2 inline" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserType } from '~/types'

interface Props {
  loading?: boolean
}

interface Emits {
  select: [userType: UserType]
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const selectUserType = (userType: UserType) => {
  emit('select', userType)
}
</script>