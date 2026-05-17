# Architecture

This portfolio is a plain static website. It does not use React, Vite, Next.js, or a package manager. Netlify serves the files directly from the repository root.

## Main Folders

- `index.html` - The full page structure, content sections, external CDN scripts, and stylesheet/script references.
- `styles/main.css` - Core visual system, layout, section styling, components, custom cursor styling, hero fallback styling, cards, contact form, and reveal states.
- `styles/responsive.css` - Responsive overrides for tablet, mobile, coarse pointer devices, and reduced motion.
- `scripts/main.js` - Progressive enhancement, custom cursor logic, scroll progress, active nav state, SVG accessibility cleanup, and contact form mailto behavior.
- `scripts/animations.js` - Three.js hero scene, Lenis smooth scrolling, GSAP reveals, counters, preloader, and VanillaTilt initialization.
- `assets/images` - Reserved for real project or portfolio images.
- `assets/icons` - Reserved for local icon assets if inline SVGs are replaced later.

## Project Data

Project content is currently written directly in `index.html`. That is appropriate for a small static portfolio because it keeps the site simple and deployable without a build step.

The main project areas are:

- Featured project: `#feat`
- Project cards: `#proj`
- Good Plate content section: `#gp`
- Skills: `#sk`
- About: `#ab`
- Contact: `#ct`

## Adding Projects Later

To add a new project, update the project cards inside the `#proj` section of `index.html`. Keep the same card structure and only add links that are live or intentionally public.

If the project list grows large, a future refactor can move project data into `scripts/projects.js`. That file was not added yet because the current site does not need dynamic rendering.

## Runtime Dependencies

The site loads these libraries from CDNs:

- Three.js
- GSAP and ScrollTrigger
- Lenis
- VanillaTilt

If any CDN dependency is changed, test the page locally before deploying.
