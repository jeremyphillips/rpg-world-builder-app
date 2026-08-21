# Role System Reference

This document is the canonical reference for how roles, permissions, and access
control work in the RPG World Builder platform. Keep it in sync with the code in
`packages/contracts/src/roles.ts` and `packages/contracts/src/campaign.ts`.

---

## Role Scopes

Roles exist at two distinct scopes. **Never mix them.**

| Scope    | Stored on                         | Type           | Checked by                       |
| -------- | --------------------------------- | -------------- | -------------------------------- |
| Platform | `User.role`                       | `PlatformRole` | `requirePlatformRole` middleware |
| Campaign | `CampaignMembership.campaignRole` | `CampaignRole` | `requireCampaignRole` middleware |

---

## Platform Roles

Govern access to the platform itself. Assigned globally to a user account.

| Role         | Default | Description                                                       |
| ------------ | ------- | ----------------------------------------------------------------- |
| `user`       | Yes     | Every registered account. Can own characters, own/join campaigns. |
| `admin`      | No      | Platform staff. Can manage users and moderate content.            |
| `superadmin` | No      | Owner/devs. Unrestricted platform access.                         |

**Rules:**

- All newly registered accounts receive `user`.
- Platform role is embedded in the session JWT and validated against the DB on
  every authenticated request.
- Platform role has no meaning within a campaign context — never use it to
  determine what a user can do inside a campaign.

---

## Campaign Roles

Govern what a user can do within a specific campaign. Always scoped to a single
`CampaignMembership` record.

| Role       | Assigned when        | Description                                                                   |
| ---------- | -------------------- | ----------------------------------------------------------------------------- |
| `owner`    | Campaign created     | The DM. Full control: campaign settings, content, membership, deletion.       |
| `co-owner` | Invited by owner     | Co-DM. Same as owner except cannot transfer ownership or delete the campaign. |
| `pc`       | Invite accepted      | Player. Can read party-visible content and manage controlled characters.      |
| `observer` | Invited as spectator | Read-only. Can see public-scoped content only. Cannot submit characters.      |

**Rules:**

- A user can hold different campaign roles in different campaigns simultaneously.
  (DM in Campaign A, PC in Campaign B — this is the entire reason campaign roles
  are NOT on the `User` document.)
- The `owner` membership is created automatically when the campaign is created
  and cannot be self-removed. Ownership can only be transferred.
- Only the `owner` can invite users or change membership roles.
- The `co-owner` can invite but cannot promote anyone to `co-owner` or `owner`.

---

## Campaign character association

Character↔campaign links use **three separate concepts**. Do not collapse them.

| Concept           | Record                                      | Answers                                              |
| ----------------- | ------------------------------------------- | ---------------------------------------------------- |
| **Membership**    | `CampaignMembership`                        | Which users belong to the campaign and in what role? |
| **Participation** | `CampaignCharacterParticipation`            | Which characters are in the campaign roster?         |
| **Control**       | `CampaignMembership.controlledCharacterIds` | Which PCs does this member play?                     |

**Participation** is the canonical character↔campaign association. It carries
campaign-relative **roster** state (`active` / `inactive` / `retired`). A character
has at most one **open** participation at a time (`leftAt` omitted).

**Control** is membership-scoped: which PC sheet ids a player member may act as.
It does not, by itself, place a character in the campaign — control assignments
must reference PCs with an open participation in that campaign.

**Vital** state (`alive` / `deceased` / `unknown`) is intrinsic to the character
record (`Character.vital`), not participation. See
[character-vital-and-campaign-participation.md](../../apps/dashboard/docs/character-vital-and-campaign-participation.md).

---

## Character Ownership

Stored characters are discriminated by `characterType`: `pc` or `npc`. Ownership
semantics differ — do not apply PC rules to NPCs or vice versa. Dashboard
acquisition detail: [character-acquisition.md](../../apps/dashboard/docs/character-acquisition.md).

### Player characters (`characterType: 'pc'`)

User-owned at the platform level, independent of campaigns.

- Every PC has a required `userId` (the creating user).
- PCs have **no** `campaignId` field — campaign association goes through
  `CampaignCharacterParticipation`.
- A PC may have at most one open participation at a time (across all campaigns).
- Only PCs owned by the `userId` on a `CampaignMembership` may appear on that
  membership's `controlledCharacterIds`.
