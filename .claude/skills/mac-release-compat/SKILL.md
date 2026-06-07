---
name: mac-release-compat
description: Build and verify the macOS release so it stays compatible with Intel Macs running OS X El Capitan 10.11.6 — the hard constraints are x64 architecture, Electron 14.2.9, and a minimum macOS of 10.11. Use this skill whenever building, packaging, or releasing the Mac app, running `npm run package-mac`, cutting a release, producing a .zip/.app/.dmg, after running `electron-rebuild` or `npm install` on this repo, or whenever the user mentions El Capitan, macOS 10.11, Intel / x64, Core 2 Duo, or asks "is the build still compatible". Always run the verification before shipping a Mac build — a single arm64 native binding silently breaks every El Capitan user.
---

# macOS El Capitan / Intel release compatibility

This app still ships to customers on **Intel Macs running OS X El Capitan (10.11.6)**, some on hardware as old as a Core 2 Duo. That imposes three non-negotiable constraints on every Mac build:

| Constraint | Required value | Why |
|---|---|---|
| Architecture | **x86_64** (Intel) | Core 2 Duo / all target machines are 64-bit Intel. An arm64 binary won't launch. |
| Electron | **14.2.9** | Electron 14 is the **last** major version that supports macOS 10.11. Electron 15+ raises the floor to 10.13+. Never bump past 14.x. |
| Min macOS | **10.11** | El Capitan. Both the app's `Info.plist` (`LSMinimumSystemVersion`) and every native binary's load command must allow 10.11. |

The dangerous part is the **native `sqlite3` binding** (`node_sqlite3.node`). It's compiled C++, so it has a real CPU architecture and a minimum-macOS load command baked in — and it's invisible to git (it lives under `node_modules`, which is ignored). If it's the wrong arch, the app crashes on launch with `incompatible architecture (have 'arm64'... need 'x86_64')`, which aborts the Electron main process before any IPC handler registers — so the symptom looks like "every screen says *No handler registered*", not an obvious arch error.

## The #1 gotcha: arm64 leaks in on Apple Silicon dev machines

`npm install`, `postinstall`, and `electron-rebuild` all build native modules for the **host** architecture. On an Apple Silicon Mac that means `app/node_modules/sqlite3/build/Release/node_sqlite3.node` becomes **arm64**. Because `package.json` sets `"npmRebuild": false`, electron-builder packages whatever binding is already on disk — so a plain `npm run package` on an M-series machine ships an arm64 binding that bricks every El Capitan user.

**Always build the release with `npm run package-mac`**, never `npm run package`. The `package-mac` script runs `electron-rebuild -f -v 14.2.9 --arch x64 --module-dir app` first, which forces the binding back to x64 before electron-builder runs. If you ran the app locally on Apple Silicon (which requires an arm64 rebuild to launch `npm start`), you **must** re-run `package-mac` (or the x64 rebuild) before shipping.

## Build the release

```bash
npm run package-mac
```

This builds the renderer/main bundles, rebuilds native modules for **x64 / Electron 14.2.9**, and produces `release/JoyvetSales-2.0.0-mac.zip` (and the unpacked `release/mac/JoyvetSales.app`). Signing uses the local identity; notarization is skipped without creds — neither affects El Capitan, which predates notarization.

## Verify before shipping — always

Run the bundled checker against the produced `.app`. It is the gate: do not hand off, upload, or publish a Mac build until this passes.

```bash
bash .claude/skills/mac-release-compat/scripts/verify_mac_release.sh
```

It auto-discovers `release/mac/JoyvetSales.app` (pass a path as `$1` to override) and checks, with a clear PASS/FAIL per line and a non-zero exit on any failure:

- `package.json` still pins Electron **14.2.9** and `build.mac.minimumSystemVersion` is **10.11** (catches an accidental dependency bump before it ever ships).
- The app's `Info.plist` `LSMinimumSystemVersion` is **10.11**.
- The main executable and the **Electron Framework** are **x86_64** and contain **no arm64** slice.
- The bundled `node_sqlite3.node` (extracted from `app.asar`) is **x86_64** and its `LC_VERSION_MIN_MACOSX` is **≤ 10.11**.
- Pre-flight: the source-tree `app/node_modules/.../node_sqlite3.node` is x64 (warns if it's arm64, i.e. the dev-rebuild leak described above).

## If a check fails

- **Wrong arch (arm64) anywhere** → you packaged after an Apple-Silicon rebuild. Run `npx electron-rebuild -f -v 14.2.9 --arch x64 --module-dir app`, then `npm run package-mac` again, then re-verify.
- **Electron ≠ 14.2.9** → a dependency bump slipped in. Pin it back to `14.2.9`; do not go to 15+ (drops 10.11). See the memory note on the Electron version pin.
- **`LSMinimumSystemVersion` ≠ 10.11** → fix `build.mac.minimumSystemVersion` in `package.json` and rebuild.
- **`node_sqlite3.node` min macOS > 10.11** → it was compiled against too new a deployment target; rebuild with `MACOSX_DEPLOYMENT_TARGET=10.11` (or on a toolchain whose default SDK still allows 10.11) via the same `electron-rebuild` command.

## After a successful release build, leave the tree x64

The dev-only arm64 rebuild is a local convenience for `npm start` on Apple Silicon — it must not be the resting state of the repo. After verifying, the source-tree binding should be x86_64 so the next `npm run package` (even if someone forgets `-mac`) is still safe.
