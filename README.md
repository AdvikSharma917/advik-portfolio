# Advik Sharma Portfolio

A personal student portfolio website for Advik Sharma, focused on coding, AI projects, and content creation. The site highlights VoteWise India, early coding projects, Good Plate, skills, background, and contact links.

Live site: https://advik-portfolio917.netlify.app/

## Featured Work

- **VoteWise India** - A non-partisan civic education web app for the Indian election process, ranked #155 of 17,917 submissions in PromptWars Build with AI 2026.
- **Coding projects** - Early projects across HTML, CSS, JavaScript, Node.js, and Python.
- **Good Plate** - An AI food content channel created and managed by Advik, published on YouTube and Instagram.

## Tech Stack

- Plain HTML
- CSS
- Vanilla JavaScript
- Netlify Functions
- Dialogflow ES
- Three.js
- GSAP and ScrollTrigger
- Lenis
- VanillaTilt
- Netlify static hosting

This is intentionally a simple static site. There is no React, Vite, Next.js, or build pipeline.

## Folder Structure

```text
.
├── index.html
├── styles/
│   ├── main.css
│   └── responsive.css
├── scripts/
│   ├── main.js
│   └── animations.js
├── assets/
│   ├── images/
│   └── icons/
├── docs/
├── .github/
├── _headers
├── _redirects
├── favicon.svg
├── robots.txt
├── sitemap.xml
├── site.webmanifest
├── netlify.toml
├── CHANGELOG.md
├── .editorconfig
└── .gitignore
```

## Run Locally

Because this is a static site, you can open `index.html` directly in a browser. For a more realistic local preview, run a small static server from the repository root:

```bash
python3 -m http.server 8080
```

Then visit:

```text
http://localhost:8080
```

## Dialogflow Chatbot

The portfolio includes a secure Netlify Function at:

```text
/.netlify/functions/chat
```

The browser chat bubble sends messages to that backend endpoint. The service account JSON key is never loaded by frontend HTML, CSS, or JavaScript.

For local Dialogflow testing:

1. Put the Google service account JSON key at:

```text
server/dialogflow-key.json
```

2. Add a local `.env` file:

```bash
GOOGLE_APPLICATION_CREDENTIALS=./server/dialogflow-key.json
DIALOGFLOW_PROJECT_ID=advik-digital-twin
```

3. Install dependencies:

```bash
npm install
```

4. Run the Netlify local server:

```bash
npm run dev
```

5. Open the local URL Netlify prints and test the chat bubble.

The Dialogflow agent/intents are in the old Google Cloud project:

```text
advik-digital-twin
```

The service account key can come from the newer project:

```text
advik-digital-twin-api
```

If detectIntent returns a permission error, grant this service account Dialogflow API Client access in the old `advik-digital-twin` project under IAM:

```text
dialogflow-portfolio-bot@advik-digital-twin-api.iam.gserviceaccount.com
```

The local key path, `.env`, and private key files are ignored by Git.

## Deploy on Netlify

This site is configured for Netlify as a static project:

- Publish directory: `.`
- Build command: none
- Main entry file: `index.html`

The `netlify.toml`, `_headers`, and `_redirects` files keep deployment behavior explicit.

For production chatbot credentials:

1. Go to Netlify site settings.
2. Open Environment Variables.
3. Add:

```text
DIALOGFLOW_CREDENTIALS_JSON
```

4. Paste the full service account JSON key contents as the value.
5. Redeploy the site.

Netlify should also have:

```text
DIALOGFLOW_PROJECT_ID=advik-digital-twin
```

## Links

- GitHub: https://github.com/AdvikSharma917
- LinkedIn: https://www.linkedin.com/in/advik-sharma-22a597406/?skipRedirect=true
- Good Plate YouTube: https://www.youtube.com/channel/UCVsSFyCElZjSWhv_ca3_zXA
- Good Plate Instagram: https://www.instagram.com/desi_ai_foodie/?hl=en

## Ownership

This is a personal student portfolio website. All portfolio content, writing, images, and personal branding belong to Advik Sharma.
