import { z } from 'zod'

import { equipmentBonusEffectSchema } from './effect'
import { magicPropertyCategorySchema } from '../../../vocab/magic-property/category'

export const MAGIC_PROPERTY_APPLIES_TO = ['weapon', 'armor', 'shield'] as const

export const magicPropertyAppliesToSchema = z.enum(MAGIC_PROPERTY_APPLIES_TO)

export type MagicPropertyAppliesTo = z.infer<typeof magicPropertyAppliesToSchema>

export const magicPropertyDefinitionSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    description: z.string().min(1),
    category: magicPropertyCategorySchema,
    appliesTo: z.array(magicPropertyAppliesToSchema).min(1),
    effects: z.array(equipmentBonusEffectSchema).default([]),
  })
  .strict()

export type MagicPropertyDefinition = z.infer<typeof magicPropertyDefinitionSchema>

export const equipmentMagicPropertyPresetEntrySchema = z
  .object({
    kind: z.literal('preset'),
    propertyId: z.string().min(1),
  })
  .strict()

export const equipmentMagicPropertyCustomEntrySchema = z
  .object({
    kind: z.literal('custom'),
    customId: z.string().min(1),
    name: z.string().min(1),
    description: z.string().min(1),
  })
  .strict()

export const equipmentMagicPropertyEntrySchema = z.discriminatedUnion('kind', [
  equipmentMagicPropertyPresetEntrySchema,
  equipmentMagicPropertyCustomEntrySchema,
])

export type EquipmentMagicPropertyEntry = z.infer<typeof equipmentMagicPropertyEntrySchema>

export type MagicPropertyDefinitionProvider = (id: string) => MagicPropertyDefinition | undefined
