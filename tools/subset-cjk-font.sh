#!/usr/bin/env bash
# Rebuilds the self-hosted CJK font subsets so each contains only the characters
# the pages actually use:
#   assets/fonts/noto-sans-sc-900-subset.woff2   — heavy headings on the studio pages
#   assets/fonts/noto-serif-sc-{500,700}-subset.woff2 — the Dock Fries scene overlay
# Run from the repository root after changing any Chinese text.
set -euo pipefail

ua="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"

chars_of() {
    python3 - "$@" <<'PY'
import sys, re, urllib.parse
import os
text = "".join(open(p, encoding="utf-8").read() for p in sys.argv[1:] if os.path.exists(p))
cjk = sorted(set(re.findall(r"[　-〿一-鿿＀-￯]", text)))
print(urllib.parse.quote("".join(cjk)))
PY
}

fetch_subset() { # family weight chars out
    local css url
    css=$(curl -fsS -A "$ua" "https://fonts.googleapis.com/css2?family=$1:wght@$2&text=$3")
    url=$(printf '%s' "$css" | grep -o 'https://[^)]*' | head -n1)
    curl -fsS "$url" -o "$4"
    ls -l "$4"
}

studio=$(chars_of index.html territory-guardian/index.html strategy-and-sword/index.html dock-fries/index.html)
fetch_subset "Noto+Sans+SC" 900 "$studio" assets/fonts/noto-sans-sc-900-subset.woff2

scene=$(chars_of dock-fries/play/index.html)
fetch_subset "Noto+Serif+SC" 500 "$scene" assets/fonts/noto-serif-sc-500-subset.woff2
fetch_subset "Noto+Serif+SC" 700 "$scene" assets/fonts/noto-serif-sc-700-subset.woff2
