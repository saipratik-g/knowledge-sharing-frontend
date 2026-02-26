# Knowledge Sharing Platform — Frontend

A modern, responsive React frontend for a knowledge-sharing platform. Users can read, search, and filter articles, create and publish their own, and manage their content via a personal dashboard.

---

## 1️⃣ Approach

### Architecture Overview

The frontend is a **single-page application (SPA)** built with **React 19** and styled with **Tailwind CSS**. It communicates with the backend via **Axios**, using a centralized API client with JWT injection interceptors.

```
App.js (BrowserRouter)
    ├── Public Routes (no auth required)
    │       ├── /login          → Login page
    │       ├── /signup         → Signup page
    │       ├── /              → Home (article list + search/filter)
    │       └── /articles/:id   → Article detail view
    └── Protected Routes (JWT required)
            ├── /create         → Create / Edit article
            └── /dashboard      → My articles dashboard
```

- **`api.js`** — Centralized Axios instance with `baseURL`, JWT request interceptor, and 401 response interceptor (auto-logout)
- **`App.js`** — Route definitions with `PrivateRoute` guard using `localStorage` JWT check
- **Pages** — Full-page components (Home, Login, Signup, ArticleDetail, CreateArticle, Dashboard)
- **Components** — Shared UI components (Navbar)

### Folder Structure

```
knowledge-sharing-frontend/
├── public/                   # Static assets
├── src/
│   ├── api.js                # Axios instance + interceptors
│   ├── App.js                # Routing + layout structure
│   ├── index.js              # React root entry point
│   ├── index.css             # Tailwind directives + custom utilities
│   ├── components/
│   │   └── Navbar.js         # Top navigation bar
│   └── pages/
│       ├── Home.js           # Article feed with search & category filter
│       ├── Login.js          # Login form with JWT storage
│       ├── Signup.js         # Registration form with password strength
│       ├── ArticleDetail.js  # Full article view with author actions
│       ├── CreateArticle.js  # Rich text editor (react-quill-new) + AI improve
│       └── Dashboard.js      # User's own articles with edit/delete
├── .env                      # Environment variables
├── tailwind.config.js        # Tailwind configuration
└── package.json
```

### Key Design Decisions

- **React 19 + react-quill-new** — The standard `react-quill` uses `ReactDOM.findDOMNode` which was removed in React 18+. We use `react-quill-new`, a maintained fork compatible with React 18/19
- **Centralized Axios client** — `api.js` auto-attaches JWT headers to every request and globally handles 401 by clearing localStorage and redirecting to `/login`
- **PrivateRoute pattern** — Protected pages check for JWT token in `localStorage` and redirect to `/login` if absent
- **Tailwind CSS** — Utility-first styling for rapid UI development with custom brand color tokens defined in `tailwind.config.js`
- **Tags stored as strings** — Backend stores tags as comma-separated strings; frontend splits them on render for display
- **Field mapping** — Frontend form fields (`body`, `summary`) are explicitly mapped to backend expectations (`content`, `shortSummary`) in the submit payload

---

## 2️⃣ AI Usage

### Tools Used
- **Antigravity (Google DeepMind AI Coding Assistant)** — primary tool used for UI generation, component structure, debugging, and fixing compatibility issues

### Where AI Helped

| Area | What AI Did |
|------|-------------|
| **Code generation** | Generated all page components (Home, Login, Signup, Dashboard, CreateArticle, ArticleDetail) with full JSX, state management, and API wiring |
| **UI ideas** | Suggested modern card-based layouts, password strength indicator, category color chips, and responsive grid for article feed |
| **Refactoring** | Fixed field name mismatches between frontend form state and backend API expectations across all pages |
| **API design** | Designed the Axios interceptor pattern for JWT injection and auto-logout on 401 |
| **Debugging** | Diagnosed and fixed 10 bugs including base URL mismatch, React 19 incompatibility, tags `.map()` crash, and raw HTML entity display |

### What Was Reviewed / Corrected Manually

- Validated route guard logic for protected pages using JWT presence check
- Reviewed Quill editor configuration (toolbar modules, theme, placeholder)
- Verified form validation (password length check, required fields before submit)
- Confirmed correct field mapping in article submit payload (`body` → `content`, `summary` → `shortSummary`)
- Tested tag search filter to handle both string and array formats from the API

> **Example:** "Used AI to generate rich text editor integration and dashboard UI, then manually corrected field name mismatches between frontend form state and backend API contracts, and fixed `react-quill` React 19 incompatibility by switching to `react-quill-new`."

---

## 3️⃣ Setup Instructions

### Prerequisites

- **Node.js** v18+ ([download](https://nodejs.org))
- **npm** (comes with Node.js)
- Backend server running at `http://localhost:5000` (see backend README)

### Environment Variables

Create a `.env` file in the project root:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

> ⚠️ The `/api` prefix is required — all backend routes are prefixed with `/api`.

### Frontend Setup

```bash
# 1. Clone the repo / navigate to folder
cd knowledge-sharing-frontend

# 2. Install dependencies
npm install

# 3. Create .env file (see above)

# 4. Start the development server
npm start
```

The app opens automatically at **http://localhost:3000**

### Pages & Features

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Article feed with live search and category filter |
| `/login` | Public | Login with email + password |
| `/signup` | Public | Register with username, email + password strength meter |
| `/articles/:id` | Public | Full article detail view with rich HTML content |
| `/create` | 🔒 Auth | Create or edit article with rich text editor + AI improve button |
| `/dashboard` | 🔒 Auth | View, edit, delete your own articles |

> 🔒 = Requires login. Unauthenticated users are redirected to `/login`.

### Tech Stack

| Library | Version | Purpose |
|---------|---------|---------|
| React | 19.2.4 | UI framework |
| react-router-dom | 7.x | Client-side routing |
| axios | 1.x | HTTP client |
| react-quill-new | latest | Rich text editor (React 18/19 compatible) |
| Tailwind CSS | 3.x | Utility-first styling |
| lucide-react | latest | Icon library |
