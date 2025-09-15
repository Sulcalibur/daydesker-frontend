<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="lucide:building" class="w-8 h-8 text-green-600" />
          </div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Join as Workspace Provider</h1>
          <p class="text-gray-600">Create your account to list workspaces</p>
        </div>
        
        <form @submit.prevent="handleRegister" class="space-y-6">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="first_name" class="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                id="first_name"
                v-model="form.first_name"
                type="text"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                placeholder="John"
                :disabled="isLoading"
              />
            </div>
            <div>
              <label for="last_name" class="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                id="last_name"
                v-model="form.last_name"
                type="text"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                placeholder="Doe"
                :disabled="isLoading"
              />
            </div>
          </div>
          
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              placeholder="john@example.com"
              :disabled="isLoading"
            />
          </div>
          
          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              id="phone"
              v-model="form.phone"
              type="tel"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              placeholder="+1 (555) 123-4567"
              :disabled="isLoading"
            />
          </div>
          
          <div>
            <label for="company_name" class="block text-sm font-medium text-gray-700 mb-2">
              Company/Organization Name
            </label>
            <input
              id="company_name"
              v-model="form.company_name"
              type="text"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              placeholder="Your Company Name (Optional)"
              :disabled="isLoading"
            />
          </div>
          
          <div>
            <label for="bio" class="block text-sm font-medium text-gray-700 mb-2">
              About Your Workspace
            </label>
            <textarea
              id="bio"
              v-model="form.bio"
              rows="3"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none"
              placeholder="Tell us about your workspace and what makes it special..."
              :disabled="isLoading"
            ></textarea>
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
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors pr-12"
                placeholder="Create a strong password"
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
          
          <div>
            <label for="password_confirmation" class="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              id="password_confirmation"
              v-model="form.password_confirmation"
              type="password"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              placeholder="Confirm your password"
              :disabled="isLoading"
            />
          </div>
          
          <div>
            <label class="flex items-start">
              <input
                v-model="form.terms_accepted"
                type="checkbox"
                required
                class="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-1"
                :disabled="isLoading"
              />
              <span class="ml-2 text-sm text-gray-700">
                I agree to the 
                <NuxtLink to="/terms" class="text-green-600 hover:text-green-700 font-medium">
                  Terms of Service
                </NuxtLink>
                and 
                <NuxtLink to="/privacy" class="text-green-600 hover:text-green-700 font-medium">
                  Privacy Policy
                </NuxtLink>
              </span>
            </label>
          </div>
          
          <button
            type="submit"
            :disabled="isLoading || !form.terms_accepted"
            class="w-full bg-green-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <Icon v-if="isLoading" name="lucide:loader-2" class="w-5 h-5 mr-2 animate-spin" />
            {{ isLoading ? 'Creating Account...' : 'Create Account' }}
          </button>
        </form>
        
        <div class="mt-8 text-center">
          <p class="text-gray-600">
            Already have an account?
            <NuxtLink to="/auth/login" class="text-green-600 hover:text-green-700 font-semibold">
              Sign in here
            </NuxtLink>
          </p>
          <p class="text-gray-600 mt-2">
            Looking for workspace instead?
            <NuxtLink to="/auth/register/seeker" class="text-blue-600 hover:text-blue-700 font-semibold">
              Register as Seeker
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
import type { RegisterData } from '~/types'

definePageMeta({
  middleware: 'guest',
  layout: false
})

const { register } = useAuth()

const form = ref({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  password: '',
  password_confirmation: '',
  user_type: 'workspace_provider' as const,
  terms_accepted: false,
  company_name: '',
  bio: ''
})

const showPassword = ref(false)
const isLoading = ref(false)
const error = ref('')

const handleRegister = async () => {
  try {
    error.value = ''
    
    // Validate password confirmation
    if (form.value.password !== form.value.password_confirmation) {
      error.value = 'Passwords do not match'
      return
    }
    
    isLoading.value = true
    
    // Prepare data for API - combine first_name and last_name into name
    const registrationData: RegisterData = {
      name: `${form.value.first_name.trim()} ${form.value.last_name.trim()}`.trim(),
      email: form.value.email,
      password: form.value.password,
      password_confirmation: form.value.password_confirmation,
      user_type: form.value.user_type,
      phone: form.value.phone || undefined,
      bio: form.value.bio || undefined,
      business_name: form.value.company_name || undefined
    }
    
    await register(registrationData)
    
    // Success - navigation handled by useAuth
  } catch (err: any) {
    error.value = err.message || 'Registration failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>