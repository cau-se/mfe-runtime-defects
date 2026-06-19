# 02 — Lit 3.3 Web Components Composition

Part of the `mfe-runtime-defects` artifact.

---

## Purpose

This example demonstrates that Shadow DOM, while providing encapsulation of CSS selector rules, does not prevent the two runtime defect classes identified in the paper. Both defects survive even when each micro-frontend is implemented as a proper web component with a closed shadow root.

---

## Structure

```
02-lit/
  src/
    team-a-checkout.js   Team A — checkout MFE, owns /home and /cart
    team-b-profile.js    Team B — profile MFE, catch-all router
  index.html             Composition shell
  package.json           Lit 3.3.3, Vite 7.0.0
```

---

## Run

```bash
npm install
npm run dev
```

Open the URL printed by Vite, typically `http://localhost:5173`.

---

## What to observe

### D1 — CSS token indirection (visible on first load)

Both components define `--brand-primary`, `--brand-radius`, and
`--brand-spacing` via the Constructable Stylesheets API, which injects
them at `:root` scope. Because CSS custom properties inherit through
shadow boundaries by specification — that inheritance being the
standard mechanism for theming web components — the last-loaded
stylesheet wins page-wide.

On first load, Team A's "Pay" button renders blue and square despite
Team A's source declaring red and rounded. Team A's code does not
change; no build warning is produced.

The runtime probe in the shell reads `--brand-primary` from
`getComputedStyle(document.documentElement)` and reads the button's
computed `background-color` through `shadowRoot.querySelector('button')`,
confirming that Shadow DOM did not isolate the token collision.

### D2 — Route shadowing (visible on navigation)

Both components register independent `hashchange` listeners on
`window`. Team B's router contains a catch-all that redirects any
unrecognised route to `#/promo`. When the user navigates to `#/cart`,
Router A handles it correctly, then Router B's catch-all intercepts the
same event and rewrites the URL to `#/promo`. 

Both components remain in the DOM throughout. The routing conflict does
not prevent rendering; it only corrupts navigation state.

---

## Load order experiment (metric M1)

Swap the two `<script type="module">` lines in `index.html` and reload.
Team A's stylesheet now appends last and wins the cascade: Team A's
button renders red, and Team B's card border becomes red instead. The
defect transfers from one team to the other with no source change in
either component. This load-order symmetry is the basis for metric M1
in the benchmark.

---

## Key finding for the paper

Shadow DOM encapsulates CSS rules but not CSS custom property values.
The value behind a `var()` call is always resolved from the document
cascade, which is a shared global scope. This means token indirection
collisions (D1) are a property of the CSS specification itself, not of
any particular framework or isolation strategy. Any architecture that
uses CSS custom properties for theming across independently deployed
units is subject to this class of defect.
