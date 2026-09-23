# Media field summaries — implementation plan

Status: implemented for managed content authoring and character Identity forms.

## Intended behavior

Add reusable image-field summaries with two presentations: `compact` and
`expanded`. Presentation is independent of collection capacity: a compact field
shows one thumbnail but may represent many images. All thumbnails are square in
this iteration. Image management remains in the existing MediaManager.

Use compact summaries before Name on image-enabled content authoring forms. Use
the expanded summary before Name in the character builder Identity step. Preserve
the existing surrounding field order unless moving media requires a change.

Current media domains are Character, Class, Species, Equipment, Location, and
Organization. Cover create/edit and overlay shells, all equipment families, and
PC/NPC builder paths. Audit alternate forms for those domains before declaring
rollout complete. Account avatars and campaign image fields currently use the raw
file field; preserve their data model and behavior in this rollout. Do not infer
media support for other content types from a legacy image property alone.

## UX decisions

### Compact summary

The square thumbnail and caption form one native `button type="button"` with one
focus stop. Clicking the thumbnail, caption, or padding opens the manager. Use no
nested link/button and no click handler on a generic wrapper. The hit area ends at
the compact control; it does not include adjacent form fields or the whole row.

| Capacity and state                 | Visual                 | Caption                |
| ---------------------------------- | ---------------------- | ---------------------- |
| Single, empty                      | Image-plus placeholder | No image · Add image   |
| Single, occupied                   | Image preview          | Change image           |
| Multiple, empty                    | Image-plus placeholder | No images · Add images |
| Multiple, one, limit 3             | Representative preview | 1 of 3 images · Manage |
| Multiple, two, limit 3             | Representative preview | 2 of 3 images · Manage |
| Multiple, full, limit 3            | Representative preview | 3 of 3 images · Manage |
| Multiple, count-only configuration | Representative preview | 3 images · Manage      |

Use singular `1 image` for count-only copy. At capacity, Manage remains available;
only adding more images is constrained. Single-image Change opens the manager,
where replacement, removal, alt text, and applicable role controls remain available.

Use capacity copy by default. The current collection limit is 20, not 3; examples
must not silently change product limits. Keep a count-only option for contexts
where showing the limit is distracting.

### Compact empty-state appearance

Render one square, neutral image well with a subtle solid border, standard field
radius, and a centered image-plus icon. Use named surface/border/icon tokens; no
sample photograph, avatar silhouette, blank image element, or dashed dropzone
border in manager mode. Keep the well the same dimensions as the populated preview
so adding an image causes no layout shift. The icon is decorative.

Place the caption directly below the square, centered. Render `No image`/`No images`
as muted supporting text and `Add image`/`Add images` with the normal action
emphasis, separated by a middle dot. These are styled spans within the same button,
not separate controls. Allow the caption width to exceed the square where needed
to avoid forcing tiny text or awkward wrapping.

```text
     ┌──────────────┐
     │              │
     │   image +    │
     │              │
     └──────────────┘
 No images · Add images
```

For effective capacity one, use `No image · Add image`; for larger capacities,
use the plural even though only one preview tile is rendered. Do not display
`0 of N` in the empty caption. If capacity guidance is needed, use the existing
field hint rather than adding text inside the square.

Hover gives a subtle surface/border response across the control; keyboard focus
gets one visible focus ring around the complete button. There is no separate plus
button, hover-only action, or tooltip required to discover the action. Clicking
opens the empty manager, with its upload action available; it does not immediately
launch a native file picker. Disabled/read-only states follow the conventions below.
An upload-configured empty state instead uses actual dropzone affordances and
file-picker behavior. Loading or broken existing images never use the empty icon
and Add copy, because the collection is not empty.

### Expanded summary

Header: `Images` on the left; `Add images` when empty or `Manage` when populated
on the right. Show the count/capacity once as supporting text when populated.

Empty: one full-width, shallow empty well with `No images yet.`. Both the well and
the header action can open the manager. Do not render placeholder gallery slots.

Populated: show up to four square tiles. If there are more than four attachments,
show three thumbnails and a fourth `+N` tile; N equals the entire hidden count.
For seven attachments, render three thumbnails and `+4`. With four attachments,
show all four. Preserve attachment order. On narrow screens, wrap the same tiles
without horizontal overflow; the overflow count remains stable.

Each thumbnail opens the manager with that attachment selected. Manage opens the
representative attachment; the overflow tile opens the first hidden attachment.
The latter makes the hidden-images action useful and predictable. Opening an
image selects it without editing its data or marking the session dirty.

