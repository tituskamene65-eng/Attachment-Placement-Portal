# 🎓 SAPMS — Student Attachment Placement Management System

A full-stack web application for managing student industrial attachment (internship) placements between universities, students, and companies.

---

## 📁 Project Structure

```
sapms/
├── client/                  # React frontend (Create React App)
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── context/
│       │   └── AuthContext.js      # JWT auth state + axios config
│       ├── components/
│       │   └── Sidebar.js          # Role-aware navigation sidebar
│       ├── pages/
│       │   ├── AuthPage.js         # Login + Register (all roles)
│       │   ├── StudentDashboard.js # Student portal (5 sub-pages)
│       │   ├── CompanyDashboard.js # Company portal (5 sub-pages)
│       │   └── AdminDashboard.js   # Admin portal (5 sub-pages)
│       ├── App.js                  # React Router setup
│       ├── index.js
│       └── index.css               # Full design system (CSS variables)
│
├── server/
│   ├── index.js             # Express server + all API routes + in-memory DB
│   └── package.json
│
├── package.json             # Root scripts for running both
└── README.md
```

---

## 🚀 Deploy to Vercel

### One-click (recommended)

1. Push this repo to GitHub/GitLab/Bitbucket.
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your repo.
3. Vercel auto-detects the config from `vercel.json`. No extra settings needed for a basic deploy.
4. Hit **Deploy**.

### Environment variables (optional)

Set these in **Vercel → Project → Settings → Environment Variables**:

| Variable | Purpose | Required? |
|---|---|---|
| `FRONTEND_URL` | Restricts CORS to your deployed domain, e.g. `https://sapms.vercel.app` | No (defaults to `*`) |
| `REACT_APP_API_URL` | Only if API and frontend are in separate Vercel projects | No |

### How it works on Vercel

| Layer | What Vercel does |
|---|---|
| `api/index.js` | Deployed as a Node.js Serverless Function |
| `client/` | Built with `react-scripts build`, served as static files |
| `vercel.json` routes | `/auth/*`, `/students/*`, `/companies/*` etc. → API function; everything else → React app |

> ⚠️ **In-memory database**: All data resets on every cold start (serverless function spin-up). This is by design for the demo. For a persistent deployment, replace the in-memory arrays with a hosted database (e.g. PlanetScale, Supabase, MongoDB Atlas).

---

## 🚀 Quick Start (local dev)

### 1. Install dependencies

```bash
# From the project root (sapms/)
cd server && npm install
cd ../client && npm install
```

### 2. Start the backend server

```bash
# In one terminal — from sapms/server/
npm start
# Server runs on http://localhost:5000
```

### 3. Start the React frontend

```bash
# In another terminal — from sapms/client/
npm start
# App opens at http://localhost:3000
```

---

## 🔑 Demo Credentials

| Role    | Email                        | Password     |
|---------|------------------------------|--------------|
| Admin   | admin@university.ac.ke       | admin123     |
| Student | amina@student.ac.ke          | student123   |
| Student | brian@student.ac.ke          | student123   |
| Student | cynthia@student.ac.ke        | student123   |
| Company | hr@safaricom.co.ke           | company123   |
| Company | internships@kcb.co.ke        | company123   |
| Company | careers@andela.com           | company123   |

---

## ✨ Features

### Student Portal
- Register / Login
- Browse companies and view their details
- Browse active attachment opportunities with slot indicators
- Apply with an optional cover letter
- Track application statuses (pending / accepted / rejected)
- View confirmed placement details (company, position, dates)

### Company Portal
- Register / Login
- Post, edit, deactivate and delete attachment opportunities
- Set available slots per opportunity
- Review incoming applications with student details (course, university, year)
- Accept or reject applicants
- View list of confirmed placed students

### Admin Portal
- Comprehensive statistics dashboard
- View and search all registered students
- View all companies and their opportunities
- Monitor all applications across the system with override controls (accept/reject/reset)
- Confirm placements: assign student → opportunity with start/end dates and notes
- Mark placements as completed
- Remove incorrect placements

---

## 🌐 API Reference

### Auth
| Method | Endpoint       | Description               | Auth |
|--------|---------------|---------------------------|------|
| POST   | /auth/register | Register student/company  | No   |
| POST   | /auth/login    | Login (all roles)         | No   |
| GET    | /auth/me       | Get current user          | Yes  |

### Students
| Method | Endpoint        | Description        | Role  |
|--------|-----------------|--------------------|-------|
| GET    | /students       | List all students  | Admin |
| GET    | /students/:id   | Get student        | Admin/Self |

### Companies
| Method | Endpoint        | Description           | Role     |
|--------|-----------------|-----------------------|----------|
| GET    | /companies      | List all companies    | Any      |
| GET    | /companies/:id  | Get company + opps    | Any      |
| PUT    | /companies/:id  | Update company        | Company  |

### Opportunities
| Method | Endpoint             | Description              | Role    |
|--------|----------------------|--------------------------|---------|
| GET    | /opportunities       | List all opportunities   | Any     |
| GET    | /opportunities/:id   | Get single opportunity   | Any     |
| POST   | /opportunities       | Post new opportunity     | Company |
| PUT    | /opportunities/:id   | Edit opportunity         | Company |
| DELETE | /opportunities/:id   | Delete opportunity       | Company |

### Applications
| Method | Endpoint                     | Description             | Role           |
|--------|------------------------------|-------------------------|----------------|
| GET    | /applications                | List (role-filtered)    | Any            |
| POST   | /applications                | Submit application      | Student        |
| PUT    | /applications/:id/status     | Accept / Reject         | Company/Admin  |

### Placements
| Method | Endpoint          | Description              | Role  |
|--------|-------------------|--------------------------|-------|
| GET    | /placements       | List (role-filtered)     | Any   |
| POST   | /placements       | Confirm placement        | Admin |
| PUT    | /placements/:id   | Update placement         | Admin |
| DELETE | /placements/:id   | Remove placement         | Admin |

### Stats
| Method | Endpoint | Description              | Role  |
|--------|----------|--------------------------|-------|
| GET    | /stats   | Dashboard statistics     | Admin |

---

## 🗃️ In-Memory Data Model

```javascript
users[]        // All users (students, companies, admin) with role field
companies[]    // Company profiles linked to company users
opportunities[]// Attachment positions posted by companies
applications[] // Student→opportunity applications with status
placements[]   // Confirmed placements (student→company→opportunity)
tokens{}       // token → userId map (session store)
```

---

## 🔒 Role-Based Access Control

- **Students**: Can only read their own applications and placement; apply to opportunities
- **Companies**: Can only manage their own opportunities and applications therein
- **Admin**: Full read/write access across all entities; can override any application status; confirms placements

---

## 🛠️ Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 18, React Router v6, Axios  |
| Backend   | Node.js, Express 4                |
| Database  | In-memory (JS arrays/objects)     |
| Auth      | Token-based (UUID tokens in memory) |
| Styling   | Custom CSS with CSS variables     |
| Fonts     | DM Serif Display + DM Sans        |

---

## 📝 Notes

- **Data resets on server restart** — this is by design (in-memory DB). Seed data is re-loaded each time.
- The React dev server proxies API calls to `localhost:5000` via the `"proxy"` field in `client/package.json`.
- For production, build the React app with `npm run build` in `/client` and serve the static files from the Express server.
