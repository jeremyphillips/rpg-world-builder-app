# Creature forms

Forms live on the monster body as `forms`. The shared value object is
`content/creature/forms.ts`; the monster host is `content/monster/forms.ts`.

`profileFormId` is a stable identity independent of designation. `trueForm` designates
either the creature profile or one row in `definedForms`. The profile and designated
true form use base statistics; alternate defined forms may replace `sizes`. The central
`resolveCreatureFormsContext` resolver owns identity, designation, eligibility,
destinations, and effective-statistics status. It never substitutes the profile for an
incomplete or missing defined designation.

Published configurations require a resolved true form and at least one alternate
destination. Defined names are authoritative and case-insensitively unique. A profile
name is only a prose override. `onlyInFormIds` remains string-based. An absent list is every form. A stored list,
including one that names every current form, stays a list. An empty list is an incomplete
draft and fails publish. Ids must be unique and must name an eligible form: defined forms,
plus the profile id only while the profile is the true form. Lifecycle planners strip a
removed id without dropping the key, so a row left with `[]` stays invalid instead of
becoming available in every form.

When no Shape-Shift row exists, the stat block appends a derived Forms trait from
`formatMonsterForms`. A Shape-Shift row replaces it with `formatMonsterShapeShift`.
Both consume the central context. Profile return wording stays generic unless an
explicit profile name override exists. Notes remain visible for every defined form,
including a designated true form.

Form qualifiers use the full authoritative form name, for example “Bite (Bear or
Bear-Humanoid Hybrid Form Only)”; SRD shorthand is intentionally not modeled.
Defined forms may override `movement` (atomic speeds and hover), `canSpeak: false`, and
sizes. `analyzeCreatureFormDifferences` and `resolveCreatureFormStatistics` in
`runtime/creature` drive qualified Speed and Languages rows (`stat-rows`) or Shape-Shift
parentheticals and speech sentences (`transformation-description`). `forms.differencesPresentation`
defaults to `stat-rows`; `resolveFormDifferencesPresentation` keeps differences visible when
Shape-Shift is absent. Hit points continue reading base `sizes` (`resolveMonsterHitPoints`).
`formatMonsterFormQualifier` prints those names in the stored order of `onlyInFormIds` (canonical order follows `definedForms`, then the profile id when the profile is the true form),
for example “Bite (Bear or Bear-humanoid hybrid Form Only)”. It composes with limited-use
notation as “(Recharge 5–6; Vampire Form Only)”. `collectFormAvailabilityAdvisories` checks
one level: a Multiattack step with no eligible attack in a form that can use the
Multiattack, and a legendary or reaction reference (including a Parry follow-up) whose
target is unavailable in a form where the reference is available. Stored references are
not changed. A restriction alone makes the retained-statistics sentence “Except for the
differences noted, its game statistics are the same in each form.”

## Catalog stat-block reference (deferred)

Shape-Shift and similar traits that **replace the entire stat block** with another
catalog creature (Incubus Form, Succubus Form, polymorph-style “use that creature’s
statistics”) are not `definedForms`. Those rows stay custom prose until
`stat-block-replacement` in [srd-mechanical-coverage.md](./srd-mechanical-coverage.md)
ships.

When implemented, authoring should use the same picker grammar as monster spell and
equipment pickers ([`CatalogEntityPickerSheet`](../../../apps/dashboard/src/features/content/lib/entity/surfaces/catalog/catalog-entity-picker-sheet.tsx))
via a monster-domain drawer — not a raw id combobox. The stored edge is a canonical
content id with campaign/ruleset scope and lifecycle-aware unresolved state, distinct
from partial form overrides on this document.