Do not make the expanded container itself clickable: its thumbnails and header
action have different targets. No inline removal, reordering, crop tools, role
toggles, lightbox, or per-thumbnail menus. These remain in the manager.

### Preview selection and crops

For compact authoring summaries, use the domain's representative role when valid,
then Primary if different and available, then the first attached image. This last
fallback is an authoring convenience and must not assign a role or alter public
entity-display semantics. Existing representative-image resolution deliberately
returns a placeholder for unassigned media; do not globally change that resolver.

Reuse existing role/crop resolution for assigned previews. For an unassigned
attachment or expanded source thumbnail, use a square source preview with a
display-only center crop. This must never persist a crop or mutate the original.
If roles are missing, retain the manager's existing role validation/guidance.

### Configurable inline upload

The default empty action opens the manager. An explicit form option may replace
the empty well/compact placeholder with the existing compact FileDropzone for
inline upload. Never imply drag/drop through styling on a modal-only control.

Inline upload is an alternate empty state, not an expanded inline manager. Upload
through the existing scoped queue; count queued/in-flight reservations against the
remaining capacity. Show progress and actionable failure/retry state in the well.
Do not add parallel upload APIs or use the legacy file endpoint for managed media.

Once the queue settles, show the normal summary for successful attachments;
preserve any failures until retried or dismissed. Offer Manage for role/crop work.
Only successful uploads become form attachments. Upload completion is not a
parent-record save. If required presentation validation cannot be satisfied yet,
surface an actionable field error that opens the manager.

For max-one fields, an existing image still uses Change image in the manager;
inline upload is only the empty-state acquisition path. On parent discard/unmount,
abort pending work and preserve existing temporary-asset lease cleanup semantics.

## Schema and ownership

### Persisted data

Keep `ContentMedia` from `@rpg/contracts` as the sole domain value:
`revision`, ordered `images`, and `roles`. Keep attachment IDs distinct from asset
IDs. Do not store preview URLs, counts, selected attachment, modal state, layout,
or native File objects in ContentMedia. Derive counts from attachments.

Do not introduce a new single-image persisted shape. Single capacity still uses
the same collection schema. Layout is form configuration, not entity data.

### Presentation configuration

Define one dashboard media-field presentation type, exported through the media
feature barrel, and consume it from content form definitions and builder fields.
Suggested shape (illustrative TypeScript):

```ts
type MediaFieldPresentation = {
  layout: 'compact' | 'expanded'
  emptyAction?: 'manager' | 'upload' // default: manager
  countDisplay?: 'capacity' | 'count' // default: capacity
}

type MediaFieldConfig = {
  collection?: {
    maxItems?: number // omitted: global default; positive integer up to platform ceiling
  }
  presentation: MediaFieldPresentation
}
```

Use shared named constants for repeated vocabulary/defaults. Keep the initial
expanded tile budget at four and shape square; do not add arbitrary dimensions,
aspect ratios, or a thumbnail-size configuration system yet.

Content form metadata can expose `media: { domain, collection, presentation }`. Centralize the
media-domain association and presentation defaults, replacing the ad hoc route
map in the header. Reuse any existing authoritative mapping discovered during the
integration audit rather than maintaining two registries. Builder configuration
selects expanded explicitly. Form metadata must not carry user-specific scope;
the host supplies authorized scope and permission state at runtime.

Use the current Form slot extension to render the dashboard adapter. This makes
layout configurable through form builders without teaching `@rpg/ui` about
dashboard media APIs. Keep `type: 'file'` for native File/File[] fields. Managed
ContentMedia and raw browser files have different lifecycles and must not become
an ambiguous union in FileFieldConfig.

### Capacity policy

Current validation/upload infrastructure uses `CONTENT_MEDIA_MAX_ATTACHMENTS = 20`.
Add an optional per-collection `collection.maxItems` override. Omission uses the
global default; setting N limits that gallery to N regardless of compact/expanded
presentation. For example, `{ collection: { maxItems: 3 }, presentation: { layout:
'compact' } }` shows one preview and permits three attachments. `maxItems: 1`
activates single-image copy and replacement behavior in either layout.

Separate the default from the platform's absolute ceiling conceptually, even if
both initially remain 20. In this iteration, overrides may narrow the global limit
to any positive integer; do not allow overrides to bypass the platform ceiling.
Reject zero, negative, fractional, and over-ceiling configuration values instead
of silently clamping them. Use read-only/disabled state to prevent editing rather
than a capacity of zero. A future increase above the current platform ceiling is
a separate policy change.

