# Campaign access (dashboard)

Campaign availability is a **separate form surface** from content body fields. It uses its own RHF instance, `contentCampaignAccessPatchSchema`, and `PATCH …/campaign-access` — not the entity PATCH payload.

## Surfaces

| Surface         | Persistence                   | Dirty source                                                                   |
| --------------- | ----------------------------- | ------------------------------------------------------------------------------ |
| Body form       | Entity create/update mutation | RHF `dirtyFields`                                                              |
| Campaign access | `PATCH …/campaign-access`     | RHF `dirtyFields` (edit) or diff vs `DEFAULT_CONTENT_CAMPAIGN_ACCESS` (create) |

## Disclosure UX

Collapsed summary comes from `resolveCampaignAccessSummary`. The group uses
`disclosure: { variant: 'inline' | 'dialog' }` via `presentation` on
`CampaignAvailabilityField` (`buildCampaignAvailabilityFields`).

| Host                          | `availabilityPresentation` | `identityLayout` |
| ----------------------------- | -------------------------- | ---------------- |
| Full create/edit routes       | `dialog`                   | `inline`         |
| Create modals, subclass panel | `disclosure`               | `stacked`        |

`identityLayout: 'inline'` is a `kind: 'row'` so Name and Campaign availability share one
field container (`width: 'full'` + `width: '1/3'`, top-aligned). Stacked overlays keep them
as sibling top-level fields.

`presentation` defaults to `disclosure` so a new overlay host cannot accidentally nest a
dialog. The page shell opts into `dialog`. While dirty, the summary appends ` · Unsaved`.
Inline **Done** is an outline button in the expanded panel footer; the dialog **Done** is the
single footer action. Both only dismiss the editor — nothing commits until the page Save.

`CampaignAvailabilityField` accepts optional `density` — typically inherited from the parent form via `ContentFormHeader` (`useFormSectionContext`) or from `useCreateFlowFormDensity()` inside create modals. Summary chrome and field labels follow the same `compact` / `comfortable` scale as sibling form fields.

The collapsed disclosure renders as a **status row**:

- **Available** — success dot, `Available` label, and configured player-access `detail` (e.g. `DM only`) on one line; no tinted wrapper.
- **Unavailable** — faint warning accent shell (`chrome: { variant: 'accent', tone: 'warning', emphasis: 'faint' }`), `Unavailable` label with warning inactive icon, and preserved `detail` (configured access mode).

Status, `· Unsaved`, and the **Change** affordance stay on that one line, at 12px in both compact and comfortable forms. Consequence copy lives in the switch hint and the row tooltip, not the summary.

`detail` reflects the **configured** player-access mode even when availability is off — it is preserved, not erased.

## Participant context

`CampaignAccessFormProvider` owns reactive participant state (`isDirty`, `isPending`, `save`, `reset`). `CampaignAvailabilityField` registers bindings via `useCampaignAccessParticipantUpdater`. Shells and guards consume `useCampaignAccessForm()`.

Availability toggle preflight uses a narrow `CampaignAccessAvailabilityProvider` inside the section — separate from participant state.

## Save session (edit)

`useContentSaveSession` combines body + campaign access dirty state into one `ContentSaveActionState` for the footer.

**Order:** campaign access first, then body.

| Access result         | Body runs?         |
| --------------------- | ------------------ |
| `blocked` / `invalid` | No                 |
| `updated` / `skipped` | Yes, if body dirty |

`skipped` means the access form was clean at save time — not an error.

Pure orchestration lives in `content-save-session.lib.ts` (`runContentSaveSession`).

## Discard invariant

Each surface resets to its own **latest persisted baseline**. A successful access save advances that baseline immediately; if body save then fails, **Discard** resets only the still-dirty body — it does not roll back access.

## Preflight

