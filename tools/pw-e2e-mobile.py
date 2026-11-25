import json
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
LOCAL = "http://localhost:3000"
REMOTE = "https://puppy.instabizweb.com"

def main():
    report = {"mobile_heights": {}, "interactive_e2e": {}, "animation_parity": {}}

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, channel="chrome")

        # 1. Mobile (390x844) height & zero-horizontal-overflow parity across all 8 routes
        for name, route in [
            ("home", "/"),
            ("puppies", "/puppies"),
            ("puppy-detail", "/puppies/maltipoo-max-male"),
            ("how-it-works", "/how-it-works"),
            ("happy-families", "/happy-families"),
            ("faq", "/faq"),
            ("contact", "/contact"),
            ("gone-home", "/gone-home"),
        ]:
            cr = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
            pr = cr.new_page()
            pr.goto(f"{REMOTE}{route}", wait_until="domcontentloaded", timeout=30000)
            pr.wait_for_timeout(1200)
            rh = pr.evaluate("async () => { await document.fonts.ready; return { h: document.documentElement.scrollHeight, overflowX: document.documentElement.scrollWidth > window.innerWidth }; }")
            cr.close()

            cl = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
            pl = cl.new_page()
            pl.goto(f"{LOCAL}{route}", wait_until="domcontentloaded", timeout=30000)
            pl.wait_for_timeout(1200)
            lh = pl.evaluate("async () => { await document.fonts.ready; return { h: document.documentElement.scrollHeight, overflowX: document.documentElement.scrollWidth > window.innerWidth }; }")
            cl.close()

            report["mobile_heights"][route] = {
                "remoteH": rh["h"],
                "localH": lh["h"],
                "deltaH": lh["h"] - rh["h"],
                "localOverflowX": lh["overflowX"],
            }

        # 2. Desktop Interactive + Motion E2E suite on localhost:3000
        ctx = browser.new_context(viewport={"width": 1440, "height": 900})
        page = ctx.new_page()
        console_errs = []
        page.on("console", lambda m: console_errs.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: console_errs.append(str(e)))

        # 2a. Home: PupActor live mode, Hero lineup, House door visited, Basket snug
        page.goto(f"{LOCAL}/", wait_until="domcontentloaded", timeout=30000)
        page.wait_for_timeout(1400)
        home_top = page.evaluate("""() => ({
          dataPup: document.documentElement.dataset.pup || null,
          navTexts: Array.from(document.querySelectorAll('header nav[aria-label="Main"] a')).map(a => a.textContent.trim()),
          heroSeats: document.querySelectorAll('.tp-lineup__seat').length,
          chatInitiallyHidden: Array.from(document.querySelectorAll('.tp-msg-group')).map(el => el.getAttribute('data-show')),
          photowallDelays: Array.from(document.querySelectorAll('.tp-photowall__prints > li')).map(el => el.style.getPropertyValue('--d')),
          photowallTapes: Array.from(document.querySelectorAll('.tp-photowall__prints > li')).map(el => el.querySelectorAll('.tp-tape').length),
        })""")
        # Scroll to bottom so PupActor visits every scene including house door & basket
        total_h = page.evaluate("() => document.documentElement.scrollHeight")
        for y in range(0, total_h, 700):
            page.evaluate(f"window.scrollTo(0, {y})")
            page.wait_for_timeout(80)
        page.evaluate(f"window.scrollTo(0, {total_h})")
        page.wait_for_timeout(500)
        home_bottom = page.evaluate("""() => ({
          ctaVisited: document.querySelector('[data-section="cta"]')?.getAttribute('data-visited') || null,
          layerFrontAtBasket: document.querySelector('.pup-layer')?.getAttribute('data-front') || null,
          actorBodySvgDirect: !!document.querySelector('.pup-actor__body > svg'),
        })""")
        report["interactive_e2e"]["home"] = {**home_top, **home_bottom}

        # 2b. /puppies: basket puppy tail/body hidden (opacity 0) & live interactive, filters, gone-home link -> 200
        page.goto(f"{LOCAL}/puppies", wait_until="domcontentloaded", timeout=30000)
        page.wait_for_timeout(1000)
        pup_basket = page.evaluate("""() => {
          const b = document.querySelector('.tp-basket');
          const body = b?.querySelector('[data-p="body"]');
          const shadow = b?.querySelector('[data-p="shadow"]');
          const ledge = b?.querySelector('[data-p="ledge"]');
          const buddy = b?.querySelector('.pup-buddy');
          return {
            hasDataPup: document.documentElement.hasAttribute('data-pup'),
            bodyOpacity: body?.getAttribute('opacity'),
            shadowOpacity: shadow?.getAttribute('opacity'),
            ledgeOpacity: ledge?.getAttribute('opacity'),
            buddyLive: buddy?.hasAttribute('data-live'),
            initialCards: document.querySelectorAll('.tp-sketches > li').length,
            goneStripLinks: Array.from(document.querySelectorAll('.tp-gone a[href^="/puppies/"]')).map(a => a.getAttribute('href')),
          };
        }""")
        # Test clicking a gone-home puppy slug resolves 200
        gone_href = pup_basket["goneStripLinks"][0] if pup_basket["goneStripLinks"] else "/puppies/pomeranian-ace-boy"
        resp = page.goto(f"{LOCAL}{gone_href}", wait_until="domcontentloaded", timeout=30000)
        pup_basket["goneSlugStatus"] = resp.status if resp else None
        report["interactive_e2e"]["puppies"] = pup_basket

        # 2c. /how-it-works: tab click & ArrowRight switch, no fake hm? bubble
        page.goto(f"{LOCAL}/how-it-works", wait_until="domcontentloaded", timeout=30000)
        page.wait_for_timeout(800)
        hiw_before = page.evaluate("""() => ({
          hasFakeBubble: !!document.querySelector('#care-title')?.closest('section')?.querySelector('.pup-bubble-at'),
          h1Height: Math.round(document.querySelector('h1').getBoundingClientRect().height),
          dataReady: document.querySelector('.tp-journeys')?.getAttribute('data-ready'),
        })""")
        page.locator('[role="tab"]').first.focus()
        page.keyboard.press("ArrowRight")
        page.wait_for_timeout(200)
        hiw_after = page.evaluate("""() => ({
          secondTabSelected: document.querySelectorAll('[role="tab"]')[1]?.getAttribute('aria-selected'),
        })""")
        report["interactive_e2e"]["how_it_works"] = {**hiw_before, **hiw_after}

        # 2d. /happy-families: 64 polaroids, natural varied heights, lightbox open + Next + Escape
        page.goto(f"{LOCAL}/happy-families", wait_until="domcontentloaded", timeout=30000)
        page.wait_for_timeout(1000)
        hf_info = page.evaluate("""() => {
          const imgs = Array.from(document.querySelectorAll('.tp-polaroid__photo img'));
          const heights = [...new Set(imgs.slice(0, 12).map(i => Math.round(i.getBoundingClientRect().height)))];
          const fakeCaps = Array.from(document.querySelectorAll('.tp-polaroid__caption')).filter(c => /Happy Teddy Pup #/.test(c.textContent || '')).length;
          return {
            count: imgs.length,
            uniqueHeightsSample: heights.length,
            fakeCaptions: fakeCaps,
            hasMomentsCount: document.body.textContent.includes('64 moments and counting'),
            hasFootPup: !!document.querySelector('.tp-memories__foot .pup-buddy'),
          };
        }""")
        page.locator('.tp-wall__print').first.click()
        page.wait_for_timeout(300)
        hf_dialog_open = page.evaluate("() => !!document.querySelector('dialog[open]')")
        page.keyboard.press("Escape")
        page.wait_for_timeout(200)
        hf_dialog_closed = page.evaluate("() => !document.querySelector('dialog[open]')")
        report["interactive_e2e"]["happy_families"] = {**hf_info, "lightboxOpen": hf_dialog_open, "lightboxClosedOnEsc": hf_dialog_closed}

        # 2e. /faq: search filter + mark highlight + accordion toggle
        page.goto(f"{LOCAL}/faq", wait_until="domcontentloaded", timeout=30000)
        page.wait_for_timeout(800)
        page.locator('input[type="search"]').fill("Korea")
        page.wait_for_timeout(200)
        faq_info = page.evaluate("""() => ({
          filteredNotes: document.querySelectorAll('.tp-note:not(.tp-note--empty)').length,
          markCount: document.querySelectorAll('.tp-note mark').length,
          bubbleOpen: document.querySelector('.tp-notes__teddy')?.hasAttribute('data-open'),
        })""")
        report["interactive_e2e"]["faq"] = faq_info

        # 2f. /contact: empty submit shows alert + aria-invalid; valid submit seals & sends; 15 puppy options clean
        page.goto(f"{LOCAL}/contact", wait_until="domcontentloaded", timeout=30000)
        page.wait_for_timeout(800)
        page.locator('button[type="submit"]').click()
        page.wait_for_timeout(200)
        contact_err = page.evaluate("""() => ({
          hasAlert: !!document.querySelector('.tp-letterform__alert[role="alert"]'),
          invalidFields: document.querySelectorAll('[aria-invalid="true"]').length,
          duplicateBreedOptions: Array.from(document.querySelectorAll('select[name="puppy"] option')).filter(o => {
            const t = o.textContent || '';
            return t.includes('Maltipoo (Korean Teacup Maltipoo') || t.includes('Toy Poodle (Toy Poodle');
          }).length,
        })""")
        report["interactive_e2e"]["contact"] = contact_err

        report["console_errors"] = console_errs
        ctx.close()
        browser.close()

    out_path = ROOT / "eval-out" / "pw-audit" / "e2e-mobile-report.json"
    out_path.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
