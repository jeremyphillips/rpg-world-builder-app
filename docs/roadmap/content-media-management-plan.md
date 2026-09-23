# Reusable content media management

Status: proposed technical implementation plan and UX review. No runtime changes.

## Scope and recommendation

Use the proposed ContentMedia model: an ordered collection of image attachments,
with Primary and Portrait referencing those attachments through independent
presentation metadata. Preserve uploaded original bytes. Keep the identity area
above tabs compact; collection management belongs in one modal.

Deliver shared infrastructure for **Character, Class, Species, Equipment, Location, and Organization**.
Portrait applies exclusively to Character, including PC and NPC. Do not introduce separate uploads
for portraits, scatter role checks by content type, or expand identity into a gallery.
Account avatars and campaign banners are separate consumers of the existing upload
service; preserve their behavior unless explicitly included in a later cutover.
All other content types are outside this rollout.

| Content policy                     | Available roles         | Identity presentation                                            |
| ---------------------------------- | ----------------------- | ---------------------------------------------------------------- |
| Character (PC and NPC)             | Portrait, Primary image | Portrait → transient square Primary crop → character placeholder |
| Class                              | Primary image           | Primary → class placeholder                                      |
| Species                            | Primary image           | Primary → species placeholder                                    |
| Equipment (all authoring families) | Primary image           | Primary → equipment placeholder                                  |
| Location                           | Primary image           | Primary → location placeholder                                   |
| Organization                       | Primary image           | Primary → organization placeholder                               |

Use an explicit opt-in registry. Unsupported content types do not gain a Manage images
action just because they share the identity layout. Reject Portrait on Class, Species,
Equipment, Location, and Organization writes as well as hiding its controls. Equipment coverage includes every
family routed through its existing form registry, not only weapons and armor.

## Findings in the current codebase

| Current surface            | Evidence and implementation consequence                                                                                                                                                                                |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shared authored content    | `authoredContentBodySchema` owns a single optional imageKey; content envelopes reuse it. Compose a media-bearing variant for opted-in domains; preserve imageKey for out-of-scope domains. Do not replace it globally. |
| Character media            | Character sheet and builder identity also use imageKey. Update persistence, creation, drafts, conversions, previews, and detail DTOs together.                                                                         |
| Upload API                 | POST /api/uploads accepts one file, checks magic-byte MIME and a byte limit, writes original bytes under a UUID, and returns `{ key }`. No asset record, attachment ownership, or dimensions exist here.               |
| Asset delivery             | GET /api/uploads/:key is public with immutable public caching. An unpredictable UUID does not provide authorization. Decide disclosure explicitly before campaign-private assets use the new path.                     |
| Existing image form helper | useExistingImageField handles only the first file and uploads on parent submit; account/avatar and campaign/banner consumers still need it.                                                                            |
| Form layout                | buildContentIdentityFields currently composes Name and availability. Add a shared optional media slot at this ownership point, not ad-hoc per-type spacing.                                                            |
| Render paths               | getContentImageUrl and buildEntityMediaFromImageKey resolve one image and a placeholder. Replace content consumers with a role/context resolver.                                                                       |
| System overlays            | Content writes deep-merge campaign patches. Media must be replaced atomically or cleared roles can reappear from the system base.                                                                                      |
| UI tooling                 | Shared file fields already support multiple selection. Shared dialog panels, confirmation dialogs, and viewport/scroll rules exist. No crop dependency was identified in the inspected package manifests.              |

Source references:

- [Authored content contract](../../packages/contracts/src/rpg/primitives/authored-content.ts)
- [Upload routes](../../apps/api/src/features/uploads/upload.routes.ts)
- [Upload service](../../apps/api/src/features/uploads/upload.service.ts)
- [Upload response contract](../../packages/contracts/src/shared/upload.ts)
- [Asset URL helper](../../packages/contracts/src/shared/assets.ts)
- [Existing image field](../../apps/dashboard/src/lib/use-existing-image-field.ts)
- [Identity layout composition](../../apps/dashboard/src/features/content/lib/forms/fields/content-identity-form-fields.ts)
- [Content write service](../../apps/api/src/features/content/lib/content-write.service.ts)
- [Entity media rendering](../../apps/dashboard/src/features/content/lib/entity/summary/entity-media.lib.tsx)

## Spec and mock refinements

The mock successfully keeps the collection separate from the main form and gives
the active image enough working space. Apply these refinements:

1. Remove the footer “Set as primary.” Role checkboxes are the sole assignment control.
2. Use one selected thumbnail state: border plus accessible selected label. The empty
   circles, selected checkmark, and duplicate ellipsis positions imply multiple
   selection systems. V1 selects one image for editing; upload multi-select is separate.
3. Correct policy-dependent copy. The mock sits over Edit Fighter in Classes but says
   “this character” and offers Portrait. Class policy must show Primary only and an
   image preview, with no portrait controls.
4. Label the middle panel “Portrait crop” only when editing Portrait. When an image
   has both roles, show explicit presentation tabs or a role selector; v1 Primary
   preview is read-only. Unassigned images show the full source preview.
