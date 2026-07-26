# Campaign access enforcement

Architecture decision record for viewer identity and content read policies (Track A).

## Core product rule

Campaign access controls what can be **newly discovered or selected**. It must **not**
break display of content already referenced by a saved character.

Overview catalog listings apply campaign discovery visibility. Existing saved-character
references and direct authorized record reads follow their separate read policy.

## A1 — Canonical viewer identity

### Decision

`participantIds` on campaign access stores **PC character document IDs** drawn from
**open** `CampaignCharacterParticipation` records in the campaign — not membership
`controlledCharacterIds` alone.

Viewer PC ids for content policy are the intersection of membership control and open
participation: `controlledCharacterIds ∩ open participations`. The API resolves
this in `requireCampaignRole` as `req.campaignMembership.pcCharacterIds`.

| Identity candidate           | Outcome                                                                             |
| ---------------------------- | ----------------------------------------------------------------------------------- |
| `CampaignMembership.id`      | Rejected — mixes PC and observer; no stable app-level id today                      |
| `userId`                     | Rejected — not what `participantIds` semantically names                             |
| `characterId` / PC id        | **Chosen** — one id per participating PC; aligns with per-character builder context |
| New `CampaignParticipant.id` | Deferred — no participant entity beyond participation records                       |

### `ContentViewer` mapping

Contracts export `ContentViewer` (`packages/contracts/src/rpg/content/lib/content-viewer-access.ts`):

```ts
type ContentViewer =
  | { kind: 'manage' } // owner / co-owner
  | { kind: 'pc'; characterIds: string[] } // pc role — pre-resolved viewer PC ids
  | { kind: 'none' } // observer or pc with no viewer PC ids
```

API list handlers build a viewer from `req.campaignMembership` via
`buildContentViewerFromCampaignContext`:

- `owner` / `co-owner` → `{ kind: 'manage' }`
- `pc` with non-empty `pcCharacterIds` → `{ kind: 'pc', characterIds: pcCharacterIds }`
- `observer` or `pc` with empty `pcCharacterIds` → `{ kind: 'none' }`

`pcCharacterIds` is `controlledCharacterIds` filtered to characters with an open
participation in the route's campaign. Control without participation does not grant
viewer access.

`specific_players` grants match when **any** viewer `characterId` is listed in
`participantIds`. Stale-id resolution uses campaign-wide open participation ids via
`GET /api/campaigns/:campaignId/content/access-participants` and
`resolveContentCampaignAccess(..., { validParticipantIds })`.

## A3 — Participant roster and authoring

Managers load the pickable roster from:

`GET /api/campaigns/:campaignId/content/access-participants` (owner/co-owner)

Each entry is a campaign-participating PC (`id`, `name`, `playerDisplayName`) sourced
from open participations. The dashboard multi-select writes `participantIds` through
`PATCH …/campaign-access`. The patch schema requires at least one participant for
`specific_players` and normalizes `participantIds` to `[]` for other visibility modes.

Stale grants — ids persisted on content but no longer in open campaign participation —
surface in `unavailableParticipantIds` on resolved reads. The edit form merges
valid and stale ids so managers can clear stale selections on save.

## A2 — Discovery vs saved-reference policies

Two separate predicates — do not collapse into one list filter.

### `isContentDiscoverableForViewer`

| Read context                      | Policy                            | Expected outcome                                                                        |
| --------------------------------- | --------------------------------- | --------------------------------------------------------------------------------------- |
| Catalog discovery / overview list | `isContentDiscoverableForViewer`  | Hide `unavailable`, `dm_only`, non-granted `specific_players`                           |
| Ordinary direct catalog URL       | Same as discovery                 | Detail routes resolve from the filtered list response — no separate GET record endpoint |
| Manager authoring                 | Manager viewer (`kind: 'manage'`) | Full catalog including restricted rows and drafts                                       |

Applied at:

- API `GET /api/campaigns/:campaignId/content/:contentType` (and subclass lists)
- Dashboard overview tables (defense-in-depth — Track B B3)
- Future builder/catalog pickers

Not applied indiscriminately to:

- Saved-character reference resolution (`canResolveSavedContentReference`)
- General rules reference views
- Manager authoring surfaces

### `canResolveSavedContentReference`

| Read context                   | Policy                            | Expected outcome                                                                                      |
| ------------------------------ | --------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Saved-character reference read | `canResolveSavedContentReference` | Allow when the viewer's PC ids include `reference.characterId`, regardless of current campaign access |

Managers always resolve. Campaign access overlay state (`available`, `visibilityMode`,
`participantIds`) is intentionally **not** an input — turning content off or restricting
discovery must not strip content already on a saved sheet.

### Direct-read outcomes (locked)

| Scenario                                               | Non-manager                                           | Manager         |
| ------------------------------------------------------ | ----------------------------------------------------- | --------------- |
| List / direct URL for `unavailable`                    | Hidden (not in list → detail 404)                     | Visible         |
| List / direct URL for `dm_only`                        | Hidden                                                | Visible         |
| List / direct URL for `specific_players` (not granted) | Hidden                                                | Visible         |
| Saved reference after content became unavailable       | Resolve allowed via `canResolveSavedContentReference` | Resolve allowed |

## Related docs

- Contracts: `packages/contracts/src/rpg/content/lib/content-viewer-access.ts`
- Participation model: `packages/contracts/ROLES.md`
- Dashboard campaign access UX: `apps/dashboard/src/features/content/lib/campaign-access/README.md`
