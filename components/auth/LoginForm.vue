<template>
  <div class="w-full max-w-md mx-auto">
    <div class="text-center mb-8">
      <h2 class="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
      <p class="text-gray-600">Sign in to your DayDeskr account</p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Email Field -->
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <div class="relative">
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            autocomplete="email"
            class="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            :class="{
              'border-red-300 focus:ring-red-500': errors.email,
              'opacity-50': loading
            }"
            placeholder="Enter your email"
            :disabled="loading"
          />
          <Icon name="lucide:mail" class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        <p v-if="errors.email" class="mt-2 text-sm text-red-600">{{ errors.email }}</p>
      </div>

      <!-- Password Field -->
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
            autocomplete="current-password"
            class="w-full px-4 py-3 pl-11 pr-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            :class="{
              'border-red-300 focus:ring-red-500': errors.password,
              'opacity-50': loading
            }"
            placeholder="Enter your password"
            :disabled="loading"
          />
          <Icon name="lucide:lock" class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            :disabled="loading"
          >
            <Icon :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'" class="w-5 h-5" />
          </button>
        </div>
        <p v-if="errors.password" class="mt-2 text-sm text-red-600">{{ errors.password }}</p>
      </div>

      <!-- Remember Me & Forgot Password -->
      <div class="flex items-center justify-between">
        <label class="flex items-center">
          <input
            v-model="form.remember"
            type="checkbox"
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            :disabled="loading"
          />
          <span class="ml-2 text-sm text-gray-700">Remember me</span>
        </label>
        <NuxtLink
          to="/auth/forgot-password"
          class="text-sm text-blue-600 hover:text-blue-500 transition-colors"
        >
          Forgot password?
        </NuxtLink>
      </div>

      <!-- General Error Message -->
      <div v-if="errors.general" class="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div class="flex items-center">
          <Icon name="lucide:alert-circle" class="w-5 h-5 text-red-500 mr-2" />
          <p class="text-sm text-red-700">{{ errors.general }}</p>
        </div>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="loading || !isFormValid"
        class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Icon v-if="loading" name="lucide:loader-2" class="w-5 h-5 animate-spin inline mr-2" />
        {{ loading ? 'Signing In...' : 'Sign In' }}
      </button>
    </form>

    <!-- Sign Up Link -->
    <div class="mt-8 text-center">
      <p class="text-gray-600">
        Don't have an account?
        <NuxtLink
          to="/auth/select-type"
          class="text-blue-600 hover:text-blue-500 font-medium transition-colors"
        >
          Sign up here
        </NuxtLink>
      </p>
    </div>

    <!-- Social Login (Optional) -->
    <div class="mt-8">
      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-300"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <div class="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
          :disabled="loading"
        >
          <Icon name="lucide:chrome" class="w-5 h-5" />
          <span class="ml-2">Google</span>
        </button>
        <button
          type="button"
          class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
          :disabled="loading"
        >
          <Icon name="lucide:github" class="w-5 h-5" />
          <span class="ml-2">GitHub</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LoginCredentials } from '~/types'

interface Props {
  loading?: boolean
  errors?: Record<string, string>
}

interface Emits {
  submit: [credentials: LoginCredentials]
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  errors: () => ({})
})

const emit = defineEmits<Emits>()

const showPassword = ref(false)

const form = ref<LoginCredentials>({
  email: '',
  password: '',
  remember: false
})

// Form validation
const isFormValid = computed(() => {
  return form.value.email.trim() !== '' && 
         form.value.password.trim() !== '' &&
         /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)
})

const handleSubmit = () => {
  if (!isFormValid.value || props.loading) return
  emit('submit', { ...form.value })
}

// Clear form errors when user types
watch(() => form.value.email, () => {
  if (props.errors.email) {
    delete props.errors.email
  }
})

watch(() => form.value.password, () => {
  if (props.errors.password) {
    delete props.errors.password
  }
})
</script>