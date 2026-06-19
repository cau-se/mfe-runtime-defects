# 01 — Plain HTML Baseline

Part of the `mfe-runtime-defects` artifact

---

## Purpose

This example establishes a zero-dependency baseline that reproduces
both runtime defect classes using only a browser and a single HTML
file. It demonstrates that the defects are not artifacts of any
framework, build tool, or component model — they are properties of
shared browser primitives that any composition strategy must contend
with.

---

## Structure

```
01-plain-html/
  index.html   Self-contained shell and both micro-frontend simulations
```

No build step. No dependencies. Open `index.html` directly in a browser.

---

## What to observe

### D1 — CSS token indirection (visible on first load)

Two `<style>` blocks simulate the global stylesheets that i
ndependently developed micro-frontends would each ship. Both define
the same CSS custom property names at `:root` scope with different
values. The browser cascade applies the last-defined value page-wide,
silently re-theming any component that consumes those tokens via `var()`.

The runtime probe reads `--brand-primary` from `getComputedStyle(document.documentElement)` and compares it against Team A's expected
value. The result is logged to the console and to the visible probe
panel on the page.

### D2 — Route shadowing (visible on navigation)

Two `hashchange` listeners simulate independently developed routers
loaded into the same browser context. Team B's listener contains a
catch-all that redirects any unrecognised route to `#/promo`.
Clicking the `#/cart` link triggers both listeners: Team A's router
handles the route correctly, then Team B's catch-all immediately
overwrites the URL. The probe navigates to `#/cart` programmatically,
waits for both listeners to settle, and asserts that the final hash
matches the requested hash.

---

## Load order experiment (metric M1)

Swap the order of the two `<style>` blocks in `index.html` and
reload. Team A's token values now win the cascade and Team B's
components are re-themed instead. The defect transfers between teams
with no logic change in either unit. This symmetry demonstrates that
the outcome is determined entirely by load order, which is
non-deterministic across deployments.

---

## Key finding for the paper

This example is the control case for the benchmark. Because it
introduces no framework, no component model, and no build tooling, it
isolates the defects to their root cause: the CSS cascade and the
browser history API are global shared resources with no per-consumer
isolation. Every more sophisticated setup in this repository — Lit
web components with Shadow DOM, Angular Elements with emulated
encapsulation — inherits this baseline behaviour. The defects
observed in those examples are not introduced by the frameworks; they
are the same defects, persisting despite the additional isolation
layers each framework provides.
