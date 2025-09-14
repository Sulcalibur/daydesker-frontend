# Quick Deploy Guide 🚀

Your Nuxt app is ready for deployment! Here's how to get it live in minutes:

## 🌐 Deploy Frontend to Cloudflare Pages (5 minutes)

### Option 1: GitHub Integration (Recommended)
1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for Cloudflare Pages deployment"
   git push origin main
   ```

2. **Connect Cloudflare Pages**:
   - Go to [pages.cloudflare.com](https://pages.cloudflare.com/)
   - Click "Connect to Git"
   - Select your repository
   - **Build command**: `npm run build`
   - **Build output directory**: `.output/public` or `dist`
   - **Environment variable**: `NUXT_PUBLIC_API_BASE_URL=https://your-api-url.com/api`

### Option 2: Direct Upload (Fastest)
```bash
# Install Wrangler (Cloudflare CLI)
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy directly
npx wrangler pages deploy .output/public --project-name=daydeskr
```

## 🚀 Deploy Backend API

### Railway (Easiest for Laravel)
1. Go to [railway.app](https://railway.app)
2. "New Project" → "Deploy from GitHub repo"
3. Select your Laravel backend folder
4. Add MySQL database service
5. Set environment variables:
   ```
   APP_ENV=production
   APP_DEBUG=false
   APP_KEY=base64:your-generated-key
   ```

### Alternative: DigitalOcean App Platform
1. Go to [cloud.digitalocean.com](https://cloud.digitalocean.com)
2. Create → Apps → GitHub
3. Select Laravel repository
4. Add managed MySQL database
5. Deploy!

## 🔗 Connect Frontend to Backend

After both are deployed, update your frontend:

1. **In Cloudflare Pages dashboard**:
   - Go to Settings → Environment Variables
   - Set: `NUXT_PUBLIC_API_BASE_URL=https://your-api-domain.com/api`
   - Redeploy

2. **Test the connection**:
   - Visit your Cloudflare Pages URL
   - Check if workspace data loads properly

## ✅ Post-Deployment Checklist

- [ ] Frontend loads at Cloudflare Pages URL
- [ ] API responds at `/api/workspaces`
- [ ] Workspace images display correctly
- [ ] Booking form works (shows alert)
- [ ] Phone numbers are clickable
- [ ] Navigation between pages works

## 🌟 Your Live URLs

After deployment:
- **Frontend**: `https://daydeskr.pages.dev` (or your custom domain)
- **Backend API**: `https://your-app.railway.app` or DigitalOcean URL

## 🐛 Quick Fixes

**Build fails?**
- Make sure you're using Node 18+
- Run `npm install` before building

**API not connecting?**
- Check CORS settings in Laravel
- Verify API URL in environment variables

**Images not loading?**
- Unsplash URLs should work globally
- Check browser console for errors

---

Your DayDeskr app is production-ready! 🎉