# 04 — Tailwind CSS v4 design-token configurations

Part of the `mfe-runtime-defects` artifact.

This example is the production-styling stage of the CSS experiment. It answers
one question: does the token failure observed in the industrial system survive
real design-token tooling, and which token declarations are actually safe?

It is a controlled experiment, not a demo you click through. Every outcome is
recorded as a computed style by a headless browser, so the numbers in
[`RESULTS.md`](./RESULTS.md) are reproducible on your machine with
`npm run verify`.

---

## Structure

```
04-tailwind-css/
├── configs/                     the token configurations (experiment inputs)
│   ├── a-indirection.css              @theme, indirect value, no fallback      <- production pattern
│   ├── b-indirection-fallback.css     @theme, indirect value + fallback
│   ├── c-direct.css                   @theme, concrete value
│   ├── d-theme-inline.css             @theme inline, indirect value
│   └── compare.css                    all four in one document, same token names
├── src/
│   ├── index.html               the headline: @theme vs @theme inline, side by side
│   ├── probe.html               full four-by-two matrix, also used by the script
│   ├── index-plain.html         framework-free control: hand-written equivalent of A and D
│   └── index.css                the original `@theme inline` entry, kept for reference
├── scripts/run-probes.sh        drives headless Chrome and cross-checks its own result
├── dist/                        generated CSS (gitignored)
└── RESULTS.md                   committed observations, with browser and date
```

---

## Run

```bash
npm install
npm run verify     # build all configurations, then measure them
```

Or step by step:

```bash
npm run build      # configs/*.css -> dist/*.css
npm run probes     # measured table (needs Chrome or Chromium)
npm run probes -- --json   # raw JSON observations
```

Set `CHROME=/path/to/chromium` if Chrome is not in the default macOS location.

### See it without running anything

Open `src/index.html` after `npm run build`. Two identical boxes, each declaring
`--app-color-primary: #e2533f` on itself, differ only in the utility class:

| | utility | computed | rendered |
|---|---|---|---|
| left | `.bg-indirect` from `@theme` | `rgba(0, 0, 0, 0)` | transparent |
| right | `.bg-inline` from `@theme inline` | `rgb(226, 83, 63)` | red |

Open `src/probe.html` for all four configurations at once, in either scope, via
`?scope=local` (default) or `?scope=global`. Every box prints its own computed
colour underneath, so the page and the script report the same numbers.

---

## The two things that decide the outcome

**Where the token is declared.** `var()` inside a custom property is
substituted where the property is *declared*, not where it is *used*. Tailwind
emits theme variables on `:root`, so an indirect theme value is resolved
against `:root` — before any micro-frontend subtree exists.

**`@theme` vs `@theme inline`.** This is the difference the whole example is
about. The two declarations look interchangeable and the generated CSS is not:

```css
/* source */
@theme         { --color-indirect: var(--app-color-primary); }
@theme inline  { --color-inline:   var(--app-color-primary); }

/* emitted */
.bg-indirect { background-color: var(--color-indirect);     }  /* chain resolved at :root */
.bg-inline   { background-color: var(--app-color-primary);  }  /* chain resolved on the element */
```

`inline` substitutes the theme *value* into the utility, so the lookup moves to
the consuming element. With the concrete value declared only on the element,
that is the difference between a red box and a transparent one. Everything else
in the matrix follows from where the chain gets evaluated.

Token names are identical between `configs/compare.css` and the single-pattern
builds, so the combined view and the isolated measurements are directly
comparable. `scripts/run-probes.sh` verifies this on every run and prints
`combined vs one-config-at-a-time: 16/16 identical`.

One thing that looks like a difference but is not: all four configurations emit
a `:root` token declaration, and in local scope all four compute to the
guaranteed-invalid value. In configuration D that declaration is dead code — the
utility never reads it. What matters is which variable the utility references,
not whether a token exists in `:root`.

---

## Result in one line

`inline` decides whether the component renders at all. Without it, indirection
fails silently when the concrete value is local to the micro-frontend and
hijacks that value when it is global; a fallback hides the failure without
removing the dependency; `@theme inline` moves the failure instead of removing
it; only a concrete value in the theme is stable in all four cells. The full
matrix, with computed colours, is in [`RESULTS.md`](./RESULTS.md).

| config | scope | outcome |
|--------|-------|---------|
| A indirection, no fallback | `:root` | resolves, but to the **global** value even when the element declares its own |
| A indirection, no fallback | local only | **transparent**, no diagnostic |
| B indirection + fallback | `:root` | resolves, global value still wins |
| B indirection + fallback | local only | resolves via fallback (failure masked, dependency kept) |
| C direct value | `:root` | resolves, independent of any other scope |
| C direct value | local only | resolves, independent of any other scope |
| D `@theme inline` | `:root` | resolves per element scope (element value wins) |
| D `@theme inline` | local only | element with a local value resolves; **element without one is transparent** |
| plain CSS control | local only | indirection transparent, direct reference resolves |

---

## What this example contributes to the paper

- It is the third stage of the CSS experiment (plain HTML → Lit/Shadow DOM →
  Tailwind v4), and it is now real code with recorded output rather than a
  described setup.
- It adds a fourth configuration, `@theme inline`, which the current text does
  not cover. Tailwind documents `inline` as the way to reference external
  variables, so teams following the tooling's own guidance land in a
  configuration that fails for elements without a local declaration. That is a
  stronger version of the "you can hit this without doing anything wrong"
  argument.
- It measures the coupling direction, not just the failure: under global scope a
  component that declares its own token value renders with another unit's value.
  A wrong colour is harder to notice than a missing one.
- `src/index-plain.html` is the framework-free control for this specific
  mechanism, so the Tailwind result cannot be dismissed as a tooling bug.

---

## Notes and limits

- One browser, one version. `RESULTS.md` records which; the paper's environment
  table must match it.
- The probe measures `background-color` on a plain element. Whether the failure
  crosses a shadow boundary is `02-lit-web-components`' job.
- The experiment varies token *declarations*, not composition mechanisms. It
  says nothing about module federation, Module Federation, or iframe isolation.
- `postcss.config.js` is only used if you run Tailwind through PostCSS. It uses
  `export default` while `package.json` declares `"type": "commonjs"`, so a
  PostCSS loader would reject it; rename it to `postcss.config.mjs` if you wire
  that path up. The Tailwind CLI ignores the file, which is why the build works
  as is.
