#!/usr/bin/env python3
"""Cache-busting: append ?v=<content hash> to every reference to a file under assets/.

GitHub Pages lets browsers cache CSS / JS / fonts for a while, so after an update a
visitor can get the new HTML with an old i18n.js or font. With the hash in the URL,
any change to a file changes its address. Run from the repository root after editing
anything in assets/ (tools/subset-cjk-font.sh runs it automatically).
"""
import hashlib, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
# site.css first: stamping its font URLs changes its own hash, which the pages then pick up
PAGES = ['assets/site.css', 'index.html', 'territory-guardian/index.html', 'strategy-and-sword/index.html',
         'dock-fries/index.html', 'dock-fries/play/index.html']
REF = re.compile(r'''((?:\.\./)*(?:assets/)?(?:fonts|vendor)?/?[\w./-]+\.(?:css|js|woff2))(\?v=[0-9a-f]+)?(?=["')])''')

def digest(path):
    return hashlib.md5(path.read_bytes()).hexdigest()[:10]

for page in PAGES:
    src = ROOT / page
    text = src.read_text(encoding='utf-8')
    def stamp(m):
        target = (src.parent / m.group(1)).resolve()
        assets = (ROOT / 'assets').resolve()
        if assets not in target.parents or not target.is_file():
            return m.group(0)
        return f'{m.group(1)}?v={digest(target)}'
    new = REF.sub(stamp, text)
    if new != text:
        src.write_text(new, encoding='utf-8')
        print('stamped', page)
