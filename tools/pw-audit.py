import json
import os
import subprocess
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "eval-out" / "pw-audit"
OUT_DIR.mkdir(parents=True, exist_ok=True)

REMOTE_BASE = os.environ.get("REMOTE_URL", "https://puppy.instabizweb.com")
LOCAL_BASE = os.environ.get("LOCAL_URL", "http://localhost:3000")

ROUTES = [
    ("home", "/"),
    ("puppies", "/puppies"),
    ("puppy-detail", "/puppies/maltipoo-max-male"),
    ("how-it-works", "/how-it-works"),
    ("happy-families", "/happy-families"),
    ("faq", "/faq"),
    ("contact", "/contact"),
    ("gone-home", "/gone-home"),
]

METRICS_JS = """async () => {
  await document.fonts.ready;
  document.querySelectorAll('video').forEach(v => { v.pause(); try { v.currentTime = 0; } catch {} });
  const curtain = document.querySelector('.tp-curtain');
  if (curtain) { curtain.style.display = 'none'; curtain.setAttribute('data-state', 'idle'); }
  document.querySelectorAll('[data-armed]').forEach(el => el.setAttribute('data-revealed', 'true'));
  document.querySelectorAll('[data-reveal]').forEach(el => el.setAttribute('data-revealed', 'true'));
  // Scroll gently down and back up to trigger lazy image loads cleanly
  const totalH = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
  for (let y = 0; y < totalH; y += 800) {
    window.scrollTo(0, y);
    await new Promise(r => setTimeout(r, 40));
  }
  window.scrollTo(0, 0);
  await new Promise(r => setTimeout(r, 600));

  const scrollHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
  const navLinks = Array.from(document.querySelectorAll('header nav[aria-label="Main"] a')).map(a => ({
    text: a.textContent.trim(),
    href: a.getAttribute('href'),
    active: a.getAttribute('aria-current') === 'page',
    dataActive: a.getAttribute('data-active')
  }));
  const headings = Array.from(document.querySelectorAll('h1, h2, h3')).slice(0, 20).map(h => {
    const cs = getComputedStyle(h);
    const r = h.getBoundingClientRect();
    return {
      tag: h.tagName,
      text: h.textContent.trim().replace(/\\s+/g, ' ').slice(0, 60),
      fontFamily: cs.fontFamily,
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      fontVariationSettings: cs.fontVariationSettings,
      lineHeight: cs.lineHeight,
      letterSpacing: cs.letterSpacing,
      x: Math.round(r.x),
      y: Math.round(r.y + window.scrollY),
      w: Math.round(r.width),
      h: Math.round(r.height),
    };
  });
  const basketBody = document.querySelector('.tp-basket [data-p="body"]');
  const basketShadow = document.querySelector('.tp-basket [data-p="shadow"]');
  const basketLedge = document.querySelector('.tp-basket [data-p="ledge"]');
  const basketInfo = {
    hasDataPup: document.documentElement.hasAttribute('data-pup'),
    bodyOpacityAttr: basketBody ? basketBody.getAttribute('opacity') : null,
    shadowOpacityAttr: basketShadow ? basketShadow.getAttribute('opacity') : null,
    ledgeOpacityAttr: basketLedge ? basketLedge.getAttribute('opacity') : null,
  };
  const loadedFonts = Array.from(document.fonts)
    .filter(f => f.status === 'loaded')
    .map(f => `${f.family}:${f.weight}`);
  const animations = document.getAnimations({ subtree: true }).map(a => ({
    name: a.animationName || a.id || 'anon',
    timeline: a.timeline ? a.timeline.constructor.name : 'unknown',
    playState: a.playState
  }));
  return {
    title: document.title,
    scrollHeight,
    navLinks,
    headings,
    basketInfo,
    loadedFonts: [...new Set(loadedFonts)],
    animationCount: animations.length,
    animationsSample: animations.slice(0, 15)
  };
}"""


def capture(page, url: str, shot_path: Path):
    console_errors = []
    failed_requests = []
    page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
    page.on("pageerror", lambda e: console_errors.append(str(e)))
    page.on("response", lambda r: failed_requests.append({"url": r.url, "status": r.status}) if r.status >= 400 else None)

    page.goto(url, wait_until="domcontentloaded", timeout=30000)
    page.wait_for_timeout(1500)
    metrics = page.evaluate(METRICS_JS)
    page.wait_for_timeout(400)
    # Pause animations before deterministic screenshot
    page.evaluate("() => document.getAnimations({ subtree: true }).forEach(a => { try { a.pause(); } catch {} })")
    page.screenshot(path=str(shot_path), full_page=True, animations="disabled", timeout=45000)
    return metrics, console_errors, failed_requests


def main():
    selected = set(sys.argv[1:])
    routes = [r for r in ROUTES if not selected or r[0] in selected]
    results = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, channel="chrome")
        for name, route_path in routes:
            ctx_r = browser.new_context(viewport={"width": 1440, "height": 900}, device_scale_factor=1)
            page_r = ctx_r.new_page()
            r_shot = OUT_DIR / f"{name}-remote.png"
            r_metrics, _, _ = capture(page_r, f"{REMOTE_BASE}{route_path}", r_shot)
            ctx_r.close()

            ctx_l = browser.new_context(viewport={"width": 1440, "height": 900}, device_scale_factor=1)
            page_l = ctx_l.new_page()
            l_shot = OUT_DIR / f"{name}-local.png"
            l_metrics, l_errs, l_fails = capture(page_l, f"{LOCAL_BASE}{route_path}", l_shot)
            ctx_l.close()

            results.append({
                "name": name,
                "route": route_path,
                "remote": r_metrics,
                "local": l_metrics,
                "localConsoleErrors": l_errs,
                "localFailedRequests": l_fails,
            })
            print(
                f"CAPTURED {route_path:<28} | H: R={r_metrics['scrollHeight']} L={l_metrics['scrollHeight']} "
                f"({l_metrics['scrollHeight'] - r_metrics['scrollHeight']:+d}) | "
                f"Nav: {len(r_metrics['navLinks'])}/{len(l_metrics['navLinks'])} | "
                f"BasketBodyOp: R={r_metrics['basketInfo']['bodyOpacityAttr']} L={l_metrics['basketInfo']['bodyOpacityAttr']} | "
                f"Errs: {len(l_errs)}/{len(l_fails)}",
                flush=True,
            )
        browser.close()

    meta_path = OUT_DIR / "metrics.json"
    meta_path.write_text(json.dumps(results, indent=2), encoding="utf-8")

    # Run Node pixelmatch diff + heading/band summary
    subprocess.run(["node", str(ROOT / "tools" / "pw-diff.mjs")], check=True)


if __name__ == "__main__":
    main()
