# Portfolio Test Instructions

## Problem: Projects save but images don't show

The issue is that Vercel serverless functions reset memory on each request. You MUST setup Vercel KV for persistent storage.

## Quick Test (Local):

1. **Start dev server:**
```bash
npm run dev
```

2. **Open browser console** (F12)

3. **Go to admin:** `http://localhost:3000/admin`
   - Login: `kholikov_admin` / `Meronshokh@2024!Secure`

4. **Add project with image:**
   - Fill title, category, description
   - Upload 1 image (max 2MB)
   - Watch console for: "✓ Image 1 loaded successfully"
   - Click "Create Project"
   - Watch console for: "POST: Creating project: [title] Images: 1"

5. **Go to projects page:** `http://localhost:3000/projects`
   - Click on your project
   - Watch console for: "Project found: [title] Images: 1"
   - Image should display

## If images still don't show:

### Check Console Errors:
- Open browser console (F12)
- Look for red errors
- Share the error message

### Check Network Tab:
- Open browser DevTools → Network tab
- Click on project
- Find the API call to `/api/projects/[id]`
- Check the Response - does it have `images` array?

## For Production (Vercel):

### YOU MUST SETUP VERCEL KV:

1. Go to: https://vercel.com/dashboard
2. Select project: `kholikovportfolio`
3. Click **Storage** tab
4. Click **Create Database**
5. Select **KV (Redis)**
6. Name: `portfolio-kv`
7. Region: **Washington D.C. (iad1)**
8. Click **Create**
9. Click **Connect to Project**
10. Select: `kholikovportfolio`
11. Environment: **Production, Preview, Development**
12. Click **Connect**

Vercel will auto-redeploy and projects will persist!

## Alternative: Use localStorage (Client-side only)

If you want quick fix without Vercel KV, I can make it use localStorage (but only you will see your projects, not visitors).

## Current Status:

- ✅ Admin panel works
- ✅ Projects save (temporarily)
- ✅ Categories work
- ✅ Image upload works
- ❌ Images don't persist on Vercel (need KV)
- ❌ Memory resets on each serverless function call

## What to do:

1. Test locally first (follow steps above)
2. If works locally → Setup Vercel KV
3. If doesn't work locally → Share console errors

---

Need help? Share:
1. Browser console errors (F12)
2. Network tab response for `/api/projects/[id]`
3. Whether it works locally or not
