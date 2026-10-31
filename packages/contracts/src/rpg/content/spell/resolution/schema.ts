import { z } from 'zod'

import {
  effectResolutionFieldShape,
  resolutionAutomaticMethodSchema,
  resolutionSavingThrowMethodSchema,
  validateEffectResolution,
  type ResolutionEffect,
  type ResolutionEffectId,
  type ResolutionOrigin,
  type ResolutionTarget,
} from '../../lib/resolution/schema'
import type { ResolutionOutcomeResult, ResolutionSelectionMode } from '../../../vocab/resolution'
import { SPELL_RESOLUTION_ATTACK_TYPES } from './vocab'
import { spellResolutionProgressionSchema } from './progression/schema'
import { validateSpellResolutionProgression } from './progression/validation'

export const spellResolutionMethodSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('attack'),
    attackType: z.enum(SPELL_RESOLUTION_ATTACK_TYPES),
  }),
  resolutionSavingThrowMethodSchema,
  resolutionAutomaticMethodSchema,
])

export type SpellResolutionMethod = z.infer<typeof spellResolutionMethodSchema>

export const spellApplicationPatternUnitLabelSchema = z.object({
  singular: z.string().min(1),
  plural: z.string().min(1),
})

export type SpellApplicationPatternUnitLabel = z.infer<
  typeof spellApplicationPatternUnitLabelSchema
>

export const spellApplicationPatternFixedCountSchema = z.object({
  type: z.literal('fixed'),
  value: z.number().int().min(1),
})

export type SpellApplicationPatternFixedCount = z.infer<
  typeof spellApplicationPatternFixedCountSchema
>

export const spellApplicationPatternProjectilesSchema = z.object({
  kind: z.literal('projectiles'),
  count: spellApplicationPatternFixedCountSchema,
  unitLabel: spellApplicationPatternUnitLabelSchema.optional(),
  applicationMode: z.literal('per-projectile'),
})

export type SpellApplicationPatternProjectiles = z.infer<
  typeof spellApplicationPatternProjectilesSchema
>

export const spellApplicationPatternSchema = z.discriminatedUnion('kind', [
  spellApplicationPatternProjectilesSchema,
])

export type SpellApplicationPattern = z.infer<typeof spellApplicationPatternSchema>

export type SpellResolutionValidationInput = {
  selectionMode: ResolutionSelectionMode
  target?: ResolutionTarget
  origin?: ResolutionOrigin
  areaOfEffect?: EffectResolutionArea
  method: SpellResolutionMethod
  applicationPattern?: SpellApplicationPattern
  effects: readonly ResolutionEffect[]
  outcomes: readonly {
    result: ResolutionOutcomeResult
    applications: readonly { effectId: ResolutionEffectId; amount: string }[]
    note?: string
  }[]
  progression?: z.infer<typeof spellResolutionProgressionSchema>
}

type EffectResolutionArea = NonNullable<z.infer<typeof effectResolutionFieldShape.areaOfEffect>>

export function validateSpellResolutionReferences(
  resolution: SpellResolutionValidationInput,
  ctx: z.RefinementCtx,
): void {
  validateEffectResolution(resolution, ctx)
  if (resolution.progression) {
    validateSpellResolutionProgression(resolution, resolution.progression, ctx)
  }
}

export const spellResolutionSchema = z
  .object({
    ...effectResolutionFieldShape,
    method: spellResolutionMethodSchema,
    applicationPattern: spellApplicationPatternSchema.optional(),
    progression: spellResolutionProgressionSchema.optional(),
  })
  .superRefine(validateSpellResolutionReferences)

export type SpellResolution = z.infer<typeof spellResolutionSchema>
