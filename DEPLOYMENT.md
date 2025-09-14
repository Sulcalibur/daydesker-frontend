# DayDeskr Deployment Guide

This guide covers deploying the DayDeskr application with:
- **Frontend (Nuxt.js)**: Cloudflare Pages
- **Backend (Laravel API)**: Railway or DigitalOcean

## 🌐 Frontend Deployment (Cloudflare Pages)

### Prerequisites
- GitHub repository
- Cloudflare account

### Steps:

1. **Push code to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for Cloudflare Pages deployment"
   git push origin main
   ```

2. **Connect to Cloudflare Pages**:
   - Go to [Cloudflare Pages](https://pages.cloudflare.com/)
   - Click "Create a project"
   - Connect your GitHub account
   - Select your DayDeskr repository
   - Choose the branch (main/master)

3. **Configure Build Settings**:
   - **Build command**: `npm run build`
   - **Build output directory**: `.output/public`
   - **Root directory**: (leave empty or set to frontend folder if needed)

4. **Set Environment Variables**:
   ```
   NUXT_PUBLIC_API_BASE_URL=https://your-laravel-api-url.com/api
   ```

5. **Deploy**: Cloudflare will automatically deploy on every push!

### Custom Domain (Optional):
- Add your domain in Cloudflare Pages settings
- Update DNS records as shown

## 🚀 Backend Deployment Options

### Option 1: Railway (Recommended)

1. **Create Railway Account**: [railway.app](https://railway.app)

2. **Deploy from GitHub**:
   - Connect GitHub repository
   - Select Laravel backend folder
   - Railway auto-detects Laravel

3. **Environment Variables**:
   ```
   APP_ENV=production
   APP_DEBUG=false
   APP_KEY=base64:your-app-key
   DB_CONNECTION=mysql
   DB_HOST=your-db-host
   DB_DATABASE=daydeskr
   DB_USERNAME=your-username
   DB_PASSWORD=your-password
   ```

4. **Database**: Use Railway's MySQL service

### Option 2: DigitalOcean App Platform

1. **Create DigitalOcean Account**

2. **Create App**:
   - Connect GitHub repository
   - Select Laravel backend
   - Choose $5/month plan

3. **Add Database**: DigitalOcean Managed MySQL

4. **Configure Environment Variables** (same as Railway)

## 📝 Post-Deployment Steps

1. **Run Database Migrations**:
   ```bash
   # On Railway/DigitalOcean console
   php artisan migrate --force
   ```

2. **Seed Database** (optional):
   ```bash
   php artisan db:seed --force
   ```

3. **Test API Endpoints**:
   - Visit: `https://your-api-url.com/api/workspaces`
   - Should return JSON data

4. **Update Frontend Environment**:
   - In Cloudflare Pages settings
   - Update `NUXT_PUBLIC_API_BASE_URL` to your API URL
   - Redeploy frontend

## 🔧 Local Testing Before Deployment

```bash
# Test build locally
./deploy.sh

# Test with production API
NUXT_PUBLIC_API_BASE_URL=https://your-api-url.com/api npm run dev
```

## 🌟 Final URLs

After deployment, you'll have:
- **Frontend**: `https://your-app.pages.dev` (or custom domain)
- **Backend API**: `https://your-api.railway.app` or DigitalOcean URL

## 🐛 Troubleshooting

### Common Issues:

1. **Build Fails**: Check Node.js version (use Node 18+)
2. **API Not Connecting**: Verify CORS settings in Laravel
3. **Images Not Loading**: Check Unsplash URLs are accessible

### Laravel CORS Configuration:

Add to `config/cors.php`:
```php
'allowed_origins' => [
    'https://your-app.pages.dev',
    'http://localhost:3000'
],
```

## 📊 Performance

- **Cloudflare Pages**: Global CDN, instant loading
- **Railway**: Fast API responses, auto-scaling
- **DigitalOcean**: Reliable hosting, good performance

Your DayDeskr app will be blazingly fast! 🚀