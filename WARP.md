# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

DayDeskr Frontend is a Nuxt 4 application for booking flexible workspaces, meeting rooms, and offices. It's a modern Vue.js SPA that consumes the DayDeskr API for workspace data and provider information.

**Tech Stack:**
- Nuxt 4 (latest)
- Vue 3.5+ with Composition API
- TypeScript
- Tailwind CSS with custom design system
- Headless UI & Heroicons
- VueUse composables

## Development Commands

### Installation & Setup
```bash
npm install
# or
yarn install
```

### Development
```bash
npm run dev          # Start dev server on localhost:3000
yarn dev             # Alternative with yarn
```

### Build & Deployment
```bash
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run generate     # Generate static site (SSG)
```

### Additional Commands
```bash
npm run postinstall  # Prepare Nuxt (runs automatically after install)
```

## Architecture Overview

### Directory Structure
- `pages/` - File-based routing with Nuxt
  - `index.vue` - Homepage with workspace search
  - `workspaces/[id].vue` - Dynamic workspace detail pages
- `components/` - Reusable Vue components
  - `WorkspaceCard.vue` - Main workspace card component with image carousel
- `composables/` - Vue 3 composables for shared logic
  - `useApi.ts` - API client with error handling and typed responses
- `types/` - TypeScript type definitions for API responses and data models
- `utils/` - Pure utility functions for formatting, validation, etc.
- `layouts/` - Page layouts with navigation and footer
- `app/` - Main app configuration (currently shows Nuxt welcome)

### API Integration
- **Base URL**: Configured via `NUXT_PUBLIC_API_BASE_URL` (defaults to Railway production API)
- **Endpoints**: RESTful API for workspaces (`/api/workspaces`, `/api/workspaces/:id`)
- **Error Handling**: Centralized in `useApi()` composable with proper HTTP status codes
- **Data Fetching**: Uses Nuxt's `useLazyAsyncData` for optimal loading states

### Type System
Strong TypeScript integration with comprehensive interfaces:
- `Workspace` - Core workspace data model
- `WorkspaceProvider` - Provider/host information  
- `User` - User account data
- `PaginatedResponse<T>` - API pagination wrapper
- `WorkspaceFilters` - Search and filter parameters

### Styling System
- **Framework**: Tailwind CSS with custom configuration
- **Design Tokens**: Extended color palette (primary/secondary), custom spacing, animations
- **Components**: Headless UI for accessible interactive components
- **Icons**: Heroicons for consistent iconography
- **Typography**: Inter font loaded via Google Fonts

## Key Features

### Workspace Discovery
- **Search**: Text-based search across workspace names and descriptions
- **Filtering**: By type, location, price range, capacity
- **Pagination**: Server-side pagination with proper loading states

### Workspace Details
- **Image Gallery**: Multi-image carousel with thumbnails and auto-rotation
- **Rich Information**: Full workspace details, amenities, provider info
- **Pricing**: Hourly, daily, and monthly rates
- **Provider Verification**: Visual badges for verified hosts

### UI/UX Patterns
- **Loading States**: Skeleton UI for async data loading
- **Error Handling**: User-friendly error pages with recovery actions
- **Responsive Design**: Mobile-first with breakpoint-specific layouts
- **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation

## Environment Configuration

### Required Environment Variables
```bash
# API Configuration
NUXT_PUBLIC_API_BASE_URL=https://daydeskr-api-production.up.railway.app
```

### Runtime Configuration
- API base URL exposed to client-side code
- SSR enabled by default for SEO optimization
- Image optimization for external domains (Unsplash)

## Data Flow Patterns

### API Calls
1. Use `useApi()` composable for all API interactions
2. Leverage Nuxt's `useLazyAsyncData` for caching and loading states
3. Handle errors consistently with `createError()` for proper status codes

### State Management
- Local component state with `ref()` and `reactive()`
- Computed properties for derived data (e.g., `parsedAmenities`)
- No global state management (Pinia) currently needed

### Navigation
- File-based routing with Nuxt Router
- Dynamic routes for workspace details (`/workspaces/[id]`)
- Programmatic navigation with `navigateTo()`

## Component Patterns

### Vue 3 Composition API
- `<script setup>` syntax throughout
- Composables for reusable logic
- TypeScript interfaces for props and emits

### Styling Conventions
- Tailwind utility classes with responsive modifiers
- Custom CSS only for complex layouts (image carousels)
- Design tokens via Tailwind config extensions

## Development Notes

### Image Handling
- External images from Unsplash domains
- Error handling for broken image URLs
- Optimization via Nuxt Image module

### SEO Optimization
- Dynamic meta tags based on workspace data
- OpenGraph tags for social sharing
- Structured data for better search visibility

### Performance
- Code splitting via Nuxt's automatic optimization
- Lazy loading of images and components
- Minimal bundle size with tree-shaking

## Deployment

Configured for **Cloudflare Pages** deployment:
- Static site generation with `nuxt generate`
- Environment variables via Cloudflare dashboard
- Automatic deployments from git commits

The application is production-ready but missing booking functionality (intentionally disabled with "Coming Soon" state).