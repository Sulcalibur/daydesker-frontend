# DayDeskr Frontend

> Modern workspace booking platform built with Nuxt 4 and Vue 3

DayDeskr is a comprehensive workspace booking platform that enables organizations to efficiently manage and book desks, meeting rooms, and other workspace resources. This frontend application provides an intuitive interface for users to search, book, and manage their workspace reservations.

## ✨ Features

- 🏢 **Workspace Management** - Browse and book desks, meeting rooms, and shared spaces
- 🔍 **Smart Search** - Advanced filtering by location, amenities, and availability
- 📅 **Real-time Booking** - Instant booking confirmation with calendar integration
- 📊 **Analytics Dashboard** - Usage statistics and booking insights
- 🎨 **Modern UI** - Clean, responsive design with Tailwind CSS
- 🌙 **Dark Mode** - Built-in theme switching
- 📱 **Mobile Responsive** - Optimized for all device sizes
- ⚡ **Fast Performance** - Server-side rendering with Nuxt 4

## 🛠 Tech Stack

- **Framework**: [Nuxt 4](https://nuxt.com/) - The Intuitive Vue Framework
- **Frontend**: [Vue 3](https://vuejs.org/) with Composition API
- **Language**: [TypeScript](https://www.typescriptlang.org/) for type safety
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for utility-first CSS
- **Icons**: [Heroicons](https://heroicons.com/) via Iconify
- **Fonts**: [Google Fonts](https://fonts.google.com/) (Inter)
- **Deployment**: [Cloudflare Pages](https://pages.cloudflare.com/)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **pnpm** (recommended) or npm/yarn
- **Git** for version control

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd daydeskr-frontend
```

### 2. Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# Using npm
npm install

# Using yarn
yarn install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# API Configuration
NUXT_PUBLIC_API_BASE_URL=http://localhost:8000/api

# Optional: Analytics, monitoring, etc.
# NUXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

### 4. Start Development Server

```bash
# Using pnpm
pnpm dev

# Using npm
npm run dev

# Using yarn
yarn dev
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
daydeskr-frontend/
├── assets/              # Static assets (images, styles)
├── components/          # Vue components
│   ├── global/         # Global components
│   ├── ui/             # UI components
│   └── workspace/      # Workspace-specific components
├── composables/         # Vue composables
├── layouts/            # Nuxt layouts
├── middleware/         # Route middleware
├── pages/              # File-based routing
├── plugins/            # Nuxt plugins
├── public/             # Public static files
├── server/             # Server-side code
├── stores/             # Pinia stores
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── nuxt.config.ts      # Nuxt configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── package.json        # Project dependencies
```

## 🔧 Available Scripts

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm generate     # Generate static site
pnpm preview      # Preview production build
pnpm postinstall  # Post-installation setup

# Code Quality
pnpm lint         # Run ESLint
pnpm lint:fix     # Fix ESLint issues
pnpm type-check   # Run TypeScript checks

# Testing (if configured)
pnpm test         # Run tests
pnpm test:watch   # Run tests in watch mode
```

## 🌐 API Integration

The frontend communicates with the DayDeskr API backend:

- **Base URL**: Configured via `NUXT_PUBLIC_API_BASE_URL`
- **Authentication**: JWT-based authentication
- **Endpoints**: RESTful API for workspaces, bookings, users
- **Real-time**: WebSocket connections for live updates

### Key API Endpoints

- `GET /api/workspaces` - List available workspaces
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/user/:id` - User's bookings
- `GET /api/analytics` - Booking analytics

## 🚀 Deployment

### Cloudflare Pages (Recommended)

This project is configured for deployment on Cloudflare Pages:

1. **Build Settings**:
   - Build command: `pnpm build`
   - Build output directory: `dist`
   - Node.js version: `20`

2. **Environment Variables**:
   ```
   NUXT_PUBLIC_API_BASE_URL=https://your-api-domain.com/api
   ```

3. **Deploy**:
   - Connect your repository to Cloudflare Pages
   - Configure build settings
   - Deploy automatically on push to main branch

### Alternative Deployment Options

- **Vercel**: `pnpm build` → Deploy `dist` folder
- **Netlify**: `pnpm generate` → Deploy `dist` folder
- **Static Hosting**: `pnpm generate` → Upload `dist` folder

## 🔒 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------||
| `NUXT_PUBLIC_API_BASE_URL` | Backend API base URL | Yes | - |
| `NUXT_PUBLIC_ANALYTICS_ID` | Analytics tracking ID | No | - |
| `NUXT_PUBLIC_SENTRY_DSN` | Error tracking DSN | No | - |

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](../shared/docs/CONTRIBUTING.md) for details.

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feat/amazing-feature`
3. **Commit** your changes: `git commit -m 'feat: add amazing feature'`
4. **Push** to the branch: `git push origin feat/amazing-feature`
5. **Open** a Pull Request

### Code Standards

- Follow [Vue 3 Style Guide](https://vuejs.org/style-guide/)
- Use TypeScript for all new code
- Follow [Conventional Commits](https://conventionalcommits.org/)
- Ensure all tests pass before submitting PR

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../shared/docs/LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [documentation](../shared/docs/)
2. Search [existing issues](../../issues)
3. Create a [new issue](../../issues/new) if needed

## 🔗 Related Projects

- [DayDeskr API](../daydeskr-api/) - Backend API service
- [DayDeskr CMS](https://daydeskr.sulei.pro) - Content management system

---

**Built with ❤️ by the DayDeskr Team**
<!-- Force deployment $(date) -->
