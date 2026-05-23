# Macro Calculator — Project Context for Claude Code

## What This Is
A free, no-login, no-ads macro and nutrition calculator website.
Target domains: `macrocalculatorfree.com` and `freemacrocalculator.org`

## Tech Stack
- **Framework:** Vite + React (JSX)
- **Styling:** Pure CSS-in-JS — NO Tailwind, NO external CSS files
- **No backend, no database, no API calls — ever**
- **Food data:** `public/foods.json` (flat JSON file, loaded client-side)
- **Hosting:** Vercel (auto-deploys on every GitHub push)
- **Repo:** https://github.com/gavishah/macro-calculator
- **Local path:** C:\Users\gbsha\Documents\macro-calculator

## Key Files
```
macro-calculator/
├── src/
│   └── App.jsx          ← entire app lives here, single component file
├── public/
│   └── foods.json       ← food database (190 raw ingredients, 62KB)
├── vercel.json          ← security headers (iframe protection, XSS)
├── vite.config.js
└── package.json         ← React 19, Vite 8
```

## What the App Does
1. **BMR/TDEE calculator** — 3 formulas: Mifflin-St Jeor (recommended), Harris-Benedict, Katch-McArdle
2. **Macro targets** — protein/carbs/fat with adjustable sliders
3. **Meal builder** — user picks raw ingredients, adjusts grams, sees live macro totals
4. **Micronutrient tracking** — 14 vitamins & minerals with % of daily RDA
5. **Diet filter** — Omnivore / Vegetarian / Vegan
6. **localStorage** — saves user inputs between sessions
7. **Search + category tabs** — for browsing the food database
8. **Single scrolling page** — no routing, no page transitions

## Design System
- **Background:** `#f0f0f3` (off-white)
- **Style:** Neumorphic — soft shadows, no hard borders
- **Shadows:** `6px 6px 12px #cbcbcf, -6px -6px 12px #ffffff`
- **Font:** DM Sans / system-ui
- **Fully mobile responsive**
- Do NOT introduce Tailwind, Bootstrap, or any CSS framework

## Food Database (public/foods.json)
- 190 raw ingredients across 10 categories
- Categories: Fruits, Vegetables, Meat & Poultry, Fish & Seafood, Dairy & Eggs, Legumes, Grains & Cereals, Nuts & Seeds, Oils & Fats, Herbs & Spices
- Every food has: calories, protein, carbs, fat + 14 micronutrients per 100g
- Grains and legumes are **dry/uncooked weight**
- Each category has a `note` field explaining measurement basis
- Future plan: expand to 500+ ingredients (edit JSON + push to GitHub, no backend needed)

## Deployment Flow
```
Edit code locally → git push → Vercel auto-deploys in ~30 seconds
```
- Vercel framework: **Vite**
- Output directory: **dist**
- No manual deploy steps needed

## Security (vercel.json)
- X-Frame-Options: DENY (no iframe embedding)
- X-Content-Type-Options: nosniff
- XSS Protection enabled
- Permissions Policy: no camera/mic/location

## Hard Rules — Never Break These
- No backend, no API, no user accounts — keep it free to run forever
- No external CSS frameworks
- No crowd-sourcing features
- Keep everything client-side
- All food data stays in foods.json (not hardcoded in App.jsx)

## Current Status
- App is fully scaffolded and running
- npm run dev works on localhost:5173
- Git is clean, up to date with origin/main
- Vercel is live and auto-deploying

## Future Plans (not now)
- Expand food database to 500+ ingredients
- SEO optimization (meta tags, structured data)
- Possibly saved meals feature (would need backend at that point)
