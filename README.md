# ScriptNova — Frontend

React + Vite frontend for the ScriptNova AI blog generation platform. Users can generate, edit, star, and manage AI-written blogs with a clean dashboard UI.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + Vite 7 |
| Styling | Tailwind CSS 3 |
| HTTP Client | Axios |
| Routing | React Router DOM v6 |
| Animations | Framer Motion |
| Icons | Lucide React |
| Markdown | react-markdown + remark-gfm |

---

## Project Structure

```
ScriptNova-frontend/
├── public/
│   └── vite.svg
├── src/
│   ├── App.jsx                         # Root component + route definitions
│   ├── main.jsx                        # ReactDOM entry point
│   ├── index.css                       # Global styles + Tailwind base
│   ├── assets/
│   ├── pages/
│   │   ├── Landing.jsx                 # Public landing page
│   │   ├── Auth.jsx                    # Login + Signup page
│   │   ├── Dashboard.jsx               # Main dashboard shell + page routing
│   │   └── About.jsx                   # About page
│   ├── components/
│   │   ├── Navbar.jsx                  # Public navbar
│   │   ├── HeroSection.jsx             # Landing hero
│   │   ├── FeaturesSection.jsx         # Landing features
│   │   ├── PricingSection.jsx          # Landing pricing
│   │   ├── About.jsx                   # About component
│   │   ├── Footer.jsx                  # Footer
│   │   └── dashboard/
│   │       ├── Sidebar.jsx             # Dashboard left nav
│   │       ├── Header.jsx              # Dashboard top bar
│   │       ├── NavButton.jsx           # Sidebar nav button
│   │       ├── BlogGenerator.jsx       # Blog generation form + preview + recent sidebar
│   │       ├── BlogEditor.jsx          # Side-by-side editor + preview with AI tools
│   │       ├── BlogManager.jsx         # Blog grid with star/filter/slug
│   │       ├── SEOChecklist.jsx        # SEO checklist component
│   │       └── Settings.jsx            # User settings
│   ├── services/
│   │   ├── auth.jsx                    # Auth API calls (login, signup, profile)
│   │   └── blog.jsx                    # All blog API calls
│   └── interceptors/
│       └── auth_interceptor.jsx        # Axios auth token interceptor
├── .env                                # Environment variables
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- ScriptNova backend running at `http://localhost:8000`

### 1. Install dependencies
```bash
cd ScriptNova-frontend
npm install
```

### 2. Configure environment
The `.env` file is already present with default values:
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_BRAND_NAME=ScriptNova
```

Change `VITE_API_BASE_URL` if your backend runs on a different port or host.

### 3. Start development server
```bash
npm run dev
```

App runs at `http://localhost:5173`

### Other scripts
```bash
npm run build      # Production build → dist/
npm run preview    # Preview production build locally
npm run lint       # ESLint check
```

---

## Pages

### Landing (`/`)
Public marketing page with Hero, Features, and Pricing sections. Has Sign Up and Login buttons.

### Auth (`/auth`)
Single page handling both login and signup with a toggle. On success, stores the auth token in `localStorage` as `userToken` and redirects to the dashboard.

### Dashboard (`/dashboard`)
The main app. A sidebar-based layout with these sections:

| Section | Key | Description |
|---------|-----|-------------|
| Generate Blog | `generate` | AI blog generation form |
| My Blogs | `manage` | Full blog grid with star/filter |
| Editor | `editor` | Side-by-side markdown editor |
| Settings | `settings` | User profile settings |

---

## Key Components

### BlogGenerator
The main generation flow:

1. User enters a **topic** (saved as `prompt` in the DB)
2. Optionally adds or AI-generates **keywords**
3. Selects **tone** and **length**
4. Clicks **Generate Blog** — backend suggests a title and writes the article
5. Generated blog auto-saves to DB immediately as a draft
6. User can:
   - **Edit the title inline** — auto-patches DB on blur
   - **Regenerate Title** — AI suggests a new title, auto-patches DB
   - **Rephrase / Rearrange / Regenerate** article — auto-patches DB
   - Download as Markdown or plain text
   - Open in the full Editor

Right sidebar shows the **5 most recent blogs** with star indicators and a "View all →" link to My Blogs.

### BlogEditor
Side-by-side editor with live preview:

