import type { Equipment } from '../../content/equipment'
import { isArmorEquipment } from '../../content/equipment'
import type { SkillProficiency } from '../../content/skill-proficiency'
import type {
  ArmorTrainingPool,
  SkillProficiencyPool,
  ToolProficiencyPool,
  WeaponProficiencyPool,
} from '../../content/lib/proficiency-grant'
import { getSkillName } from '../../content/skill-proficiency'
import type { ToolCategory } from '../../vocab/equipment/tool-category'
import type { CreatureEquipmentCatalog } from './equipment'
import { toEquipmentContentId } from './equipment'

// ---------------------------------------------------------------------------
// Creature proficiency primitives — expands grant pools against catalog
// vocabulary. Reusable across character, NPC, and monster runtime surfaces; no
// builder or character-sheet dependencies.
// ---------------------------------------------------------------------------

export type CreatureSkillCatalog = ReadonlyMap<string, SkillProficiency>

/** Neutral tool-proficiency target shared by character sheets and future monster stat blocks. */
export type CreatureToolProficiencyTarget = {
  toolId?: string
  toolCategory?: ToolCategory
}

function toolIdMatchesEquipment(
  toolId: string,
  equipment: Extract<Equipment, { kind: 'tool' }>,
): boolean {
  return (
    toolId === equipment.id ||
    toolId === equipment.slug ||
    toEquipmentContentId(equipment.rulesetId, toolId) === equipment.id
  )
}

/** Returns true when proficiency rows cover a catalog tool row. */
export function isToolProficient(args: {
  equipment: Extract<Equipment, { kind: 'tool' }>
  proficiencies: readonly CreatureToolProficiencyTarget[]
}): boolean {
  const { equipment, proficiencies } = args

  return proficiencies.some(
    (entry) =>
      (entry.toolCategory !== undefined && entry.toolCategory === equipment.toolCategory) ||
      (entry.toolId !== undefined && toolIdMatchesEquipment(entry.toolId, equipment)),
  )
}

function findSkillByIdOrSlug(
  skills: CreatureSkillCatalog,
  skillId: string,
): SkillProficiency | undefined {
  const byId = skills.get(skillId)
  if (byId) return byId

  for (const skill of skills.values()) {
    if (skill.slug === skillId) return skill
  }

  return undefined
}

/** Returns catalog skill rows matching a skill proficiency grant pool. */
export function listSkillsMatchingPool(args: {
  pool: SkillProficiencyPool
  skills: CreatureSkillCatalog
}): SkillProficiency[] {
  const { pool, skills } = args

  if (pool.source === 'explicit') {
    return pool.skillIds.flatMap((skillId) => {
      const skill = findSkillByIdOrSlug(skills, skillId)
      return skill ? [skill] : []
    })
  }

  return [...skills.values()]
}

/** Returns catalog weapon equipment rows matching a weapon proficiency grant pool. */
export function listWeaponsMatchingPool(args: {
  pool: WeaponProficiencyPool
  equipment: CreatureEquipmentCatalog
  rulesetId: string
}): Equipment[] {
  const { pool, equipment, rulesetId } = args

  if (pool.source === 'explicit') {
    return pool.weaponSlugs.flatMap((slug) => {
      const equipmentId = toEquipmentContentId(rulesetId, slug)
      const row = equipment.get(equipmentId)
      return row?.kind === 'weapon' ? [row] : []
    })
  }

  return [...equipment.values()].filter(
    (row) =>
      row.kind === 'weapon' && (!pool.weaponCategory || row.category === pool.weaponCategory),
  )
}

/** Returns catalog tool equipment rows matching a tool proficiency grant pool. */
export function listToolsMatchingPool(args: {
  pool: ToolProficiencyPool
  equipment: CreatureEquipmentCatalog
  rulesetId: string
}): Equipment[] {
  const { pool, equipment, rulesetId } = args

  if (pool.source === 'explicit') {
    return pool.toolSlugs.flatMap((slug) => {
      const equipmentId = toEquipmentContentId(rulesetId, slug)
      const row = equipment.get(equipmentId)
      return row?.kind === 'tool' ? [row] : []
    })
  }

  if (pool.source === 'any') {
    return [...equipment.values()].filter((row) => row.kind === 'tool')
  }

  return [...equipment.values()].filter(
    (row) => row.kind === 'tool' && (!pool.toolCategory || row.toolCategory === pool.toolCategory),
  )
}

/** Returns catalog armor equipment rows matching an armor training grant pool. */
export function listArmorMatchingPool(args: {
  pool: ArmorTrainingPool
  equipment: CreatureEquipmentCatalog
  rulesetId: string
}): Equipment[] {
  const { pool, equipment, rulesetId } = args

  if (pool.source === 'explicit') {
    return pool.armorSlugs.flatMap((slug) => {
      const equipmentId = toEquipmentContentId(rulesetId, slug)
      const row = equipment.get(equipmentId)
      return row && isArmorEquipment(row) ? [row] : []
    })
  }

  return [...equipment.values()].filter(
    (row) => isArmorEquipment(row) && (!pool.armorCategory || row.category === pool.armorCategory),
  )
}

export type CreatureProficiencyPoolOption = {
  id: string
  label: string
}

/** Maps expanded skill pool rows to selectable option ids and labels. */
export function skillPoolChoiceOptions(
  skills: readonly SkillProficiency[],
): CreatureProficiencyPoolOption[] {
  return skills
    .map((skill) => ({
      id: skill.id,
      label: skill.name ?? getSkillName(skill.slug),
    }))
    .sort((left, right) => left.label.localeCompare(right.label))
}

/** Maps expanded weapon pool rows to selectable option ids and labels. */
export function weaponPoolChoiceOptions(
  weapons: readonly Equipment[],
): CreatureProficiencyPoolOption[] {
  return weapons
    .filter((row): row is Extract<Equipment, { kind: 'weapon' }> => row.kind === 'weapon')
    .map((weapon) => ({
      id: weapon.id,
      label: weapon.name,
    }))
    .sort((left, right) => left.label.localeCompare(right.label))
}

/** Maps expanded tool pool rows to selectable option ids and labels. */
export function toolPoolChoiceOptions(
  tools: readonly Equipment[],
): CreatureProficiencyPoolOption[] {
  return tools
    .filter((row): row is Extract<Equipment, { kind: 'tool' }> => row.kind === 'tool')
    .map((tool) => ({
      id: tool.id,
      label: tool.name,
    }))
    .sort((left, right) => left.label.localeCompare(right.label))
}

/** Maps expanded armor pool rows to selectable option ids and labels. */
export function armorPoolChoiceOptions(
  armorRows: readonly Equipment[],
): CreatureProficiencyPoolOption[] {
  return armorRows
    .filter(isArmorEquipment)
    .map((armor) => ({
      id: armor.id,
      label: armor.name,
    }))
    .sort((left, right) => left.label.localeCompare(right.label))
}
