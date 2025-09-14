#!/bin/bash

echo "🚀 Building DayDeskr Frontend for Cloudflare Pages..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build for production
echo "🏗️  Building for production..."
npm run build

echo "✅ Build complete! Ready for Cloudflare Pages deployment."
echo ""
echo "📁 Build output is in: .output/public"
echo ""
echo "Next steps:"
echo "1. Push your code to GitHub"
echo "2. Connect your GitHub repo to Cloudflare Pages"
echo "3. Set build command: 'npm run build'"
echo "4. Set build output directory: '.output/public'"
echo "5. Add environment variable: NUXT_PUBLIC_API_BASE_URL"