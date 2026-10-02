# Measured results — Tailwind v4 token configurations

Tables in this file come from `npm run verify` (= `npm run build && npm run
probes`). Re-run it and commit the new numbers; the interpretation sections are
hand-written.

```
browser:  Google Chrome 154.0.8037.93
tailwind: 4.2.2 (@tailwindcss/cli)
node:     24.0.0
date:     2026-10-02T09:47:08Z
```

## The headline: `@theme` vs `@theme inline`

Same element, same local declaration `--app-color-primary: #e2533f`, nothing at
`:root` (scope = local). The two token declarations differ by one keyword.

```css
@theme         { --color-indirect: var(--app-color-primary); }
@theme inline  { --color-inline:   var(--app-color-primary); }
```

Tailwind emits:

```css
.bg-indirect { background-color: var(--color-indirect);      /* chain resolved at :root   */ }
.bg-inline   { background-color: var(--app-color-primary);   /* chain resolved on element */ }
```

Measured on `src/index.html`:

| utility | computed background-color | outcome |
|---------|---------------------------|---------|
| `.bg-indirect` (`@theme`) | `rgba(0, 0, 0, 0)` | invalid at computed-value time, silently |
| `.bg-inline` (`@theme inline`) | `rgb(226, 83, 63)` | resolved |

`inline` is not a cosmetic modifier. It moves where the `var()` chain is
evaluated, and that decides whether the component renders.

### A trap when reading the raw observations

The probe records both where the token is declared and what it computes to:

```
A  declared at ":root, :host"   value <guaranteed-invalid or absent>
D  declared at ":root, :host"   value <guaranteed-invalid or absent>
```

Identical, in both configurations. All four configurations emit a token
declaration on `:root`, and in local scope every one of them resolves to the
guaranteed-invalid value. The difference is that `@theme` utilities *read* that
broken token, while `@theme inline` utilities never reference it — Tailwind
substituted the value at build time. So `:root { --color-inline: ... }` exists
in configuration D as dead code. Judge a configuration by which variable its
utility references, not by whether a token exists in `:root`.

## Full matrix

`inner var = global` means `--app-color-primary` is defined at `:root`.
`inner var = local` means it exists only on the consuming element.
`element declares = True` marks the box that declares
`--app-color-primary: #e2533f` inline.

| inner var | config | element declares | computed background-color | outcome |
|-----------|--------|------------------|---------------------------|---------|
| global | A indirect | True | `rgb(10, 125, 63)` | resolved — **to the global value** |
| global | A indirect | False | `rgb(10, 125, 63)` | resolved |
| global | B indirect + fallback | True | `rgb(10, 125, 63)` | resolved, global value, fallback unused |
| global | B indirect + fallback | False | `rgb(10, 125, 63)` | resolved |
| global | C direct | True | `rgb(226, 83, 63)` | resolved |
| global | C direct | False | `rgb(226, 83, 63)` | resolved |
| global | D `@theme inline` | True | `rgb(226, 83, 63)` | resolved — element value wins |
| global | D `@theme inline` | False | `rgb(10, 125, 63)` | resolved — global value |
| **local** | **A indirect** | **True** | `rgba(0, 0, 0, 0)` | **invalid, silent** |
| local | A indirect | False | `rgba(0, 0, 0, 0)` | invalid, silent |
| local | B indirect + fallback | True | `rgb(226, 83, 63)` | resolved via fallback |
| local | B indirect + fallback | False | `rgb(226, 83, 63)` | resolved via fallback |
| local | C direct | True | `rgb(226, 83, 63)` | resolved |
| local | C direct | False | `rgb(226, 83, 63)` | resolved |
| local | D `@theme inline` | True | `rgb(226, 83, 63)` | resolved |
| **local** | **D `@theme inline`** | **False** | `rgba(0, 0, 0, 0)` | **invalid, silent** |

Framework-free control (`src/index-plain.html`, local scope, no Tailwind, no build):

| utility | computed background-color | outcome |
|---------|---------------------------|---------|
| indirection through the exported token | `rgba(0, 0, 0, 0)` | invalid, silent |
| direct reference to the inner variable | `rgb(226, 83, 63)` | resolved |

Consistency check performed by the script:

```
combined vs one-config-at-a-time: 16/16 identical -> combined view is faithful
```

Each configuration is measured twice, once inside the combined comparison
document and once with only its own stylesheet loaded. All sixteen cells match,
so showing four patterns side by side does not perturb the cascade.

## What the numbers say

1. **`inline` decides the outcome.** With the concrete value declared only on
   the element, `@theme` renders transparent and `@theme inline` renders the
   intended colour. One keyword.
2. **Indirection without a fallback fails silently** (A/local). The failing box
   declares the value itself and still renders transparent, because `var()` is
   substituted where the custom property is *declared* (`:root`), not where it
   is *used*.
3. **The same failure occurs with no framework at all** (control, identical
   computed value). It is CSS, not Tailwind.
4. **Under global scope the indirection inverts ownership** (A/global, the box
   that declares its own value): it renders `rgb(10, 125, 63)`, the document-wide
   value, instead of the `rgb(226, 83, 63)` it asked for. Whoever writes the
   shared name at `:root` decides the look of every consumer. A wrong value is
   harder to notice than a missing one.
5. **A fallback hides the failure and keeps the dependency** (B): everything
   resolves, but under global scope the global value still wins.
6. **Direct declaration never depends on another scope** (C): identical
   `rgb(226, 83, 63)` in all four cells. The cost is that the token can no
   longer be re-themed from outside.
7. **`@theme inline` moves the failure rather than removing it** (D): it fixes
   A/local, but now any element without a local declaration fails (D/local),
   and every utility on the page references the shared name
   `--app-color-primary` directly, which widens the surface for finding 4.

## Mapping to the paper

These rows replace the current Table III (`tab:token-configs`), which lists
three configurations and reports no per-stage numbers. Suggested changes:

- four configurations, not three — `@theme inline` is missing from the text
- report computed colours instead of the words *resolved* / *invalid*
- add the framework-free control row as the baseline
- add findings 4 and 7, neither of which is in the current draft
- state the cost of configuration C (no external re-theming)

## Caveats

- One browser, one version (Chrome 154). The paper's environment table says
  Chromium 136; record the version actually used.
- The probe measures `background-color` on a plain element. Shadow DOM
  behaviour is covered by `02-lit-web-components`, not here.
- `postcss.config.js` uses `export default` while `package.json` declares
  `"type": "commonjs"`. The Tailwind CLI ignores that file, so the build works,
  but a PostCSS pipeline would fail to load it. Rename to
  `postcss.config.mjs` if you wire Tailwind through PostCSS.
