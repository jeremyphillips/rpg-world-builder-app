import { z } from 'zod'

import { effectEndSchema } from '../../../primitives/mechanics/effect-end'
import { damageTypeIdSchema } from '../../../vocab/damage'
import { weaponDamageDraftSchema } from '../../equipment/weapon-variant'
import { resolutionTargetRequirementsSchema } from '../../lib/resolution/target-requirements'

export type MonsterActionMode = 'published' | 'draft'

export const PARRY_AC_BONUS_MIN = 1
export const PARRY_AC_BONUS_MAX = 10
export const PARRY_AC_BONUS_DEFAULT = 2

export const parryAcBonusSchema = z
  .number()
  .int()
  .min(PARRY_AC_BONUS_MIN, 'AC bonus must be at least 1.')
  .max(PARRY_AC_BONUS_MAX, 'AC bonus cannot exceed 10.')

export const NATURAL_WEAPON_PROPERTIES = ['finesse'] as const

export const naturalWeaponPropertySchema = z.enum(NATURAL_WEAPON_PROPERTIES)

export const attackModes = ['melee', 'ranged'] as const

const draftEffectDescriptionSchema = z.string().optional()

const attackOnHitDraftEffectSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('damage'),
    roll: weaponDamageDraftSchema.optional(),
    damageType: damageTypeIdSchema.optional(),
    description: draftEffectDescriptionSchema,
  }),
  z.object({
    kind: z.literal('condition'),
    conditionId: z.string().optional(),
    end: effectEndSchema.optional(),
    description: draftEffectDescriptionSchema,
    replacesConditionId: z.string().optional(),
  }),
  z.object({
    kind: z.literal('note'),
    description: draftEffectDescriptionSchema,
  }),
])

export const attackOnHitDraftSchema = z.object({
  effects: z.array(attackOnHitDraftEffectSchema).optional(),
})

export {
  multiattackDraftStepSchema,
  multiattackPublishedStepSchema,
  multiattackAttackGroupDraftSchema,
  multiattackAttackGroupPublishedSchema,
  multiattackReplacementDraftSchema,
  multiattackReplacementSchema,
  multiattackAlternativeDraftSchema,
  multiattackAlternativePublishedSchema,
  isMultiattackAttackGroup,
  isMultiattackUseClause,
  type MultiattackAttackGroup,
  type MultiattackUseSingle,
  type MultiattackUseChoice,
  type MultiattackPublishedStep,
  type MultiattackDraftStep,
  type MultiattackReplacement,
  type MultiattackAlternative,
} from './multiattack-schemas'

export const positiveWholeFeetSchema = z.number().int().min(1)

export const bonusTeleportPassengerSchema = z.object({
  withinFeet: positiveWholeFeetSchema.optional(),
  requirements: resolutionTargetRequirementsSchema.optional(),
})

export type BonusTeleportPassenger = z.infer<typeof bonusTeleportPassengerSchema>
