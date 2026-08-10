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
import { startingEquipmentChoiceSetId } from '../resolvers/equipment/resolve-starting-equipment-choice-sets'
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

function startingPackageGrantsWeaponDirectly(args: {
  option: StartingEquipmentOption
  weaponId: string
  characterClass: CharacterClass
}): boolean {
  if (isStartingGoldOption(args.option)) return false

  for (const item of args.option.items) {
    if (item.kind !== 'grant') continue

    if (isProficiencyLinkedStartingEquipmentGrant(item)) continue

    const slug = startingEquipmentGrantEquipmentSlug(item)
    if (!slug) continue
    const equipmentId = toEquipmentContentId(args.characterClass.rulesetId, slug)
    if (equipmentId === args.weaponId) return true
  }

  return false
}

/** Whether a resolved draft actually includes the required starting weapon. */
export function isRequiredStartingWeaponSatisfiedInDraft(args: {
  weaponId: string
  draft: CharacterBuilderDraft
  characterClass: CharacterClass
  catalogIndex: CharacterBuildCatalogIndex
}): boolean {
  for (const selections of Object.values(args.draft.choiceSelections)) {
    if (selections?.includes(args.weaponId)) return true
  }

  const startingEquipment = args.characterClass.characterCreation?.startingEquipment
  if (!startingEquipment) return false

  const selectedPackageIds =
    args.draft.choiceSelections[startingEquipmentChoiceSetId(args.characterClass.id)] ?? []

  for (const packageId of selectedPackageIds) {
    const option = startingEquipment.options.find((entry) => entry.id === packageId)
    if (!option) continue
    if (
      startingPackageGrantsWeaponDirectly({
        option,
        weaponId: args.weaponId,
        characterClass: args.characterClass,
      })
    ) {
      return true
    }
  }

  return false
}

/**
 * Advisory: weapons the UI may offer for a Quick NPC requirement picker.
 * Enumerates weapons reachable through non-gold starting-equipment packages only.
 */
export function listReachableStartingWeapons(args: {
  seed: Pick<AutomaticNpcBuildSeed, 'classId'>
  context: CharacterBuildContext
}): ReachableStartingWeaponOption[] {
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