5. Portrait is fixed 1:1, so remove its aspect-ratio dropdown. Remove Rotate in v1;
   automatic orientation handling is required, user-authored rotation is deferred.
6. Replace the Preview button with always-visible square and circular thumbnail
   previews at representative compact sizes. The actual square crop remains canonical;
   the circle is a display mask demonstrating avatar/token clipping.
7. “Remove image” should say “Remove from this {content type}” in confirmation copy.
   List affected roles and explain that removal takes effect on save. It is detachment,
   not immediate physical deletion of an uploaded original.
8. A role transfer can normally be staged immediately with feedback such as “Primary
   moved from image 2 to image 1.” Confirm only if the transfer discards customized
   presentation state; otherwise Cancel provides a clear escape. Removing an assigned
   image always explains its role consequences before staging removal.
9. Identity shows one image, a count, and one clearly named Manage images action.
   Both image and action open the same modal. Keep controls visible without hover.
10. On narrow screens use a full-height dialog with a horizontal thumbnail strip and
    vertically stacked preview/details. Keep Save/Cancel visible; avoid three tiny
    scrolling columns. Desktop may use three regions with shared dialog scroll rules.

Alt text describes the source image, as requested. Placeholder text should encourage
visual description, not just the entity name. Allow intentionally empty alt text;
renderers decide whether an adjacent name makes an image decorative. Cropped images
must not announce off-crop details as if visible: compact named identity contexts
can use empty alt, while the full artwork view uses source alt. Defer separate
presentation descriptions unless a real use requires them.

## UI delivery specification

This section is the visual and interaction acceptance contract for Phase 5 and Phase 6.
Use the supplied mock for hierarchy, proportions, grouping, and density, with the
explicit refinements above. Do not substitute a generic file-picker dialog. The mock
is a reference image, not a source of additional product requirements.

### Identity area above tabs

- Preserve the existing Name and campaign availability arrangement. Add one compact,
  square representative-image slot to its left through the shared identity layout.
  Use the existing identity/avatar size tokens; do not enlarge the panel to show files.
- The image slot is a button with an accessible name such as “Manage character images.”
  Characters label the treatment “Portrait”; the other five types use “Image.”
- With an empty collection, show a neutral placeholder and visible “Add image” action.
  This opens the same manager in its empty state; upload happens inside the modal.
- With attachments, show “1 image · Manage images” or “{n} images · Manage images”
  below the image slot. The count is attachments, not roles. Keep the action visible
  when no representative role is assigned; show the placeholder in that case.
- Character Primary fallback uses the square resolver without displaying a Portrait
  assignment badge or writing a role. Do not suggest a persisted Portrait exists.
- On narrow forms, wrap Name/availability according to the shared identity layout;
  keep the image and its management action together. No thumbnail strip above tabs.
- In form mode, modal save immediately updates this preview and count in the parent
  draft. Parent cancellation still discards the media changes.

### Desktop modal anatomy and sizing

At the mock's 1536 × 1024 reference viewport, target a centered dialog approximately
1240 pixels wide and 830 pixels high, with generous outer gutters. These are visual
targets: implement using shared dialog size tokens and viewport constraints, not
consumer-local pixel overrides. Add a shared size variant if existing variants cannot
support the workspace. Use semantic surface, border, text, and accent tokens rather
than copying the mock's gold/white color values.

```text
Manage images                                                     Close
Add, organize, and assign images for this {content label}.
───────────────────────────────────────────────────────────────────────
Images (4)    + Add images  │ Portrait crop / Image preview
                           │ Contextual description
[thumbnail] [thumbnail]    │ [source and crop viewport] │ Image details
[thumbnail] [thumbnail]    │ [pan / zoom / reset]       │ Alt text
                           │ [live compact previews]   │ Assign roles
                           │                           │ File metadata
                           │                           │ Remove image
───────────────────────────────────────────────────────────────────────
Parent-form persistence hint                    Cancel    Save changes
```

- Header and footer remain visible while the body scrolls. Use the shared dialog
  focus/scroll contract; avoid independent scroll traps in all three regions.
- Header contains one heading, one sentence, and one top-right Close icon with an
  accessible label. Use “this character,” “this class,” “this species,” “this
  equipment item,” “this location,” and “this organization.” Equipment may use its registered subtype label when appropriate.
- Reserve roughly 35% of usable body width for the gallery and 65% for the workspace.
  A vertical divider separates these areas. The workspace heading spans its preview
  and details columns; below it, allocate about three-fifths to preview and two-fifths
  to details. Maintain sufficient details width for labels and filenames to wrap.
- Gallery header and workspace header align. Body padding, vertical rhythm, controls,
  rounded corners, shadows, and dividers use shared component variants/tokens.
- Footer has a top divider, persistence hint on the left in form mode, and Cancel /
  Save changes on the right. Save changes is the only primary button. No Set as primary.

### Gallery and upload states

- Show square thumbnails in two columns at the reference desktop width, with consistent
  gaps. Use a safe thumbnail rendition; selecting an image always previews its source.
