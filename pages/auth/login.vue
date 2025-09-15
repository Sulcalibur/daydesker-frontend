<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p class="text-gray-600">Sign in to your DayDeskr account</p>
        </div>
        
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter your email"
              :disabled="isLoading"
            />
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors pr-12"
                placeholder="Enter your password"
                :disabled="isLoading"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                :disabled="isLoading"
              >
                <Icon :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'" class="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div class="flex items-center justify-between">
            <label class="flex items-center">
              <input
                v-model="form.remember"
                type="checkbox"
                class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                :disabled="isLoading"
              />
              <span class="ml-2 text-sm text-gray-700">Remember me</span>
            </label>
            <NuxtLink
              to="/auth/forgot-password"
              class="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Forgot password?
            </NuxtLink>
          </div>
          
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <Icon v-if="isLoading" name="lucide:loader-2" class="w-5 h-5 mr-2 animate-spin" />
            {{ isLoading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>
        
        <div class="mt-8 text-center">
          <p class="text-gray-600">
            Don't have an account?
            <NuxtLink to="/auth/select-type" class="text-blue-600 hover:text-blue-700 font-semibold">
              Sign up here
            </NuxtLink>
          </p>
        </div>
      </div>
      
      <!-- Error Alert -->
      <div v-if="error" class="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
        <div class="flex items-center">
          <Icon name="lucide:alert-circle" class="w-5 h-5 text-red-500 mr-2" />
          <p class="text-red-700 text-sm">{{ error }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LoginCredentials } from '~/types'

definePageMeta({
  middleware: 'guest',
  layout: false
})

const { login } = useAuth()

const form = ref<LoginCredentials>({
  email: '',
  password: '',
  remember: false
})

const showPassword = ref(false)
const isLoading = ref(false)
const error = ref('')

const handleLogin = async () => {
  try {
    error.value = ''
    isLoading.value = true
    
    await login(form.value)
    
    // Success - navigation handled by useAuth
  } catch (err: any) {
    error.value = err.message || 'Login failed. Please check your credentials and try again.'
  } finally {
    isLoading.value = false
  }
}
</script>