# Content media management

Implementation tracker for reusable content media (Character, Class, Species,
Equipment, Location, Organization, Game term). Full product and UX specification:
[roadmap/content-media-management-plan.md](./roadmap/content-media-management-plan.md).

## Display-image SSOT (locked)

1. **No image fallbacks as URLs.** No `fallback-content.png`, `getContentImageUrl`,
   or placeholder `<img>` src. Wire `ContentDisplayImage` is omitted when there is no
   real upload or registry path; compact UI paints semantic fallback icons instead.
2. **Semantic fallback keys** (contracts): concept keys such as `character`, `npc`,
   `class`, `species`, `spell`, `feat`, `skill-proficiency`, `game-term`, media domains,
   and `generic`. Resolve via `resolveContentDisplayFallback({ domain, surface, … })`
   and `resolveContentDisplayFallbackForSearchTarget` — compact and search share class
   and species keys; detail and field keep class/species on `generic`. `@rpg/ui`
   `CONTENT_DISPLAY_FALLBACK_ICONS` is the identity glyph map (sidebar catalog items reuse it via
   `contentIdentityIcon`). Section and action glyphs live in separate registries — see
   [packages/ui/docs/icon-registry.md](../packages/ui/docs/icon-registry.md).
   Wire `ContentDisplayImage` / search `displayImage` is real media only — no fallback field
   on search documents.
3. **Field summary empty state:** ImagePlus when the viewer can manage media; otherwise
   the domain fallback passed from the media field.
4. **Always-on media on compact identity rows** (entity cards, pickers, link rows).
   `CharacterListCard` still omits the stacked band when `displayImage` is absent.
5. **Closed surface walker** — `resolveContentDisplayImage({ surface, domain, … })` with
   `surface: 'compact' | 'detail' | 'field'`. Compact walks `representativeRoles`
   (character: portrait → primary). Detail walks `detailRoles` when declared on the
   domain policy (otherwise primary only). Field walks the domain representative role.
   Campaign overview hero stays on its banner path.
6. **`imageKey` removed from authored catalog content.** Media domains display through
   `ContentMedia` only. Spell **entities** do not attach `ContentMedia`; spell detail
   hero art resolves from the spell-school vocabulary entry (registry emblem or campaign
   override). Feats and skill-proficiencies still have no image UI until they opt into
   `ContentMedia`. `avatarKey` stays.
7. **Location and organization** allow `primary` and `emblem` uploads. Compact cards,
   pickers, and overview thumbnails resolve **primary** only (emblem is manager-only in
   this pass).

## Crop ownership and frame presentation

The authored role crop defines the permitted source region and is the only crop persisted
with `ContentMedia`. Focal points are persisted in source-normalized coordinates. Each
destination frame derives an ephemeral effective crop from the authored crop, focal point,
role, and canonical frame descriptor. The editor guide and renderer consume the same frame
presentation result. An effective frame crop may narrow the authored region but must never
reveal pixels outside it or be saved back over the authored role crop.

System art comes only from `SYSTEM_CONTENT_IMAGE_ENTRIES` while walking each role
(upload assignment, then registry entry for that subject, slug, and role). Registry
subjects use `SystemImageSubject` (`content-type` or `vocabulary-set` keys).

## v1 policy defaults (locked)

| Limit                  | Value                              |
| ---------------------- | ---------------------------------- |
| Attachments per record | 20                                 |
| Uploads in flight      | 3                                  |
| Portrait minimum crop  | 128×128 oriented px (1:1)          |
| Primary minimum crop   | 800×600 oriented px (4:3)          |
| Banner minimum crop    | 1200×400 oriented px (3:1)         |
| Max decode pixels      | 25 MP                              |
| Max edge               | 8192 px                            |
| Upload byte ceiling    | `MAX_UPLOAD_BYTES` (5 MiB default) |
| Unreferenced lease     | 24 hours                           |

Character allows Portrait + Primary; location and organization allow Primary + Emblem;
game-term vocabulary entries allow Emblem only (max one attachment). All other opted-in
catalog domains are Primary only. Animated GIF/WebP originals are
preserved; inspection and derivatives use the first frame. SVG is rejected. Private
assets live under `{UPLOAD_DIR}/media/{assetId}/` and are not served by
`GET /api/uploads/:key`.

## Contracts (`@rpg/contracts/shared/media`)

- Asset DTO, upload session, `ContentImage`, `ImagePresentation`, `ContentMedia`
- Typed `CONTENT_MEDIA_POLICIES` registry
- `resolveContentDisplayImage` + `ContentDisplayFallback` semantic keys
- `resolveCharacterDisplayImage` for portrait → primary character resolution
- Normalized crop geometry and `validateContentMedia`
- `mediaBearingAuthoredContentBodySchema` (authored bodies without `imageKey`)
- Overlay replacement key: `CONTENT_MEDIA_REPLACE_KEY` (`media`)
- `reconcileContentMedia`, `reclaimExpiredAssets`, `remapContentMediaForDuplicate`
- System content image registry (`SYSTEM_CONTENT_IMAGE_ENTRIES`)

## System artwork vs rendition fixture

- **`SYSTEM_ASSET_MANIFEST`** — upload/rendition fixture dimensions for tests.
- **`system-content-image-registry.ts`** — shipped SRD catalog artwork (class and
  species primary for `srd-cc-5.2.1` with `white-paper-knockout`; spell-school emblems
  with `mono-glyph-invert`). The media manager lists virtual system sources alongside
  uploads.

## Phase status

| Phase                     | Status |
| ------------------------- | ------ |
| 1 Contracts & crop proof  | Done   |
| 2 Asset upload & delivery | Done   |
| 3 Attachment lifecycle    | Done   |
| 4 Resolver & derivatives  | Done   |
| 5 Media manager UI        | Done   |
| 6 Domain cutover          | Done   |
| 7 Acceptance              | Done   |

## Out of scope

- Account avatar (`avatarKey`)
- Legacy `POST /api/uploads` and `GET /api/uploads/:key` (parallel to media assets)
- Character builder draft `imageKey` fingerprint (legacy field on sheet/draft; display
  uses `media` only)

## Campaign banner media

- Campaign identity stores banner, primary, and emblem roles on `identity.media`
- Create flow uploads banner media after campaign creation
- Campaign overview hero renders the saved banner rendition (3:1 cover frame)
