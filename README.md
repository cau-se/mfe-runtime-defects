# mfe-runtime-defects

This repository contains three self-contained code examples that demonstrate
the same class of runtime defects across progressively more isolated technology
stacks. The central claim they support is that the defects described in the
paper are emergent properties of composition, not artifacts of any particular
framework, and are therefore invisible to per-unit static analysis,
compilation, linting, and testing.

---
 
## Defect taxonomy
 
The paper identifies three defect classes, all of which manifest exclusively at composition runtime:
 
**D1 -- CSS token indirection collision.**
Components reference design tokens by name via CSS custom properties (`var(--token-name)`). The value behind the name is resolved at runtime from the 
document cascade, which is a shared global scope. When two independently built 
micro frontends define the same token names with different values, the 
last-loaded stylesheet wins page-wide. No component's source code changes; no 
build step reports an error. The outcome depends on stylesheet load order, 
which is non-deterministic across deployments.
 
**D2 -- Route shadowing.**
The browser URL is a single shared resource. Each micro frontend that 
bootstraps its own router subscribes independently to URL change events 
(`hashchange`, `popstate`). Overlapping route patterns or catch-all wildcards 
cause one router to intercept and redirect navigations initiated by another. 
Each router is internally correct in isolation; the conflict is a property of 
concurrent subscription to a shared channel.
 
**D3 -- Multi-version runtime collision (Angular-specific, example 03).**

Deploying micro frontends built on different major versions of the same 
framework introduces additional runtime hazards: global API monkey-patching by 
`zone.js` affecting a co-deployed zoneless application; duplicate framework 
runtime bundles increasing memory and parse cost; These hazards are 
specific to the multi-version composition scenario studied in the paper.
 
---
 
## Why the defects are invisible to static analysis
 

Each micro frontend in this repository compiles without errors, passes 
TypeScript type checking, and would pass a standard unit test suite run in 
isolation. The defects satisfy all three conditions for invisibility to static 
tooling:
 
1. No single compilation unit contains an error. The fault is distributed 
across the boundary between units.

2. The triggering condition is load order, which is determined at runtime by 
the host page and network, not by any source file.

3. The shared resources that mediate the conflict (the CSS cascade, the browser 
URL, the `window` object) are outside the analysis scope of any per-MFE tool.

---