| When              | Mechanism                                     | Purpose                                       |
| ----------------- | --------------------------------------------- | --------------------------------------------- |
| Toggle off (edit) | Advisory `GET …/campaign-access-availability` | Immediate UX; revert toggle if blocked        |
| Bulk validate     | `POST …/campaign-access-availability/batch`   | One round trip for overview bulk preflight    |
| Save (edit)       | Authoritative `PATCH`                         | Persists or returns structured `409` blockers |

Save does **not** run a separate availability GET when PATCH already returns blockers.

### Batch validate (`POST …/campaign-access-availability/batch`)

Used by dashboard bulk campaign availability after Phase 2. Single-item
`GET …/:entityId/campaign-access-availability` remains for detail/toggle surfaces.

| Rule                  | Behavior                                                                                                                                        |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Auth                  | owner / co-owner                                                                                                                                |
| Request               | `{ targets: [{ entityId }] }` — unique IDs, 1–50 entries                                                                                        |
| Response              | `{ targets: [{ targetId, targetName, availability \| failure }] }` in request order                                                             |
| Subclasses            | `POST …/classes/:classId/subclasses/campaign-access-availability/batch` — every target must belong to `:classId` (`400 mixed_subclass_parents`) |
| Per-target not found  | `200` with `{ failure: { code: 'not_found', message: … } }` — safe public copy                                                                  |
| Unexpected eval error | `200` with `{ failure: { code: 'validate_error', message: … } }` — raw exception text stays server-side                                         |

Dashboard client: `fetchContentCampaignAccessAvailabilityBatch` →
`mapContentCampaignAccessAvailabilityBatchResponse`.

On authoritative block, only `available` is restored to the persisted baseline; other dirty player-access edits are kept.

## Create

No unified Save — Publish / Save draft stay pending-only. Campaign access uses deferred persistence after entity creation. Dirty baseline is `DEFAULT_CONTENT_CAMPAIGN_ACCESS` via `isDefaultCampaignAccessPatch`. Navigation guard includes access-only draft changes.

## Testing

- Coordinator matrix: `content-save-session.test.ts`
- Section behavior: `campaign-availability-field.test.tsx`
- Shell wiring: `content-save-session.integration.test.tsx`
- Participant contract: `campaign-access-form-context.test.tsx`
- Bulk preview: `campaign-access/bulk/resolve-bulk-campaign-access-preview.test.ts`

## Capability

Bulk campaign availability from content overviews requires both `canManage` and
`supportsContentBulkCampaignAccess(contentTypeKey)`. Subclasses support single-item campaign
access in the class editor but not overview-style bulk selection (`bulkCampaignAccess: false`).

Shared action lifecycle docs: [actions.md](../../../../docs/actions.md).

## Shared vs bulk builders

| Concern     | Detail (`buildCampaignAccessFields`) | Bulk (`buildBulkCampaignAccessFields`)                      |
| ----------- | ------------------------------------ | ----------------------------------------------------------- |
| Value model | Direct booleans / enums              | `BulkFieldOperation<T>` tri-state selects                   |
| Chrome      | Disclosure summary group             | Modal form rows                                             |
| Options     | `campaign-access-options.lib.ts`     | Same lib with `includeLeaveUnchanged`                       |
| Patch merge | N/A (per-entity form)                | `applyBulkCampaignAccessOperations` in `@rpg/contracts`     |
| Persistence | `PATCH …/campaign-access`            | Same endpoint, orchestrated per row (cap 50, concurrency 5) |

Do not share `FormItem[]` builders between detail and bulk — share options, labels, and contracts only.

## Participant picker

`useCampaignAccessParticipantRoster` loads `GET …/content/access-participants`.
`buildCampaignAccessFields` renders **Player access** as a `kind: 'dependent'` controller
whose gated dependent is the `participantIds` combobox — inset behind a rail (the
`DependentConfig` defaults) and shown only while availability is on and
`visibilityMode === 'specific_players'`.

Subclass editor save orchestration reuses `CampaignAccessFormProvider` and
`runContentSaveSession` (access first, then body) for persisted subclasses.
