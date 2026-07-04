import { z } from 'zod'

import { spellValidationMessages } from './spell-messages'

export const spellMaterialComponentSchema = z.object({
  description: z.string().min(1),
})

export type SpellMaterialComponent = z.infer<typeof spellMaterialComponentSchema>

export const spellComponentsSchema = z
  .object({
    verbal: z.literal(true).optional(),
    somatic: z.literal(true).optional(),
    material: spellMaterialComponentSchema.optional(),
  })
  .refine((val) => val.verbal === true || val.somatic === true || val.material !== undefined, {
    message: spellValidationMessages.componentRequired(),
  })

export type SpellComponents = z.infer<typeof spellComponentsSchema>
