# Studio One Café — QR Giveaway + Review Manager

A production-deployable web app for managing weekly giveaways and capturing customer details via QR codes.

## Features
- **Public Landing Page**: Minimalist, mobile-first design for giveaway entry.
- **TOS Compliance**: Google Review link is explicitly optional and visually separated.
- **Admin Control Panel**: GM can view entries, pick winners, and send notification emails.
- **Persistence**: Powered by Neon Postgres and Drizzle ORM.
- **Automated Reminders**: Netlify Scheduled Functions send weekly reminders to the GM.

## Tech Stack
- **Framework**: Next.js (App Router)
- **Database**: Neon Postgres
- **ORM**: Drizzle
- **Email**: Resend
- **Auth**: JWT-based session with shared password
- **Hosting**: Netlify

## Environment Variables
Create a `.env.local` file with the following:
```bash
DATABASE_URL="postgresql://..."
REVIEW_URL="https://search.google.com/local/writereview?placeid=..."
RESEND_API_KEY="re_..."
EMAIL_FROM="Studio One Cafe <hi@yourdomain.com>"
GM_EMAIL="gm@studioone.cafe"
ADMIN_PASSWORD="your-secure-password"
ADMIN_SESSION_SECRET="random-32-char-string"
APP_BASE_URL="https://your-site.netlify.app"
CRON_SECRET="your-cron-secret"
```

## Setup & Deployment

### 1. Database
Initialize the database schema using Drizzle:
```bash
npm run db:push
```

### 2. Resend
1. Verify Your Domain in Resend.
2. Update `EMAIL_FROM` with your verified sender address.

### 3. Netlify Deployment
1. Push this repository to GitHub.
2. Connect to Netlify.
3. Add the Environment Variables in Netlify UI.
4. Deployment will automatically configure the Scheduled Function for Monday 8:00 AM PST.

## Weekly Ops Checklist
1. **Monday 8:00 AM**: Receive reminder email.
2. **Monday-Tuesday**: Log in to `/admin`.
3. **Pick Winner**: Click "Pick" on the desired entry.
4. **Notify**: Use the action to send the official winner email via Resend.
