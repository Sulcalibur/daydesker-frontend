#!/bin/bash

echo "🔍 Verifying DayDeskr Build for Deployment..."
echo ""

# Check if dist directory exists
if [ -d "dist" ]; then
    echo "✅ Build output directory 'dist' exists"
else
    echo "❌ Build output directory 'dist' not found"
    echo "Run 'npm run build' first"
    exit 1
fi

# Check for required files
required_files=("_worker.js" "_routes.json" "favicon.ico" "workspaces")
for file in "${required_files[@]}"; do
    if [ -e "dist/$file" ]; then
        echo "✅ Required file/folder '$file' exists"
    else
        echo "❌ Required file/folder '$file' missing"
    fi
done

echo ""
echo "📊 Build Statistics:"
echo "📁 Total files in dist/:" $(find dist -type f | wc -l)
echo "💾 Total build size:" $(du -sh dist | cut -f1)

echo ""
echo "🚀 Ready for deployment!"
echo ""
echo "Next steps:"
echo "1. Push to GitHub: git add . && git commit -m 'Deploy' && git push"
echo "2. Connect to Cloudflare Pages"
echo "3. Set build command: npm run build"
echo "4. Set build output: dist"
echo "5. Deploy! 🎉"