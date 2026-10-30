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

## Spells

Monster `spell` actions reference canonical spell ids. `collectMonsterCatalogIssues`
calls `collectSpellReferenceIssues` for every `spellGroups[].spellIds` entry, then
adds `spell_casting_time_incompatible` on publish when a known spell's casting time
does not match the section.

| Intent              | Catalog unavailable                   | Unknown id      | Incompatible casting time         |
| ------------------- | ------------------------------------- | --------------- | --------------------------------- |
| Draft homebrew save | Allowed                               | `unknown_spell` | Allowed                           |
| Publish / promotion | Blocked (`spell_catalog_unavailable`) | `unknown_spell` | `spell_casting_time_incompatible` |

`spell_not_referenceable` applies on publish when the spell exists but is still a draft.
The dashboard passes `spellCatalogById` from the spells query. The API loads spells in
`monstersValidateBeforeWrite`.

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

## Movement authoring

Monster (and species) forms author movement as row arrays via
`movementWithHoverGroup()` in
[`content-movement-form-fields.ts`](../../lib/forms/fields/content-movement-form-fields.ts).
`normalizeMonsterFormValues` and `resolveMonsterFormSchema` convert rows to the API
`movement` record before save and Zod body validation. Fly hover uses the shared
`hover` switch (visible only when a fly row is present).

Hit points use `monsterHitPointsFields()` (Fixed switch, inline hit-dice sentence `N dY`,
number stepper for fixed HP) with session stash via `_hitPointsStash` and `valueSyncs` on
the monster form def — not the statistics panel slot. Die faces (`Y`) follow creature size.
