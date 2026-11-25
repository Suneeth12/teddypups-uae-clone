import json
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "eval-out" / "motion-eval"
OUT_DIR.mkdir(parents=True, exist_ok=True)

REMOTE = "https://puppy.instabizweb.com"
LOCAL = "http://localhost:3000"

SAMPLE_HOME_JS = """(scrollY) => {
  const actor = document.querySelector('.pup-actor');
  const body = document.querySelector('.pup-actor__body');
  const layer = document.querySelector('.pup-layer');
  const aRect = actor ? actor.getBoundingClientRect() : null;
  const bStyle = body ? getComputedStyle(body) : null;
  const rootG = body?.querySelector('[data-p="root"]');
  const bodyG = body?.querySelector('[data-p="body"]');
  const ledgeG = body?.querySelector('[data-p="ledge"]');
  const haunchG = body?.querySelector('[data-p="haunch"]');
  const meetSection = document.querySelector('.tp-meet');
  const meetTrack = document.querySelector('.tp-meet__track');
  const doorsOpen = Array.from(document.querySelectorAll('.tp-door')).filter(d => d.getAttribute('data-open') === 'true').length;
  const scenesHere = Array.from(document.querySelectorAll('[data-pup-scene]'))
    .map((s, idx) => ({ idx, here: s.getAttribute('data-here'), visited: s.getAttribute('data-visited') }));
  const chatShown = Array.from(document.querySelectorAll('.tp-msg-group')).map(m => m.getAttribute('data-show'));
  const pawPrints = Array.from(document.querySelectorAll('.pup-prints svg'))
    .filter(svg => svg.getAnimations().length > 0).length;
  return {
    scrollY: Math.round(window.scrollY),
    totalH: document.documentElement.scrollHeight,
    dataPup: document.documentElement.dataset.pup || null,
    actorX: aRect ? Math.round(aRect.left) : null,
    actorY: aRect ? Math.round(aRect.top) : null,
    actorW: aRect ? Math.round(aRect.width) : null,
    bodyTransform: bStyle ? bStyle.transform : null,
    layerFront: layer ? layer.getAttribute('data-front') : null,
    holding: actor ? actor.getAttribute('data-holding') : null,
    rootTf: rootG ? rootG.getAttribute('transform') : null,
    bodyOp: bodyG ? bodyG.getAttribute('opacity') : null,
    ledgeOp: ledgeG ? ledgeG.getAttribute('opacity') : null,
    haunchOp: haunchG ? haunchG.getAttribute('opacity') : null,
    meetPinned: meetSection ? getComputedStyle(meetSection).getPropertyValue('--pinned').trim() : null,
    trackLeft: meetTrack ? Math.round(meetTrack.getBoundingClientRect().left) : null,
    doorsOpen,
    scenesHere,
    chatShown,
    pawPrints,
  };
}"""

SAMPLE_BUDDIES_JS = """() => {
  return Array.from(document.querySelectorAll('.pup-buddy')).map((el, idx) => {
    const r = el.getBoundingClientRect();
    const svg = el.querySelector('svg');
    const rootG = svg?.querySelector('[data-p="root"]');
    const bodyG = svg?.querySelector('[data-p="body"]');
    const headG = svg?.querySelector('[data-p="head"]');
    const tailG = svg?.querySelector('[data-p="tail"]');
    const ledgeG = svg?.querySelector('[data-p="ledge"]');
    const haunchG = svg?.querySelector('[data-p="haunch"]');
    const stop = el.closest('[data-pup-stop]');
    return {
      idx,
      cls: el.className,
      facing: el.getAttribute('data-facing'),
      live: el.hasAttribute('data-live'),
      stopPose: stop?.getAttribute('data-pose') || null,
      stopAct: stop?.getAttribute('data-act') || null,
      x: Math.round(r.left),
      y: Math.round(r.top + window.scrollY),
      w: Math.round(r.width),
      h: Math.round(r.height),
      vis: getComputedStyle(el).visibility,
      rootTf: rootG?.getAttribute('transform') || null,
      bodyOp: bodyG?.getAttribute('opacity') || null,
      bodyTf: bodyG?.getAttribute('transform') || null,
      headTf: headG?.getAttribute('transform') || null,
      tailTf: tailG?.getAttribute('transform') || null,
      ledgeOp: ledgeG?.getAttribute('opacity') || null,
      haunchOp: haunchG?.getAttribute('opacity') || null,
      hasBubble: !!el.querySelector('.pup-bubble'),
    };
  });
}"""


def sample_home_trajectory(browser, base_url):
    ctx = browser.new_context(viewport={"width": 1440, "height": 900}, device_scale_factor=1)
    page = ctx.new_page()
    page.goto(f"{base_url}/", wait_until="domcontentloaded", timeout=30000)
    page.wait_for_timeout(2000)
    page.evaluate("async () => { await document.fonts.ready; const c = document.querySelector('.tp-curtain'); if (c) { c.style.display = 'none'; c.dataset.state = 'idle'; } }")
    page.wait_for_timeout(400)

    total_h = page.evaluate("() => document.documentElement.scrollHeight")
    max_scroll = max(1, total_h - 900)
    samples = []
    # 30 evenly spaced depths from 0% to 100%
    for i in range(31):
        target_y = round(max_scroll * (i / 30))
        page.evaluate(f"window.scrollTo(0, {target_y}); window.dispatchEvent(new Event('scroll'));")
        page.wait_for_timeout(220)
        s = page.evaluate(SAMPLE_HOME_JS, target_y)
        s["step"] = i
        s["pct"] = round((i / 30) * 100, 1)
        samples.append(s)
    ctx.close()
    return samples


