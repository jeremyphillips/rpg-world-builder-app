import { z } from 'zod'

import { equipmentFamilyPathSchema } from '../../vocab/equipment/family-path'

// ---------------------------------------------------------------------------
// Structured navigation targets — dashboard resolves href; API never emits paths.
// ---------------------------------------------------------------------------

export const globalSearchClassTargetSchema = z.object({
  kind: z.literal('class'),
  id: z.string().min(1),
})

export const globalSearchSpellTargetSchema = z.object({
  kind: z.literal('spell'),
  id: z.string().min(1),
})

export const globalSearchSpeciesTargetSchema = z.object({
  kind: z.literal('species'),
  id: z.string().min(1),
})

export const globalSearchFeatTargetSchema = z.object({
  kind: z.literal('feat'),
  id: z.string().min(1),
})

export const globalSearchEquipmentTargetSchema = z.object({
  kind: z.literal('equipment'),
  family: equipmentFamilyPathSchema,
  id: z.string().min(1),
})

export const globalSearchSkillProficiencyTargetSchema = z.object({
  kind: z.literal('skill-proficiency'),
  id: z.string().min(1),
})

export const globalSearchOrganizationTargetSchema = z.object({
  kind: z.literal('organization'),
  id: z.string().min(1),
})

export const globalSearchLocationTargetSchema = z.object({
  kind: z.literal('location'),
  id: z.string().min(1),
})

export const globalSearchCharacterTargetSchema = z.object({
  kind: z.literal('character'),
  id: z.string().min(1),
  characterType: z.enum(['pc', 'npc']),
})

export const globalSearchGameTermTargetSchema = z.object({
  kind: z.literal('game-term'),
  setId: z.string().min(1),
  termId: z.string().min(1),
})

export const globalSearchTargetSchema = z.discriminatedUnion('kind', [
  globalSearchClassTargetSchema,
  globalSearchSpellTargetSchema,
  globalSearchSpeciesTargetSchema,
  globalSearchFeatTargetSchema,
  globalSearchEquipmentTargetSchema,
  globalSearchSkillProficiencyTargetSchema,
  globalSearchOrganizationTargetSchema,
  globalSearchLocationTargetSchema,
  globalSearchCharacterTargetSchema,
  globalSearchGameTermTargetSchema,
])

export type GlobalSearchTarget = z.infer<typeof globalSearchTargetSchema>
