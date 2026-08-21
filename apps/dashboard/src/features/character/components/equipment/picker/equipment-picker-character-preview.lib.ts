import {
  abilityModifier,
  assembleStartingEquipment,
  canPurchaseEquipment,
  formatSignedModifier,
  formatWeaponDamageWithModifier,
  isArmorEquipment,
  proficiencyBonus,
  resolveArmorClassIfEquipped,
  resolveEquippedArmorFromInventory,
  resolveWeaponAttackAbilityModifier,
  subtractFromWealth,
  formatWealthAsGold,
  weaponAttackBonus,
  type Ability,
  type ArmorClassBase,
  type ArmorEquipment,
  type CharacterBuildCatalogIndex,
  type CharacterBuilderDraft,
  type Equipment,
  type ResolvedCharacterCreationRules,
  type SystemRulesetId,
} from '@rpg/contracts'

import type { EquipmentBudgetSummary } from './equipment-picker-drawer.types'

export const EQUIPMENT_PICKER_CHARACTER_PREVIEW_SECTION_LABEL = 'Character preview'

export const EQUIPMENT_PICKER_PREVIEW_ATTACK_LABEL = 'Attack'
export const EQUIPMENT_PICKER_PREVIEW_DAMAGE_LABEL = 'Damage'
export const EQUIPMENT_PICKER_PREVIEW_AC_IF_EQUIPPED_LABEL = 'AC if equipped'
export const EQUIPMENT_PICKER_PREVIEW_REMAINING_AFTER_PURCHASE_LABEL = 'Remaining after purchase'

export type EquipmentPickerCharacterPreviewContext = {
  level: number
  armorClassBase: ArmorClassBase
  abilityScores?: Partial<Record<Ability, number>>
  equippedArmor?: readonly ArmorEquipment[]
  budget?: EquipmentBudgetSummary
}

export function resolveEquipmentPickerCharacterPreviewContext(args: {
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  characterCreationRules: ResolvedCharacterCreationRules
  rulesetId: SystemRulesetId
  budget?: EquipmentBudgetSummary
}): EquipmentPickerCharacterPreviewContext | undefined {
  const { draft, catalogIndex, characterCreationRules, rulesetId, budget } = args
  if (!draft.class.classId) return undefined

  const { equipment } = assembleStartingEquipment(draft, catalogIndex, {
    startingWealth: characterCreationRules.startingWealth,
    rulesetId,
  })
  const equippedArmor = resolveEquippedArmorFromInventory({
    equipment,
    catalog: catalogIndex.equipment,
  })

  return {
    level: draft.class.level,
    armorClassBase: characterCreationRules.armorClass.base,
    abilityScores: draft.abilities.scores,
    equippedArmor,
    budget,
  }
}

function resolveWeaponPreviewLines(
  equipment: Extract<Equipment, { kind: 'weapon' }>,
  context: EquipmentPickerCharacterPreviewContext,
  isProficient: boolean,
): string[] {
  if (!equipment.damage) return []

  const abilityMod = resolveWeaponAttackAbilityModifier(equipment, context.abilityScores ?? {})
  if (abilityMod === undefined) return []

  const profBonus = proficiencyBonus(context.level)
  const attack = weaponAttackBonus(abilityMod, isProficient, profBonus)

  return [
    `${EQUIPMENT_PICKER_PREVIEW_ATTACK_LABEL}: ${formatSignedModifier(attack)}`,
    `${EQUIPMENT_PICKER_PREVIEW_DAMAGE_LABEL}: ${formatWeaponDamageWithModifier(
      equipment.damage,
      abilityMod,
    )}`,
  ]
}

function resolveArmorPreviewLine(
  equipment: ArmorEquipment,
  context: EquipmentPickerCharacterPreviewContext,
): string | undefined {
  const dexScore = context.abilityScores?.dex
  const needsDexScore =
    equipment.category !== 'heavy' && equipment.category !== 'shields' && equipment.addDexModifier

  if (needsDexScore && typeof dexScore !== 'number') return undefined

  const dexModifier = typeof dexScore === 'number' ? abilityModifier(dexScore) : 0
  const ac = resolveArmorClassIfEquipped({
    acBase: context.armorClassBase,
    dexModifier,
    currentEquippedArmor: context.equippedArmor ?? [],
    candidateArmor: equipment,
  })

  return `${EQUIPMENT_PICKER_PREVIEW_AC_IF_EQUIPPED_LABEL}: ${ac}`
}

function resolveBudgetPreviewLine(
  context: EquipmentPickerCharacterPreviewContext,
  equipment: Equipment,
) {
  if (!context.budget || !canPurchaseEquipment(equipment)) return undefined

  const remaining = subtractFromWealth(context.budget.remaining, equipment.cost)
  return `${EQUIPMENT_PICKER_PREVIEW_REMAINING_AFTER_PURCHASE_LABEL}: ${formatWealthAsGold(remaining)}`
}

export function resolveEquipmentPickerCharacterPreviewLines(
  equipment: Equipment,
  context: EquipmentPickerCharacterPreviewContext,
  options: { isProficient: boolean },
): string[] {
  const lines: string[] = []

  if (equipment.kind === 'weapon') {
    lines.push(...resolveWeaponPreviewLines(equipment, context, options.isProficient))
  }

  if (equipment.kind === 'armor' && isArmorEquipment(equipment)) {
    const armorLine = resolveArmorPreviewLine(equipment, context)
    if (armorLine) lines.push(armorLine)
  }

  const budgetLine = resolveBudgetPreviewLine(context, equipment)
  if (budgetLine) lines.push(budgetLine)

  return lines
}

export function formatEquipmentPickerItemDetails(
  equipment: Equipment,
  options?: {
    showCharacterPreview?: boolean
    characterPreviewContext?: EquipmentPickerCharacterPreviewContext
    isProficient?: boolean
  },
  baseDetails?: string,
): string {
  const catalogDetails = baseDetails ?? ''
  if (!options?.showCharacterPreview || !options.characterPreviewContext) {
    return catalogDetails
  }

  const previewLines = resolveEquipmentPickerCharacterPreviewLines(
    equipment,
    options.characterPreviewContext,
    { isProficient: options.isProficient ?? true },
  )

  if (previewLines.length === 0) return catalogDetails

  return [catalogDetails, '', ...previewLines].filter(Boolean).join('\n')
}
