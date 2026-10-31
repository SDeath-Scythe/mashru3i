# Mashrou3i — مشروعي

A landing site for **Mashrou3i (مشروعي)**, a service that helps final-year students with their graduation projects, research papers and defense preparation. Orders are sent straight to WhatsApp — no backend needed.

## Pages

| File | What it does |
|------|--------------|
| `index.html` | Home page: graduation-cap loading animation, sticky translucent navbar (with phone menu), services, how it works, departments, FAQ, call to action, footer |
| `order.html` | Single-screen 3-step order form (type → name & WhatsApp → university, department, date) that opens WhatsApp with the order as a ready text message |

## Assets

- `assets/logo.svg` — logo (also used as the favicon)
- `assets/cursor.svg`, `assets/cursor-hover.svg` — graduation-cap mouse cursor
- `assets/order.js` — order form logic, validation, WhatsApp message builder, and the Netlify Forms backup
- `assets/og.png` — link preview image (WhatsApp, Instagram, Facebook)
- `assets/apple-touch-icon.png` — home-screen icon
- `404.html` — not-found page · `netlify.toml` — headers and caching · `robots.txt`, `sitemap.xml`

## Orders

Each order is sent two ways at once: it opens WhatsApp with the message ready, **and** a copy is saved to Netlify Forms (form name `order`). So even if a student never presses send inside WhatsApp, the order shows up in Netlify → Forms, and Netlify can email you each one (Forms → Form notifications → Email).

## Settings

- **WhatsApp number that receives orders:** `WA_TO` at the top of `assets/order.js` (currently `9647738293881` = 0773 829 3881, international format without `+`).
- **Brand colours:** orange `#C8502E`, navy `#14204A`, cream `#FBF5EA`, white.
- **Fonts:** Alexandria (headings) and IBM Plex Sans Arabic (body), loaded from Google Fonts.

## Run locally

It is a static site — open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

## Deploy

Live on Netlify: https://mashru3i.netlify.app — no build step, the folder is published as-is. The order backup uses Netlify Forms, so it only works when hosted on Netlify.
