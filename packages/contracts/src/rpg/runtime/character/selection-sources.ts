import { z } from 'zod'

import { characterValidationMessages } from './character-messages'

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
  'classSpellcasting',
  'backgroundStartingEquipment',
  'startingWealthTier',
  'manual',
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
 * - `classSpellcasting` — `sourceId` = class content id, `grantId` = `cantrips` or `spells`
 * - `backgroundStartingEquipment` — reserved for future background content; same shape as class
 * - `startingWealthTier` — `sourceId` = starting wealth table id, `grantId` = tier id
 */
export const characterSelectionSourceSchema = z
  .object({
    kind: characterSelectionSourceKindSchema,
    sourceId: z.string().min(1).optional(),
    grantId: z.string().min(1).optional(),
    notes: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.kind !== 'manual' && val.sourceId === undefined) {
      ctx.addIssue({
        code: 'custom',
        message: characterValidationMessages.selectionSourceIdRequired(),
        path: ['sourceId'],
      })
    }
  })

export type CharacterSelectionSource = z.infer<typeof characterSelectionSourceSchema>

export const characterSelectionSourcesSchema = z.array(characterSelectionSourceSchema).optional()
