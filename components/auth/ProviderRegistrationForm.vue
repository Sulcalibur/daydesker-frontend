<template>
  <div class="w-full max-w-md mx-auto">
    <div class="text-center mb-8">
      <h2 class="text-3xl font-bold text-gray-900 mb-2">Join as Workspace Provider</h2>
      <p class="text-gray-600">Share your workspace and earn income</p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Name Fields -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="firstName" class="block text-sm font-medium text-gray-700 mb-2">
            First Name
          </label>
          <input
            id="firstName"
            v-model="form.firstName"
            type="text"
            required
            autocomplete="given-name"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            :class="{
              'border-red-300 focus:ring-red-500': errors.firstName,
              'opacity-50': loading
            }"
            placeholder="John"
            :disabled="loading"
          />
          <p v-if="errors.firstName" class="mt-2 text-sm text-red-600">{{ errors.firstName }}</p>
        </div>
        <div>
          <label for="lastName" class="block text-sm font-medium text-gray-700 mb-2">
            Last Name
          </label>
          <input
            id="lastName"
            v-model="form.lastName"
            type="text"
            required
            autocomplete="family-name"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            :class="{
              'border-red-300 focus:ring-red-500': errors.lastName,
              'opacity-50': loading
            }"
            placeholder="Doe"
            :disabled="loading"
          />
          <p v-if="errors.lastName" class="mt-2 text-sm text-red-600">{{ errors.lastName }}</p>
        </div>
      </div>

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
            placeholder="john.doe@example.com"
            :disabled="loading"
          />
          <Icon name="lucide:mail" class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        <p v-if="errors.email" class="mt-2 text-sm text-red-600">{{ errors.email }}</p>
      </div>

      <!-- Phone Field -->
      <div>
        <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
          Phone Number
        </label>
        <div class="relative">
          <input
            id="phone"
            v-model="form.phone"
            type="tel"
            required
            autocomplete="tel"
            class="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            :class="{
              'border-red-300 focus:ring-red-500': errors.phone,
              'opacity-50': loading
            }"
            placeholder="+1 (555) 123-4567"
            :disabled="loading"
          />
          <Icon name="lucide:phone" class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        <p v-if="errors.phone" class="mt-2 text-sm text-red-600">{{ errors.phone }}</p>
      </div>

      <!-- Company Name Field -->
      <div>
        <label for="companyName" class="block text-sm font-medium text-gray-700 mb-2">
          Company Name
        </label>
        <div class="relative">
          <input
            id="companyName"
            v-model="form.companyName"
            type="text"
            required
            autocomplete="organization"
            class="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            :class="{
              'border-red-300 focus:ring-red-500': errors.companyName,
              'opacity-50': loading
            }"
            placeholder="Your Company Name"
            :disabled="loading"
          />
          <Icon name="lucide:building" class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        <p v-if="errors.companyName" class="mt-2 text-sm text-red-600">{{ errors.companyName }}</p>
      </div>

      <!-- Bio Field -->
      <div>
        <label for="bio" class="block text-sm font-medium text-gray-700 mb-2">
          Bio <span class="text-gray-500">(Optional)</span>
        </label>
        <textarea
          id="bio"
          v-model="form.bio"
          rows="3"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
          :class="{
            'border-red-300 focus:ring-red-500': errors.bio,
            'opacity-50': loading
          }"
          placeholder="Tell us about yourself and your workspace..."
          :disabled="loading"
          maxlength="500"
        ></textarea>
        <div class="flex justify-between items-center mt-1">
          <p v-if="errors.bio" class="text-sm text-red-600">{{ errors.bio }}</p>
          <p class="text-sm text-gray-500 ml-auto">{{ form.bio.length }}/500</p>
        </div>
      </div>

      <!-- Password Fields -->
      <div class="space-y-4">
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
              autocomplete="new-password"
              class="w-full px-4 py-3 pl-11 pr-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              :class="{
                'border-red-300 focus:ring-red-500': errors.password,
                'opacity-50': loading
              }"
              placeholder="Create a strong password"
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

        <div>
          <label for="passwordConfirmation" class="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password
          </label>
          <div class="relative">
            <input
              id="passwordConfirmation"
              v-model="form.passwordConfirmation"
              :type="showPasswordConfirmation ? 'text' : 'password'"
              required
              autocomplete="new-password"
              class="w-full px-4 py-3 pl-11 pr-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              :class="{
                'border-red-300 focus:ring-red-500': errors.passwordConfirmation || passwordMismatch,
                'opacity-50': loading
              }"
              placeholder="Confirm your password"
              :disabled="loading"
            />
            <Icon name="lucide:lock" class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <button
              type="button"
              @click="showPasswordConfirmation = !showPasswordConfirmation"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              :disabled="loading"
            >
              <Icon :name="showPasswordConfirmation ? 'lucide:eye-off' : 'lucide:eye'" class="w-5 h-5" />
            </button>
          </div>
          <p v-if="errors.passwordConfirmation" class="mt-2 text-sm text-red-600">{{ errors.passwordConfirmation }}</p>
          <p v-else-if="passwordMismatch" class="mt-2 text-sm text-red-600">Passwords do not match</p>
        </div>
      </div>

      <!-- Password Strength Indicator -->
      <div v-if="form.password" class="space-y-2">
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-600">Password Strength:</span>
          <span class="text-sm font-medium" :class="passwordStrengthColor">{{ passwordStrengthText }}</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="h-2 rounded-full transition-all duration-300"
            :class="passwordStrengthColor.replace('text-', 'bg-')"
            :style="{ width: `${passwordStrengthPercentage}%` }"
          ></div>
        </div>
      </div>

      <!-- Terms and Conditions -->
      <div class="flex items-start">
        <input
          id="acceptTerms"
          v-model="form.acceptTerms"
          type="checkbox"
          required
          class="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          :class="{ 'border-red-300': errors.acceptTerms }"
          :disabled="loading"
        />
        <label for="acceptTerms" class="ml-3 text-sm text-gray-700">
          I agree to the
          <NuxtLink to="/terms" class="text-blue-600 hover:text-blue-500 underline" target="_blank">
            Terms of Service
          </NuxtLink>
          and
          <NuxtLink to="/privacy" class="text-blue-600 hover:text-blue-500 underline" target="_blank">
            Privacy Policy
          </NuxtLink>
        </label>
      </div>
      <p v-if="errors.acceptTerms" class="text-sm text-red-600">{{ errors.acceptTerms }}</p>

      <!-- Marketing Consent -->
      <div class="flex items-start">
        <input
          id="marketingConsent"
          v-model="form.marketingConsent"
          type="checkbox"
          class="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          :disabled="loading"
        />
        <label for="marketingConsent" class="ml-3 text-sm text-gray-700">
          I would like to receive marketing emails about new features and workspace opportunities
        </label>
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
        {{ loading ? 'Creating Account...' : 'Create Account' }}
      </button>
    </form>

    <!-- Sign In Link -->
    <div class="mt-8 text-center">
      <p class="text-gray-600">
        Already have an account?
        <NuxtLink
          to="/auth/login"
          class="text-blue-600 hover:text-blue-500 font-medium transition-colors"
        >
          Sign in here
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProviderRegistrationData } from '~/types'

