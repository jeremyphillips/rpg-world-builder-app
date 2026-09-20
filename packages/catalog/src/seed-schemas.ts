import { z } from 'zod'
import {
  slotProgressionSchema,
  spellcastingProfileSchema,
  startingWealthRulesSchema,
  xpProgressionSchema,
} from '@rpg/contracts'

/** On-disk shape for starting-wealth seed JSON (one table per ruleset). */
export const startingWealthSeedFileSchema = z
  .array(startingWealthRulesSchema)
  .length(1, 'Each SRD ruleset must ship exactly one starting wealth table')

/** On-disk shape for xp-progressions seed JSON (one progression per ruleset). */
export const xpProgressionSeedFileSchema = z
  .array(xpProgressionSchema)
  .length(1, 'Each SRD ruleset must ship exactly one XP progression')

/** On-disk shape for spellcasting slot progression seed JSON. */
export const slotProgressionSeedFileSchema = z.array(slotProgressionSchema).min(1)

/** On-disk shape for spellcasting profile seed JSON. */
export const spellcastingProfileSeedFileSchema = z.array(spellcastingProfileSchema).min(1)
