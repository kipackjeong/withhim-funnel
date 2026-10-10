# With Him — App Store site

Static site for **With Him**, a published iPhone Bible app. The alarm hands you a short verse to read aloud or type; a chosen Focus Shield pauses selected apps after scrolling. The Bible reader remains free and works offline.

Live at <https://kipackjeong.github.io/withhim-funnel/>. The App Store listing is <https://apps.apple.com/us/app/with-him-wake-in-the-words/id6795353533>.

## Pages

`index.html` is the main landing page. `join.html` keeps its existing URL but is now the download page; `thanks.html` is a welcome and sharing guide, not proof of installation. `support.html`, `privacy.html`, and `terms.html` retain their existing URLs, section anchors, and content while inheriting the landing page's light design system.

The earlier pre-launch waitlist has ended. All download actions go directly to the App Store. The six real app captures used by the landing and download pages live in `assets/screenshots/`: `wake-gate`, `focus-gate`, `today`, `habits`, `bible`, and `notes`.

## App captures

`assets/screenshots/*.png` are real simulator captures of the app's **Pearl Dusk** light theme, taken from the app repo at `admin/assets/withim-ios-screenshots-1.0.14-879b991/raw/1320x2868/en/`. They are resampled to 1206×2622 — the `width`/`height` the pages declare — and quantised with `pngquant --quality=65-92 --speed 1 --strip`, which keeps each file in the 350–730 KB range without visible banding in the theme's gradients. Capture names map to the funnel names directly, except that the app's `library` capture is filed here as `notes.png` because the tab is now **Notes**.

When the app's screens change, re-export from a fresh capture bundle rather than editing these files, and re-check the pages that name what is on screen: the hero and Bible-section `alt` text, the `Free` / `With Him Plus` feature lists on the landing page, and the equivalent sections in `support.html` and `terms.html`. The authoritative split lives in the app's `PlusValueCopy` and `PaywallCopy`: Bible reading, search, highlights, notes, the daily verse, and the verse alarm are free; With Him Plus buys the Focus Shield, sermon recording, and account sync.

The published product also offers optional sermon processing; consult the current privacy policy before making account, cloud, or audio-processing claims on these pages.

## Build

There is no build step or framework. Serve this directory as a static site. `assets/shared.css` contains the shared design tokens and components.

## Updating the pages

The funnel runs on static HTML, CSS, and JavaScript. Keep the App Store URL and current plan terms aligned across the landing and download pages. The landing page's hero through Threads section follows the exported Claude artboard's Instrument Serif/Geist typography, device frames, and 1440px desktop geometry, on the iOS app's own neutral surfaces: #F5F5F5 page ground (the app's measured canvas), #FFFFFF cards, #ECECEC Threads and FAQ bands, and the #0B0D12 night section. Text uses #3C4043 / #5F6368; the amber `--dawn` accent is the only warm colour. The legal and support pages use those same light tokens with a narrower reading measure and contents navigation in `assets/legal.css`. Bump the `shared.css?v=` and `legal.css?v=` values on the affected pages when changing CSS so GitHub Pages serves the new styles.

## Brand icon

The favicon, apple-touch icon, and header/footer mark are all the App Store icon, `App/Resources/Assets.xcassets/AppIcon.appiconset/icon-1024.png` in the app repo, resampled into `assets/favicon-32.png`, `favicon-192.png`, `apple-touch-icon.png` (180px), and `app-icon.png` (128px, the wordmark mark in `shared.css`). When the app icon changes, regenerate those four files from the new 1024px source with `sips -z <size> <size> icon-1024.png --out assets/<name>.png`.

## Social card

`assets/og.png` (1200×630) is rendered from the site's own markup, not drawn by hand, so it cannot drift from the landing page. The card reuses `index.html`'s `<style>` block and the `.wordmark`, `.hero-badge`, `.hero-arch`, and `.device` rules verbatim, placing the live `wake-gate` and `today` captures in the hero's device frames. Regenerate it after a screenshot or hero-copy change: build a temporary `_og.html` that inlines `index.html`'s `<style>` and the font/CSS `<link>`s, give it a 1200×630 `#og` root, screenshot it at a 1440px viewport and 2× device pixel ratio, downscale the top-left 1200×630 region, run it through `pngquant`, and delete `_og.html`. Keep it under ~100 KB; the card is served to every scraper that previews a link.
