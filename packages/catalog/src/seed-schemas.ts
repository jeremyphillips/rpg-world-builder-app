import { z } from 'zod'
import { startingWealthRulesSchema, xpProgressionSchema } from '@rpg/contracts'

/** On-disk shape for starting-wealth seed JSON (one table per ruleset). */
export const startingWealthSeedFileSchema = z
  .array(startingWealthRulesSchema)
  .length(1, 'Each SRD ruleset must ship exactly one starting wealth table')

/** On-disk shape for xp-progressions seed JSON (one progression per ruleset). */
export const xpProgressionSeedFileSchema = z
  .array(xpProgressionSchema)
  .length(1, 'Each SRD ruleset must ship exactly one XP progression')
