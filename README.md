# EVENTHUB – College Event Management System
> **"Discover. Register. Participate."**

A complete, beginner-friendly, responsive, modular, and secure full-stack web application designed for collegiate event discovery, seat reservation, administrative management, and AI-assisted campus exploration.

---

## 🏛️ System Architecture

EventHub is built using a decoupled three-tier architecture demonstrating industry-standard engineering practices:

```
[ React.js + Vite + Tailwind CSS ]  <--- Browser UI (Port 5173)
           │
           │  1. Client-side Auth / Token exchange
           ▼
   [ Supabase Auth ]
           │
           │  2. Authenticated Session & JWT Bearer Token
           ▼
[ Node.js + Express.js Backend ]     <--- API Server (Port 5000)
    │           │
    │           │  4. Gemini AI SDK (@google/genai)
    │           ▼
    │     [ Google Gemini API ] (Server-side Only)
    │
    │  3. Token verification & Scoped Queries
    ▼
[ Supabase PostgreSQL ]              <--- Row-Level Security (RLS) Database
    ├── profiles
    ├── events
    └── event_registrations
```

### Key Security Safeguards
1. **Never Expose AI or DB Admin Keys**: `GEMINI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` reside exclusively on the Express backend.
2. **Database-Level Protection (RLS)**: PostgreSQL enforces Row Level Security policies so students can only inspect and cancel their own registrations, while administrative mutations require verified `admin` role.
3. **Role Tampering Prevention**: The `profiles` table enforces `CHECK (role IN ('student', 'admin'))`. User profile update endpoints explicitly ignore client-supplied role parameters to prevent privilege escalation.
4. **Backend Authorization Guards**: Express routes enforce `requireAuth` and `requireAdmin` middlewares returning standard `401 Unauthorized` and `403 Forbidden` JSON responses.

---

## 💻 Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, JavaScript, Tailwind CSS, React Router DOM v6, Lucide Icons, Fetch API |
| **Backend** | Node.js, Express.js, CORS, dotenv, Zod (schema validation) |
| **Database & Auth** | Supabase PostgreSQL, Supabase Auth, Row Level Security (RLS) |
| **Artificial Intelligence**| Google Gemini API (`@google/genai` official SDK) |

---

## 📁 Project Directory Structure

