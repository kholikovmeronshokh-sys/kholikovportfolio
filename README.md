# Kholikov Meronshokh - Portfolio Website

A modern, powerful personal portfolio website with project management system.

## Features

✨ Modern landing page with smooth animations
📁 Pinterest-style masonry grid layout
🎨 Purple + Green gradient theme
🔐 Secure admin panel
📤 Upload images & videos
🔍 Search & filter projects
📱 Fully responsive
⚡ Fast & optimized

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- JWT Authentication

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Edit `.env.local` and set your admin credentials:

```
JWT_SECRET=your-super-secret-jwt-key-change-this
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Build for Production

```bash
npm run build
npm start
```

## Routes

- `/landing` - Homepage
- `/projects` - All projects grid
- `/project/:id` - Single project view
- `/admin` - Admin dashboard (login required)

## Admin Panel

1. Go to `/admin`
2. Login with credentials from `.env.local`
3. Add/Edit/Delete projects
4. Upload images and videos

## Default Credentials

- Username: `admin`
- Password: `admin123`

**⚠️ Change these in production!**

## Project Structure

```
├── app/
│   ├── landing/          # Homepage
│   ├── projects/         # Projects grid
│   ├── project/[id]/     # Single project
│   ├── admin/            # Admin panel
│   └── api/              # API routes
├── public/
│   └── uploads/          # Uploaded media
└── data/
    └── projects.json     # Projects database
```

## Features Breakdown

### Landing Page
- Hero section with name and title
- Animated gradient background
- Featured projects preview
- Smooth scroll animations

### Projects Page
- Pinterest-style masonry layout
- Search functionality
- Hover effects
- Lazy loading support

### Admin Panel
- Secure JWT authentication
- Add/Edit/Delete projects
- Image & video upload
- Real-time preview

### Storage
- File-based JSON database
- Persistent uploads in `/public/uploads`
- No data loss on restart

## Customization

### Colors
Edit `app/globals.css`:
```css
:root {
  --purple: #8B5CF6;
  --green: #10B981;
}
```

### Content
Edit `.env.local` for admin credentials and site settings.

## Performance

- Optimized images
- Lazy loading
- Smooth animations
- Fast API routes
- Minimal bundle size

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Personal use only.

---

Built with ❤️ by Kholikov Meronshokh
