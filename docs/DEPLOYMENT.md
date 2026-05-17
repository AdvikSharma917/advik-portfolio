# Deployment

This portfolio is deployed as a static site on Netlify.

## Netlify Settings

- Publish directory: `.`
- Build command: none
- Entry point: `index.html`

The `netlify.toml` file records the publish directory so the setup is clear when the repository is imported into Netlify.

## Files That Matter

- `index.html` - Main page served at the homepage.
- `styles/` - CSS loaded by `index.html`.
- `scripts/` - JavaScript loaded by `index.html`.
- `assets/` - Local static assets if added later.
- `_redirects` - Safe fallback for direct navigation on a one-page site.
- `_headers` - Basic security and cache headers.
- `robots.txt` and `sitemap.xml` - Search engine discovery.
- `site.webmanifest` and `favicon.svg` - Browser metadata and site icon.

## Test Before Publishing

From the repository root:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

Check that:

- CSS loads.
- JavaScript loads.
- The hero animation works on desktop.
- The custom cursor works on desktop pointer devices.
- Mobile layout does not overflow horizontally.
- External project and social links open correctly.
- The browser console has no new errors.

## Common Deployment Issues

- If styles or scripts do not load, confirm paths in `index.html` still match the folder names.
- If Netlify shows a blank page, confirm the publish directory is `.` and `index.html` is at the repository root.
- If SEO files are missing, confirm `robots.txt`, `sitemap.xml`, `site.webmanifest`, and `favicon.svg` are in the publish root.
- If CDN libraries fail, check the browser console and the external script URLs in `index.html`.
