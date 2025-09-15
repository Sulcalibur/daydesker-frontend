<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="max-w-4xl w-full">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">Welcome to DayDeskr</h1>
        <p class="text-xl text-gray-600">Choose how you'd like to use our platform</p>
      </div>
      
      <div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <!-- Desk Seeker Card -->
        <div class="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-300 border border-gray-100">
          <div class="text-center">
            <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon name="lucide:search" class="w-10 h-10 text-blue-600" />
            </div>
            <h2 class="text-2xl font-bold text-gray-900 mb-4">I'm looking for a workspace</h2>
            <p class="text-gray-600 mb-8 leading-relaxed">
              Find and book the perfect workspace for your needs. Browse available desks, 
              meeting rooms, and coworking spaces in your area.
            </p>
            <ul class="text-left space-y-3 mb-8">
              <li class="flex items-center text-gray-700">
                <Icon name="lucide:check-circle" class="w-5 h-5 text-green-500 mr-3" />
                Browse available workspaces
              </li>
              <li class="flex items-center text-gray-700">
                <Icon name="lucide:check-circle" class="w-5 h-5 text-green-500 mr-3" />
                Book desks and meeting rooms
              </li>
              <li class="flex items-center text-gray-700">
                <Icon name="lucide:check-circle" class="w-5 h-5 text-green-500 mr-3" />
                Manage your bookings
              </li>
              <li class="flex items-center text-gray-700">
                <Icon name="lucide:check-circle" class="w-5 h-5 text-green-500 mr-3" />
                Rate and review spaces
              </li>
            </ul>
            <button 
              @click="selectUserType('desk_seeker')"
              class="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-blue-200"
            >
              Continue as Desk Seeker
            </button>
          </div>
        </div>
        
        <!-- Workspace Provider Card -->
        <div class="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-300 border border-gray-100">
          <div class="text-center">
            <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon name="lucide:building" class="w-10 h-10 text-green-600" />
            </div>
            <h2 class="text-2xl font-bold text-gray-900 mb-4">I have workspace to offer</h2>
            <p class="text-gray-600 mb-8 leading-relaxed">
              List your workspace and start earning. Share your office space, 
              meeting rooms, or coworking area with professionals who need it.
            </p>
            <ul class="text-left space-y-3 mb-8">
              <li class="flex items-center text-gray-700">
                <Icon name="lucide:check-circle" class="w-5 h-5 text-green-500 mr-3" />
                List your workspace
              </li>
              <li class="flex items-center text-gray-700">
                <Icon name="lucide:check-circle" class="w-5 h-5 text-green-500 mr-3" />
                Set your own pricing
              </li>
              <li class="flex items-center text-gray-700">
                <Icon name="lucide:check-circle" class="w-5 h-5 text-green-500 mr-3" />
                Manage bookings
              </li>
              <li class="flex items-center text-gray-700">
                <Icon name="lucide:check-circle" class="w-5 h-5 text-green-500 mr-3" />
                Earn passive income
              </li>
            </ul>
            <button 
              @click="selectUserType('workspace_provider')"
              class="w-full bg-green-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-green-200"
            >
              Continue as Workspace Provider
            </button>
          </div>
        </div>
      </div>
      
      <div class="text-center mt-12">
        <p class="text-gray-600">
          Already have an account? 
          <NuxtLink to="/auth/login" class="text-blue-600 hover:text-blue-700 font-semibold">
            Sign in here
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserType } from '~/types'

definePageMeta({
  middleware: 'guest',
  layout: false
})

const selectUserType = (userType: UserType) => {
  if (userType === 'desk_seeker') {
    navigateTo('/auth/register/seeker')
  } else {
    navigateTo('/auth/register/provider')
  }
}
</script>