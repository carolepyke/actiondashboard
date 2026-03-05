# The Personal Branding SPA — Dashboard Builder
## Vercel Deployment Guide

---

### What's in this folder

| File | Purpose |
|------|---------|
| `src/App.jsx` | The complete dashboard builder (all your dashboards live here) |
| `src/storage.js` | Saves data to the browser |
| `src/main.jsx` | App entry point |
| `index.html` | Page shell |
| `package.json` | Project dependencies |
| `vite.config.js` | Build configuration |

---

### Deploy to Vercel — Step by Step (10 minutes)

**Step 1 — Create a GitHub account (if you don't have one)**
Go to github.com and sign up for free.

**Step 2 — Create a new repository**
- Click the green "New" button on GitHub
- Name it: `spa-dashboard`
- Keep it Private
- Click "Create repository"

**Step 3 — Upload these files**
- Click "uploading an existing file" on the new repo page
- Drag the entire contents of this zip folder in
- Make sure the folder structure looks like this:
  ```
  index.html
  package.json
  vite.config.js
  src/
    App.jsx
    main.jsx
    storage.js
  ```
- Click "Commit changes"

**Step 4 — Deploy on Vercel**
- Go to vercel.com and sign up with your GitHub account
- Click "Add New Project"
- Select your `spa-dashboard` repository
- Vercel will auto-detect it as a Vite project
- Click "Deploy" — that's it

**Step 5 — Get your URL**
Vercel gives you a URL like `spa-dashboard.vercel.app`
You can rename this to something like `spa-dashboard-wtd.vercel.app` in Vercel settings.

**Share this URL with your VA** — they open it in any browser, enter their name,
and you're both working from the same dashboard.

---

### Important note on shared data

The current version saves data to each person's own browser (localStorage).
This means you and your VA each see your own copy.

**To make it truly shared** (both see the same tasks), you have two options:

**Option A — Use the same browser / device**
If you and your VA share a machine, it already works.

**Option B — Add a free cloud sync (recommended)**
Sign up for a free JSONBin account at jsonbin.io.
Then ask your developer or VA to update `src/storage.js` with your JSONBin API key.
This gives you real-time shared data across any device.

---

### Need help?

Share this README with your VA or a developer — the setup is straightforward.
Everything needed to deploy is in this zip file.
