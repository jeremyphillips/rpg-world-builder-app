import { z } from 'zod'
import { addCustomRefinementIssue } from '../../../../lib/add-custom-refinement-issue'

import { characterValidationMessages } from '../character-messages'

// ---------------------------------------------------------------------------
// Source / provenance records
// ---------------------------------------------------------------------------

export const CHARACTER_SELECTION_SOURCE_KINDS = [
  'classFeature',
  'subclassFeature',
  'speciesTrait',
  'heritageOption',
  'feat',
  'equipment',
  'classStartingEquipment',
  'startingGold',
  'classSpellcasting',
  'backgroundStartingEquipment',
  'startingWealthTier',
  'characterCreation',
  'manual',
  /** Generic equipment grant — not purchase-shaped and not automation-coupled. */
  'grant',
  /** NPC role template — `sourceId` = template id, `grantId` = choice set id, `kit`, or `training`. */
  'npcTemplate',
] as const

export const characterSelectionSourceKindSchema = z.enum(CHARACTER_SELECTION_SOURCE_KINDS)

export type CharacterSelectionSourceKind = z.infer<typeof characterSelectionSourceKindSchema>

/**
 * Provenance for a selected or granted character entry.
 *
 * `sourceId` points at the granting content record when there is one. For
 * class/subclass features, `grantId` can hold the feature id that is unique
 * within that parent content record.
 *
 * Starting equipment and wealth tier kinds:
 * - `classStartingEquipment` — `sourceId` = class content id, `grantId` = starting option id
 * - `startingGold` — `sourceId` = class content id, `grantId` = starting gold option id
 * - `classSpellcasting` — `sourceId` = class content id, `grantId` = `cantrips` or `spells`
 * - `backgroundStartingEquipment` — reserved for future background content; same shape as class
 * - `startingWealthTier` — `sourceId` = starting wealth table id, `grantId` = tier id
 * - `characterCreation` — `sourceId` = ruleset id, `grantId` = proficiency choice/grant id
 * - `npcTemplate` — `sourceId` = template id, `grantId` = choice set id, `kit`, or `training`
 */
export const characterSelectionSourceSchema = z
  .object({
    kind: characterSelectionSourceKindSchema,
    sourceId: z.string().min(1).optional(),
    grantId: z.string().min(1).optional(),
    notes: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.kind !== 'manual' && val.kind !== 'grant' && val.sourceId === undefined) {
      addCustomRefinementIssue(ctx, characterValidationMessages.selectionSourceIdRequired(), [
        'sourceId',
      ])
    }
  })

export type CharacterSelectionSource = z.infer<typeof characterSelectionSourceSchema>

export const characterSelectionSourcesSchema = z.array(characterSelectionSourceSchema).optional()
