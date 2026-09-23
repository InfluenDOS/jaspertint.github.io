#!/usr/bin/env bash
# Rebuilds assets/fonts/noto-sans-sc-900-subset.woff2 — a Noto Sans SC Black
# subset containing only the CJK characters used by the site's pages.
# Run from the repository root after changing any Chinese text.
set -euo pipefail

pages=(index.html territory-guardian/index.html strategy-and-sword/index.html)
chars=$(python3 - "${pages[@]}" <<'PY'
import sys, re, urllib.parse
text = "".join(open(p, encoding="utf-8").read() for p in sys.argv[1:])
cjk = sorted(set(re.findall(r"[　-〿一-鿿＀-￯]", text)))
print(urllib.parse.quote("".join(cjk)))
PY
)

ua="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
css=$(curl -fsS -A "$ua" "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@900&text=${chars}")
url=$(printf '%s' "$css" | grep -o 'https://[^)]*' | head -n1)
curl -fsS "$url" -o assets/fonts/noto-sans-sc-900-subset.woff2
ls -l assets/fonts/noto-sans-sc-900-subset.woff2
