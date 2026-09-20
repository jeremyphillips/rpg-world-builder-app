import { z } from 'zod'

import { absoluteLevelSchema } from '../../../primitives/level'
import { progressionExtensionSchema } from '../../../vocab/spell/progression-extension'

// ---------------------------------------------------------------------------
// Class gain progression — sparse level/count rows for spell acquisition
// (e.g. wizard spellbook gains). Missing row = 0; no fill-forward.
// ---------------------------------------------------------------------------

const classGainCurveRowSchema = z.object({
  level: absoluteLevelSchema,
  count: z.number().int().min(0),
})

export const classGainProgressionSchema = z.object({
  curve: z.object({
    rows: z.array(classGainCurveRowSchema).default([]),
  }),
  extension: progressionExtensionSchema.default('zero'),
})

export type ClassGainProgression = z.infer<typeof classGainProgressionSchema>
