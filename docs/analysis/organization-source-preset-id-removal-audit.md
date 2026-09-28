# Organization `sourcePresetId` removal audit (2026-03-28)

Recorded before removing persisted preset provenance. After materializing membership titles on the
create form, no runtime consumer should depend on `sourcePresetId`.

## Definitions and persistence

| Location                                                                     | Role                           |
| ---------------------------------------------------------------------------- | ------------------------------ |
| `packages/contracts/src/rpg/content/organization/organization.ts`            | Body + create input field      |
| `packages/contracts/src/rpg/content/organization/membership-titles.ts`       | Create XOR + snapshot resolver |
| `apps/api/src/features/content/organizations/homebrew-organization.model.ts` | Mongo enum                     |
| `apps/api/src/features/content/organizations/organizations.config.ts`        | Create body + read shaping     |

## Read / write / duplicate

| Consumer                                           | Behavior                          | Post-removal                       |
| -------------------------------------------------- | --------------------------------- | ---------------------------------- |
| `organizations.config.ts` `toHomebrewOrganization` | Optional read field               | Drop field                         |
| `organizations.config.ts` `bodyFromCreateInput`    | Snapshot titles from preset id    | Use client `members.titles` only   |
| `duplicate-content-policy.ts`                      | Strip on duplicate                | Remove from deny list (field gone) |
| Classification PATCH                               | Already stripped in update schema | Unchanged                          |

## Dashboard create

| Consumer                                               | Behavior                             | Post-removal                                              |
| ------------------------------------------------------ | ------------------------------------ | --------------------------------------------------------- |
| `organization-form-projection.ts`                      | `sourcePresetId` in form + serialize | Draft-only `startingPointId`; send `members.titles`       |
| Drift tests (`content-form-validation`, tab ownership) | Exempt hidden fields                 | Exempt `startingPointId`, `members.titles` path as needed |

## Downstream product (no direct `sourcePresetId` usage)

- Organization detail / display — taxonomy + affinities only
- Member picker / Quick NPC — `members.titles`, affinities
- Global search — classification discovery text
- Import — N/A for org presets

## Conclusion

Safe to remove `sourcePresetId` when create submits explicit `members.titles` materialized from the
Starting point on the client.