Define the collection constraint schema in `@rpg/contracts`; derive its TypeScript
shape rather than duplicating it in dashboard config. Resolve effective capacity
once from shared configuration, and pass the result to summary copy, manager,
validation, replacement handling, and every upload queue/drop/picker path. Count
in-flight reservations as well as completed attachments for upload admission.

Collection constraints are separate from domain role policy: two configured
galleries may share a domain but have different limits. Associate the constraint
with a stable gallery/field context in shared configuration. The form references
that policy; it does not become the only authority. Server attachment writes
resolve the same trusted context and enforce its limit rather than trusting a
client-supplied number. All entry points editing the same collection must resolve
the same policy, including detail-mode manager use. Do not store maxItems in each
ContentMedia value or add gallery IDs to persisted data solely for this option.

There is currently one managed media collection per record in these integrations.
Design the resolver around the existing domain/field context; add extra context
keys only when a concrete second collection requires them. Default configurations
remain unchanged until a particular gallery explicitly opts into a smaller limit.

At capacity one, replacement must be possible without removing the old attachment
first. Upload the candidate while retaining the original, then stage an atomic
replacement on success. Failure/cancel preserves the original. Treat that upload
as a replacement reservation, not an extra persistent attachment. Explicitly
handle role transfer and crop reset using the manager's existing confirmation
conventions; never silently reuse incompatible crop geometry. No immediate asset
deletion is introduced.

### Components and state

- `@rpg/ui`: add a controlled, RHF-free MediaFieldSummary primitive, using the
  existing MediaImage/MediaCompactPreview primitives where appropriate. It owns
  accessible chrome, square layout, empty/error/loading visuals, and compact versus
  expanded rendering. Consume display items and callbacks, not API knowledge.
  Place token classes in a co-located variants module.
- Dashboard media feature: add the managed MediaField adapter. It resolves policy,
  metadata and authorized rendition URLs, coordinates modal/open selection state,
  retains uploaded metadata, and shares upload orchestration for opt-in inline use.
- Form integration: bind the value reactively inside the Form surface/slot. Use the
  existing Form binding APIs or a narrowly scoped form adapter; do not put RHF in
  the visual primitive. Forward dirty/touched/validation and field accessibility
  information through the established form contract.
- Extend MediaManager with `initialSelectedImageId?: ContentImage['id']`. Apply it
  only when initializing a newly opened session. Validate it against attachments;
  use normal representative/first fallback if stale. Initialize the selected
  presentation consistently with that image. Parent re-renders must not reset an
  open editing session.
- Keep `onSave`'s existing `{ media, expectedMediaRevision, assets }` contract. Retain
  returned asset metadata or seed the authorized query cache for immediate previews
  and reopening. Preserve detail-mode revision handling.

## Existing integration issues to address

1. ContentMediaIdentitySlot reads `form.getValues('media')`, which does not subscribe
   to external changes. Use a watched/controller value so reset, removal, modal
   saves, and external form updates immediately refresh the summary.
2. The character manager writes directly to `draft.identity.media`. IdentityDraftSync
   watches other fields and substitutes draft media when comparing values, while
   Continue serializes form values. A media-only change can therefore leave form
   media stale. Bind media to the form, watch it in the sync bridge, and use the
   established form-to-draft path. Regression-test media-only edits and Continue.
3. Both hosts currently discard assets returned by manager save. Preserve these
   as described above rather than waiting for a new metadata fetch.
4. Existing hosts use fallback upload scopes such as `draft` and `current-user`.
   Verify actual authorized create flows during integration. Where scope is not
   ready, disable upload with an explanation; do not invent usable scope IDs.
5. Audit form schemas, draft schemas, toFormValues/toInput, create/edit submits,
   and overlay replacement semantics. A visible field alone does not establish
   media persistence. Preserve undefined versus explicit empty-media semantics.

## Edge cases and accessibility

- Missing metadata: reserve the square space, show loading, and keep the true
  attachment count. Failed rendition: show `Preview unavailable`; do not describe
  a nonempty gallery as empty or silently remove an attachment.
- Duplicate sources: use attachment IDs as selection/React keys. Two attachments
  referring to one asset must not share editor selection accidentally.
- Removing the final image returns to the chosen empty state. Parent form reset
  restores the correct summary and clears transient upload/error state.
- Disabled, read-only, and missing-permission states preserve previews. Disabled
  controls cannot open or upload; read-only summaries omit editing actions. Pass
  the reason through normal field hint/error conventions where needed.
- Invalid/oversized/unsupported uploads stay actionable. Upload failures do not
  inflate attachment counts. Do not accept video/audio through image-only rules.
