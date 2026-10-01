import { isArmorEquipment, type Equipment } from '../../../content/equipment'
import type { CharacterClass } from '../../../content/classes/class'
import type { StartingEquipmentOption } from '../../../content/starting-equipment'
import {
  isProficiencyLinkedStartingEquipmentGrant,
  isStartingGoldOption,
  startingEquipmentGrantEquipmentSlug,
  startingEquipmentGrantProficiencyChoiceId,
} from '../../../content/starting-equipment'
import { toEquipmentContentId } from '../../creature/equipment'
import type { CharacterBuildCatalogIndex } from '../context'
import { resolveEquipmentPoolChoiceOptions } from '../resolvers/equipment/equipment-pool-choice-options'
import { resolveClassToolProficiencyChoice } from '../resolvers/equipment/resolve-proficiency-linked-equipment-grant'
import type { NpcEquipmentPreferenceKind } from './equipment-preference-stream'

export type ReachableStartingEquipmentItem = {
  id: string
  kind: NpcEquipmentPreferenceKind
}

function addReachableItem(
  items: ReachableStartingEquipmentItem[],
  seen: Set<string>,
  equipment: Equipment | undefined,
  equipmentId: string,
): void {
  if (!equipment || seen.has(equipmentId)) return
  if (equipment.kind === 'weapon') {
    seen.add(equipmentId)
    items.push({ id: equipmentId, kind: 'weapon' })
    return
  }
  if (isArmorEquipment(equipment)) {
    seen.add(equipmentId)
    items.push({ id: equipmentId, kind: 'armor' })
  }
}

/**
 * Shallow reachable weapon and armor ids from one starting-equipment package:
 * direct grants, one-level nested equipment pools, and proficiency-linked pools.
 */
export function collectReachableStartingEquipmentFromPackage(args: {
  option: StartingEquipmentOption
  characterClass: CharacterClass
  catalogIndex: CharacterBuildCatalogIndex
}): ReachableStartingEquipmentItem[] {
  const { option, characterClass, catalogIndex } = args
  const items: ReachableStartingEquipmentItem[] = []
  const seen = new Set<string>()
  const rulesetId = characterClass.rulesetId

  for (const item of option.items) {
    if (item.kind === 'grant') {
      if (isProficiencyLinkedStartingEquipmentGrant(item)) {
        const choiceId = startingEquipmentGrantProficiencyChoiceId(item)!
        const resolved = resolveClassToolProficiencyChoice(characterClass, choiceId, catalogIndex)
        if (!resolved) continue
        for (const poolOption of resolved.options) {
          addReachableItem(items, seen, catalogIndex.equipment.get(poolOption.id), poolOption.id)
        }
        continue
      }

      const slug = startingEquipmentGrantEquipmentSlug(item)
      if (!slug) continue
      const equipmentId = toEquipmentContentId(rulesetId, slug)
      addReachableItem(items, seen, catalogIndex.equipment.get(equipmentId), equipmentId)
      continue
    }

    if (item.kind !== 'choice') continue
    const poolOptions = resolveEquipmentPoolChoiceOptions(item.pool, catalogIndex, rulesetId)
    for (const poolOption of poolOptions) {
      addReachableItem(items, seen, catalogIndex.equipment.get(poolOption.id), poolOption.id)
    }
  }

  return items
}

export function startingEquipmentPackageProvidesReachableSlug(args: {
  option: StartingEquipmentOption
  slug: string
  kind: NpcEquipmentPreferenceKind
  characterClass: CharacterClass
  catalogIndex: CharacterBuildCatalogIndex
}): boolean {
  if (isStartingGoldOption(args.option)) return false
  return collectReachableStartingEquipmentFromPackage({
    option: args.option,
    characterClass: args.characterClass,
    catalogIndex: args.catalogIndex,
  }).some(
    (item) =>
      item.kind === args.kind && (item.id.endsWith(`:${args.slug}`) || item.id === args.slug),
  )
}