- Each tile is one single-selection control. Use a selected border and a visible
  selected indicator distinct from role badges. Do not show empty multi-select circles.
  Keyboard focus must remain distinguishable from selection.
- Overlay concise Portrait and Primary badges along the lower edge; show both on a
  shared source. Badges describe staged assignments immediately and are not buttons.
  Expose filename and roles in the accessible tile name. Long filenames must not
  expand the grid; full filename is available in details.
- Omit thumbnail ellipsis menus in v1: role assignment and Remove image already have
  explicit locations. Selecting a tile is never a removal or assignment action.
- Keep “+ Add images” next to “Images ({n})”. It opens a multi-file chooser. An optional
  drop target may enhance the gallery but cannot be the only upload mechanism.
- While uploading, show temporary tiles with filename, progress/status, and cancellation
  where supported. Failed tiles show concise errors plus Retry and Remove from queue.
  These controls must be siblings of tile selection controls, not nested buttons.
- The count describes successfully attached draft images; announce uploading/failed
  counts separately. Apply the collection limit to attachments plus pending candidates.
- Preserve the current selection when uploads finish. For an initially empty gallery,
  select the first successful upload in chooser order; never assign a role implicitly.
- Duplicate file selection resolves to the existing attachment with a brief notice;
  do not create another tile or overwrite its alt text or presentation.
- Empty state spans the gallery with “No images yet” and brief upload guidance. The
  workspace shows a neutral “Add an image to get started” state; hide crop, metadata,
  role controls, and Remove image until an image is selected.

### Preview and Portrait editing

| Selection state                  | Workspace heading     | Controls                                                      |
| -------------------------------- | --------------------- | ------------------------------------------------------------- |
| Unassigned source                | Image preview         | Full source preview; guidance to assign a role                |
| Primary only, any supported type | Primary image preview | Full artwork preview; no crop controls in v1                  |
| Character Portrait only          | Portrait crop         | Fixed square crop, pan, zoom, reset, live previews            |
| Character source with both roles | Role-specific heading | Portrait / Primary image presentation tabs; independent views |

- On open, select the identity role's source, then Primary's source, then the first
  attachment. Select Portrait presentation if available. This chooses the editor
  state only and does not change role assignments. Retain selection within a session.
- Show the complete source in a bounded neutral preview surface using contain behavior.
  Portrait mode overlays a fixed 1:1 aperture, dims the area outside it, and shows
  corner markers and rule-of-thirds guides. Pan the image underneath the aperture;
  do not suggest freely resizable crop handles if the interaction cannot resize them.
- Put a labeled Zoom slider, numeric zoom value, and zoom-out/in buttons directly below
  the viewport. Clamp zoom/pan so the crop never exposes blank pixels. Provide labeled
  reposition controls or documented keyboard arrows as an alternative to dragging.
- Reset crop restores the centered, largest valid square for this Portrait presentation
  only. Re-selecting the image must preserve the current staged crop and zoom.
- Show “Square portrait” and “Circular avatar preview” together below the controls.
  They update live from the same crop; the circular mask does not change persisted data.
  Keep these previews small so the source remains the dominant editing surface.
- No aspect ratio dropdown, Rotate, or modal Preview button in v1. Primary and
  unassigned previews must not show disabled or irrelevant portrait controls.
- When both roles use a source, choosing a presentation tab changes the preview only;
  it does not toggle either role checkbox. After assigning Portrait, open its editor;
  after unassigning it, fall back to Primary preview or unassigned source preview.
- If an image is too small for Portrait, disable that assignment with the required
  dimensions and actual dimensions explained inline; allow Primary if valid. Do not
  remove the source or silently upscale to satisfy role eligibility.

### Image details and roles

- Match the mock's order: “Image details,” Alt text field and helper, “Assign roles,”
  read-only metadata separated by a divider, then the destructive image action.
- Use the schema-driven Form field layer for the labeled Alt text control. A short
  multiline input may grow modestly for descriptions. Helper: “Describe the original
  image for accessibility.” Allow empty values and avoid persisting placeholder copy.
- Character has Portrait followed by Primary image checkboxes. Class, Species,
  Equipment, Location, and Organization each have only Primary image. Preserve this section for a single role.
- Role helper text: Portrait — “Used for character cards, lists, and tokens.” Primary
  image — “Used for representative artwork and detail views.” Icons supplement labels.
- Checking a role on a new source transfers it. Keep selection on that source and
  update both tiles' badges together. If confirmation is needed for a customized
  presentation, do not mutate draft state until confirmation succeeds.
- With no assigned role, show quiet guidance: “Assign Primary image to show artwork
  on this {content label}.” Character guidance can offer Portrait for compact identity.
- Metadata rows: filename, oriented dimensions, and formatted file size. Uploaded
  date is optional when available; uploader identity is not required for v1. Wrap
  filenames and omit unavailable metadata rather than inventing values. No asset IDs.
- Place one “Remove image” destructive outline button below metadata. Confirmation
  names the image, lists roles that will be cleared, and explains that Save changes
  applies removal. Removing a non-role image may stage immediately with an announcement.
  After removal select the nearest remaining tile and restore logical keyboard focus.