interface Props {
  loading?: boolean
  errors?: Record<string, string>
}

interface Emits {
  submit: [data: ProviderRegistrationData]
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  errors: () => ({})
})

const emit = defineEmits<Emits>()

const showPassword = ref(false)
const showPasswordConfirmation = ref(false)

const form = ref<ProviderRegistrationData>({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  companyName: '',
  bio: '',
  password: '',
  passwordConfirmation: '',
  acceptTerms: false,
  marketingConsent: false
})

// Password validation
const passwordMismatch = computed(() => {
  return form.value.password !== '' && 
         form.value.passwordConfirmation !== '' && 
         form.value.password !== form.value.passwordConfirmation
})

const passwordStrength = computed(() => {
  const password = form.value.password
  if (!password) return 0
  
  let strength = 0
  if (password.length >= 8) strength += 1
  if (/[a-z]/.test(password)) strength += 1
  if (/[A-Z]/.test(password)) strength += 1
  if (/[0-9]/.test(password)) strength += 1
  if (/[^A-Za-z0-9]/.test(password)) strength += 1
  
  return strength
})

const passwordStrengthPercentage = computed(() => {
  return (passwordStrength.value / 5) * 100
})

const passwordStrengthText = computed(() => {
  switch (passwordStrength.value) {
    case 0:
    case 1:
      return 'Very Weak'
    case 2:
      return 'Weak'
    case 3:
      return 'Fair'
    case 4:
      return 'Good'
    case 5:
      return 'Strong'
    default:
      return 'Very Weak'
  }
})

const passwordStrengthColor = computed(() => {
  switch (passwordStrength.value) {
    case 0:
    case 1:
      return 'text-red-500'
    case 2:
      return 'text-orange-500'
    case 3:
      return 'text-yellow-500'
    case 4:
      return 'text-blue-500'
    case 5:
      return 'text-green-500'
    default:
      return 'text-red-500'
  }
})

// Form validation
const isFormValid = computed(() => {
  return form.value.firstName.trim() !== '' &&
         form.value.lastName.trim() !== '' &&
         form.value.email.trim() !== '' &&
         /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email) &&
         form.value.phone.trim() !== '' &&
         form.value.companyName.trim() !== '' &&
         form.value.password.length >= 8 &&
         form.value.password === form.value.passwordConfirmation &&
         form.value.acceptTerms
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