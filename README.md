# C.A.R.S. — Collision Auto Repair Shop

## Overview

Full-featured collision auto repair shop management application. C.A.R.S. streamlines every aspect of running an auto body shop — from intake and estimates to invoicing and customer communication. Built with a modern React frontend and Supabase backend with row-level security, the platform provides real-time dashboards, AI-powered invoice generation, and comprehensive work order tracking.

## Tech Stack

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS 3
- **State Management:** Zustand
- **Backend:** Supabase (Auth, Database, Storage, RLS)
- **Animations:** Framer Motion
- **PDF Generation:** jsPDF
- **Scheduling:** React Big Calendar
- **Error Tracking:** Sentry
- **Testing:** Vitest
- **Deployment:** Vercel

## Features

- **AI Invoice Generation** — Automatically generate detailed repair invoices from work order data
- **Work Order Management** — Create, assign, track, and close repair jobs through a visual pipeline
- **Customer CRM** — Maintain customer profiles, vehicle history, and communication logs
- **Inventory Tracking** — Monitor parts stock levels, costs, and reorder points
- **PDF Generation** — Export professional invoices and estimates as downloadable PDFs via jsPDF
- **Calendar Scheduling** — Drag-and-drop appointment scheduling with React Big Calendar
- **Image Comparison** — Before/after photo overlays for documenting repair quality
- **Email Notifications** — Automated status updates and appointment reminders to customers
- **Row-Level Security** — Supabase RLS policies ensure data isolation and access control
- **Admin Dashboard** — Real-time metrics, revenue tracking, and shop performance analytics
- **Role-Based Access** — Separate views and permissions for admins, technicians, and front desk

## Getting Started

```bash
# Clone the repository
git clone https://github.com/kstephens0331/c.a.r.s..git
cd c.a.r.s.

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Add your Supabase URL, anon key, and Sentry DSN

# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

## Project Structure

```
c.a.r.s./
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Route-level page components
│   ├── stores/          # Zustand state stores
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Supabase client and service modules
│   ├── utils/           # Utility functions and helpers
│   ├── types/           # TypeScript type definitions
│   └── App.tsx          # Root application component
├── supabase/
│   ├── migrations/      # Database migration files
│   └── functions/       # Supabase Edge Functions
├── vite.config.ts       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```

## License

All rights reserved. Proprietary software.

---

**Built by StephensCode LLC**