```
Actual project/
├── README.md
├── backend/
│   ├── .env.example
│   ├── .env
│   ├── package.json
│   └── src/
│       ├── config/
│       │   └── supabase.js             # Supabase Admin & scoped client factory
│       ├── middleware/
│       │   ├── authMiddleware.js       # JWT extraction & Supabase user verification
│       │   ├── adminMiddleware.js      # Verifies req.profile.role === 'admin' (HTTP 403)
│       │   └── errorMiddleware.js      # Centralized error handler & 404 handler
│       ├── schemas/
│       │   ├── eventSchema.js          # Zod validation for event creation/update
│       │   ├── registrationSchema.js   # Zod validation for registration params & profile
│       │   └── aiSchema.js             # Zod validation for AI assistant input
│       ├── services/
│       │   └── geminiService.js        # Google Gemini AI SDK with DB context grounding
│       ├── controllers/
│       │   ├── eventController.js      # CRUD, search, category filter, sort
│       │   ├── registrationController.js# 10-step registration verification & admin stats
│       │   ├── profileController.js    # Student profile get & safe update
│       │   └── aiController.js         # Grounded Gemini endpoint
│       ├── routes/
│       │   ├── eventRoutes.js          # /api/events
│       │   ├── registrationRoutes.js   # /api/events/:id/register & /api/my-events
│       │   ├── profileRoutes.js        # /api/profile
│       │   ├── adminRoutes.js          # /api/admin/*
│       │   └── aiRoutes.js             # /api/ai/assistant
│       └── server.js                   # Express application entrypoint
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── .env.example
    ├── .env
    ├── package.json
    └── src/
        ├── index.css                   # Tailwind base, components, and glassmorphism
        ├── main.jsx                    # React DOM root
        ├── App.jsx                     # Route definitions & scroll restoration
        ├── context/
        │   └── AuthContext.jsx         # Global user, token, profile, and role state
        ├── services/
        │   ├── supabase.js             # Supabase browser authentication client
        │   └── api.js                  # Centralized Fetch wrapper with Bearer token
        ├── components/
        │   ├── Navbar.jsx              # Responsive header with student/admin navigation
        │   ├── Footer.jsx              # Brand footer and tech stack info
        │   ├── EventCard.jsx           # Card with category badge & remaining seat gauge
        │   ├── EventGrid.jsx           # Responsive 4-column event grid
        │   ├── SearchBar.jsx           # Search input with clear button
        │   ├── FilterBar.jsx           # Category selector pills & sorting dropdown
        │   ├── LoadingSpinner.jsx      # Animated SVG loader
        │   ├── ErrorMessage.jsx        # Styled alert banner with retry trigger
        │   ├── EmptyState.jsx          # Friendly placeholder for empty lists
        │   ├── ProtectedRoute.jsx      # Student route guard (redirects to /login)
        │   ├── AdminRoute.jsx          # Admin route guard (prevents student access)
        │   ├── Modal.jsx               # Confirmation dialog for cancellations & deletions
        │   ├── Button.jsx              # Reusable button with loading & icon support
        │   ├── Input.jsx               # Form input with validation states
        │   ├── Select.jsx              # Dropdown select control
        │   ├── EventForm.jsx           # Validated form for event create & edit
        │   ├── RegistrationButton.jsx  # Full lifecycle register/cancel button
        │   ├── AIChatBox.jsx           # Interactive conversational chatbot
        │   └── DashboardCard.jsx       # Analytics KPI card
        └── pages/
            ├── HomePage.jsx            # Hero, categories, featured, how it works
            ├── EventsPage.jsx          # Searchable, filterable event catalog
            ├── EventDetailPage.jsx     # Detailed event logistics & seat booking
            ├── LoginPage.jsx           # Student/Admin login with demo helper
            ├── RegisterPage.jsx        # Student signup with academic metadata
            ├── StudentDashboardPage.jsx# Registered, upcoming, completed KPIs
            ├── MyEventsPage.jsx        # Student schedule & cancellation modal
            ├── ProfilePage.jsx         # View/edit student profile
            ├── AIAssistantPage.jsx     # Conversational Gemini assistant
            └── admin/
                ├── AdminDashboardPage.jsx    # Campus metrics, recent events & signups
                ├── AdminEventsPage.jsx       # Comprehensive admin data table
                ├── AdminCreateEventPage.jsx  # Event publishing form
                ├── AdminEditEventPage.jsx    # Event editing form
                └── AdminRegistrationsPage.jsx# Registered students roster & CSV export
```

---

## 📊 Database Schema & Row-Level Security

All database tables are created in Supabase PostgreSQL:

```sql
-- 1. Profiles Table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    college TEXT,
    department TEXT,
    year TEXT,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Events Table
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    venue TEXT NOT NULL,
    organizer TEXT NOT NULL,
    image_url TEXT,
    max_participants INTEGER NOT NULL CHECK (max_participants > 0),
    registration_deadline DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Event Registrations Table
CREATE TABLE public.event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);
```

### Security Definer Function & Policies
To avoid recursive policy loops, administrative checks use a `SECURITY DEFINER` function:
```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## ⚡ Step-by-Step Setup & Workshop Guide

### 1. Backend Setup
```bash
cd backend
npm install
# Edit .env if you wish to add your personal Google Gemini API key:
# GEMINI_API_KEY=your_key_here
npm start
```
*The backend starts at `http://localhost:5000`.*
*Health check URL: `http://localhost:5000/api/health`.*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*The frontend starts at `http://localhost:5173`.*

---

## 🧪 Testing the Application

1. **Browse Public Catalog**:
   - Open `http://localhost:5173/` in your browser.
   - Explore the 8 seeded campus events across Hackathon, Workshop, Seminar, Cultural, and Sports.
   - Use the category chips (e.g. *Workshop*) or search bar (*Hack*) on `/events`.

2. **Test Grounded Gemini AI**:
   - Go to `/ai-assistant` or click "Ask AI Assistant".
   - Click the prompt chip: *"What hackathons are available?"*.
   - Notice that the assistant returns accurate details (HackSphere 2026, 120 seats, Innovation Lab) grounded in the PostgreSQL database!

3. **Student Registration Flow**:
   - Click **Register** in the top navigation.
   - Create a student account (e.g. `student@college.edu`).
   - Navigate to any event details page and click **Register Now**.
   - Notice your registration is confirmed, available seats decrease, and the event appears in **My Events** and the **Student Dashboard**.

4. **Admin Role & Management**:
   - Create an admin user or switch role in `profiles`.
   - Access `/admin` to see the analytics overview, manage events, edit details, or view the registered student roster with CSV export.
