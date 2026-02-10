# Deployment Guide - Drone Operations Coordinator

This guide covers how to deploy the Drone Operations Coordinator AI Agent on various platforms.

## Quick Start (Simplest Method)

### Option 1: Direct File Opening (No Server Required)
1. Download `index.html`
2. Double-click the file to open in any web browser
3. ✅ That's it! The app will run locally

**Pros:** Zero setup, works immediately  
**Cons:** No URL to share, runs only on your machine

---

## Cloud Deployment Options

### Option 2: Vercel (Recommended - Free & Fast)

**Steps:**
1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Navigate to project folder:
```bash
cd drone-coordinator
```

3. Deploy:
```bash
vercel
```

4. Follow prompts, press Enter for defaults
5. Get instant URL: `https://your-project.vercel.app`

**Time:** 2 minutes  
**Cost:** Free  
**Auto-deploy:** Yes (on git push)

---

### Option 3: Netlify (Great for Teams)

**Method A: Drag & Drop (No CLI)**
1. Go to [netlify.com](https://netlify.com)
2. Sign up/login
3. Drag the entire folder to "Sites" page
4. Get URL instantly

**Method B: CLI**
```bash
npm install -g netlify-cli
netlify deploy
```

**Time:** 1 minute  
**Cost:** Free  
**Features:** Custom domains, form handling, serverless functions

---

### Option 4: GitHub Pages (Free Forever)

**Steps:**
1. Create GitHub repository
2. Push your code:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/drone-coordinator.git
git push -u origin main
```

3. Go to repository Settings → Pages
4. Source: Deploy from branch `main`
5. URL: `https://yourusername.github.io/drone-coordinator`

**Time:** 5 minutes  
**Cost:** Free  
**Best for:** Open source, portfolios

---

### Option 5: Replit (Live Coding & Sharing)

**Steps:**
1. Go to [replit.com](https://replit.com)
2. Create new Repl → Import from GitHub or Upload ZIP
3. Click "Run"
4. Share URL with anyone

**Time:** 1 minute  
**Cost:** Free  
**Features:** Live collaboration, built-in code editor

---

### Option 6: Railway (Backend-Ready)

**Steps:**
1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Railway auto-detects settings
4. Get URL

**Time:** 3 minutes  
**Cost:** Free tier (500 hours/month)  
**Best for:** When you add backend later

---

### Option 7: Render (Full Stack Hosting)

**Steps:**
1. Go to [render.com](https://render.com)
2. New → Static Site
3. Connect GitHub or upload files
4. Build command: Leave empty
5. Publish directory: `.`

**Time:** 2 minutes  
**Cost:** Free  
**Auto-deploy:** Yes

---

## Local Development Server

### Option 8: Quick Local Server (For Testing)

**Using Python (Built-in on Mac/Linux):**
```bash
cd drone-coordinator
python3 -m http.server 8000
```
Open: `http://localhost:8000`

**Using Node.js:**
```bash
npx serve .
```
Open: `http://localhost:3000`

**Using PHP:**
```bash
php -S localhost:8000
```

---

## Recommended Workflow

### For Technical Assignment Submission:
**Use Vercel (Best balance of speed and professionalism)**
```bash
npm install -g vercel
cd drone-coordinator
vercel
```
Copy the URL and submit!

### For Portfolio/Demo:
**Use Netlify or GitHub Pages**
- More control over domain
- Great for long-term hosting

### For Team Collaboration:
**Use Replit**
- Live editing with team members
- Instant sharing

---

## Adding Google Sheets Integration (Future)

When ready to add backend for Google Sheets sync:

1. **Create Backend API**
```bash
mkdir server
cd server
npm init -y
npm install express googleapis
```

2. **Update deployment to include backend:**
   - Vercel: Add `vercel.json` with serverless functions
   - Railway: Automatic Node.js detection
   - Render: Deploy as Web Service (not Static Site)

3. **Environment Variables:**
   All platforms support env vars for API keys:
   - Vercel: Settings → Environment Variables
   - Netlify: Site settings → Build & deploy → Environment
   - Railway: Variables tab
   - Render: Environment tab

---

## Troubleshooting

### Icons Not Showing
- Ensure internet connection (uses Lucide CDN)
- Check browser console for errors

### Blank Page
- Check browser console (F12)
- Verify all files are in same directory
- Try different browser

### Deployment URL Not Working
- Wait 30-60 seconds for CDN propagation
- Check build logs for errors
- Verify deployment settings

---

## Cost Comparison

| Platform | Free Tier | Paid Tier | Best For |
|----------|-----------|-----------|----------|
| Vercel | Yes (100GB bandwidth) | $20/mo | Production apps |
| Netlify | Yes (100GB bandwidth) | $19/mo | Teams |
| GitHub Pages | Yes (1GB storage) | N/A | Open source |
| Replit | Yes (limited compute) | $7/mo | Learning/demos |
| Railway | 500 hrs/mo | $5/mo | Full stack |
| Render | Yes | $7/mo | Simple deploys |

---

## Security Notes

### For Production:
1. **Add HTTPS** (all platforms provide automatically)
2. **Set CORS headers** if adding backend
3. **Environment variables** for API keys (never commit)
4. **Rate limiting** if public-facing
5. **Input validation** before Google Sheets sync

### Example CORS Config (Express Backend):
```javascript
const cors = require('cors');
app.use(cors({
  origin: 'https://your-frontend.vercel.app',
  credentials: true
}));
```

---

## Support

For issues or questions:
- Check README.md
- Review DECISION_LOG.md
- Contact: [Your contact info]

---

**Happy Deploying! 🚀**