### Saving, dismissal, and feedback

- In parent forms, keep the requested “Save changes” label and visibly state “Image
  changes are saved when you save this {content label}.” This applies to the parent
  draft; the dialog does not silently save unrelated fields or the entire record.
- Save is disabled when unchanged, while saving, or while retained upload errors,
  pending uploads, or invalid presentations exist. Explain blocking issues near the
  affected item and in a concise status summary; do not rely on a disabled button alone.
- During save, show progress in the primary button and prevent duplicate submission.
  Keep the dialog/draft open on server failure, with a visible retryable error. A
  revision conflict must offer explicit reload/discard rather than automatic overwrite.
- Cancel, Close, Escape, and backdrop dismissal all use the same dirty-session policy:
  pristine closes immediately; dirty asks “Discard image changes?” before closing.
  Selecting another thumbnail never triggers this confirmation.
- Use inline status/live announcements for upload and role operations without forcing
  focus away from current controls. Use nested confirmation dialogs only for the
  specified consequential actions, following the shared dialog stack conventions.

### Responsive and visual acceptance

- At intermediate widths, retain the gallery beside the workspace but stack Image
  details below the preview. Switch before controls become cramped; use established
  layout breakpoints rather than device detection.
- On small screens use the shared full-height modal treatment. Gallery becomes a
  horizontal, keyboard-scrollable thumbnail strip below its heading/Add images row.
  Preview and details stack beneath it in one vertical content scroller. Header and
  footer remain reachable with safe-area padding and the on-screen keyboard visible.
- Keep Save/Cancel together in the footer; wrap the persistence hint above them when
  needed. Do not allow the horizontal gallery to cause whole-dialog horizontal scroll.
- Verify the supplied reference viewport, a tablet-width layout, a narrow mobile
  viewport, and 200% zoom. Compare hierarchy, proportions, selection treatment, and
  control placement against the mock, not exact source-image pixels or hardcoded colors.
- Required visual fixtures: Character with separate roles (mock equivalent), Character
  with both roles on one source, Class/Species/Equipment/Location/Organization with Primary only, empty
  collection, unassigned collection, long metadata, and partial upload failure. Include
  an integrated identity-above-tabs capture and each responsive layout before sign-off.
- Approved departures from the mock are explicit: no duplicate Set as primary, no
  thumbnail menu clutter/multi-select circles, fixed Portrait ratio, no manual rotation,
  and always-visible compact previews. Other layout changes require a documented reason.

## Product defaults proposed for v1

- No automatic role assignment, including the first upload. After upload, offer
  role controls and explain that no representative image is selected yet.
- Missing Primary on ordinary content shows a placeholder, even with a nonempty
  gallery. Never silently pick the first attachment.
- Character compact contexts prefer Portrait, then a transient centered square
  rendition of Primary, then the character placeholder. Full artwork/detail contexts
  use Primary, then a placeholder. Fallbacks never persist role assignments.
- A role transfer starts from the destination source's default presentation. Warn
  before discarding an existing customized crop. Cancel restores the full session.
- Preserve insertion order in the gallery. “Organize” means role assignment in v1;
  drag reordering and bulk removal are deferred. If reorder is later added, include
  keyboard move controls and persist the same ordered array.
- Proposed configurable limits: 20 attachments per record, three uploads in flight,
  Portrait crop at least 128 × 128 decoded pixels. Retain the existing server byte
  ceiling and add an explicit decoded-pixel limit. Confirm concrete limits during
  implementation performance testing and expose one policy source to client/server.

## Ownership and dependencies

