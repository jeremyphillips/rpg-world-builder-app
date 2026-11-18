# Monster action and trait field order

Detail bodies are assembled in the field composers, not in the master-detail shell. Identity (name, kind, section) stays on the header.

Regions, in order. An empty region renders nothing.

1. **Source** — a concrete reference. Today this is only a weapon's equipment select.
2. **Preview** — read-only attack summary, multiattack stat-block sentence, spellcasting stat-block sentence, or trait sentence.
3. **Advisory** — `buildAdvisories` for the selected row.
4. **Primary prose** — Rules text on a custom ability and a custom trait. It can be omitted when a saving throw is present.
5. **Mechanics** — optional Saving throw on a custom ability or custom trait, then trigger, usage, configuration, primary damage, and secondary effects. Shape-Shift puts equipment and the prerequisite in this region. Spellcasting keeps its action-level limit after omitted components. Per-spell limits stay inside each spell row.
6. **Supplemental prose** — optional Additional details. The editor stays in this position when the disclosure is open.

Form availability follows the advisory when the row schema includes `onlyInFormIds`. All forms leaves that key absent. Only in selected forms stores ids in heading order. Shape-Shift omits the control. Preset traits do not carry the field.

Casting ability is mechanics. It does not belong in Source.

Save actions keep one Saving Throw group. Inside it, order is: save ability and DC, targeting, **Failed save** (one ordered effect list, then repeat save), **Successful save** (one ordered effect list), optional **Failure or success**, then **Turn limit**. Turn limit is the presence of `onceUntilNextTurn`. Global turn-limit disclosure is omitted on save actions because it lives on this tail.

Failed save is an ordered list of Damage, Condition, and Note rows. Each Damage row is the editor of its `resolution.effects` definition. Adding Damage creates that definition, a full reference on the failed save, and a success reference that defaults to no damage. Successful save shows those references: a read-only roll and type, plus a damage amount (No damage, Half damage, or Full damage). Those rows are not added or removed on their own. Removing the failed-save Damage row removes the definition and every reference to it. When another outcome uses the same id, the row says the definition is shared. Monster menus do not offer healing.

Repeat save stays hidden until the first-failure outcome lists a condition, or a repeat shell is already open. A note or damage row alone does not reveal it. Opening repeat writes the fixed end-of-next-turn timing and shows First failure and Second failure as field labels before the second tier has effects. Eligibility is an optional note on that shell. Recurring saves stay note effects.

Do not apply this order to species traits or class features. Their descriptions are the primary authored content, and grant summaries are a different region.

Form designation and the Defined forms master-detail editor live in Creature Details,
outside action and trait detail-body ordering. Shape-Shift only authors its action-local
equipment and prerequisite fields here; its destinations and return identity come from
the shared Forms configuration.
