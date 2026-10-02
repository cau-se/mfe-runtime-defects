#!/usr/bin/env bash
# Token resolution probe runner.
#
#   ./scripts/run-probes.sh          # readable table + consistency check
#   ./scripts/run-probes.sh --json   # raw JSON observations
#
# Three passes:
#   1. src/index-plain.html            framework-free control
#   2. src/probe.html (combined)       all four token patterns in one document,
#                                      per scope -- this is what you see in a browser
#   3. src/probe.html?v=<config>       each pattern compiled on its own, per scope
#
# Pass 3 re-measures pass 2 one configuration at a time. If the two disagree,
# the combined view is perturbing the result and the table is not trustworthy.
#
# Requires Google Chrome or Chromium, and a prior `npm run build`.

set -euo pipefail

CHROME="${CHROME:-}"
if [ -z "$CHROME" ]; then
  for candidate in \
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
    "$(command -v google-chrome-stable 2>/dev/null || true)" \
    "$(command -v google-chrome 2>/dev/null || true)" \
    "$(command -v chromium 2>/dev/null || true)"; do
    if [ -n "$candidate" ] && [ -x "$candidate" ]; then CHROME="$candidate"; break; fi
  done
fi

if [ -z "$CHROME" ]; then
  echo "Chrome/Chromium not found. Set CHROME=/path/to/chrome and retry." >&2
  exit 1
fi

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ ! -f "$ROOT/dist/compare.css" ]; then
  echo "dist/ is empty. Run: npm run build" >&2
  exit 1
fi

probe() {
  local page="$1" query="${2:-}"
  "$CHROME" \
    --headless=new \
    --disable-gpu \
    --no-first-run \
    --allow-file-access-from-files \
    --virtual-time-budget=3000 \
    --dump-dom \
    "file://$ROOT/src/$page$query" 2>/dev/null \
    | sed -n 's:.*<pre id="out">\(.*\)</pre>.*:\1:p' | head -1
}

OUT="$(mktemp)"
trap 'rm -f "$OUT"' EXIT

{
  probe "index-plain.html"
  for scope in global local; do
    probe "probe.html" "?scope=$scope"
    for variant in a-indirection b-indirection-fallback c-direct d-theme-inline; do
      probe "probe.html" "?v=$variant&scope=$scope"
    done
  done
} | grep '^{' > "$OUT"

echo "# browser: $("$CHROME" --version 2>/dev/null | head -1)"
echo "# date:    $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo

if [ "${1:-}" = "--json" ] || ! command -v python3 >/dev/null 2>&1; then
  cat "$OUT"
  exit 0
fi

python3 - "$OUT" <<'PY'
import json, sys

rows = [json.loads(l) for l in open(sys.argv[1]) if l.strip()]

def cells(obs):
    for c in obs['cells']:
        cfg = c.get('configuration') or c.get('element')
        local = c.get('declaresLocally', 'indirect' not in c.get('element', ''))
        yield cfg, local, c

combined, isolated, control = {}, {}, []
for obs in rows:
    for cfg, local, c in cells(obs):
        rec = (c['backgroundColor'], c['outcome'])
        if obs.get('variant') == 'plain-indirection-control':
            control.append((cfg, local, rec))
        elif obs.get('mode') == 'isolated':
            isolated[(cfg, obs['scope'], local)] = rec
        else:
            combined[(cfg, obs['scope'], local)] = rec

hdr = f"{'inner var':<10}{'configuration':<26}{'element declares':<18}{'background-color':<20}outcome"
print(hdr); print('-' * len(hdr))
order = ['A', 'B', 'C', 'D']
for scope in ('global', 'local'):
    for cfg in order:
        for local in (True, False):
            rec = combined.get((cfg, scope, local))
            if rec:
                print(f"{scope:<10}{cfg:<26}{str(local):<18}{rec[0]:<20}{rec[1]}")

print()
print('framework-free control (src/index-plain.html, local scope):')
for cfg, local, rec in control:
    print(f"  {cfg:<26}{rec[0]:<20}{rec[1]}")

match = sum(1 for k, v in combined.items() if isolated.get(k) == v)
print()
print(f"combined vs one-config-at-a-time: {match}/{len(combined)} identical",
      "-> combined view is faithful" if match == len(combined)
      else "-> MISMATCH, report isolated numbers only")
PY
