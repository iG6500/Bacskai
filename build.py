# -*- coding: utf-8 -*-
"""
BÁCSKAI AKADÉMIA — közös oldal-összeállító
═══════════════════════════════════════════

Mit csinál: a pages/ alatti forrás-oldalakba beilleszti a parts/ alatti
KÖZÖS komponenseket (nav, mobil menü, footer, adatvédelmi ablak, polish
design-réteg), és a kész fájlokat a dist/ mappába írja. A dist/ tartalmát
kell a repo gyökerébe feltölteni.

Használat:  python3 build.py

Ha a menün, footeren vagy a design-rétegen akarsz változtatni, a parts/
alatti EGY fájlt szerkeszted, lefuttatod a buildet, és mind a 7 oldal
frissül. Az oldalak saját tartalmát (hero, szekciók) továbbra is a
pages/ alatti fájlokban szerkeszted.
"""
import re, os, shutil, sys

HERE = os.path.dirname(os.path.abspath(__file__))
PAGES = os.path.join(HERE, "pages")
PARTS = os.path.join(HERE, "parts")
DIST = os.path.join(HERE, "dist")

def part(name):
    with open(os.path.join(PARTS, name), encoding="utf-8") as f:
        return f.read().strip()

def build_page(fname):
    with open(os.path.join(PAGES, fname), encoding="utf-8") as f:
        s = f.read()
    is_index = (fname == "index.html")
    report = []

    # 1) NAV csere
    nav = part("nav_index.html" if is_index else "nav_sub.html")
    s, n = re.subn(r"<nav>.*?</nav>", lambda m: nav, s, count=1, flags=re.S)
    report.append(f"nav:{n}")

    # 2) MOBIL MENÜ csere
    menu = part("mobilemenu_index.html" if is_index else "mobilemenu_sub.html")
    s, n = re.subn(r'<div class="mobile-menu"[^>]*>.*?</div>', lambda m: menu, s, count=1, flags=re.S)
    report.append(f"menu:{n}")

    # 3) FOOTER csere
    footer = part("footer.html")
    s, n = re.subn(r"<footer>.*?</footer>", lambda m: footer, s, count=1, flags=re.S)
    report.append(f"footer:{n}")

    # 4) ADATVÉDELMI ablak — csak ha még nincs az oldalon
    if "privacyOverlay" not in s:
        s = s.replace("</body>", part("privacy.html") + "\n</body>", 1)
        report.append("privacy:+")
    else:
        report.append("privacy:ok")

    # 5) POLISH réteg — idempotens (marker alapján cserél vagy beszúr)
    polish = part("polish.html")
    if "BACSKAI:POLISH:START" in s:
        s = re.sub(r"<!-- BACSKAI:POLISH:START -->.*?<!-- BACSKAI:POLISH:END -->",
                   lambda m: polish, s, count=1, flags=re.S)
        report.append("polish:frissítve")
    else:
        s = s.replace("</head>", polish + "\n</head>", 1)
        report.append("polish:+")

    with open(os.path.join(DIST, fname), "w", encoding="utf-8") as f:
        f.write(s)
    return report

def main():
    os.makedirs(DIST, exist_ok=True)
    ok = True
    for fname in sorted(os.listdir(PAGES)):
        if not fname.endswith(".html"):
            continue
        rep = build_page(fname)
        bad = [r for r in rep if r.endswith(":0")]
        flag = "HIBA" if bad else "OK"
        if bad: ok = False
        print(f"  {fname:24s} {flag}  ({', '.join(rep)})")
    # az esemenyek.js-t változatlanul visszük
    src_ev = os.path.join(HERE, "..", "esemenyek.js")
    if os.path.exists(src_ev):
        shutil.copy(src_ev, os.path.join(DIST, "esemenyek.js"))
        print("  esemenyek.js            OK  (másolva)")
    print("KÉSZ — a dist/ tartalma megy a repo gyökerébe." if ok else "FIGYELEM: volt sikertelen csere!")
    sys.exit(0 if ok else 1)

if __name__ == "__main__":
    main()
