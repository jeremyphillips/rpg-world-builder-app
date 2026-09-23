# Content media authoring

Phase 5 provides `MediaManager` through this feature's public barrel. Character
(PC/NPC) supports Portrait and Primary; Class, Species, Equipment, Location, and
Organization support Primary only. Phase 6 mounts the manager from the shared
content identity area and the character builder identity step.

## Integration contract

`ManagedMediaField` is the form-facing adapter. Its `MediaFieldConfig` keeps the
domain, collection constraint, and presentation separate from persisted
`ContentMedia`. Compact summaries are used by content form headers; the character
Identity step selects the expanded presentation. The adapter watches the RHF value,
retains assets returned by Apply, and opens `MediaManager` with the chosen attachment.
Omitted collection capacity resolves to the platform default of 20.

Mount under the app's TanStack Query provider. Pass `open`, `onOpenChange`, `domain`,
`scope`, `value`, `mode`, and `onSave`. Supply `initialAssets` when metadata is already
available; other metadata loads through authorized queries. `imageUrl` is an optional
rendition resolver for authorized/system assets and offline visual fixtures; the
default uses the same-origin media API.

`onSave` receives `{ media, expectedMediaRevision, assets }`. In `form` mode, apply
these to the parent draft and retain new asset metadata for reopening. The modal
explicitly explains that the parent record still needs saving. In `detail` mode,
await the domain write mutation with the expected revision. Rejections preserve the
open draft and show the error; never swallow conflicts or silently overwrite them.
The host retains domain permissions and must refresh the record before reopening
following a revision conflict. No domain write endpoint is invented by this feature.

Unmounting a closed manager discards its isolated reducer and aborts pending uploads.
Already uploaded originals retain their server lease until attached or reclaimed.
There is no browser-only cleanup or immediate physical delete. A parent form must
retain the media draft until its own save/cancel decision.

## Implementation

- `lib/media-session.ts`: pure session reducer; attachment selection, role transfer,
  crop, alt text, removal and dirty state. Selection is not a data edit.
- `hooks/use-media-manager.ts`: metadata queries, validation, confirmations, save modes.
- `hooks/use-media-uploads.ts`: three-request queue, retry idempotency, bounded count,
  abort handling and ordered publication of successful uploads.
- `api/media-api.ts`: response contracts and CSRF-protected same-origin requests.
- `components/`: gallery, schema-driven alt form, role controls and modal workspace.
- `@rpg/ui` `MediaCropEditor`: controlled pan/zoom editor in normalized source geometry,
  keyboard repositioning and live square/circle previews. No persistence dependencies.

The image collection stays in insertion order. No first-image role assignment,
reordering, user rotation, or Primary crop controls are introduced. Server validation
is authoritative; the client additionally blocks invalid portraits and unresolved
uploads before applying changes.

## Testing and preview

Run `pnpm --filter @rpg/dashboard storybook` and open **Features / Media / MediaManager**
on port 6007. Examples cover all six policies, both roles on one source, empty and
unassigned collections, save failure and mobile. Gallery stories cover partial
upload failure. Offline artwork fixtures are intentional geometric illustrations
for crop verification. Real uploads require an authenticated API and authorized scope.

Run `pnpm --filter @rpg/dashboard exec vitest run src/features/media` and the UI crop
editor tests. See [the roadmap](../../../../../docs/roadmap/content-media-management-plan.md)
for rollout boundaries and visual acceptance criteria.
