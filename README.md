# micro-frontends runtime defects

Code artifact for the paper on runtime defects in micro-frontend (MFE)
architectures. It contains three self-contained examples that demonstrate the
same class of runtime defects across progressively more isolated technology
stacks:

- **01 — plain HTML**: zero dependencies, one file, pure browser
- **02 — Lit web components**: Shadow DOM + native routing
- **03 — Angular Elements**: four real Angular apps with *different* framework
  versions, composed into one shell

The central claim they support: these defects are **emergent properties of
composition**. Every project compiles cleanly, passes type checking, and
passes its unit tests. The failure only appears when the parts are loaded
together into one browser page — which is exactly why no per-project tool can
catch it.

---

## Repository structure

```
mfe-runtime-defects/
├── 01-plain-html/              Single HTML file, no build step
├── 02-lit-web-components/      Two Lit MFEs + a shell page (Vite)
└── 03-angular-elements/        The main example used in the paper
    ├── shell/                  Angular host application (port 4200)
    ├── micro-frontend-1/       Angular 20.0.0   (port 4301)
    ├── micro-frontend-2/       Angular 21.2.6   (port 4302)
    ├── micro-frontend-3/       Angular 20.3.19  (port 4303)
    └── micro-frontend-4/       Angular 22.2.0   (port 4304)
```

Each subfolder has its own README with details:

- [01 — Plain HTML baseline](./01-plain-html/README.md)
- [02 — Lit web components](./02-lit-web-components/README.md)
- [03 — Angular Elements](./03-angular-elements/README.md)

---

## Framework versions used

This table is central to example 03 (defect D3). The shell and each
micro-frontend are independent Angular applications, each bundling its **own**
framework runtime. They deliberately span different major versions:

| Application        | Angular version | Relation to shell (21.2.6) |
|--------------------|-----------------|----------------------------|
| shell              | 21.2.6          | —                          |
| micro-frontend-1   | 20.0.0          | older major, baseline minor |
| micro-frontend-2   | 21.2.6          | **identical** (control case, the one that works) |
| micro-frontend-3   | 20.3.19         | older major, latest patch  |
| micro-frontend-4   | 22.2.0          | newer major                |

The running (not declared) version is what matters. The instrumentation
described below records each application's actual `VERSION.full` in every
captured event, so the version matrix is verifiable from the recorded data.

---

## Prerequisites

- **Node.js 20 or newer** (any recent LTS works; the Dockerfiles use Node 20)
- **npm** (bundled with Node)
- **Docker** — optional, only for serving the MFEs as separate origins

No global packages are needed.

---

## Running example 01 (plain HTML)

No build, no install:

```bash
open 01-plain-html/index.html
# or: python3 -m http.server in 01-plain-html/ and visit http://localhost:8000
```

## Running example 02 (Lit web components)

```bash
cd 02-lit-web-components
npm install
npm run dev        # Vite dev server, port shown in the terminal
```

## Running example 03 (Angular Elements)

This is the main experiment. Five applications run on five ports:

| App              | Port | Command (run in a separate terminal) |
|------------------|------|--------------------------------------|
| shell            | 4200 | `cd 03-angular-elements/shell && npm install && npm start` |
| micro-frontend-1 | 4301 | `cd 03-angular-elements/micro-frontend-1 && npm install && npx ng serve --port 4301` |
| micro-frontend-2 | 4302 | `cd 03-angular-elements/micro-frontend-2 && npm install && npx ng serve --port 4302` |
| micro-frontend-3 | 4303 | `cd 03-angular-elements/micro-frontend-3 && npm install && npx ng serve --port 4303` |
| micro-frontend-4 | 4304 | `cd 03-angular-elements/micro-frontend-4 && npm install && npx ng serve --port 4304` |

Then open **http://localhost:4200**. The shell header lists all four
micro-frontends with their Angular versions in parentheses. Clicking one
loads that MFE's production script (`http://localhost:430N/main.js`) from a
**different origin** and renders it into the shell page.

> For a faithful "deployment-like" setup, serve the MFEs from Docker instead
> of the dev server. Each MFE folder contains a `Dockerfile` and an
> `nginx.conf` that sets the CORS headers the shell needs:
>
> ```bash
> cd 03-angular-elements/micro-frontend-1 && docker build -t mfe1 . && docker run -p 4301:80 mfe1
> # repeat for mfe2 (4302), mfe3 (4303), mfe4 (4304)
> ```
>
> If you see `Script error.` with no details in the console, the MFE scripts
> are being blocked by the same-origin policy — the dev server / nginx CORS
> configuration must be in place (this is a documented part of the study:
> cross-origin script failures degrade error reporting to an opaque
> `ErrorEvent`).

---

## Runtime instrumentation (built in)

All five applications of example 03 carry identical instrumentation code
(`src/runtime-debug.ts`, `src/runtime-error-handler.ts` in each project).
When you load the shell, it installs listeners that capture, for both the
shell **and** each micro-frontend:

