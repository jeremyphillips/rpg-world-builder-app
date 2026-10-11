# Monster form catalog validation

Monster catalog rules live in `@rpg/contracts` as `collectMonsterCatalogIssues`. The API
`monstersValidateBeforeWrite` hook and the private monster form `resolveMonsterFormSchema`
both call that collector — do not fork rules in the dashboard or API.

## Skill proficiencies

| Intent              | Catalog unavailable                   | Unknown / ineligible skill id                                                       |
| ------------------- | ------------------------------------- | ----------------------------------------------------------------------------------- |
| Draft homebrew save | Allowed; rows stay on the form        | Allowed; preserved until publish                                                    |
| Publish / promotion | Blocked (`skill_catalog_unavailable`) | Blocked (`unknown_skill`, `skill_not_referenceable`, `skill_not_campaign_eligible`) |

Draft saves intentionally stay enabled when the skill query fails. Strict saves use
`useReportContentFormWriteGate('strict', …)` from the creature-details panel so publish
is blocked early with the same loading/error copy shown inline.

## Equipment

Equipment row rules (unknown ids, body-armor conflicts, weapon actions) still run on
draft when the equipment catalog is **ready**. When the catalog query is pending or failed,
draft saves skip client-side equipment checks; the server validates once the catalog loads.

Strict saves (publish) require a ready equipment catalog on the client (`equipment` write
gate on the equipment panel) and emit `equipment_catalog_unavailable` from the collector
when publish validation cannot run.

## Write gate scopes

`ContentFormWriteGateProvider` supports `strict` (publish / published update) and `draft`
scopes. Catalog panels report **strict** reasons only so draft homebrew saves are not
blocked by transient catalog failures.

Shared helper: `resolveStrictCatalogWriteGateReason` in
`content-form-catalog-write-gate.lib.ts`.
