<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation Header -->
    <header class="bg-white border-b border-gray-200">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div class="w-full py-6 flex items-center justify-between border-b border-indigo-500 lg:border-none">
          <div class="flex items-center">
            <NuxtLink
              to="/"
              class="text-2xl font-bold text-blue-600 hover:text-blue-700"
            >
              DayDeskr
            </NuxtLink>
          </div>

          <div class="ml-10 space-x-4">
            <NuxtLink
              to="/"
              class="text-base font-medium text-gray-500 hover:text-gray-900"
              active-class="text-blue-600"
            >
              Browse Workspaces
            </NuxtLink>
            
            <!-- Future navigation items -->
            <span class="text-base font-medium text-gray-400">
              Sign In
            </span>
          </div>
        </div>

        <!-- Mobile menu button -->
        <div class="py-4 flex flex-wrap justify-center space-x-6 lg:hidden">
          <NuxtLink
            to="/"
            class="text-base font-medium text-gray-500 hover:text-gray-900"
            active-class="text-blue-600"
          >
            Browse Workspaces
          </NuxtLink>
        </div>
      </nav>
    </header>

    <!-- Main Content -->
    <main>
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 mt-16">
      <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div class="col-span-2">
            <div class="text-2xl font-bold text-blue-600 mb-4">DayDeskr</div>
            <p class="text-gray-600 mb-4">
              Find and book flexible workspaces, meeting rooms, and offices in your area.
            </p>
          </div>

          <div>
            <h3 class="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">
              Company
            </h3>
            <ul class="space-y-3">
              <li>
                <span class="text-base text-gray-500">About</span>
              </li>
              <li>
                <span class="text-base text-gray-500">Contact</span>
              </li>
              <li>
                <span class="text-base text-gray-500">Privacy</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 class="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">
              Support
            </h3>
            <ul class="space-y-3">
              <li>
                <span class="text-base text-gray-500">Help Center</span>
              </li>
              <li>
                <span class="text-base text-gray-500">Guidelines</span>
              </li>
            </ul>
          </div>
        </div>

        <div class="mt-8 border-t border-gray-200 pt-8">
          <p class="text-base text-gray-400 text-center">
            &copy; 2024 DayDeskr. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>