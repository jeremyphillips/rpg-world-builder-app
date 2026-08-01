import type { CharacterEligibilitySubject } from './character-eligibility-subject'
import type { CharacterCampaignWarningCategory } from '../../campaign/character/eligibility-contracts'
import type { CharacterCampaignContentReferenceType } from '../../campaign/character/eligibility-contracts'

export type ContentReference =
  | {
      kind: 'blocking'
      code: 'species_unavailable' | 'class_unavailable' | 'subclass_unavailable'
      contentType: CharacterCampaignContentReferenceType
      contentId: string
      speciesId?: string
    }
  | {
      kind: 'warning'
      category: CharacterCampaignWarningCategory
      contentType: CharacterCampaignContentReferenceType
      contentId: string
      speciesId?: string
    }

function pushWarningReference(
  references: ContentReference[],
  category: CharacterCampaignWarningCategory,
  contentType: CharacterCampaignContentReferenceType,
  contentId: string,
): void {
  references.push({ kind: 'warning', category, contentType, contentId })
}

function collectSpeciesReferences(subject: CharacterEligibilitySubject): ContentReference[] {
  const references: ContentReference[] = [
    {
      kind: 'blocking',
      code: 'species_unavailable',
      contentType: 'species',
      contentId: subject.species.id,
    },
  ]

  if (subject.species.heritageId) {
    references.push({
      kind: 'blocking',
      code: 'species_unavailable',
      contentType: 'heritage',
      contentId: subject.species.heritageId,
      speciesId: subject.species.id,
    })
  }

  return references
}

function collectClassReferences(subject: CharacterEligibilitySubject): ContentReference[] {
  const references: ContentReference[] = []

  for (const classEntry of subject.classes) {
    references.push({
      kind: 'blocking',
      code: 'class_unavailable',
      contentType: 'class',
      contentId: classEntry.classId,
    })

    if (classEntry.subclassId) {
      references.push({
        kind: 'blocking',
        code: 'subclass_unavailable',
        contentType: 'subclass',
        contentId: classEntry.subclassId,
      })
    }
  }

  return references
}

function collectEquipmentReferences(subject: CharacterEligibilitySubject): ContentReference[] {
  const equipmentIds = [
    ...subject.equipment.weapons.map((entry) => entry.equipmentId),
    ...subject.equipment.armor.map((entry) => entry.equipmentId),
    ...subject.equipment.gear.map((entry) => entry.equipmentId),
    ...(subject.equipment.magicItems ?? []).map((entry) => entry.equipmentId),
  ]

  return equipmentIds.map((contentId) => ({
    kind: 'warning' as const,
    category: 'equipment' as const,
    contentType: 'equipment' as const,
    contentId,
  }))
}

function collectProficiencyReferences(subject: CharacterEligibilitySubject): ContentReference[] {
  const references: ContentReference[] = []

  for (const skill of subject.proficiencies.skills) {
    pushWarningReference(references, 'proficiencies', 'proficiencies', skill.skill)
  }

  for (const tool of subject.proficiencies.tools) {
    if (tool.toolId) {
      pushWarningReference(references, 'proficiencies', 'tools', tool.toolId)
    }
  }

  for (const language of subject.proficiencies.languages) {
    pushWarningReference(references, 'proficiencies', 'languages', language.language)
  }

  return references
}

export function collectCharacterContentReferences(
  subject: CharacterEligibilitySubject,
): ContentReference[] {
  return [
    ...collectSpeciesReferences(subject),
    ...collectClassReferences(subject),
    ...collectEquipmentReferences(subject),
    ...subject.spells.map((spell) => ({
      kind: 'warning' as const,
      category: 'spells' as const,
      contentType: 'spells' as const,
      contentId: spell.spellId,
    })),
    ...subject.feats.map((feat) => ({
      kind: 'warning' as const,
      category: 'feats' as const,
      contentType: 'feats' as const,
      contentId: feat.featId,
    })),
    ...collectProficiencyReferences(subject),
  ]
}
