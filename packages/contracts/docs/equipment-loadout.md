# Equipment loadout and inventory architecture

Decision register and verified contracts for **equipment instances**, **stacks**, **loadout editing**, and **derived combat display**. This document separates **what is implemented today** from **future assignment/loadout mechanics** that are not yet modeled.

Related: [magic-properties.md](./magic-properties.md) (stacks and editor), [runtime-resolution-boundaries.md](./runtime-resolution-boundaries.md) (creature vs character layers), [apps/dashboard/docs/equipment-inventory.md](../../apps/dashboard/docs/equipment-inventory.md) (dashboard IA).

---

## Terminology

| Term                   | Meaning                                                                                                                                   |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Catalog equipment**  | A row in the campaign equipment catalog (`Equipment`), keyed by `equipmentId`.                                                            |
| **Equipment instance** | A persisted inventory row (`EquipmentInstance`): `equipmentId`, `quantity`, optional `equipped`, optional customization fields.           |
| **Stack**              | One instance row representing one or more **identically configured** copies (`quantity`).                                                 |
| **Plain stack**        | Instance with no configuration — SSOT: `isPlainEquipmentEntry` in [`equipment-stack.ts`](../src/rpg/runtime/creature/equipment-stack.ts). |
| **Configured stack**   | Any instance where `!isPlainEquipmentEntry` (custom text, `magical`, magic properties, adjustments, modifiers).                           |
| **Loadout**            | The set of owned instance rows plus which stacks are marked equipped for authoring/display.                                               |
| **Ownership**          | Which instance rows exist and their quantities (inventory).                                                                               |
| **Activation**         | Which owned copies are treated as equipped for today’s boolean semantics — **not** full slot assignment.                                  |

**UI label `Unmodified`:** Shown on a **plain** stack when another **configured** stack shares the same catalog `equipmentId`. Not the same as API `ContentCreationMode: 'ordinary'` (non-duplicate content create — see [resolve-content-creation-defaults.ts](../../apps/api/src/features/content/lib/resolve-content-creation-defaults.ts)).

---

## Implemented mechanics (verified)

### Instance schema

[`equipmentInstanceSchemaBase`](../src/rpg/content/equipment/instance/instance.ts):

- `equipmentId` — catalog reference.
- `quantity` — int ≥ 1 (default 1).
- `equipped` — optional boolean; schema comment: _one unit of the entry is in use_ (not a count).
- Customization: `customName`, `customDescription`, `magical`, `magicProperties`, `adjustments`, `modifiers`.
- Differently customized copies are **separate entries** (distinct `entryId` when persisted on forms).

### Plain vs configured classification

**SSOT:** [`isPlainEquipmentEntry`](../src/rpg/runtime/creature/equipment-stack.ts) / [`equipment-stack.test.ts`](../src/rpg/runtime/creature/equipment-stack.test.ts).

- Plain: no custom text, not `magical`, no magic properties, adjustments, or modifiers.
- Cosmetic-only (`customName` / `customDescription`) → **configured**, not plain.

Dashboard [`equipmentEntryHasMeaningfulCustomization`](../../apps/dashboard/src/features/content/monsters/lib/equipment/equipment-entry-customization.lib.ts) is for **removal confirmation copy only** — do not use it for variant or Unmodified logic.

### Stacks, picker, and editor

| Behavior                                              | Owner                                                                                                                                                                                 |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Canonical plain stack for picker/stepper              | `findCanonicalPlainEntry` — prefers equipped plain stack ([`equipment-stack.ts`](../src/rpg/runtime/creature/equipment-stack.ts))                                                     |
| Stack quantity summaries                              | `summarizeEquipmentStacks`                                                                                                                                                            |
| Split one copy when customizing qty > 1               | `splitEquipmentEntry` + [`commitEquipmentEditorSession`](../../apps/dashboard/src/features/content/equipment/lib/instance-editor/commit-equipment-editor-session.ts) (`scope: 'one'`) |
| Loadout picker plain-stack increments                 | [`monster-equipment-loadout.lib.ts`](../../apps/dashboard/src/features/content/monsters/lib/equipment/monster-equipment-loadout.lib.ts)                                               |
| Loadout weapon-proficiency match stamping (dashboard) | [`applyLoadoutWeaponMatchSignals`](../../apps/dashboard/src/features/content/equipment/lib/loadout/equipment-loadout-picker.lib.ts) only                                              |

### Equipped state (today)

- **Stored:** optional `equipped: boolean` on each instance row.
- **Monster UI:** inline equip toggle per row; equipped badge omitted from status lane ([`resolveMonsterEquipmentRowStatus`](../../apps/dashboard/src/features/content/monsters/lib/equipment/resolve-monster-equipment-row-status.lib.ts) → shared status helper).
- **Not implemented:** equipped quantity (e.g. 2 of 3), hand/slot assignment, worn vs wielded distinction.

### Derived statistics (display)

