import type { ContentGrant } from '../../../content/lib/grants'
import type { CharacterClass } from '../../../content/classes/class'
import { resolveEquipmentContentId } from '../../../content/starting-equipment'
import { isArmorEquipment } from '../../../content/equipment'
import type {
  CharacterArmorProficiencyEntry,
  CharacterSkillProficiencyEntry,
  CharacterToolProficiencyEntry,
  CharacterWeaponProficiencyEntry,
} from '../../character/proficiencies'
import type { CharacterBuildCatalogIndex } from '../context'
import type { CharacterBuilderDraft } from '../draft/draft'
import { collectSourcedGrants } from './collect-sourced-grants'

// ---------------------------------------------------------------------------
// Fixed grant proficiency assembly — converts unlocked content grants into
// proficiency rows with provenance (species traits, heritage, class features).
// ---------------------------------------------------------------------------

function rulesetIdFromContentId(contentId: string): string {
  const colonIndex = contentId.indexOf(':')
  return colonIndex >= 0 ? contentId.slice(0, colonIndex) : contentId
}

function fixedSkillEntriesFromGrant(
  grant: Extract<ContentGrant, { kind: 'skillProficiency' }>,
  sources: CharacterSkillProficiencyEntry['sources'],
): CharacterSkillProficiencyEntry[] {
  if (grant.grant.kind !== 'fixed') return []

  return grant.grant.skillIds.map((skill) => ({
    skill,
    rank: 'proficient' as const,
    sources,
  }))
}

function fixedWeaponEntriesFromGrant(
  grant: Extract<ContentGrant, { kind: 'weaponProficiency' }>,
  sources: CharacterWeaponProficiencyEntry['sources'],
): CharacterWeaponProficiencyEntry[] {
  if (grant.grant.kind !== 'fixed') return []

  const fromCategories = (grant.grant.weaponCategories ?? []).map((weaponCategory) => ({
    weaponCategory,
    rank: 'proficient' as const,
    sources,
  }))

  const fromItems = (grant.grant.weaponSlugs ?? []).map((weaponId) => ({
    weaponId,
    rank: 'proficient' as const,
    sources,
  }))

  return [...fromCategories, ...fromItems]
}

function fixedToolEntriesFromGrant(
  grant: Extract<ContentGrant, { kind: 'toolProficiency' }>,
  sources: CharacterToolProficiencyEntry['sources'],
): CharacterToolProficiencyEntry[] {
  if (grant.grant.kind !== 'fixed') return []

  const fromCategories = (grant.grant.toolCategories ?? []).map((toolCategory) => ({
    toolCategory,
    rank: 'proficient' as const,
    sources,
  }))

  const fromItems = (grant.grant.toolSlugs ?? []).map((toolId) => ({
    toolId,
    rank: 'proficient' as const,
    sources,
  }))

  return [...fromCategories, ...fromItems]
}

function fixedArmorEntriesFromGrant(
  grant: Extract<ContentGrant, { kind: 'armorTraining' }>,
  sources: CharacterArmorProficiencyEntry['sources'],
  catalogIndex: CharacterBuildCatalogIndex,
  rulesetId: string,
): CharacterArmorProficiencyEntry[] {
  if (grant.grant.kind !== 'fixed') return []

  const fromCategories = (grant.grant.armorCategories ?? []).map((armorCategory) => ({
    armorCategory,
    sources,
  }))

  const fromItems = (grant.grant.armorSlugs ?? []).flatMap((slug) => {
    const equipmentId = resolveEquipmentContentId(rulesetId, slug)
    const equipment = catalogIndex.equipment.get(equipmentId)
    if (!equipment || !isArmorEquipment(equipment)) return []

    return [{ armorCategory: equipment.category, sources }]
  })

  return [...fromCategories, ...fromItems]
}

export function assembleGrantSkillProficiencyEntries(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
  characterClass?: CharacterClass,
): CharacterSkillProficiencyEntry[] {
  return collectSourcedGrants(draft, catalogIndex, characterClass).flatMap(({ grant, sources }) => {
    if (grant.kind !== 'skillProficiency') return []
    return fixedSkillEntriesFromGrant(grant, sources)
  })
}

export function assembleGrantToolProficiencyEntries(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
  characterClass?: CharacterClass,
): CharacterToolProficiencyEntry[] {
  return collectSourcedGrants(draft, catalogIndex, characterClass).flatMap(({ grant, sources }) => {
    if (grant.kind !== 'toolProficiency') return []
    return fixedToolEntriesFromGrant(grant, sources)
  })
}

export function assembleGrantWeaponProficiencyEntries(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
  characterClass?: CharacterClass,
): CharacterWeaponProficiencyEntry[] {
  return collectSourcedGrants(draft, catalogIndex, characterClass).flatMap(({ grant, sources }) => {
    if (grant.kind !== 'weaponProficiency') return []
    return fixedWeaponEntriesFromGrant(grant, sources)
  })
}

export function assembleGrantArmorProficiencyEntries(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
  characterClass?: CharacterClass,
): CharacterArmorProficiencyEntry[] {
  const rulesetId =
    characterClass?.rulesetId ?? rulesetIdFromContentId(draft.species.speciesId ?? '')

  return collectSourcedGrants(draft, catalogIndex, characterClass).flatMap(({ grant, sources }) => {
    if (grant.kind !== 'armorTraining') return []
    return fixedArmorEntriesFromGrant(grant, sources, catalogIndex, rulesetId)
  })
}
