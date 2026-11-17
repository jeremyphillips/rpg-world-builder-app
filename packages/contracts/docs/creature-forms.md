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
name is only a prose override. `onlyInFormIds` remains string-based; lifecycle planners
strip removed or newly ineligible identities without broadening or redirecting empty
restrictions.

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
`onlyInFormIds` authoring remains Phase 4.
