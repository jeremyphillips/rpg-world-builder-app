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

| Role       | Assigned when                 | Description                                                                   |
| ---------- | ----------------------------- | ----------------------------------------------------------------------------- |
| `owner`    | Campaign created              | The DM. Full control: campaign settings, content, membership, deletion.       |
| `co-owner` | Invited by owner              | Co-DM. Same as owner except cannot transfer ownership or delete the campaign. |
| `pc`       | Invited + character submitted | Player. Can read party-visible content and manage their submitted characters. |
| `observer` | Invited as spectator          | Read-only. Can see public-scoped content only. Cannot submit characters.      |

**Rules:**

- A user can hold different campaign roles in different campaigns simultaneously.
  (DM in Campaign A, PC in Campaign B — this is the entire reason campaign roles
  are NOT on the `User` document.)
- The `owner` membership is created automatically when the campaign is created
  and cannot be self-removed. Ownership can only be transferred.
- Only the `owner` can invite users or change membership roles.
- The `co-owner` can invite but cannot promote anyone to `co-owner` or `owner`.

---

## Character Ownership

Characters are owned by users at the platform level, independent of campaigns.

- Every user owns all characters they create.
- A user can own multiple characters.
- A character can be submitted to at most one campaign at a time
  (`Character.campaignId` is either `null` or a single campaign ID).
- Only characters owned by the `userId` on a `CampaignMembership` may be added
  to that membership's `characterIds`.
- When a user leaves a campaign, their characters are removed from the campaign;
  character ownership remains with the user.

---

## Campaign Membership Invariants

Enforced in the service layer (not at the schema level):

1. `(campaignId, userId)` is unique — a user has at most one membership per campaign.
2. Membership `owner` role cannot be removed; only transferred.
3. `characterIds` on a membership may only reference characters owned by that
   membership's `userId`.
4. A `Character.campaignId` may only point to a campaign where the character
   owner has an active membership.

---

## Content Visibility (Phase 1)

Every content item within a campaign carries a `visibility` field.

| Value     | Visible to                                    |
| --------- | --------------------------------------------- |
| `dm-only` | `owner` and `co-owner` only                   |
| `party`   | `owner`, `co-owner`, and all `pc` members     |
| `public`  | Everyone in the campaign including `observer` |

Content defaults to `dm-only` unless the DM explicitly changes it.

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