- Assigning control may create participation when none exists yet; see
  `assignControlledPcToCampaignMember` in the API.
- When a user leaves a campaign, their PCs are removed from control assignments;
  ownership remains with the user. Participation close/transfer workflows are
  deferred (`leftAt` is schema-only in MVP).

### Campaign NPCs (`characterType: 'npc'`)

Campaign sheet records — not tied to a user account.

- NPCs have no `userId` and never appear on `controlledCharacterIds`.
- An NPC is in a campaign only when it has an **open** `CampaignCharacterParticipation`
  for that campaign. NPC create attaches participation atomically; list, read,
  patch, and delete all resolve through open participation.
- Created by campaign `owner` or `co-owner` via `POST /api/campaigns/:campaignId/npcs`.
- Deleted when removed from the campaign (participation + character record).

---

## Campaign Membership Invariants

Enforced in the service layer (not at the schema level):

1. `(campaignId, userId)` is unique — a user has at most one membership per campaign.
2. Membership `owner` role cannot be removed; only transferred.
3. `controlledCharacterIds` on a membership may only reference **PC** characters owned by
   that membership's `userId` (not NPCs).
4. `controlledCharacterIds` ⊆ open PC participations in the same `campaignId`.
5. A PC may appear on at most one membership's `controlledCharacterIds` per campaign.

---

## Content visibility

Every content item within a campaign carries a `visibility` field using the live
vocabulary `all_players | dm_only | specific_players` (see
`packages/contracts/src/rpg/vocab/content-visibility.ts` and
`apps/api/docs/campaign-access-enforcement.md`).

| Value              | Visible to                                                                   |
| ------------------ | ---------------------------------------------------------------------------- |
| `all_players`      | All campaign members, including `observer` and PCs with no controlled PC yet |
| `dm_only`          | `owner` and `co-owner` only                                                  |
| `specific_players` | `owner`, `co-owner`, and PCs whose character id appears in `participantIds`  |

Content defaults to `all_players` with `available: true` unless the DM explicitly
changes campaign access (see `DEFAULT_CONTENT_CAMPAIGN_ACCESS` in
`packages/contracts/src/rpg/content/lib/campaign-access/campaign-access.ts`).

> **Historical note:** early Phase-1 docs used `dm-only | party | public`. That
> vocabulary was superseded by the table above — do not reintroduce it.

---

## Content Permissions — Phase 2 Design (ABAC)

> Not yet implemented. Design captured here to ensure Phase 1 schema extends
> cleanly without a breaking migration.

Phase 2 adds row-level grant overrides on top of the Phase 1 visibility flags.
A `ContentPermission` record targets a specific content item and grants or
restricts access for a specific subject.

```
ContentPermission {
  campaignId:   string
  contentId:    string
  contentType:  string                            // e.g. 'monster', 'location'
  subjectType:  'user' | 'campaign_role'
  subjectId:    string                            // userId or CampaignRole value
  permissions:  ('read' | 'write' | 'create')[]
}
```

**Examples:**

- DM grants one specific PC `write` on a particular location entry.
- DM grants all `observer`s `read` on a content item that is normally `dm-only`.
- DM grants a PC `create` permission on the `npc` content type.

Resolution order: explicit user grant → campaign_role grant → visibility flag default.

---

## Auth Library Strategy

The current stack uses a custom JWT/cookie implementation. This is intentional.

**When social login (Discord, Google) is needed:** migrate to
[Better Auth](https://www.better-auth.com/). It handles OAuth account linking,
password reset, and email verification with an Express adapter and Mongoose
adapter, with no vendor lock-in and no hosted UI dependency.

**Files the migration would touch** (campaign/character logic is unaffected):

- `apps/api/src/features/auth/`
- `apps/api/src/lib/jwt.ts`, `lib/cookies.ts`
- `apps/api/src/middleware/require-auth.ts`
- Dashboard and public app auth clients

**Why not Clerk:** The self-built user dashboard removes Clerk's main value
proposition (hosted UI). The SDK is Next.js-centric; social OAuth requires the
paid tier.

**Why not Lucia v3:** It has repositioned as an auth guide with a thin session
library. Better Auth provides more utility for the same self-hosted profile.
