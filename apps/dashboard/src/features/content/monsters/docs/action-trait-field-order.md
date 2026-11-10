# Monster action and trait field order

Detail bodies are assembled in the field composers, not in the master-detail shell. Identity (name, kind, section) stays on the header.

Regions, in order. An empty region renders nothing.

1. **Source** — a concrete reference. Today this is only a weapon's equipment select.
2. **Preview** — read-only attack summary or trait sentence.
3. **Advisory** — `buildAdvisories` for the selected row.
4. **Primary prose** — required Rules text on a special ability, and the description on a custom trait.
5. **Mechanics** — trigger, usage, configuration, primary damage, then secondary effects. Spellcasting keeps its action-level limit after omitted components. Per-spell limits stay inside each spell row.
6. **Supplemental prose** — optional Additional details. The editor stays in this position when the disclosure is open.

Casting ability is mechanics. It does not belong in Source.

Save actions keep one Saving Throw group. Ability, DC, and selection come first, then resolution damage, then the failure note and success amount.

Do not apply this order to species traits or class features. Their descriptions are the primary authored content, and grant summaries are a different region.
