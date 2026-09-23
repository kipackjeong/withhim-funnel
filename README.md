# With Him — App Store site

Static site for **With Him**, a published iPhone Bible app. The alarm hands you a short verse to read aloud or type; a chosen Focus Shield pauses selected apps after scrolling. The Bible reader remains free and works offline.

Live at <https://kipackjeong.github.io/withhim-funnel/>. The App Store listing is <https://apps.apple.com/us/app/with-him-wake-in-the-words/id6795353533>.

## Pages

`index.html` is the main landing page. `join.html` keeps its existing URL but is now the download page; `thanks.html` is a welcome and sharing guide, not proof of installation. `support.html`, `privacy.html`, and `terms.html` retain their existing URLs and content.

The earlier pre-launch waitlist has ended. All download actions go directly to the App Store. The six real app captures used by the landing and download pages live in `assets/screenshots/`.

The published product also offers optional sermon processing; consult the current privacy policy before making account, cloud, or audio-processing claims on these pages.

## Build

There is no build step or framework. Serve this directory as a static site. `assets/shared.css` contains the shared design tokens and components.

## Updating the pages

The funnel runs on static HTML, CSS, and JavaScript. Keep the App Store URL and the current plan terms aligned across the landing and download pages. The light `funnel-v2` styles in `assets/shared.css` are scoped to the redesigned pages; legal and support pages still use their original dark surface.
