# With Him — pre-launch site

Static site for **With Him**, an iOS Bible app in development. The alarm stops when you read a
verse out loud; a focus shield interrupts a long scroll with the same thirty seconds. A complete
offline Bible reader sits underneath, and Scripture is free permanently.

Live at <https://kipackjeong.github.io/withhim-funnel/>

## Pages

`index.html` is the landing page. `demo.html` is the interactive demo — it uses the browser's
Web Speech API so a visitor reads Philippians 4:6-7 (Berean Standard Bible, public domain) into
their own microphone and watches each word illuminate as it is recognised. `join.html` is the
waitlist form and `thanks.html` is the confirmation and referral page.

Note that the web demo uses the browser's speech recognition, which on Safari means audio is
processed by Apple. The iOS app processes speech on-device and never transmits audio. That
difference is disclosed on the demo page itself.

## Build

There is no build step. Plain HTML, CSS and JavaScript with no dependencies and no framework —
open any page directly in a browser. `assets/shared.css` holds the design tokens and shared
components used by all four pages.

## Wiring the form

`join.html` currently stores submissions in `localStorage` and redirects. The block marked
`FORM ENDPOINT` in its script is where a real provider (ConvertKit, Buttondown, Formspree) gets
connected. Analytics calls are stubbed behind a `track()` function on every page and currently
only log to the console.
