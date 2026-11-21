#!/usr/bin/env bash
# KovaMesh website — pre-deploy validation + deploy commands.
# Usage: ./deploy.sh
# Exits non-zero if any check fails. Deploys nothing by itself.
set -u
cd "$(dirname "$0")"

FAIL=0
say()  { printf '%s\n' "$*"; }
ok()   { printf '  PASS  %s\n' "$*"; }
bad()  { printf '  FAIL  %s\n' "$*"; FAIL=1; }

say "== KovaMesh site validation =="

# 1. Required files exist
say "-- required files --"
for f in index.html styles.css app.js README.md \
         docs/index.html privacy/index.html terms/index.html \
         assets/logo.svg assets/logo-mark.svg assets/logo.png \
         assets/avatar-400x400.png assets/opengraph-1200x630.png \
         assets/architecture.svg; do
  if [ -f "$f" ]; then ok "$f"; else bad "missing: $f"; fi
done

# 2. Every local asset reference (img/link/script src|href) resolves to a file.
#    Skips absolute http(s) URLs, mailto:, #anchors, and //protocol-relative URLs.
say "-- local asset/link targets --"
python3 - <<'PY'
import os, re, sys
from html.parser import HTMLParser

fail = 0
checked = set()
class P(HTMLParser):
    def __init__(self, base):
        super().__init__(); self.base = base
    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        for attr in ("src", "href"):
            v = d.get(attr)
            if not v: continue
            if v.startswith(("http://","https://","mailto:","//","#","data:")): continue
            v = v.split("#")[0].split("?")[0]
            if not v: continue
            # resolve relative to the page's directory
            path = os.path.normpath(os.path.join(self.base, v))
            checked.add(path)
            # a directory link is valid iff it serves an index.html
            if os.path.isdir(path):
                path = os.path.join(path, "index.html")
            if os.path.isfile(path):
                print(f"  PASS  {path}  (from {self.base or '.'})")
            else:
                print(f"  FAIL  missing: {path}  (referenced as '{v}')")
                globals().__setitem__("fail", 1)

for root, _, files in os.walk("."):
    for name in sorted(files):
        if name.endswith(".html"):
            full = os.path.join(root, name)
            base = os.path.dirname(full)
            p = P(base)
            with open(full, encoding="utf-8") as fh:
                p.feed(fh.read())
print(f"-- {len(checked)} distinct local targets checked --")
sys.exit(1 if globals().get("fail") else 0)
PY
[ $? -ne 0 ] && FAIL=1

# 3. No placeholder / lorem text
say "-- placeholder check --"
if grep -rniE 'lorem ipsum|TODO|FIXME|placeholder|XXX' --include='*.html' --include='*.css' --include='*.js' . >/dev/null; then
  bad "placeholder text found (see grep output above)"
  grep -rniE 'lorem ipsum|TODO|FIXME|placeholder|XXX' --include='*.html' --include='*.css' --include='*.js' . || true
else
  ok "no lorem ipsum / TODO / FIXME / placeholder text"
fi

# 4. Basic HTML sanity: every <html> file has matching </html>, and JS parses.
say "-- sanity checks --"
for f in index.html docs/index.html privacy/index.html terms/index.html; do
  grep -q '</html>' "$f" && ok "$f has closing </html>" || bad "$f missing </html>"
done
if command -v node >/dev/null 2>&1; then
  node --check app.js && ok "app.js parses (node --check)" || bad "app.js failed node --check"
else
  bad "node not found — could not syntax-check app.js"
fi

say ""
if [ "$FAIL" -ne 0 ]; then
  say "RESULT: VALIDATION FAILED — fix the FAIL lines above before deploying."
  exit 1
fi
say "RESULT: ALL CHECKS PASSED"
say ""
say "== Deploy (pick one) =="
say "  Cloudflare Pages:  npx wrangler pages deploy . --project-name kovamesh"
say "  Vercel:            vercel --prod"
say "  GitHub Pages (recommended): push this folder to https://github.com/bntam/kovamesh then enable Pages (main, /)"
  say "    git add . && git commit -m \"Deploy KovaMesh site\" && git push"
say "  Local preview:     python3 -m http.server 8000   # http://localhost:8000/"
