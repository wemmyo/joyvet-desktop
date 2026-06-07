#!/usr/bin/env bash
#
# Verify a packaged macOS build is compatible with Intel / OS X El Capitan 10.11.6.
# Hard contract: x86_64 architecture, Electron 14.2.9, minimum macOS 10.11.
#
# Usage:
#   bash .claude/skills/mac-release-compat/scripts/verify_mac_release.sh [path/to/App.app]
#
# Exits 0 if all checks pass, 1 if any fail. Run before shipping any Mac build.

set -uo pipefail

# --- compatibility contract ------------------------------------------------
EXPECTED_ELECTRON="14.2.9"
EXPECTED_MIN_OS="10.11"
EXPECTED_ARCH="x86_64"

# --- locate repo root and the .app ----------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"   # .claude/skills/<name>/scripts -> repo root
cd "$ROOT"

APP="${1:-}"
if [ -z "$APP" ]; then
  APP="$(ls -d release/mac/*.app 2>/dev/null | head -1)"
fi

PASS=0; FAIL=0; WARN=0
ok()   { printf '  \033[32mPASS\033[0m  %s\n' "$1"; PASS=$((PASS+1)); }
bad()  { printf '  \033[31mFAIL\033[0m  %s\n' "$1"; FAIL=$((FAIL+1)); }
warn() { printf '  \033[33mWARN\033[0m  %s\n' "$1"; WARN=$((WARN+1)); }

# true if $1 (a version like 10.7) is <= $2 (like 10.11)
ver_le() { [ "$(printf '%s\n%s\n' "$1" "$2" | sort -V | head -1)" = "$1" ]; }

# arch check: must contain x86_64 and must NOT contain arm64
check_arch() {
  local label="$1" file="$2"
  if [ ! -e "$file" ]; then bad "$label: file not found ($file)"; return; fi
  local archs; archs="$(lipo -archs "$file" 2>/dev/null || file -b "$file")"
  if echo "$archs" | grep -qw arm64; then
    bad "$label: contains arm64 slice ($archs) — will not run on Intel"
  elif echo "$archs" | grep -qw "$EXPECTED_ARCH"; then
    ok "$label: $archs"
  else
    bad "$label: unexpected arch ($archs), expected $EXPECTED_ARCH"
  fi
}

echo "== mac-release-compat: verifying Intel / El Capitan (10.11.6) compatibility =="
echo "   contract: arch=$EXPECTED_ARCH, electron=$EXPECTED_ELECTRON, min macOS=$EXPECTED_MIN_OS"
echo

# --- 1. package.json contract ---------------------------------------------
echo "[1] package.json pins"
ELECTRON_VER="$(node -e "const p=require('./package.json');process.stdout.write(((p.devDependencies&&p.devDependencies.electron)||(p.dependencies&&p.dependencies.electron)||'').replace(/[^0-9.]/g,''))" 2>/dev/null)"
[ "$ELECTRON_VER" = "$EXPECTED_ELECTRON" ] && ok "electron pinned to $ELECTRON_VER" \
  || bad "electron is '$ELECTRON_VER', must be $EXPECTED_ELECTRON (15+ drops macOS 10.11)"
PKG_MIN="$(node -e "const p=require('./package.json');process.stdout.write(((p.build&&p.build.mac&&p.build.mac.minimumSystemVersion)||''))" 2>/dev/null)"
[ "$PKG_MIN" = "$EXPECTED_MIN_OS" ] && ok "build.mac.minimumSystemVersion = $PKG_MIN" \
  || bad "build.mac.minimumSystemVersion is '$PKG_MIN', must be $EXPECTED_MIN_OS"
echo

# --- 2. source-tree native binding (pre-flight) ---------------------------
echo "[2] source tree native binding (pre-flight)"
SRC_NODE="app/node_modules/sqlite3/build/Release/node_sqlite3.node"
if [ -f "$SRC_NODE" ]; then
  SRC_ARCHS="$(lipo -archs "$SRC_NODE" 2>/dev/null || file -b "$SRC_NODE")"
  if echo "$SRC_ARCHS" | grep -qw arm64; then
    warn "$SRC_NODE is $SRC_ARCHS — an arm64 dev rebuild leaked in; rebuild x64 before 'npm run package'"
  else
    ok "$SRC_NODE: $SRC_ARCHS"
  fi
