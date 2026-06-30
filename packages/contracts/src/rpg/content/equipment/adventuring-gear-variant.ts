import { z } from 'zod'

import { gearKindSchema } from '../../vocab/equipment/gear-kind'
import { holySymbolUsageSchema } from '../../vocab/equipment/holy-symbol-usage'
import { slugSchema } from '../lib/envelope'
import type { EquipmentBaseFields } from './base'

/** Kind-specific fields for `kind: adventuring_gear`. Spread onto {@link EquipmentBaseFields}. */
export const adventuringGearEquipmentKindFields = {
  kind: z.literal('adventuring_gear'),
  gearKind: gearKindSchema,
  /** How many units the listed cost/weight buys (e.g. 20 arrows). */
  bundleSize: z.number().int().min(1).optional(),
  /** The container a bundle ships in (e.g. "Quiver", "Case"). */
  storage: z.string().optional(),
  /** Open-ended mechanical notes (e.g. "burst DC 13", "1-hour duration"). */
  properties: z.array(z.string()).optional(),
  /** Storage capacity, free text (e.g. "1 cubic foot / 30 lb of gear"). */
  capacity: z.string().optional(),
  /** Valid ways to carry a holy symbol focus (required when `gearKind` is `holy_symbol`). */
  holySymbolUsage: z.array(holySymbolUsageSchema).min(1).optional(),
  /** Weapon slug when this gear item also functions as a weapon (e.g. focus staff as quarterstaff). */
  alsoWeaponSlug: slugSchema.optional(),
} as const

export type AdventuringGearEquipmentKindFields = z.infer<
  z.ZodObject<typeof adventuringGearEquipmentKindFields>
>

/** Cross-field invariants for adventuring gear equipment records. */
export function refineAdventuringGearEquipment(
  val: EquipmentBaseFields & AdventuringGearEquipmentKindFields,
  ctx: z.RefinementCtx,
): void {
  if (val.gearKind === 'holy_symbol') {
    if (val.holySymbolUsage === undefined || val.holySymbolUsage.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['holySymbolUsage'],
        message: '`holySymbolUsage` is required when gearKind is holy_symbol',
      })
    }
  } else if (val.holySymbolUsage !== undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['holySymbolUsage'],
      message: '`holySymbolUsage` is only allowed when gearKind is holy_symbol',
    })
  }

  if (
    val.alsoWeaponSlug !== undefined &&
    val.gearKind !== 'arcane_focus' &&
    val.gearKind !== 'druidic_focus'
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['alsoWeaponSlug'],
      message: '`alsoWeaponSlug` is only allowed on arcane or druidic focus gear',
    })
  }
}
