import { z } from 'zod'

import { abilitySchema } from '../../vocab/ability'
import { toolCategorySchema } from '../../vocab/equipment/tool-category'

// ---------------------------------------------------------------------------
// Tool utilize actions — structured DC checks from the SRD tool tables.
// ---------------------------------------------------------------------------

export const toolUtilizeActionSchema = z.object({
  description: z.string().min(1),
  dc: z.number().int().min(1).max(30),
})

export type ToolUtilizeAction = z.infer<typeof toolUtilizeActionSchema>

/** Formats a single utilize action for display (e.g. "Identify a substance (DC 15)"). */
export function formatToolUtilizeAction({ description, dc }: ToolUtilizeAction): string {
  return `${description} (DC ${dc})`
}

/** Joins utilize actions for display (e.g. "Pick a lock (DC 15), or Disarm a trap (DC 15)"). */
export function formatToolUtilizes(actions: readonly ToolUtilizeAction[]): string {
  return actions.map(formatToolUtilizeAction).join(', or ')
}

// ---------------------------------------------------------------------------
// Tool equipment variant
// ---------------------------------------------------------------------------

/** Kind-specific fields for `kind: 'tool'`. Spread onto {@link EquipmentBaseFields}. */
export const toolEquipmentKindFields = {
  kind: z.literal('tool'),
  toolCategory: toolCategorySchema,
  /** The ability a check with this tool typically uses. */
  ability: abilitySchema,
  utilizes: z.array(toolUtilizeActionSchema).min(1),
  crafts: z.array(z.string().min(1)).optional(),
} as const

export const toolEquipmentKindSchema = z.object(toolEquipmentKindFields)

export type ToolEquipmentKindFields = z.infer<typeof toolEquipmentKindSchema>
