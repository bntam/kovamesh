# KovaMesh — Website

Production-ready static website for **KovaMesh** — multi-agent QA that actually runs your code.
Live at **https://bntam.github.io/kovamesh/** · Contact: ngoctam.699@gmail.com · Future custom domain: https://kovamesh.dev

Zero build step, zero framework, zero dependencies at runtime. Plain HTML + CSS + vanilla JS.
The only external resource is none by default — the architecture diagram is a local SVG
(`assets/architecture.svg`) and all images are local. No CDN is required for the site to work.

## Files

| File | What it is |
|---|---|
| `index.html` | Landing page: hero, live interactive demo (3 tabs), architecture & integrations, benchmarks, pricing, CTA, footer |
| `styles.css` | Full theme (dark editorial dev-tool: `#070B14` / mint `#00E5A0` / indigo `#7C8CFF`) |
| `app.js` | Interactive demo: typed terminal animation, Run / Reset, verdict card, per-tab YAML + JSON |
| `assets/` | `logo.svg`, `logo-mark.svg` (favicon), `logo.png`, `avatar-400x400.png`, `opengraph-1200x630.png`, `architecture.svg` |
| `docs/index.html` | Quickstart: install, `kovamesh.yaml`, run, GitHub Actions, exit codes, FAQ |
| `privacy/index.html` | Privacy Policy (21 Nov 2026) |
| `terms/index.html` | Terms of Service (21 Nov 2026) |
| `deploy.sh` | Validates files/links/assets, then prints the deploy commands |

## Local preview (1 command)

```bash
python3 -m http.server 8000
# then open http://localhost:8000/
```

Or with Node:

```bash
npx --yes serve .
```

## Deploy — 1 command each

### GitHub Pages (recommended — live target)

```bash
# repo: https://github.com/bntam/kovamesh — push this folder's contents to the repo root
# then: Settings → Pages → Deploy from a branch → main, folder `/`
# Live at: https://bntam.github.io/kovamesh/
# Later, attach the custom domain in Settings → Pages → Custom domain: `kovamesh.dev`
git add . && git commit -m "Deploy KovaMesh site" && git push
```

### Cloudflare Pages

```bash
npx wrangler pages deploy . --project-name kovamesh
```

Then in the Cloudflare dashboard, attach the custom domain `kovamesh.dev`
(Pages → kovamesh → Custom domains → Set up a custom domain).

### Vercel

```bash
vercel --prod
```

Then attach the domain: `vercel domains add kovamesh.dev` (or in the dashboard:
Project → Settings → Domains → `kovamesh.dev`), and set the DNS records Vercel shows.

## Validate before deploying

```bash
./deploy.sh
```

This checks that every HTML file exists, every local `<img src>` / `<link>` /
`<script src>` target exists, and every internal `href` target exists — and
then prints the three deploy commands above. Fix any `FAIL` line before deploying.

## Notes

- All internal links are relative, so the site works identically at
  `bntam.github.io/kovamesh/`, at `kovamesh.dev` (once attached), on a `*.pages.dev` / `*.vercel.app` preview URL, and locally.
- SEO: title, meta description, OpenGraph + Twitter cards (1200×630 image),
  favicon `assets/logo-mark.svg`.
- Benchmarks on the homepage are labelled as an early internal pilot
  (Nov 2026, n=18 repos, 214 PRs) with a full methodology note — not a
  third-party benchmark.
