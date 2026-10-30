import { z } from 'zod'
import { addCustomRefinementIssue } from '../../../../lib/add-custom-refinement-issue'

import { grantRowIdSchema } from '../../../content/lib/grants/grant-row-id'
import { characterValidationMessages } from '../character-messages'

const GRANT_DERIVED_SELECTION_SOURCE_KINDS = [
  'speciesTrait',
  'heritageOption',
  'classFeature',
  'subclassFeature',
] as const

type GrantDerivedSelectionSourceKind = (typeof GRANT_DERIVED_SELECTION_SOURCE_KINDS)[number]

function isGrantDerivedSelectionSourceKind(kind: string): kind is GrantDerivedSelectionSourceKind {
  return (GRANT_DERIVED_SELECTION_SOURCE_KINDS as readonly string[]).includes(kind)
}

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
  /** NPC role template — `sourceId` = template id, `grantId` = choice set id or `training`. */
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
 * - `npcTemplate` — `sourceId` = template id, `grantId` = choice set id or `training`
 */
export const characterSelectionSourceSchema = z
  .object({
    kind: characterSelectionSourceKindSchema,
    sourceId: z.string().min(1).optional(),
    /** Owning trait, feature, or heritage option id. Not the grant row id. */
    grantId: z.string().min(1).optional(),
    /** Stable id of the individual grant row. Required for grant-derived sources. */
    grantRowId: grantRowIdSchema.optional(),
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

/**
 * Refinement of {@link characterSelectionSourceSchema} for sources produced from
 * a content grant row. Unrelated kinds stay on the base schema without `grantRowId`.
 */
export const grantDerivedSelectionSourceSchema = characterSelectionSourceSchema.superRefine(
  (val, ctx) => {
    if (!isGrantDerivedSelectionSourceKind(val.kind)) {
      addCustomRefinementIssue(ctx, characterValidationMessages.grantDerivedSourceKind(), ['kind'])
    }
    if (val.grantId === undefined) {
      addCustomRefinementIssue(ctx, characterValidationMessages.grantDerivedGrantIdRequired(), [
        'grantId',
      ])
    }
    if (val.grantRowId === undefined) {
      addCustomRefinementIssue(ctx, characterValidationMessages.grantDerivedGrantRowIdRequired(), [
        'grantRowId',
      ])
    }
  },
)

export type GrantDerivedSelectionSource = z.infer<typeof grantDerivedSelectionSourceSchema>

export const characterSelectionSourcesSchema = z.array(characterSelectionSourceSchema).optional()