def sample_all_page_buddies(browser, base_url):
    routes = ["/puppies", "/puppies/maltipoo-max-male", "/how-it-works", "/happy-families", "/faq", "/contact", "/gone-home"]
    out = {}
    for r in routes:
        ctx = browser.new_context(viewport={"width": 1440, "height": 900}, device_scale_factor=1)
        page = ctx.new_page()
        page.goto(f"{base_url}{r}", wait_until="domcontentloaded", timeout=30000)
        page.wait_for_timeout(1400)
        page.evaluate("async () => { await document.fonts.ready; }")
        # Scroll to bottom briefly so below-fold PupBuddy intersection observers activate
        h = page.evaluate("() => document.documentElement.scrollHeight")
        page.evaluate(f"window.scrollTo(0, {h})")
        page.wait_for_timeout(400)
        out[r] = page.evaluate(SAMPLE_BUDDIES_JS)
        ctx.close()
    return out


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, channel="chrome")
        print("Sampling REMOTE home trajectory (31 scroll depths)...", flush=True)
        remote_traj = sample_home_trajectory(browser, REMOTE)
        print("Sampling LOCAL home trajectory (31 scroll depths)...", flush=True)
        local_traj = sample_home_trajectory(browser, LOCAL)

        print("\n=== HOME PUPPY TRAJECTORY DIFF (REMOTE vs LOCAL) ===", flush=True)
        diffs = []
        for r, l in zip(remote_traj, local_traj):
            dx = (l["actorX"] - r["actorX"]) if (l["actorX"] is not None and r["actorX"] is not None) else None
            dy = (l["actorY"] - r["actorY"]) if (l["actorY"] is not None and r["actorY"] is not None) else None
            flag = ""
            if dx is not None and (abs(dx) > 15 or abs(dy) > 15 or l["layerFront"] != r["layerFront"] or l["holding"] != r["holding"] or l["bodyOp"] != r["bodyOp"]):
                flag = " <--- DIFF!"
            print(
                f"Step {r['step']:2d} (Y={r['scrollY']:5d}) | "
                f"Pos R=({r['actorX']},{r['actorY']}) L=({l['actorX']},{l['actorY']}) d=({dx},{dy}) | "
                f"Front R/L={r['layerFront']}/{l['layerFront']} Hold={r['holding']}/{l['holding']} "
                f"BodyOp={r['bodyOp']}/{l['bodyOp']} Doors={r['doorsOpen']}/{l['doorsOpen']} TrackL={r['trackLeft']}/{l['trackLeft']}{flag}",
                flush=True,
            )
            diffs.append({"step": r["step"], "scrollY": r["scrollY"], "dx": dx, "dy": dy, "remote": r, "local": l})

        print("\nSampling ALL 7 non-home pages' PupBuddy instances...", flush=True)
        r_buddies = sample_all_page_buddies(browser, REMOTE)
        l_buddies = sample_all_page_buddies(browser, LOCAL)

        print("\n=== NON-HOME PUPBUDDY COMPARISON ===", flush=True)
        buddy_diffs = {}
        for route in r_buddies:
            rb = r_buddies[route]
            lb = l_buddies[route]
            route_issues = []
            for i in range(max(len(rb), len(lb))):
                a = rb[i] if i < len(rb) else None
                b = lb[i] if i < len(lb) else None
                if not a or not b:
                    route_issues.append({"idx": i, "issue": "count_mismatch", "r": a, "l": b})
                    continue
                for k in ["facing", "live", "stopPose", "bodyOp", "ledgeOp", "haunchOp", "vis", "hasBubble"]:
                    if a[k] != b[k]:
                        route_issues.append({"idx": i, "cls": a["cls"], "field": k, "r": a[k], "l": b[k]})
                if abs(a["x"] - b["x"]) > 8 or abs(a["y"] - b["y"]) > 8 or abs(a["w"] - b["w"]) > 8:
                    route_issues.append({"idx": i, "cls": a["cls"], "field": "rect", "r": (a["x"], a["y"], a["w"]), "l": (b["x"], b["y"], b["w"])})
            buddy_diffs[route] = route_issues
            print(f"{route:<28} | buddies R/L={len(rb)}/{len(lb)} | issues={len(route_issues)}", flush=True)
            for iss in route_issues[:5]:
                print(f"   {iss}", flush=True)

        browser.close()

    (OUT_DIR / "trajectory-report.json").write_text(
        json.dumps({"home_trajectory": diffs, "non_home_buddies": buddy_diffs}, indent=2),
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
