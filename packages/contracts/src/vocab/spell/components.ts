import { z } from 'zod'

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
    message: 'At least one spell component (verbal, somatic, or material) is required',
  })

export type SpellComponents = z.infer<typeof spellComponentsSchema>
