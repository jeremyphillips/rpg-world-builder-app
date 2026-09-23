# Content media management

Implementation tracker for reusable content media (Character, Class, Species,
Equipment, Location, Organization). Full product and UX specification:
[roadmap/content-media-management-plan.md](./roadmap/content-media-management-plan.md).

## v1 policy defaults (locked)

| Limit                  | Value                              |
| ---------------------- | ---------------------------------- |
| Attachments per record | 20                                 |
| Uploads in flight      | 3                                  |
| Portrait minimum crop  | 128×128 oriented px                |
| Max decode pixels      | 25 MP                              |
| Max edge               | 8192 px                            |
| Upload byte ceiling    | `MAX_UPLOAD_BYTES` (5 MiB default) |
| Unreferenced lease     | 24 hours                           |

Character allows Portrait + Primary; all other opted-in domains are Primary only.
Animated GIF/WebP originals are preserved; inspection and derivatives use the first
frame. SVG is rejected. Private assets live under `{UPLOAD_DIR}/media/{assetId}/`
and are not served by `GET /api/uploads/:key`.

## Contracts (`@rpg/contracts/shared/media`)

- Asset DTO, upload session, `ContentImage`, `ImagePresentation`, `ContentMedia`
- Typed `CONTENT_MEDIA_POLICIES` registry
- Normalized crop geometry and `validateContentMedia`
- `mediaBearingAuthoredContentBodySchema` (not yet wired into live type schemas)
- Overlay replacement key: `CONTENT_MEDIA_REPLACE_KEY` (`media`)
- `reconcileContentMedia`, `reclaimExpiredAssets`, `remapContentMediaForDuplicate`
- `resolveContentMediaPresentation`, rendition presets, system asset manifest
- `@rpg/ui` `MediaImage` / `MediaCompactPreview` (not mounted in product surfaces)

## Phase status

| Phase                     | Status  | Notes                             |
| ------------------------- | ------- | --------------------------------- |
| 1 Contracts & crop proof  | Done    | Live schemas still use `imageKey` |
| 2 Asset upload & delivery | Done    | Parallel to legacy `/api/uploads` |
| 3 Attachment lifecycle    | Done    | Reconcile, leases, cleanup        |
| 4 Resolver & derivatives  | Done    | Primitives not mounted in product |
| 5 Media manager UI        | Pending |                                   |
| 6 Domain cutover          | Pending |                                   |
| 7 Acceptance              | Pending |                                   |

## Integration checklist (cutover — phase 6)

### Render paths (dashboard)

- `apps/dashboard/src/features/content/lib/detail/page/content-image-url.ts`
- `apps/dashboard/src/features/content/lib/entity/summary/entity-media.lib.tsx`
- Content detail routes: class, species, spell, feat, equipment, location,
  organization, skill-proficiency
- Overview columns via `content-table-config.tsx`
- Entity picker / connection drawers using `buildEntityMediaFromImageKey`

### Character

- Contracts: `character/sheet.ts`, builder draft identity, finalize input
- API: `character.model.ts`, `to-character.ts`, `to-npc-character.ts`
- Dashboard: builder identity (currently no image UI), import coverage

### Out of scope (keep `imageKey` / legacy upload)

- Spells, feats, skill-proficiencies, subclass patches, starting wealth
- Account avatar (`avatarKey`) and campaign banner (`campaign.identity.imageKey`)
- Legacy `POST /api/uploads` and `GET /api/uploads/:key`

### API / overlay

- Register `media` on `patchReplaceKeys` per opted-in content config
- Character and content write services: atomic media replacement + revision
- Duplication, seeds, imports, system overlay merge
