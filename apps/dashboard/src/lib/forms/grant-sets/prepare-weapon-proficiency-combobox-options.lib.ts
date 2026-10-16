import {
  MATCHES_EQUIPPED_WEAPON_LABEL,
  MATCHES_OWNED_WEAPON_LABEL,
  isWeaponEquipment,
  resolveWeaponCrossRecommendation,
  weaponReferenceMatchesEquipment,
  type CreatureWeaponProficiencyTarget,
  type Equipment,
  type WeaponInventoryEntry,
} from '@rpg/contracts'
import type { FieldOption } from '@rpg/ui/form'

const MATCH_LABELS = new Set<string>([MATCHES_EQUIPPED_WEAPON_LABEL, MATCHES_OWNED_WEAPON_LABEL])

function withoutMatchDescription(option: FieldOption): FieldOption {
  if (option.description === undefined || !MATCH_LABELS.has(option.description)) return option
  const { description: _description, ...rest } = option
  return rest
}

function matchRank(option: FieldOption): number {
  if (option.description === MATCHES_EQUIPPED_WEAPON_LABEL) return 0
  if (option.description === MATCHES_OWNED_WEAPON_LABEL) return 1
  return 2
}

/** Specific-weapon options only. Equipped matches, then owned matches, then the original order. */
export function prepareWeaponProficiencyComboboxOptions(args: {
  options: readonly FieldOption[]
  equipmentCatalog: readonly Equipment[]
  targets: readonly CreatureWeaponProficiencyTarget[]
  inventory: readonly WeaponInventoryEntry[]
  selectedIds: ReadonlySet<string>
}): FieldOption[] {
  const decorated = args.options.map((option) => {
    if (args.selectedIds.has(option.value) || option.disabled)
      return withoutMatchDescription(option)

    const weapon = args.equipmentCatalog.find(
      (row) => isWeaponEquipment(row) && weaponReferenceMatchesEquipment(option.value, row),
    )
    if (!weapon || !isWeaponEquipment(weapon)) return withoutMatchDescription(option)

    const signal = resolveWeaponCrossRecommendation({
      equipment: weapon,
      targets: args.targets,
      inventory: args.inventory,
    })
    if (signal?.kind !== 'missing_proficiency') return withoutMatchDescription(option)

    return {
      ...option,
      description:
        signal.possession === 'equipped'
          ? MATCHES_EQUIPPED_WEAPON_LABEL
          : MATCHES_OWNED_WEAPON_LABEL,
    }
  })

  return decorated
    .map((option, index) => ({ option, index }))
    .sort(
      (left, right) => matchRank(left.option) - matchRank(right.option) || left.index - right.index,
    )
    .map((entry) => entry.option)
}