| Layer                                  | Responsibility                                                                                                                               |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/contracts/src/shared/media/` | Asset DTOs, ContentImage, ImagePresentation, ContentMedia, normalized geometry, role vocabulary and validation                               |
| Contracts domain policy                | Typed media policy per supported content type and PC/NPC; allowed roles, representative role, role dimensions/capabilities                   |
| `apps/api/src/features/media/`         | Asset records, original storage adapter, attachment authorization, inspection, derivatives, lifecycle/cleanup                                |
| Existing content/character services    | Own media on their records; delegate shared asset/role validation and attachment reconciliation                                              |
| `packages/ui`                          | Reusable source preview, gallery selection, accessible crop controls, role controls, dialog layout; no campaign queries or asset persistence |
| `apps/dashboard/src/features/media/`   | Public MediaManager orchestration, upload queue, local edit session, API hooks, policies supplied by consumers                               |
| Content/character adapters             | Parent form integration and representative image rendering through common resolver                                                           |

Follow existing feature public barrels and schema-driven Form integration. Add
co-located CSF3 stories and interactive tests. UI primitives use `.client.tsx` and
the client directive; dashboard modules use ordinary `.tsx`. Tailwind styling lives
in variants files, consumes semantic tokens, and respects shared surface ownership.

Do not add a workspace package solely for the modal. The shared contracts, UI
primitives, API feature, and dashboard feature supply useful boundaries. If a crop
library is needed, evaluate accessibility, deterministic geometry, touch support,
bundle size, and compatibility in a small spike before selecting a dependency.

## Contracts and persisted state

Retain the user's model with the following precise semantics:

- `ContentImage.id` identifies an attachment within one record. `assetId` identifies
  an immutable uploaded original; these are different identities. `alt` is attachment
  text, allowing context-specific descriptions if an asset is reused.
- `images[]` order is stable. Attachment IDs and asset IDs are unique within a record.
  Assigning two roles to one attachment never creates a second upload or attachment.
- `roles.primary` and `roles.portrait` are optional strict properties. Reject unsupported
  roles according to the record's media policy on the server, not just in the modal.
- Every role imageId must exist in images. Removing an attachment removes all of its
  role references in the same proposed media object and same atomic write.
- `crop` coordinates are normalized to [0,1] against the EXIF-oriented display source:
  x/y are top-left, width/height are positive, and the rectangle stays within bounds.
  A square Portrait requires `width * sourceWidth ≈ height * sourceHeight`; normalized
  width and height need not be equal on a nonsquare source. Use a documented pixel
  rounding tolerance and validate dimensions against trusted asset metadata.
- UI pan/zoom is transient state converted into the crop rectangle. Persist one
  canonical representation; do not persist conflicting zoom, crop, and transform state.
- If focalPoint is retained for future use, define precedence: explicit crop wins;
  focalPoint guides a generated crop only when no explicit crop exists. Keep focal-point
  editing out of v1 Primary. Do not use a Primary focal point to modify Portrait.
- Source orientation is fixed by the asset record and renderer. User rotation is out
  of scope unless a later version adds an explicit shared transform contract.

Server asset records include id, storage key, original filename, detected MIME,
byte size, oriented width/height, content hash, owner/scope, createdAt, and lifecycle
state. The client metadata DTO omits storage keys and ownership internals. Dimensions
and size are server-derived. Treat filenames as plain text, never filesystem paths.

Separate mutable source metadata from immutable bytes only where needed; crops,
roles, and alt text belong to content media, not global asset records. Do not put a
character-specific portrait flag on an asset.

## Asset scope, upload, and safe delivery

Introduce an upload session tied to an authorized owner/scope (campaign content,
campaign NPC, user-owned PC). Before a record exists, authorization is against that
creation scope. Client-supplied asset IDs are never sufficient to attach another
user's image. Shared policy resolves supported roles; domain services retain their
existing content-write permissions rather than adopting a blanket manager-only rule.

Multi-select uses a bounded queue of single-file requests initially; the current
single-file endpoint is not itself a reason to build a batch multipart endpoint.
Each new media upload returns an asset DTO and upload-session identity, not just key.
Use TanStack Query mutation hooks and same-origin CSRF-protected requests. Reuse the
storage adapter behind legacy uploads; keep avatar/banner response contracts intact.

Validate MIME by magic bytes, byte size, successful decode, dimensions, pixel count,
and frame/resource limits. Define animated-image behavior explicitly: preserve GIF
or animated WebP originals, but use a deterministic first-frame still for compact
and crop previews with an “Animated source; still preview” notice. If the selected
processing stack cannot bound animated decoding safely, reject animated uploads in
new media management with clear copy; do not silently flatten the original.

Reject SVG for the initial raster-image feature. Reject corrupt or unsupported
images with per-file errors; allow successful uploads to stay in the queue. Retry
failed files individually. Save is unavailable while a retained upload is pending
or failed; the user can remove failed entries and save the successful subset.

Deduplicate identical bytes within the authorized scope using a server hash; do
not expose cross-user hash-existence information. Hash deduplication is distinct
from role reuse, which works even without hashing. Use request idempotency for
retries. Different encodings/crops of the same subject are distinct source files.

New scoped media must use authorization-aware delivery, including derivatives;
public immutable caching is inappropriate for private campaign assets. Use authenticated
same-origin reads with suitable private caching or short-lived authorized URLs.
Published public/system assets may use a separate explicit public delivery policy.
Never leak storage paths. Serve sanitized display derivatives for normal viewing
(strip incidental EXIF metadata) while retaining original bytes in controlled storage.
Do not route private new assets through the existing public upload GET endpoint.

## Modal transaction and parent form semantics

Opening the modal clones the current form's media into an isolated edit session.
Selecting thumbnails, changing alt, assigning roles, and cropping affect only that
session. Uploads may persist temporary assets, but they do not attach them to content.

For create/edit forms, “Save changes” applies validated session media to the parent
form and marks it dirty; the parent Save persists the content. Add visible helper
copy: “Image changes will be saved when you save this {content type}.” Consider
“Apply changes” in this embedded context if product copy can differ from the mock.
For a manager opened directly from a saved detail page, Save can invoke the record's
media command and close only after success. Make this an explicit adapter mode.

Cancel discards roles/crops/alt/removals and leaves parent form media untouched.
Close/Escape/backdrop on a dirty session uses the same discard confirmation. A
removed assigned attachment is staged only after confirming which roles disappear.
On successful removal, select a nearby remaining thumbnail; removing the last image
returns to the empty gallery state. Never auto-promote another image.

Temporary uploads survive modal Apply until the parent is saved or abandoned. Use
an expiring upload lease with a deliberate duration (proposed 24 hours) and recovery
copy for expired drafts. Garbage collection deletes only expired, unreferenced
assets after an atomic lifecycle claim; attaching an asset must reject/avoid assets
claimed for deletion. Cancel requests release when possible; cleanup remains reliable
if the tab closes or a request fails. Never depend solely on browser unload handlers.

Content save atomically validates media, attaches owned ready assets, and reconciles
reference records. Physical file cleanup occurs after commit with retries. Shared
assets are retained while referenced elsewhere, including campaign overlays. Do not
delete originals synchronously from “Remove image.”

Use a per-record media revision in resolved DTOs/commands and expectedMediaRevision
for writes. A parent form update that changes media must enforce the same revision;
ordinary non-media edits cannot replace it accidentally. A stale modal returns a
conflict and preserves its draft for reload/review. Do not last-write-win an entire
gallery silently.

## API and patch behavior

Proposed media infrastructure operations: create upload session, upload asset,
resolve authorized asset metadata/renditions, release session. Domain content and
character create/update services receive a complete ContentMedia replacement plus
expectedMediaRevision where applicable. A detail-page media endpoint, if introduced,
must delegate to the same domain command, not bypass permissions or revision checks.

Define patch semantics uniformly:

- Omitted media: unchanged/inherit system media as applicable.
- Supplied media object: replace the full collection and role map together.
- Explicit empty media object (`images: [], roles: {}`): remove all effective media,
  including inherited media for a campaign overlay.

Register media as a replacement boundary in both cumulative overlay writes and
resolved reads. Removing portrait or primary from a supplied role map must not
resurrect that role from the base. Duplicating content can reuse authorized assets
but creates distinct attachment IDs and remapped role imageIds. Cross-scope copying
needs explicit authorized asset copying; do not grant access through ID reuse.

## Crop rendering and role resolver

Provide one resolver taking effective media, asset summaries, and a presentation
context such as compact identity or full artwork. It returns source/rendition,
presentation, resolved role/fallback reason, and accessibility data. Consumers must
not choose `images[0]` or read portrait/primary independently with diverging fallbacks.

Use the same normalized geometry in browser preview and server rendering. Derivative
cache keys include immutable asset identity, normalized crop, output dimensions,
format, and renderer version. Accept only validated dimensions/presets, bound resource
cost, and authorize derivative requests. Original files never change on crop edits.
Provide a few presets (gallery thumbnail, compact identity, larger portrait, artwork)
rather than per-surface ad-hoc image transformations. Generate missing derivatives on
demand initially; add workers only when measured load requires them.

Portrait requests explicitly identify the role. Primary never inherits Portrait's
square restriction. Fallback to Primary creates a centered square rendition without
writing roles. Empty/error placeholders reserve layout dimensions to avoid jumps.
Identity click opens management only where the viewer can edit; read-only artwork
surfaces use their normal viewing behavior.

## Accessibility and interaction acceptance

- Gallery uses single-selection semantics, keyboard navigation, visible focus, and
  readable role badges. Announce upload success/failure and role transfer succinctly.
- Crop supports pointer drag, touch, keyboard repositioning, and labeled zoom controls
  with a numeric value. Provide keyboard/button alternatives to dragging and a Reset
  crop action. Do not require precision gestures or rely on color alone.
- Moving between thumbnails preserves every image's pending metadata/crop. Switching
  presentation roles never commits or resets another role.
- Dialog uses shared focus trapping/return and nested confirmation conventions. Focus
  returns to the triggering image/action; upload input cancel changes nothing.
- Keep contrast, target sizes, reduced motion, and zoom/reflow compatible with WCAG
  2.2 AA. Test small viewports and browser zoom, not only a desktop screenshot.
- Component stories cover empty, both roles on one source, separate role sources,
  no assigned roles, assigned removal, uploading, partial failure, conflict, and mobile.

## Implementation phases and cutover

All phases are pending. Each phase includes its relevant tests and documentation;
the final phase verifies the integrated feature rather than deferring all quality work.
Phases 1–5 prepare infrastructure and testable components. Phase 6 switches existing
contracts and their consumers together, avoiding an interim broken application.

| Phase | Deliverable                                             | Depends on |
| ----- | ------------------------------------------------------- | ---------- |
| 1     | Contracts, policies, and validated crop design          | —          |
| 2     | Original asset upload and authorized delivery           | 1          |
| 3     | Attachment lifecycle and atomic media persistence       | 2          |
| 4     | Presentation renderer and derivatives                   | 2          |
| 5     | Complete media manager with isolated draft state        | 3, 4       |
| 6     | Content/character integration and shared schema cutover | 5          |
| 7     | End-to-end acceptance, accessibility, and release gates | 6          |

### Phase 1 — Contracts, policies, and crop proof

**Scope**

- Inventory imageKey readers/writers, seed assets, system overlays, builder drafts,
  imports, duplication, API mappers, and rendering surfaces. Record an explicit
  integration checklist, including consumers outside dashboard.
- Define asset DTOs, ContentImage, ImagePresentation, ContentMedia, media revision,
  upload-session contracts, and the typed content media policy registry.
- Limit registry opt-in to Character, Class, Species, Equipment, Location, and Organization. Inventory every
  equipment family via its form registry and cover both PC and NPC paths. Design a
  media-bearing authored-content schema composition that omits imageKey for these
  domains while leaving other domains' contracts and upload behavior intact.
- Specify geometry bounds, oriented dimensions, square-crop rounding tolerance,
  role eligibility, explicit empty-media behavior, and original preservation.
- Resolve the proposed defaults above: modal save modes, upload/pixel/count limits,
  temporary lease duration, and animated-image support. Distinguish these proposed
  product defaults from already requested invariants.
- Prototype orientation/crop parity and accessible pan/zoom using representative
  portrait, landscape, small, and EXIF-oriented images. Select any required processing
  or crop dependency only after this proof.

**Completion criteria**

- Contract tests reject invalid geometry, dangling roles, duplicate attachments,
  and unsupported role assignments.
- Crop coordinate conversion and reset behavior are demonstrated with fixtures.
- The consumer checklist and final v1 policy choices are documented. Existing
  authored-content and character contracts still retain imageKey at this phase.

### Phase 2 — Asset ingestion and authorized delivery

**Scope**

- Add the media asset model and storage adapter, preserving immutable originals.
- Implement authorized upload sessions and single-file upload commands used by a
  multi-select queue; return asset metadata rather than a bare storage key.
- Inspect MIME, decode validity, byte/pixel/frame limits, dimensions, and orientation.
- Add scoped hash deduplication and upload idempotency, without cross-owner disclosure.
- Provide authorized metadata and image delivery with explicit public/private caching.
  Keep existing account-avatar/campaign-banner upload contracts operational.

**Completion criteria**

- Unauthorized upload, metadata access, and image reads fail correctly.
- Duplicate retries do not create extra assets; corrupt/oversized inputs fail with
  useful per-file errors. Original bytes remain unchanged.
- Upload API tests cover each supported format and the chosen animation policy.
- New private media cannot be read through the old public upload route.

### Phase 3 — Attachment lifecycle and media persistence

**Scope**

- Implement shared validation/reconciliation commands called by domain write services.
- Add reference tracking, temporary leases, session release, expiration, and retryable
  physical cleanup. Protect attach-versus-cleanup races.
- Implement full-media replacement, expectedMediaRevision checks, and owned-asset
  attachment validation. Content changes and reference updates commit atomically.
- Prepare system-overlay replacement semantics, duplication/remapping, and the
  public system-asset manifest. Do not activate a parallel live media write path.
- Specify create/edit form versus saved-detail persistence adapter contracts.

**Completion criteria**

- Failed content saves cannot leave partially committed references.
- Stale updates preserve the current gallery and return a conflict.
- Referenced/shared originals survive removal from another record; abandoned temporary
  uploads are reclaimable even without a browser Cancel request.
- Overlay tests prove cleared roles and empty collections do not reappear through merge.

### Phase 4 — Role resolution and presentation rendering

**Scope**

- Build the shared resolver for compact identity and full artwork, with explicit
  Portrait → transient Primary crop → placeholder fallback for compact characters.
- Implement validated derivative presets and cache keys, sanitized display outputs,
  access checks, and bounded generation cost.
- Share canonical crop conversion between browser preview and persisted rendering.
- Provide image primitives with reserved dimensions, error states, appropriate alt
  handling, and square/circular compact previews.

**Completion criteria**

- Browser preview and generated output agree for oriented and nonsquare sources.
- Two roles on one attachment render independently; editing either never alters originals.
- Fallback rendering never persists a role. Derivative permissions match original access.
- Resolver tests cover missing roles/assets, independent crops, and placeholders.

### Phase 5 — Media manager and isolated edit session

**Scope**

- Build the reusable modal, single-selection gallery, upload queue, metadata/alt fields,
  policy-driven role assignment, and Portrait crop controls.
- Implement the UI delivery specification above, including reference-desktop proportions,
  gallery/workspace divider, preview/details hierarchy, persistent header/footer, and
  the specified tablet/mobile arrangements. Add shared variants where necessary.
- Implement a session reducer for add/select/remove, role transfers, independent crop
  edits, reset, dirty tracking, apply/save, and discard.
- Connect infrastructure through dashboard media hooks; keep UI primitives free of
  campaign queries and persistence.
- Support bounded multi-select uploads, per-file retry/removal, staged destructive
  confirmations, conflicts, and parent-form/detail save modes.
- Add responsive layouts, keyboard crop controls, live compact previews, focus handling,
  and stories for all states listed in the accessibility section.

**Completion criteria**

- Complete Character, Class, Species, Equipment, Location, and Organization policy examples work in stories/test
  harnesses. Only Character exposes Portrait; Primary-only examples show no crop editor.
- Visual fixtures match the mock's hierarchy and the documented departures. Empty,
  unassigned, dual-role, loading, error, and responsive layouts are reviewable.
- Cancel restores all initial media; selection/role changes do not discard other edits.
- Role transfers and assigned-image removal explain consequences; no automatic promotion.
- Save cannot commit unresolved upload failures, pending uploads, or invalid role geometry.
- Keyboard-only and narrow-screen flows work. Existing production forms are not yet switched.

### Phase 6 — Domain integration and coordinated cutover

**Scope**

- Prove Class Primary and PC/NPC Primary + Portrait integration first within the cutover
  work: compact identity trigger, form application, record save, draft restoration,
  role rendering, and permission checks. Treat these as checkpoints, not a separately
  released dual-schema state.
- Replace imageKey with media in Character, Class, Species, Equipment, Location, and Organization contracts
  through scoped composition and update their dependent consumers together. Do not
  globally replace imageKey in the shared authored-content base. Avoid duplicate field
  definitions by deriving the new variant from shared Zod shapes and omitting imageKey.
- Wire the manager into the shared identity composition above tabs; consumers supply
  policies rather than content-type branches inside the modal.
- Update API models/mappers/write services, system overlays, catalog loaders, seeds,
  imports, duplication, generated schemas, character finalization, and draft versions.
- Update representative image paths for all six opted-in types, including every
  Equipment family in its form registry. Their cards, lists, detail views, character
  rails, and existing character token/avatar consumers use the common resolver.
- Keep all other content policies unchanged. Shared identity
  and rendering components must preserve their existing behavior for non-opted-in callers.
- Remove obsolete content/character imageKey adapters and render paths once all callers
  are switched. Preserve helpers still required by out-of-scope content/account/campaign media.

**Completion criteria**

- One green dependency slice includes both contract removal and all consumer changes;
  no affected surface still reads a removed imageKey field.
- Standalone PC, campaign NPC, homebrew creation/editing, and system campaign overlays
  roundtrip media correctly with existing domain permissions.
- Class, Species, Location, Organization, and every Equipment authoring family support collection management
  and Primary assignment end to end. Portrait is absent in their UI and rejected by
  their API policy. Out-of-scope forms retain their existing image behavior.
- Identity remains compact with no gallery leakage. Parent-form Cancel versus modal
  Save/Cancel behavior matches the declared mode.
- Cross-scope duplication cannot grant unauthorized asset access.

### Phase 7 — Acceptance, documentation, and release gates

**Scope**

- Run the full verification matrix below across content policies and character contexts.
- Exercise abandoned sessions, cleanup/attachment races, stale edits, upload failure,
  and derivative errors using integrated API/UI tests.
- Inspect representative desktop/mobile layouts, browser zoom, keyboard navigation,
  screen-reader labels, and accessible crop alternatives.
- Review the UI specification's visual fixtures against the supplied mock, including
  actual identity integration for all six types and PC/NPC. Verify the documented
  layout proportions and responsive transitions, not only isolated component stories.
- Audit all media consumers for role resolution and private-delivery behavior.
- Update architecture, contracts structure, forms/media authoring documentation,
  upload lifecycle documentation, and affected package READMEs.

**Completion criteria**

- Required acceptance cases pass; no unresolved data-loss, permission, or crop-parity gaps.
- Current pre-commit gates pass and `pnpm gate:pre-push` passes before sharing.
- Document remaining intentional deferrals: manual rotation, Primary crop/focal-point
  controls, drag reordering, bulk removal, and separate avatar/banner modernization.

This is a dev-only codebase: no permanent dual-read imageKey/media behavior within an
opted-in domain and no
migration scripts by default. Update seed definitions and draft versions directly;
do not remove local uploads or data without explicit instruction. Shipped system
assets need a public asset manifest distinct from user uploads; do not seed fake
ownership into the private asset collection.

## Required verification

- Invalid role references, duplicate attachments/assets, unsupported roles, out-of-bounds
  or nonsquare Portrait crops, and unowned asset IDs are rejected server-side.
- One source supports independent Primary/Portrait presentation; reset/crop operations
  preserve source bytes and other roles. EXIF-oriented preview and persisted output agree.
- Cancel, parent-form cancel, browser abandonment, partial upload, and failed record
  save neither publish media changes nor leak permanent orphan files.
- Concurrent media edits fail explicitly; cleanup and attachment races cannot delete
  referenced assets. Duplicating records and shared references remain safe.
- Overlay removal stays removed through save/read roundtrips; no role is restored by
  deep merge. Standalone PC and campaign NPC creation preserve media end to end.
- Private assets/derivatives are inaccessible without authorization; cache behavior
  matches disclosure. Image decoding rejects unsupported/corrupt/oversized inputs.
- Both role badges, one selected-image state, live compact previews, keyboard crop,
  and compact identity layout match the interaction specification.
- Portrait controls exist only for Character (PC/NPC). Class, Species, Location,
  Organization, and all Equipment families use Primary-only policy. Excluded types
  do not acquire collection controls or change persistence contracts.
- Follow current hook scripts for affected checks. Run `pnpm gate:pre-push` once
  before sharing implementation; it includes coverage, coverage health, and build.
