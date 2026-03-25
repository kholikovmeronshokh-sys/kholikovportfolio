# Kholikov Meronshokh - Portfolio Website

A modern, powerful personal portfolio website with project management system.

## Features

✨ Modern landing page with smooth animations
📁 Pinterest-style masonry grid layout
🎨 Purple + Green gradient theme
🔐 Secure admin panel
📤 Upload multiple images (max 6 per project)
🎬 Auto slideshow with navigation
🔍 Search & filter projects
📱 Fully responsive
⚡ Fast & optimized
💾 Permanent storage with Vercel KV

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- JWT Authentication
- Vercel KV (Redis)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Edit `.env.local`:

```
JWT_SECRET=kM_p0rtf0l10_s3cr3t_k3y_2024_v3ry_s3cur3_r4nd0m_str1ng_x9z7
ADMIN_USERNAME=kholikov_admin
ADMIN_PASSWORD=Meronshokh@2024!Secure
```

### 3. Setup Vercel KV (Required for Production)

See `VERCEL_SETUP.md` for detailed instructions.

Quick steps:
1. Go to Vercel Dashboard → Storage
2. Create KV Database
3. Connect to your project
4. Redeploy

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Build for Production

```bash
npm run build
npm start
```

## Routes

- `/landing` - Homepage
- `/projects` - All projects grid
- `/project/:id` - Single project view with slideshow
- `/admin` - Admin dashboard (login required)

## Admin Panel Features

1. Go to `/admin`
2. Login with credentials
3. Add/Edit/Delete projects
4. Upload up to 6 images per project
5. Upload videos
6. Auto slideshow on project pages

## Default Credentials

- Username: `kholikov_admin`
- Password: `Meronshokh@2024!Secure`

**⚠️ Change these in production!**

## Project Structure

```
├── app/
│   ├── landing/          # Homepage
│   ├── projects/         # Projects grid
│   ├── project/[id]/     # Single project with slideshow
│   ├── admin/            # Admin panel
│   └── api/              # API routes (Vercel KV)
├── lib/
│   └── storage.ts        # Storage utilities
└── public/
    └── uploads/          # Uploaded media
```

## Features Breakdown

### Landing Page
- Hero section with name and title
- Animated gradient background
- Featured projects preview (6 latest)
- Smooth scroll animations

### Projects Page
- Pinterest-style masonry layout
- Search functionality
- Hover effects with scale animation
- Lazy loading support

### Project Detail Page
- Auto slideshow (3 seconds per image)
- Manual navigation (arrows + dots)
- Image counter (1/6)
- Video support
- Responsive design

### Admin Panel
- Secure JWT authentication
- Add/Edit/Delete projects
- Multiple image upload (max 6)
- Video upload
- Real-time preview
- Remove individual images

### Storage
- Vercel KV (Redis) for permanent storage
- No data loss on restart
- Shared across all users
- Fast and reliable

## Customization

### Colors
Edit `app/globals.css`:
```css
:root {
  --purple: #8B5CF6;
  --green: #10B981;
}
```

### Slideshow Speed
Edit `app/project/[id]/page.tsx`:
```typescript
const interval = setInterval(() => {
  setCurrentImageIndex((prev) => (prev + 1) % project.images.length)
}, 3000) // Change 3000 to desired milliseconds
```

## Performance

- Optimized images with base64 encoding
- Lazy loading
- Smooth animations with Framer Motion
- Fast API routes with Vercel KV
- Minimal bundle size

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Setup Vercel KV (see VERCEL_SETUP.md)
5. Deploy!

Auto-deploys on every push to main branch.

## Vercel KV Free Tier

- 256 MB storage
- 30,000 commands/month
- Perfect for portfolio sites
- Upgrade available if needed

## License

Personal use only.

---

Built with ❤️ by Kholikov Meronshokh
