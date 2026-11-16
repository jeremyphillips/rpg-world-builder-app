import { z } from 'zod'

export const resolutionEffectIdSchema = z.string().min(1).brand<'ResolutionEffectId'>()

export type ResolutionEffectId = z.infer<typeof resolutionEffectIdSchema>
