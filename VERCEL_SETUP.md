# Vercel KV Setup Instructions

## 1. Create Vercel KV Database

1. Go to your Vercel Dashboard: https://vercel.com/dashboard
2. Select your project: `kholikovportfolio`
3. Go to **Storage** tab
4. Click **Create Database**
5. Select **KV (Redis)**
6. Choose a name: `portfolio-kv`
7. Select region: **Washington D.C. (iad1)** (closest to your deployment)
8. Click **Create**

## 2. Connect to Your Project

1. After creating, click **Connect to Project**
2. Select your project: `kholikovportfolio`
3. Select environment: **Production, Preview, Development**
4. Click **Connect**

This will automatically add these environment variables:
- `KV_URL`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

## 3. Redeploy

After connecting KV, Vercel will automatically redeploy your project.

## 4. Test

1. Go to your live site
2. Login to `/admin`
3. Add a project
4. Refresh the page - project should still be there!
5. Open in another browser/device - project should be visible!

## Features Now Working:

✅ Permanent storage (data never lost)
✅ Shared across all users (everyone sees same projects)
✅ Fast Redis-based storage
✅ Free tier: 30,000 commands/month
✅ Only admin can edit/delete

## Vercel KV Free Tier:
- 256 MB storage
- 30,000 commands per month
- Perfect for portfolio sites!

---

If you need help, check: https://vercel.com/docs/storage/vercel-kv
