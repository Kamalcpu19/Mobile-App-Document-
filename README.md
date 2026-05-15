# Mobile App Documentation Website

A modern documentation site built with **Next.js 15**, **React 19**, and **Tailwind CSS**.

## Features

- Collapsible sidebar navigation with 10 modules and 33 pages
- Sticky navbar, search (Ctrl+K), dark/light mode
- Markdown content with syntax highlighting and copy buttons
- Table of contents, breadcrumbs, mobile-responsive layout

---

## 1. Run Locally

### Prerequisites

- **Node.js 20+** ([download](https://nodejs.org/))
- **npm** (included with Node.js)

### Commands

Open PowerShell or Terminal in the project folder:

```powershell
cd "c:\Users\kamal\OneDrive\Desktop\mobile app"

# Install dependencies
npm install

# Start development server
npm run dev
```

### Local URL

Open in your browser:

**http://localhost:3000**

To stop the server: press `Ctrl + C` in the terminal.

### Production build (optional test)

```powershell
npm run build
npm start
```

Then open **http://localhost:3000** (production mode).

---

## 2. Deploy to Netlify (Step-by-Step)

### Step A — Push project to GitHub

1. Create a new repository on GitHub:
   - Go to [https://github.com/new](https://github.com/new)
   - Name: `mobile-app-docs` (or any name)
   - Set to **Public** or **Private**
   - **Do NOT** add README, .gitignore, or license (project already has them)
   - Click **Create repository**

2. Run these commands in PowerShell (replace `YOUR_USERNAME` with your GitHub username):

```powershell
cd "c:\Users\kamal\OneDrive\Desktop\mobile app"

git init
git add .
git commit -m "Initial commit: mobile app documentation site"

git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mobile-app-docs.git
git push -u origin main
```

> If prompted, sign in to GitHub (browser or personal access token).

---

### Step B — Connect GitHub to Netlify

1. Go to [https://app.netlify.com](https://app.netlify.com) and sign in (or create a free account).
2. Click **Add new site** → **Import an existing project**.
3. Click **GitHub** → **Authorize Netlify** (if asked).
4. Select your repository: **mobile-app-docs**.

---

### Step C — Configure build settings

Netlify should auto-detect settings from `netlify.toml`. Verify:

| Setting | Value |
|---------|-------|
| **Branch to deploy** | `main` |
| **Build command** | `npm run build` |
| **Publish directory** | *(leave empty — plugin handles this)* |
| **Node version** | `20` (from `.nvmrc`) |

5. Click **Deploy site**.

---

### Step D — Wait for deployment

- Build takes about **2–4 minutes**.
- When status shows **Published**, your site is live.
- Netlify URL format: `https://random-name-12345.netlify.app`

---

### Step E — Custom site name (optional)

1. In Netlify dashboard → your site → **Domain management**.
2. Click **Options** → **Edit site name**.
3. Choose a name, e.g. `mobile-app-docs` → URL becomes:
   **https://mobile-app-docs.netlify.app**

---

## 3. Routing & Refresh (Already Configured)

This project uses `@netlify/plugin-nextjs` in `netlify.toml`, which:

- Handles all Next.js App Router routes (`/docs/...`)
- Fixes **page refresh 404** issues on deep links
- Runs the search API at `/api/search` as a serverless function

No extra redirect rules are required.

---

## 4. Re-deploy after changes

```powershell
git add .
git commit -m "Update documentation content"
git push
```

Netlify automatically rebuilds on every push to `main`.

---

## 5. Project Structure

```
src/
├── app/                 # Pages & API routes
├── components/          # UI components
├── content/             # Markdown documentation (33 pages)
├── data/navigation.json # Sidebar structure
└── lib/docs.ts          # Content loader
netlify.toml             # Netlify deployment config
.nvmrc                   # Node.js version (20)
```

---

## 6. Update content from Word document

```powershell
node scripts/extract-docx.mjs "c:\Users\kamal\OneDrive\Desktop\mobile.docx"
node scripts/generate-docs-from-docx.mjs
git add .
git commit -m "Update docs from Word file"
git push
```

---

## Tech Stack

- Next.js 15 · React 19 · Tailwind CSS
- Netlify + `@netlify/plugin-nextjs`
- react-markdown · Framer Motion · next-themes

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `npm install` fails | Run `npm install --legacy-peer-deps` |
| Port 3000 in use | Run `npm run dev -- -p 3001` |
| Netlify build fails | Check build logs; ensure Node 20 is selected |
| 404 on refresh | Confirm `netlify.toml` includes `@netlify/plugin-nextjs` |

---

## License

Private — internal mobile app documentation.