- A reduced limit must never silently truncate an existing gallery. Show the
  over-limit count and enable removal; block invalid saves/additions.
- Modal Apply updates the parent draft; parent save persists it. Modal Cancel
  leaves the summary unchanged. Avoid identical ambiguous Save labels: prefer
  `Apply changes` in form mode and retain `Save changes` in detail mode.
- Label the compact control with its field name, count, and action. Label expanded
  tiles using alt text or `Edit image N`; label overflow as `Manage N more images`.
  Decorative image content inside an already-labelled button should not repeat
  the same accessible name.
- Support keyboard activation, visible focus, associated hints/errors, and focus
  restoration to the originating thumbnail/action. If that tile was removed,
  restore focus to Manage or the empty action. Include touch-target and narrow
  viewport checks; do not rely on hover affordances.
- Keep role badges/editing in the manager. Do not imply that a first-image summary
  fallback assigned a representative role.

## Implementation sequence and acceptance

1. **Integration inventory and policy.** Enumerate image-enabled create/edit and
   alternate forms, document scope/serialization paths, confirm capacity sources,
   and introduce shared presentation metadata and per-collection capacity overrides.
   Update contracts, validators, generated schemas, and server enforcement together.
2. **Pure summary model and primitive.** Implement copy, preview choice, four-tile
   overflow rules and both layouts. Add co-located CSF3 stories and interaction
   tests. Demonstrate empty, one, several, full, unassigned, loading, broken,
   disabled, read-only, and narrow layouts without live uploads.
3. **Manager opening and replacement.** Add initial attachment selection and stale
   ID fallback; preserve isolated sessions and no-dirty selection. Implement and
   test single-capacity replacement behavior before exposing it to a real domain.
4. **Managed adapter and opt-in upload.** Connect authorized metadata/renditions,
   retain assets, and share the existing upload lifecycle. Implement configurable
   empty dropzone, progress/retry, capacity reservations, and cancellation.
5. **Content rollout.** Replace the button in the shared header with the compact
   field before the Name/availability layout. Apply through the registry to all
   eligible domains; handle alternate shells identified in step 1. Preserve Name
   and availability's existing inline/stacked relationship.
6. **Character rollout.** Replace the Identity button with expanded media before
   Name. Fix the form/draft media synchronization in the same change. Verify PC,
   campaign NPC, Back/Continue, draft restoration, and save/reopen.
7. **Verification and documentation.** Finish the coverage below, update form/media
   docs, and run repository gates before sharing implementation.

Key behavioral tests:

- Every compact area opens one manager; each expanded tile selects the intended
  attachment. Header and overflow actions have the specified initial selection.
- Counts/plurals at 0/1/max, four versus five tiles, no-role fallback, invalid
  initial selection, broken preview, and no persisted role/crop mutation.
- Cancel leaves parent unchanged; Apply updates the watched value/preview; parent
  save round-trips media; clearing the final image persists explicit empty media.
- Character media-only edit followed immediately by Continue retains the images;
  simultaneous name/narrative edits and external reset do not get overwritten.
- Full capacity still permits Manage, single replacement survives failed upload,
  pending uploads reserve capacity, retries do not duplicate attachments, and
  permission/revision failures remain visible.
- Configuration actually switches layouts and empty acquisition behavior.
- Omitted capacity inherits the global default; per-gallery overrides of one and
  three affect copy, manager, picker, queue, and server writes consistently. Invalid
  configuration is rejected, and editing through another entry point cannot bypass
  the collection limit. Both layouts honor the same override.
- Keyboard/focus restoration and axe assertions follow the repository CI policy.

Run focused tests while developing, then required affected lint/typecheck/tests,
lint-staged and fallow health/duplication gates. Regenerate JSON schemas when Zod
inputs change. For sharing, run `pnpm gate:pre-push` (currently coverage, coverage
health, and build). Check hook/package definitions at implementation time: the
current pre-commit hook uses `test:affected:local` and does not explicitly run
`lint:affected`, despite the prose quality-gate description; do not silently omit
the documented lint gate or change hook policy as part of this UI work.

Update `packages/ui/docs/forms.md`, the dashboard media feature README, and the
existing content-media-management roadmap with final component/config contracts
and rollout status. This plan is the initial home for the proposed enhancement.

## Scope boundaries

No domain is changed to max-one/max-three by this plan. No media model migration,
new content-type enablement, image reorder UI, inline editing workspace, video/audio
support, or arbitrary aspect-ratio system is included. Preserve unrelated working
tree changes, including the existing media-manager variants edit.
