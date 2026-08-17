import type { Equipment } from '../../../content/equipment'
import type { CharacterClass } from '../../../content/classes/class'
import type { StartingEquipmentOption } from '../../../content/starting-equipment'
import {
  isProficiencyLinkedStartingEquipmentGrant,
  isStartingGoldOption,
  startingEquipmentGrantEquipmentSlug,
  startingEquipmentGrantProficiencyChoiceId,
} from '../../../content/starting-equipment'
import { toEquipmentContentId } from '../../creature/equipment'
import type { CharacterBuildCatalogIndex, CharacterBuildContext } from '../context'
import { indexCharacterBuildCatalog } from '../context'
import type { CharacterBuilderDraft } from '../draft/draft'
import {
  deriveEquipmentDraftEntries,
  inventoryContainsEquipmentId,
} from '../resolvers/equipment/derive-equipment-draft-entries'
import { resolveEquipmentPoolChoiceOptions } from '../resolvers/equipment/equipment-pool-choice-options'
import { resolveClassToolProficiencyChoice } from '../resolvers/equipment/resolve-proficiency-linked-equipment-grant'
import type { AutomaticNpcBuildSeed } from './automatic-npc-build-seed'

export type ReachableStartingWeaponOption = {
  id: string
  label: string
}

function addWeaponOption(
  weapons: ReachableStartingWeaponOption[],
  seen: Set<string>,
  equipment: Equipment | undefined,
  equipmentId: string,
): void {
  if (!equipment || equipment.kind !== 'weapon') return
  if (seen.has(equipmentId)) return
  seen.add(equipmentId)
  weapons.push({ id: equipmentId, label: equipment.name })
}

/** Collects weapon equipment ids reachable from one starting-equipment package (advisory). */
export function collectWeaponsFromStartingEquipmentOption(args: {
  option: StartingEquipmentOption
  characterClass: CharacterClass
  catalogIndex: CharacterBuildCatalogIndex
}): ReachableStartingWeaponOption[] {
  const { option, characterClass, catalogIndex } = args
  const weapons: ReachableStartingWeaponOption[] = []
  const seen = new Set<string>()
  const rulesetId = characterClass.rulesetId

  for (const item of option.items) {
    if (item.kind === 'grant') {
      if (isProficiencyLinkedStartingEquipmentGrant(item)) {
        const choiceId = startingEquipmentGrantProficiencyChoiceId(item)!
        const resolved = resolveClassToolProficiencyChoice(characterClass, choiceId, catalogIndex)
        if (!resolved) continue
        for (const poolOption of resolved.options) {
          addWeaponOption(weapons, seen, catalogIndex.equipment.get(poolOption.id), poolOption.id)
        }
        continue
      }

      const slug = startingEquipmentGrantEquipmentSlug(item)
      if (!slug) continue
      const equipmentId = toEquipmentContentId(rulesetId, slug)
      addWeaponOption(weapons, seen, catalogIndex.equipment.get(equipmentId), equipmentId)
      continue
    }

    if (item.kind !== 'choice') continue
    const poolOptions = resolveEquipmentPoolChoiceOptions(item.pool, catalogIndex, rulesetId)
    for (const poolOption of poolOptions) {
      addWeaponOption(weapons, seen, catalogIndex.equipment.get(poolOption.id), poolOption.id)
    }
  }

  return weapons
}

/** Whether a package (not gold) can produce the required weapon id. */
export function startingEquipmentOptionProvidesWeapon(args: {
  option: StartingEquipmentOption
  weaponId: string
  characterClass: CharacterClass
  catalogIndex: CharacterBuildCatalogIndex
}): boolean {
  if (isStartingGoldOption(args.option)) return false
  return collectWeaponsFromStartingEquipmentOption({
    option: args.option,
    characterClass: args.characterClass,
    catalogIndex: args.catalogIndex,
  }).some((weapon) => weapon.id === args.weaponId)
}

/** Whether a resolved draft's assembled inventory includes the required weapon. */
export function isRequiredStartingWeaponSatisfiedInDraft(args: {
  weaponId: string
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
}): boolean {
  const inventory = deriveEquipmentDraftEntries(args.draft, args.catalogIndex)
  return inventoryContainsEquipmentId(inventory, args.weaponId)
}

/**
 * Advisory: weapons reachable through non-gold starting-equipment packages.
 * Used by automatic NPC build constraint planning (package bias, satisfiability).
 * Must not determine general weapon picker membership — Quick NPC and builder
 * pickers use playable equipment via `resolvePlayableBuilderContent`
 * (dashboard: `resolveQuickNpcWeaponRequirementOptions`).
 */
export function listReachableStartingWeapons(args: {
  seed: Pick<AutomaticNpcBuildSeed, 'classId'>
  context: CharacterBuildContext
}): ReachableStartingWeaponOption[] {
  if (!args.seed.classId) return []

  const catalogIndex = indexCharacterBuildCatalog(args.context.catalog)
  const characterClass = catalogIndex.classes.get(args.seed.classId)
  const startingEquipment = characterClass?.characterCreation?.startingEquipment
  if (!characterClass || !startingEquipment) return []

  const weapons: ReachableStartingWeaponOption[] = []
  const seen = new Set<string>()

  for (const option of startingEquipment.options) {
    if (isStartingGoldOption(option)) continue
    for (const weapon of collectWeaponsFromStartingEquipmentOption({
      option,
      characterClass,
      catalogIndex,
    })) {
      if (seen.has(weapon.id)) continue
      seen.add(weapon.id)
      weapons.push(weapon)
    }
  }

  return weapons.sort((left, right) => left.label.localeCompare(right.label))
}
