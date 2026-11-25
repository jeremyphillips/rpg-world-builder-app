# System overlay (version 1)

Campaign managers edit **system** catalog records by storing a versioned overlay on the seed body. Homebrew records are full documents — they do not use this primitive.

## Stored shape

Mongo patch documents use `contentStoredOverlayPatchSchema` (`campaignId`, `targetId`, `patch: StoredOverlay`).

- `version: 1` — only supported format today.
- `revision` — monotonic integer; client sends `expectedOverlayRevision`; stale writes return HTTP 409.
- `set` / `clear` / `restore` / `collections` — sparse deltas only; identity collections never store untouched seed rows wholesale.

Wire persistence uses `pruneStoredOverlayForWire` so optional fields are omitted (BSON must not retain `null` leaves).

## Read / write

- **Read:** `applyStoredOverlay(seed, stored, policy)` → domain body (+ diagnostics).
- **Write:** dashboard/API builds `ObjectDelta` intent → `reconcileOverlayUpdate` → next `StoredOverlay`.

Unversioned or malformed stored documents **fail closed** at read. `legacy-array` and `LegacyHold` retention are rejected in this environment.

## Future formats

When a real `version: 2` is required:

1. Add a version branch in `parseStoredOverlayInput`, `applyStoredOverlay`, and `reconcileOverlayUpdate`.
2. Document migration only if production data exists (not required for dev-only cutover).
3. Do not add parallel merge paths or partial-body patch schemas.

Policy compilation, intent building, and tests live beside this module (`apply.ts`, `reconcile.ts`, `build-intent.ts`, …).
