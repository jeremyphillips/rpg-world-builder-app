import type { CharacterClass, ContentGrant, Species, SystemRulesetId } from '@rpg/contracts'
import {
  getUnlockedGrantsAtLevel,
  normalizeGrantGroups,
  resolveGrantGroupsFromContent,
} from '@rpg/contracts'

import { loadSeedClasses } from '../classes'
import { loadSeedSpecies } from '../species'

export type GrantCoverageInventory = {
  legacyBagCount: number
  normalizeRoundTripFailures: string[]
  choiceShapeKeys: string[]
  heritageOptionCounts: Record<string, number>
  classSkillChoose: Record<string, number>
}

type InventoryAccumulator = {
  legacyBagCount: number
  normalizeRoundTripFailures: string[]
  choiceShapes: Set<string>
  heritageOptionCounts: Record<string, number>
  classSkillChoose: Record<string, number>
}

function createInventoryAccumulator(): InventoryAccumulator {
  return {
    legacyBagCount: 0,
    normalizeRoundTripFailures: [],
    choiceShapes: new Set(),
    heritageOptionCounts: {},
    classSkillChoose: {},
  }
}

function toGrantCoverageInventory(acc: InventoryAccumulator): GrantCoverageInventory {
  return {
    legacyBagCount: acc.legacyBagCount,
    normalizeRoundTripFailures: acc.normalizeRoundTripFailures,
    choiceShapeKeys: Array.from(acc.choiceShapes).sort(),
    heritageOptionCounts: acc.heritageOptionCounts,
    classSkillChoose: acc.classSkillChoose,
  }
}

function hasLegacyGrantsBag(record: { grants?: unknown }): boolean {
  return record.grants !== undefined && record.grants !== null
}

function recordNormalizeFailure(
  acc: InventoryAccumulator,
  path: string,
  groups: Parameters<typeof normalizeGrantGroups>[0],
  parentUnlock?: Parameters<typeof normalizeGrantGroups>[1],
): void {
  const normalized = normalizeGrantGroups(groups, parentUnlock)
  if (JSON.stringify(normalized) !== JSON.stringify(groups)) {
    acc.normalizeRoundTripFailures.push(path)
  }
}

function equipmentChoiceShapeKey(grant: ContentGrant): string | undefined {
  if (grant.kind !== 'equipment' || grant.grant.kind !== 'choice') return undefined

  const pool = grant.grant.pool
  if (pool.source === 'filtered' && pool.equipmentKind === 'tool') {
    return 'equipment:filtered:tool'
  }
  return 'equipment:choice'
}

function proficiencyChoiceShapeKey(grant: ContentGrant): string | undefined {
  const isProficiencyGrant =
    grant.kind === 'skillProficiency' ||
    grant.kind === 'toolProficiency' ||
    grant.kind === 'weaponProficiency' ||
    grant.kind === 'armorTraining'

  if (!isProficiencyGrant || grant.grant.kind !== 'choice') return undefined

  return `${grant.kind}:pool:${grant.grant.pool.source}`
}

function grantChoiceShapeKey(grant: ContentGrant): string | undefined {
  if (grant.kind === 'damageType') return 'damageType:heritage'
  if (grant.kind === 'featChoice') return `featChoice:${grant.category}`

  return equipmentChoiceShapeKey(grant) ?? proficiencyChoiceShapeKey(grant)
}

function collectGrantChoiceShapes(grants: ContentGrant[], shapes: Set<string>): void {
  for (const grant of grants) {
    const key = grantChoiceShapeKey(grant)
    if (key) shapes.add(key)
  }
}

function walkGrantGroupsAtLevel1(
  acc: InventoryAccumulator,
  path: string,
  content: Parameters<typeof resolveGrantGroupsFromContent>[0],
  parentLevel: number,
  parentUnlock: { level: number } | undefined,
): void {
  const groups = resolveGrantGroupsFromContent(content, parentUnlock)
  if (content.grantGroups?.length) {
    recordNormalizeFailure(acc, path, content.grantGroups, parentUnlock)
  }
  const grants = getUnlockedGrantsAtLevel(groups, 1, parentLevel)
  collectGrantChoiceShapes(grants, acc.choiceShapes)
}

function accumulateGrantContent(
  acc: InventoryAccumulator,
  path: string,
  content: Parameters<typeof resolveGrantGroupsFromContent>[0],
  parentLevel: number,
  parentUnlock: { level: number } | undefined,
): void {
  if ('grants' in content && content.kind === 'custom' && hasLegacyGrantsBag(content)) {
    acc.legacyBagCount += 1
  }
  walkGrantGroupsAtLevel1(acc, path, content, parentLevel, parentUnlock)
}

function accumulateSpecies(species: Species, acc: InventoryAccumulator): void {
  for (const trait of species.traits) {
    accumulateGrantContent(acc, `${species.slug}/trait/${trait.id}`, trait, 1, { level: 1 })
  }

  if (!species.heritage) return

  acc.choiceShapes.add('heritage')
  acc.heritageOptionCounts[species.slug] = species.heritage.options.length

  for (const option of species.heritage.options) {
    accumulateGrantContent(acc, `${species.slug}/heritage/${option.id}`, option, 1, { level: 1 })
  }
}

function accumulateStartingEquipmentChoices(cls: CharacterClass, acc: InventoryAccumulator): void {
  const startingEquipment = cls.characterCreation?.startingEquipment
  if (!startingEquipment) return

  acc.choiceShapes.add('starting-equipment')

  for (const option of startingEquipment.options) {
    for (const item of option.items) {
      if (item.kind !== 'choice') continue
      const pool = item.pool
      if (pool.source === 'filtered' && pool.equipmentKind === 'tool') {
        acc.choiceShapes.add('equipment:filtered:tool')
      }
    }
  }
}

function accumulateClassFeatures(cls: CharacterClass, acc: InventoryAccumulator): void {
  for (const feature of cls.features) {
    if (hasLegacyGrantsBag(feature)) {
      acc.legacyBagCount += 1
    }
    if (feature.grantGroups?.length) {
      recordNormalizeFailure(acc, `${cls.slug}/feature/${feature.id}`, feature.grantGroups, {
        level: feature.level,
      })
    }
    if (feature.level !== 1) continue

    walkGrantGroupsAtLevel1(acc, `${cls.slug}/feature/${feature.id}`, feature, feature.level, {
      level: feature.level,
    })
  }
}

function accumulateClass(cls: CharacterClass, acc: InventoryAccumulator): void {
  const skillChoice = cls.characterCreation?.proficiencies?.skills?.choices?.[0]
  if (skillChoice && skillChoice.choose > 0) {
    acc.choiceShapes.add('classSkills:choose:from')
    acc.classSkillChoose[cls.slug] = skillChoice.choose
  }

  accumulateStartingEquipmentChoices(cls, acc)
  accumulateClassFeatures(cls, acc)
}

export function buildGrantCoverageInventory(rulesetId: SystemRulesetId): GrantCoverageInventory {
  const acc = createInventoryAccumulator()

  for (const species of loadSeedSpecies(rulesetId)) {
    accumulateSpecies(species, acc)
  }
  for (const cls of loadSeedClasses(rulesetId)) {
    accumulateClass(cls, acc)
  }

  return toGrantCoverageInventory(acc)
}
