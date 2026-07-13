import { z } from 'zod'

import { gearKindSchema } from '../../vocab/equipment/gear-kind'
import { holySymbolUsageSchema } from '../../vocab/equipment/holy-symbol-usage'
import {
  isSpellcastingFocusGearKind,
  spellcastingGearKindSchema,
  type SpellcastingGearKind,
} from '../../vocab/equipment/spellcasting-gear-kind'
import { slugSchema } from '../lib/envelope'
import type { Equipment } from '../equipment'
import type { EquipmentBaseFields } from './base'
import { equipmentVariantValidationMessages } from './equipment-variant-messages'

/** Kind-specific fields for `kind: adventuring_gear`. Spread onto {@link EquipmentBaseFields}. */
export const adventuringGearEquipmentKindFields = {
  kind: z.literal('adventuring_gear'),
  gearKind: gearKindSchema,
  /** Sub-kind when `gearKind` is `spellcasting` (focus, holy symbol, spellbook, …). */
  spellcastingGearKind: spellcastingGearKindSchema.optional(),
  /** How many units the listed cost/weight buys (e.g. 20 arrows). */
  bundleSize: z.number().int().min(1).optional(),
  /** The container a bundle ships in (e.g. "Quiver", "Case"). */
  storage: z.string().optional(),
  /** Open-ended mechanical notes (e.g. "burst DC 13", "1-hour duration"). */
  properties: z.array(z.string()).optional(),
  /** Storage capacity, free text (e.g. "1 cubic foot / 30 lb of gear"). */
  capacity: z.string().optional(),
  /** Valid ways to carry a holy symbol (required when `spellcastingGearKind` is `holy_symbol`). */
  holySymbolUsage: z.array(holySymbolUsageSchema).min(1).optional(),
  /** Weapon slug when this gear item also functions as a weapon (e.g. focus staff as quarterstaff). */
  alsoWeaponSlug: slugSchema.optional(),
} as const

export type AdventuringGearEquipmentKindFields = z.infer<
  z.ZodObject<typeof adventuringGearEquipmentKindFields>
>

type AdventuringGearEquipmentRecord = EquipmentBaseFields & AdventuringGearEquipmentKindFields

/** Resolves spellcasting sub-kind for adventuring gear catalog rows. */
export function getEquipmentSpellcastingGearKind(
  equipment: Equipment,
): SpellcastingGearKind | undefined {
  if (equipment.kind !== 'adventuring_gear') return undefined
  if (equipment.gearKind !== 'spellcasting') return undefined
  return equipment.spellcastingGearKind
}

function refineSpellcastingGearKindFields(
  val: AdventuringGearEquipmentRecord,
  ctx: z.RefinementCtx,
): void {
  if (val.gearKind === 'spellcasting') {
    if (val.spellcastingGearKind === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['spellcastingGearKind'],
        message: equipmentVariantValidationMessages.spellcastingGearKindRequired(),
      })
    }
    return
  }

  if (val.spellcastingGearKind !== undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['spellcastingGearKind'],
      message: equipmentVariantValidationMessages.spellcastingGearKindForbidden(),
    })
  }
}

function refineHolySymbolUsageFields(
  val: AdventuringGearEquipmentRecord,
  ctx: z.RefinementCtx,
): void {
  if (val.spellcastingGearKind === 'holy_symbol') {
    if (val.holySymbolUsage === undefined || val.holySymbolUsage.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['holySymbolUsage'],
        message: equipmentVariantValidationMessages.holySymbolUsageRequired(),
      })
    }
    return
  }

  if (val.holySymbolUsage !== undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['holySymbolUsage'],
      message: equipmentVariantValidationMessages.holySymbolUsageForbidden(),
    })
  }
}

function allowsAlsoWeaponSlug(spellcastingGearKind: SpellcastingGearKind | undefined): boolean {
  return (
    spellcastingGearKind !== undefined &&
    isSpellcastingFocusGearKind(spellcastingGearKind) &&
    spellcastingGearKind !== 'holy_symbol'
  )
}

function refineAlsoWeaponSlugField(
  val: AdventuringGearEquipmentRecord,
  ctx: z.RefinementCtx,
): void {
  if (val.alsoWeaponSlug === undefined || allowsAlsoWeaponSlug(val.spellcastingGearKind)) return

  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    path: ['alsoWeaponSlug'],
    message: equipmentVariantValidationMessages.alsoWeaponSlugForbidden(),
  })
}

/** Cross-field invariants for adventuring gear equipment records. */
export function refineAdventuringGearEquipment(
  val: AdventuringGearEquipmentRecord,
  ctx: z.RefinementCtx,
): void {
  refineSpellcastingGearKindFields(val, ctx)
  refineHolySymbolUsageFields(val, ctx)
  refineAlsoWeaponSlugField(val, ctx)
}