else
  warn "$SRC_NODE not present (run npm install / electron-rebuild)"
fi
echo

# --- 3. the packaged .app --------------------------------------------------
echo "[3] packaged app: $APP"
if [ -z "$APP" ] || [ ! -d "$APP" ]; then
  bad "no .app found — run 'npm run package-mac' first (looked in release/mac/*.app)"
  echo; echo "Result: $PASS passed, $FAIL failed, $WARN warnings"; exit 1
fi

PLIST="$APP/Contents/Info.plist"
APP_MIN="$(/usr/libexec/PlistBuddy -c 'Print :LSMinimumSystemVersion' "$PLIST" 2>/dev/null)"
[ "$APP_MIN" = "$EXPECTED_MIN_OS" ] && ok "Info.plist LSMinimumSystemVersion = $APP_MIN" \
  || bad "Info.plist LSMinimumSystemVersion is '$APP_MIN', must be $EXPECTED_MIN_OS"

EXE_NAME="$(/usr/libexec/PlistBuddy -c 'Print :CFBundleExecutable' "$PLIST" 2>/dev/null)"
check_arch "main executable ($EXE_NAME)" "$APP/Contents/MacOS/$EXE_NAME"
check_arch "Electron Framework" "$APP/Contents/Frameworks/Electron Framework.framework/Electron Framework"
echo

# --- 4. bundled sqlite3 native binding (inside app.asar) -------------------
echo "[4] bundled sqlite3 binding (from app.asar)"
ASAR="$APP/Contents/Resources/app.asar"
ASAR_BIN="$ROOT/node_modules/.bin/asar"
NODE_ENTRY="node_modules/sqlite3/build/Release/node_sqlite3.node"
if [ ! -f "$ASAR" ]; then
  bad "app.asar not found at $ASAR"
elif [ ! -x "$ASAR_BIN" ]; then
  warn "asar tool not found (node_modules/.bin/asar) — skipping bundled-binding check"
else
  TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
  case "$ASAR" in /*) ASAR_ABS="$ASAR" ;; *) ASAR_ABS="$ROOT/$ASAR" ;; esac
  # `asar extract-file` writes the entry to the CURRENT directory (by basename),
  # not stdout — so run it inside the temp dir to avoid polluting the repo.
  ( cd "$TMP" && "$ASAR_BIN" extract-file "$ASAR_ABS" "$NODE_ENTRY" ) >/dev/null 2>&1
  EXTRACTED="$TMP/$(basename "$NODE_ENTRY")"
  if [ -s "$EXTRACTED" ]; then
    check_arch "app.asar node_sqlite3.node" "$EXTRACTED"
    MINOS="$(otool -l "$EXTRACTED" 2>/dev/null | awk '/LC_VERSION_MIN_MACOSX/{f=1} f&&/version/{print $2; exit} /LC_BUILD_VERSION/{g=1} g&&/minos/{print $2; exit}')"
    if [ -n "$MINOS" ] && ver_le "$MINOS" "$EXPECTED_MIN_OS"; then
      ok "node_sqlite3.node min macOS = $MINOS (<= $EXPECTED_MIN_OS)"
    else
      bad "node_sqlite3.node min macOS = '${MINOS:-unknown}', must be <= $EXPECTED_MIN_OS"
    fi
  else
    bad "could not extract $NODE_ENTRY from app.asar (is sqlite3 packaged?)"
  fi
fi

echo
echo "== Result: $PASS passed, $FAIL failed, $WARN warnings =="
if [ "$FAIL" -gt 0 ]; then
  echo "NOT El Capitan / Intel safe — see failures above. Do not ship this build."
  exit 1
fi
echo "El Capitan / Intel compatible (x86_64, Electron $EXPECTED_ELECTRON, min macOS $EXPECTED_MIN_OS)."
exit 0