1. `window.error` and `unhandledrejection` (including opaque `Script error.` events)
2. `popstate` (browser Back / Forward)
3. `history.pushState` and `history.replaceState` (wrapped, not replaced)
4. Angular router events (`NavigationStart`, `NavigationEnd`, `NavigationError`)
5. Angular `ErrorHandler` invocations

Every capture is logged to the console **and** appended to a shared,
timestamped timeline exposed on the page.

### Collecting the data

After performing the test sequence below, open the browser console and run:

```js
copy(window.__runtimeEvents)
```

This copies the full timeline to your clipboard as JSON. Each record looks
like:

```json
{
  "timestamp": "2026-09-25T10:44:29.150Z",
  "application": "MFE-2",
  "angularVersion": "21.2.6",
  "event": "router.navigation-start",
  "url": "http://localhost:4200/micro-frontend-2",
  "historyState": { "index": 3, "navigationId": 7, "restoredState": null },
  "historyLength": 4,
  "details": { "url": "/micro-frontend-2" }
}
```

Fields per record:

| Field            | Meaning                                                        |
|------------------|----------------------------------------------------------------|
| `timestamp`      | ISO-8601 wall-clock time of the event                          |
| `application`    | Which app's instrumentation caught it: `SHELL`, `MFE-1` … `MFE-4` |
| `angularVersion` | Actual runtime `@angular/core` version of that application     |
| `event`          | `window.error`, `unhandledrejection`, `popstate`, `history.pushState`, `history.replaceState`, `router.navigation-start` / `-end` / `-error`, `angular.errorHandler` |
| `url`            | `window.location.href` at event time                           |
| `historyState`   | Deep copy of `window.history.state` at event time              |
| `historyLength`  | `window.history.length` at event time                          |
| `details`        | Event-specific payload (target URL, error object, state passed to pushState, …) |

Because each application patches `history` by **chaining** onto the previous
patch, one navigation can appear in the timeline from several applications'
instrumentation. Deduplicate by `timestamp` when building tables; the
`application` fields on the duplicates show *which apps were active* when the
shared history changed — itself a relevant observation.

---

## Suggested experiment sequence

To reproduce the navigation-divergence results from the paper, perform these
steps in the browser while the shell (and all four MFEs) are running:

1. Load the shell → http://localhost:4200
2. Navigate shell → micro-frontend-2 (the matching-version control case)
3. Navigate back to shell (browser Back button)
4. Navigate shell → micro-frontend-1
5. Browser Back
6. Browser Forward
7. Navigate shell → micro-frontend-3
8. Browser Back
9. Navigate shell → micro-frontend-4
10. Browser Back until you are on the shell

Then export `window.__runtimeEvents` as described above. For each step you
can produce a row of the form:

| Step | Application | URL | Router event | History event | Error |
|------|-------------|-----|--------------|---------------|-------|
| 1    | SHELL       | /   | navigation-end | —          | —     |
| 2    | SHELL       | /micro-frontend-2 | navigation-end | replaceState | — |
| …    | …           | …   | …            | …             | …     |

The same procedure applies to examples 01 and 02 (they have no built-in
timeline; use the browser console and DevTools network/timeline tools there).

---

## Defect taxonomy

The paper identifies three defect classes, all of which manifest exclusively
at composition runtime:

**D1 — CSS token indirection collision.**
Components reference design tokens by name via CSS custom properties
(`var(--token-name)`). The value behind the name is resolved at runtime from
the document cascade, a shared global scope. When two independently built
micro-frontends define the same token name with different values, the
last-loaded stylesheet wins page-wide. No source file changes, no build step
reports an error, and the outcome depends on stylesheet load order —
non-deterministic across deployments.

**D2 — Route shadowing.**
The browser URL is a single shared resource. Each micro-frontend that
bootstraps its own router subscribes independently to URL change events
(`hashchange`, `popstate`). Overlapping route patterns or catch-all
wildcards cause one router to intercept navigations initiated by another.
Each router is internally correct in isolation; the conflict is a property
of concurrent subscription to a shared channel.

**D3 — Multi-version runtime collision (Angular-specific, example 03).**
Deploying micro-frontends built on different major versions of the same
framework introduces additional hazards: global API patching (e.g. by
`zone.js`) affecting a co-deployed application, duplicate framework runtime
bundles increasing memory and parse cost, and divergent navigation-state
formats written to the single shared `window.history.state` by incompatible
router implementations. These hazards are specific to the multi-version
composition scenario.

---

## Why the defects are invisible to static analysis

Every micro-frontend in this repository compiles without errors, passes
TypeScript type checking, and passes its unit test suite in isolation. The
defects are invisible to static tooling for three reasons:

1. **No single compilation unit contains an error.** The fault is
   distributed across the boundary between units.
2. **The triggering condition is load order**, which is determined at
   runtime by the host page and the network, not by any source file.
3. **The shared resources that mediate the conflict** (the CSS cascade, the
   browser URL, `window.history`, the `window` object) **are outside the
   analysis scope** of any per-micro-frontend tool.

