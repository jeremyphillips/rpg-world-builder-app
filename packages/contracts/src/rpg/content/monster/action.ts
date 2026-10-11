import { z } from 'zod'

import { addCustomRefinementIssue } from '../../../lib/add-custom-refinement-issue'
import {
  weaponDamageDraftSchema,
  weaponDamageSchema,
  weaponRangeSchema,
} from '../equipment/weapon-variant'
import { damageTypeIdSchema } from '../../vocab/damage'
import { weaponModeSchema, weaponPropertySchema } from '../../vocab/weapon'

export const NATURAL_WEAPON_PROPERTIES = ['finesse'] as const

const naturalWeaponPropertySchema = z.enum(NATURAL_WEAPON_PROPERTIES)

const actionIdentity = {
  id: z.string().min(1),
  description: z.string().optional(),
}

function monsterActionVariants<E extends z.ZodRawShape>(extension: E) {
  return [
    z.object({
      ...actionIdentity,
      ...extension,
      kind: z.literal('weapon'),
      name: z.string().min(1).optional(),
      equipmentEntryId: z.string().min(1),
    }),
    z.object({
      ...actionIdentity,
      ...extension,
      kind: z.literal('natural-weapon'),
      name: z.string().min(1),
      mode: weaponModeSchema,
      properties: z.array(naturalWeaponPropertySchema).default([]),
      reach: z.number().int().min(5).optional(),
      range: weaponRangeSchema.optional(),
      damage: weaponDamageSchema,
      damageType: damageTypeIdSchema,
    }),
    z.object({
      ...actionIdentity,
      ...extension,
      kind: z.literal('special'),
      name: z.string().min(1),
      description: z.string().min(1),
    }),
  ] as const
}

export const monsterActionSchema = z.discriminatedUnion('kind', [...monsterActionVariants({})])

export const monsterReactionSchema = z.discriminatedUnion('kind', [
  ...monsterActionVariants({ trigger: z.string().min(1).optional() }),
])

export type MonsterAction = z.infer<typeof monsterActionSchema>
export type MonsterReaction = z.infer<typeof monsterReactionSchema>

function monsterActionDraftVariants<E extends z.ZodRawShape>(extension: E) {
  return [
    z.object({
      id: z.string().min(1),
      kind: z.literal('weapon'),
      name: z.string().min(1).optional(),
      equipmentEntryId: z.string().min(1).optional(),
      description: z.string().optional(),
      ...extension,
    }),
    z.object({
      id: z.string().min(1),
      kind: z.literal('natural-weapon'),
      name: z.string().min(1).optional(),
      mode: weaponModeSchema.optional(),
      properties: z.array(weaponPropertySchema).optional(),
      reach: z.number().int().min(5).optional(),
      range: weaponRangeSchema.optional(),
      damage: weaponDamageDraftSchema.optional(),
      damageType: damageTypeIdSchema.optional(),
      description: z.string().optional(),
      ...extension,
    }),
    z.object({
      id: z.string().min(1),
      kind: z.literal('special'),
      name: z.string().min(1).optional(),
      description: z.string().min(1).optional(),
      ...extension,
    }),
  ] as const
}

export const monsterActionDraftSchema = z.discriminatedUnion('kind', [
  ...monsterActionDraftVariants({}),
])

export const monsterReactionDraftSchema = z.discriminatedUnion('kind', [
  ...monsterActionDraftVariants({ trigger: z.string().min(1).optional() }),
])

export type MonsterActionDraft = z.infer<typeof monsterActionDraftSchema>

export function refineMonsterActionShape(
  action: MonsterAction | MonsterReaction,
  ctx: z.RefinementCtx,
  path: (string | number)[],
): void {
  if (action.kind === 'natural-weapon') {
    if (!action.name) {
      addCustomRefinementIssue(ctx, 'Natural weapon actions require a name.', [...path, 'name'])
    }
    if (action.mode === 'ranged' && !action.range) {
      addCustomRefinementIssue(ctx, 'Ranged natural weapons require range.', [...path, 'range'])
    }
    if (action.mode === 'ranged' && action.reach !== undefined) {
      addCustomRefinementIssue(ctx, 'Reach is only allowed on melee natural weapons.', [
        ...path,
        'reach',
      ])
    }
  }

  if (action.kind === 'special' && !action.name) {
    addCustomRefinementIssue(ctx, 'Special actions require a name.', [...path, 'name'])
  }
}