| Output                                                    | Contracts                         | Dashboard adapter                            |
| --------------------------------------------------------- | --------------------------------- | -------------------------------------------- |
| Weapon band metadata (damage, to-hit, adjustment sources) | `resolveEquipmentRowSummary`      | `resolveCreatureEquipmentRowProjection`      |
| Instance summary (name, magical, property segments)       | `resolveEquipmentInstanceSummary` | Monster/character surfaces                   |
| Status lane (Not proficient, Magical, …)                  | —                                 | `resolveCreatureEquipmentInventoryRowStatus` |

Character detail **action rows** use the same row summary path via `resolveCharacterEquipmentRowProjection`. Character **builder** inventory rows use acquisition aggregates — not instance loadout rows ([equipment-inventory.md](../../apps/dashboard/docs/equipment-inventory.md)).

### Unmodified qualifier (implemented)

| Piece                                        | Location                                                                                                                                                                                                                 |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Inventory context (O(n), same `equipmentId`) | `buildEquipmentInventoryUnmodifiedContext` — [`equipment-inventory-unmodified-context.ts`](../src/rpg/runtime/creature/equipment-inventory-unmodified-context.ts)                                                        |
| Per-row boolean                              | `shouldShowUnmodifiedEquipmentQualifier`                                                                                                                                                                                 |
| Leading segment merge                        | `buildCreatureEquipmentRowSupportingMetadata` — [`resolve-creature-equipment-row-projection.lib.ts`](../../apps/dashboard/src/features/content/equipment/lib/inventory/resolve-creature-equipment-row-projection.lib.ts) |
| **Consumer (today)**                         | Monster equipment panel only                                                                                                                                                                                             |

Eligible entries: `quantity > 0`. Sibling match: catalog `equipmentId` only.

---

## Conceptual future boundary (not implemented)

Target mental model for later design — **do not read this as current behavior**:

```text
Inventory → Loadout/Assignments → Effective Equipment State → Derived Statistics
```

| Stage               | Today                              | Future (open)                                |
| ------------------- | ---------------------------------- | -------------------------------------------- |
| Inventory           | Instance rows + quantities         | Same, possibly merge rules                   |
| Loadout/Assignments | Boolean `equipped` per row         | Quantities, slots, hands, readied state      |
| Effective state     | Implicit (equipped flag + catalog) | Explicit activation for AC, attacks, effects |
| Derived statistics  | Row summaries, stat block actions  | Full combat integration                      |

---

## Character vs monster (deferred integrations)

| Surface                           | Row model                                 | Unmodified UI                                                                         |
| --------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------- |
| Monster equipment tab             | `EquipmentInstance[]` per entry           | **Shipped**                                                                           |
| Character sheet equipment cards   | Per-entry cards; catalog compact metadata | **Deferred** — use same context + segment merge when instance band metadata converges |
| Character builder Added Equipment | Purchases/grants/packages                 | **Out of scope** — not instance loadout                                               |

---

## Open questions (decision register)

### Established

- Plain vs configured: `isPlainEquipmentEntry`.
- Unmodified label: plain + configured sibling on same `equipmentId`.
- Single loadout weapon-match stamper: `applyLoadoutWeaponMatchSignals`.

### Open

- **Equipped quantity:** store vs derive; meaning of equipped for multi-qty stacks; toggle UX.
- **Hands/slots:** main/off, two-handed, shields, non-humanoid anatomy; instance- vs stack-based assignment.
- **Combat:** which effects require activation; armor/shield AC; monster authored actions vs derived weapon rows; block vs advisory for incompatible gear.
- **Inventory ops:** split/merge on qty change; equip state when removing copies; auto-merge equivalent stacks.

### Deferred

- Slot and hand assignment schema.
- Character builder ↔ instance loadout convergence.
- Character sheet Unmodified wiring (pending shared row metadata).

---

## Migration and consumers

When assignment mechanics land, expect touch points:

- [`equipmentInstanceSchema`](../src/rpg/content/equipment/instance/instance.ts)
- Monster form equipment + [`monster-action-equipment-references`](../../apps/dashboard/src/features/content/monsters/lib/actions/)
- Character sheet [`buildEquipmentCards`](../../apps/dashboard/src/features/character/lib/detail/character-sheet-catalog.ts)
- API monster write tests ([`monsters-write.integration.test.ts`](../../apps/api/src/features/content/monsters/monsters-write.integration.test.ts))

---

## Test anchors

- [`equipment-stack.test.ts`](../src/rpg/runtime/creature/equipment-stack.test.ts)
- [`equipment-inventory-unmodified-context.test.ts`](../src/rpg/runtime/creature/equipment-inventory-unmodified-context.test.ts)
- [`resolve-equipment-row-summary.test.ts`](../src/rpg/runtime/creature/resolve-equipment-row-summary.test.ts)
- [`monster-equipment-panel.test.tsx`](../../apps/dashboard/src/features/content/monsters/components/form/monster-equipment-panel.test.tsx)
- [`monster-equipment-loadout.lib.test.ts`](../../apps/dashboard/src/features/content/monsters/lib/equipment/monster-equipment-loadout.lib.test.ts)