- **Title input** — editable, with AI regenerate button
- **Content textarea** — raw Markdown
- **Preview pane** — live rendered Markdown
- **★ Star button** in header — toggle favourite, syncs to DB instantly
- **Slug pill** in header — click to copy `/blog/<slug>` to clipboard
- **AI action bar** — Rephrase / Rearrange / Regenerate dropdown, all auto-save to DB
- **💾 Save button** — manual save for title + content changes

### BlogManager
Full blog grid (`My Blogs` page):

- **All / ★ Starred** filter tabs
- Each card shows title, original topic, slug link, date, word count
- **Star icon** on each card — click to toggle favourite (optimistic update)
- **Slug** shown as a copy-to-clipboard link icon (`/slug-here`)
- Starred cards get a subtle yellow border highlight
- Edit and Delete buttons on each card

---

## Services (`src/services/blog.jsx`)

All API calls are centralised here. Every function handles errors through a shared `handleError` utility.

| Function | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| `generateKeywords(title)` | POST | `/generate-keywords/` | AI-generate 8 SEO keywords |
| `generateBlog({prompt, keywords, tone, length})` | POST | `/generate-blog/` | Generate full blog — returns `suggested_title` + `content` |
| `regenerateTitle({prompt, article_content, keywords})` | POST | `/generate-title/` | Get a new AI title for existing article |
| `rephraseBlog({article_content, mode, ...})` | POST | `/rephrase-blog/` | Rephrase, rearrange, or regenerate article |
| `saveBlog(blog)` | POST | `/blogs/` | Save a new blog to DB |
| `getUserBlogs({limit, favourite})` | GET | `/blogs/` | Get all blogs, with optional limit and favourite filter |
| `getBlogById(id)` | GET | `/blogs/<id>/` | Get single blog with full content |
| `getBlogBySlug(slug)` | GET | `/blogs/slug/<slug>/` | Get blog by slug |
| `updateBlog(id, updates)` | PATCH | `/blogs/<id>/` | Partial update — only send changed fields |
| `deleteBlog(id)` | DELETE | `/blogs/<id>/` | Delete a blog |
| `toggleFavourite(id)` | POST | `/blogs/<id>/favourite/` | Toggle star: `'normal'` ↔ `'favourite'` |
| `getBlogStats()` | GET | `/blogs/stats/` | Total blogs, favourites, total words |

---

## Authentication

On login/signup, the backend returns a token which is stored in `localStorage`:

```js
localStorage.setItem("userToken", token)
```

The Axios instance in `blog.jsx` automatically attaches it to every request:

```js
config.headers.Authorization = `Bearer ${token}`
```

To log out, clear `localStorage` and redirect to `/auth`.

---

## Favourite / Star System

The `favourite` field stores `'normal'` or `'favourite'` as a string in the DB (same pattern as the old `status` field). The API also returns a convenience `is_favourite` boolean.

In the frontend, comparisons always use the string:
```js
blog.favourite === "favourite"   // ✅ correct
blog.is_favourite                // ✅ also works (bool helper)
```

Star toggles use **optimistic updates** — the UI flips instantly and reverts silently if the API call fails.

---

## Auto-Save Behaviour

| Action | DB updated? |
|--------|-------------|
| Generate blog | ✅ auto-saved immediately after generation |
| Edit title inline and click away | ✅ auto-patched on blur |
| Regenerate Title | ✅ auto-patched after AI responds |
| Rephrase / Rearrange / Regenerate article | ✅ auto-patched after AI responds |
| Toggle star | ✅ auto-patched immediately |
| Manual edit in Editor | ✅ on clicking 💾 Save |

---

## Slug Usage

Every blog gets a unique slug auto-generated by the backend: `slugify(title)[:550]-{uuid4[:8]}`.

Example: `"AI in Medical Science"` → `"ai-in-medical-science-a3f2b1c4"`

Current uses in the frontend:
- Displayed as a copyable pill in **BlogEditor** header
- Displayed as a copyable link icon in **BlogManager** cards
- Available via `getBlogBySlug(slug)` for future public blog reader pages

When a blog's title is updated, the slug is automatically regenerated by the backend and the new slug syncs back to the frontend.

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:8000` | Backend API base URL |
| `VITE_BRAND_NAME` | `ScriptNova` | App name used in UI |
