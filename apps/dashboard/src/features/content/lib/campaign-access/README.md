# Campaign access (dashboard)

Campaign availability is a **separate form surface** from content body fields. It uses its own RHF instance, `contentCampaignAccessPatchSchema`, and `PATCH …/campaign-access` — not the entity PATCH payload.

## Surfaces

| Surface         | Persistence                   | Dirty source                                                                   |
| --------------- | ----------------------------- | ------------------------------------------------------------------------------ |
| Body form       | Entity create/update mutation | RHF `dirtyFields`                                                              |
| Campaign access | `PATCH …/campaign-access`     | RHF `dirtyFields` (edit) or diff vs `DEFAULT_CONTENT_CAMPAIGN_ACCESS` (create) |

## Disclosure UX

Collapsed summary comes from `resolveCampaignAccessSummary`. The group uses `disclosure: { variant: 'summary' }` on `buildCampaignAccessFields`. While dirty, the summary appends ` · Unsaved` and the panel stays open until **Done**.

The collapsed disclosure renders as a **status row**:

- **Available** — success dot, `Available` label, and configured player-access `detail` (e.g. `DM only`) on one line; no tinted wrapper.
- **Unavailable** — faint warning accent shell (`chrome: { variant: 'accent', tone: 'warning', emphasis: 'faint' }`), `Unavailable` label with warning inactive icon, preserved `detail` (configured access mode), and a neutral secondary consequence line (`CAMPAIGN_ACCESS_UNAVAILABLE_SUMMARY_SECONDARY`).

`detail` reflects the **configured** player-access mode even when availability is off — it is preserved, not erased. The secondary line explains that the setting is not currently effective.

## Participant context

`CampaignAccessFormProvider` owns reactive participant state (`isDirty`, `isPending`, `save`, `reset`). `CampaignAccessSection` registers bindings via `useCampaignAccessParticipantUpdater`. Shells and guards consume `useCampaignAccessForm()`.

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
| Save (edit)       | Authoritative `PATCH`                         | Persists or returns structured `409` blockers |

Save does **not** run a separate availability GET when PATCH already returns blockers.

On authoritative block, only `available` is restored to the persisted baseline; other dirty player-access edits are kept.

## Create

No unified Save — Publish / Save draft stay pending-only. Campaign access uses deferred persistence after entity creation. Dirty baseline is `DEFAULT_CONTENT_CAMPAIGN_ACCESS` via `isDefaultCampaignAccessPatch`. Navigation guard includes access-only draft changes.

## Testing

- Coordinator matrix: `content-save-session.test.ts`
- Section behavior: `campaign-access-section.test.tsx`
- Shell wiring: `content-save-session.integration.test.tsx`
- Participant contract: `campaign-access-form-context.test.tsx`
- Bulk preview: `campaign-access/bulk/resolve-bulk-campaign-access-preview.test.ts`

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
`buildCampaignAccessFields` renders a conditional `participantIds` combobox when
`visibilityMode === 'specific_players'`.

Subclass editor save orchestration reuses `CampaignAccessFormProvider` and
`runContentSaveSession` (access first, then body) for persisted subclasses.
