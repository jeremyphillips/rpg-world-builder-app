import type {
  ApiContentTypeKey,
  CharacterClass,
  Equipment,
  Feat,
  GlobalSearchDocument,
  GlobalSearchField,
  GlobalSearchTarget,
  Organization,
  ResolvedContentCampaignAccess,
  SkillProficiency,
  Species,
  Spell,
} from '@rpg/contracts'
import {
  API_CONTENT_TYPE_KEYS,
  buildEquipmentCompactSummary,
  buildSkillProficiencyCompactSummary,
  buildSpellPickerCompactSummary,
  buildSpellPickerSearchText,
  equipmentKindToFamilyPath,
  getContentTypeTerm,
  getCreatureSizeLabel,
  getFeatCategoryLabel,
  getOrganizationKindLabel,
  getEquipmentSearchName,
  joinCompactSegments,
} from '@rpg/contracts'

import type { WriteEntityBase } from '../../content/lib/content-write-config'

type NamedContentEntity = WriteEntityBase & {
  name: string
  campaignAccess?: ResolvedContentCampaignAccess
}

export type { NamedContentEntity }

const CONTENT_TYPE_LABEL = 'content' as const

function stripHtml(html: string | undefined): string {
  if (!html) return ''
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function labelField(text: string): GlobalSearchField {
  return { text, weight: 1, role: 'label' }
}

function keywordField(text: string, weight = 0.5): GlobalSearchField {
  return { text, weight, role: 'keyword' }
}

function descriptionField(text: string): GlobalSearchField {
  return { text, weight: 0.35, role: 'description' }
}

function groupField(text: string): GlobalSearchField {
  return { text, weight: 0.25, role: 'group' }
}

function buildContentDocumentId(contentType: ApiContentTypeKey, entityId: string): string {
  return `content:${contentType}:${entityId}`
}

function buildClassSecondary(characterClass: CharacterClass): string {
  return `d${characterClass.hitDie} Hit Die`
}

function buildClassFields(characterClass: CharacterClass): GlobalSearchField[] {
  return [
    labelField(characterClass.name),
    keywordField(characterClass.slug),
    descriptionField(stripHtml(characterClass.description)),
  ]
}

function buildClassTarget(characterClass: CharacterClass): GlobalSearchTarget {
  return { kind: 'class', id: characterClass.id }
}

function buildSpellSecondary(spell: Spell): string {
  const summary = buildSpellPickerCompactSummary(spell)
  return joinCompactSegments(summary.classification.levelLabel, ...summary.castingSummary) ?? ''
}

function buildSpellFields(spell: Spell): GlobalSearchField[] {
  return [labelField(spell.name), keywordField(buildSpellPickerSearchText(spell))]
}

function buildSpellTarget(spell: Spell): GlobalSearchTarget {
  return { kind: 'spell', id: spell.id }
}

function buildSpeciesSecondary(species: Species): string {
  const sizeLabels = species.sizes.map((size) => getCreatureSizeLabel(size))
  const walkSpeed = species.movement.walk
  return (
    joinCompactSegments(sizeLabels.join(', '), walkSpeed ? `${walkSpeed} ft.` : undefined) ?? ''
  )
}

function buildSpeciesFields(species: Species): GlobalSearchField[] {
  return [
    labelField(species.name),
    keywordField(species.slug),
    descriptionField(stripHtml(species.description)),
  ]
}

function buildSpeciesTarget(species: Species): GlobalSearchTarget {
  return { kind: 'species', id: species.id }
}

function buildFeatSecondary(feat: Feat): string {
  return getFeatCategoryLabel(feat.category)
}

function buildFeatFields(feat: Feat): GlobalSearchField[] {
  return [
    labelField(feat.name),
    keywordField(feat.slug),
    descriptionField(stripHtml(feat.description)),
  ]
}

function buildFeatTarget(feat: Feat): GlobalSearchTarget {
  return { kind: 'feat', id: feat.id }
}

function buildEquipmentSecondary(equipment: Equipment): string {
  const summary = buildEquipmentCompactSummary(equipment)
  return joinCompactSegments(summary.kindLabel, ...summary.comparisonGroups) ?? summary.kindLabel
}

function buildEquipmentFields(equipment: Equipment): GlobalSearchField[] {
  return [
    labelField(equipment.name),
    keywordField(getEquipmentSearchName(equipment)),
    groupField(buildEquipmentCompactSummary(equipment).kindLabel),
  ]
}

function buildEquipmentTarget(equipment: Equipment): GlobalSearchTarget {
  return {
    kind: 'equipment',
    family: equipmentKindToFamilyPath(equipment.kind),
    id: equipment.id,
  }
}

function buildSkillSecondary(skill: SkillProficiency): string {
  const summary = buildSkillProficiencyCompactSummary(skill)
  const examples = summary.exampleUses.slice(0, 2).join(', ')
  return joinCompactSegments(summary.abilityLabel, examples) ?? summary.abilityLabel
}

function buildSkillFields(skill: SkillProficiency): GlobalSearchField[] {
  return [
    labelField(skill.name),
    keywordField(skill.slug),
    descriptionField(skill.examples.join(' ')),
  ]
}

function buildSkillTarget(skill: SkillProficiency): GlobalSearchTarget {
  return { kind: 'skill-proficiency', id: skill.id }
}

function buildOrganizationSecondary(organization: Organization): string {
  return getOrganizationKindLabel(organization.organizationKind)
}

function buildOrganizationFields(organization: Organization): GlobalSearchField[] {
  return [
    labelField(organization.name),
    keywordField(organization.slug),
    descriptionField(stripHtml(organization.description)),
  ]
}

function buildOrganizationTarget(organization: Organization): GlobalSearchTarget {
  return { kind: 'organization', id: organization.id }
}

type ContentProjector<T extends WriteEntityBase> = {
  secondary: (entity: T) => string
  fields: (entity: T) => GlobalSearchField[]
  target: (entity: T) => GlobalSearchTarget
}

const CONTENT_PROJECTORS: {
  [K in ApiContentTypeKey]: ContentProjector<WriteEntityBase>
} = {
  classes: {
    secondary: (entity) => buildClassSecondary(entity as CharacterClass),
    fields: (entity) => buildClassFields(entity as CharacterClass),
    target: (entity) => buildClassTarget(entity as CharacterClass),
  },
  spells: {
    secondary: (entity) => buildSpellSecondary(entity as Spell),
    fields: (entity) => buildSpellFields(entity as Spell),
    target: (entity) => buildSpellTarget(entity as Spell),
  },
  species: {
    secondary: (entity) => buildSpeciesSecondary(entity as Species),
    fields: (entity) => buildSpeciesFields(entity as Species),
    target: (entity) => buildSpeciesTarget(entity as Species),
  },
  feats: {
    secondary: (entity) => buildFeatSecondary(entity as Feat),
    fields: (entity) => buildFeatFields(entity as Feat),
    target: (entity) => buildFeatTarget(entity as Feat),
  },
  equipment: {
    secondary: (entity) => buildEquipmentSecondary(entity as Equipment),
    fields: (entity) => buildEquipmentFields(entity as Equipment),
    target: (entity) => buildEquipmentTarget(entity as Equipment),
  },
  'skill-proficiencies': {
    secondary: (entity) => buildSkillSecondary(entity as SkillProficiency),
    fields: (entity) => buildSkillFields(entity as SkillProficiency),
    target: (entity) => buildSkillTarget(entity as SkillProficiency),
  },
  organizations: {
    secondary: (entity) => buildOrganizationSecondary(entity as Organization),
    fields: (entity) => buildOrganizationFields(entity as Organization),
    target: (entity) => buildOrganizationTarget(entity as Organization),
  },
}

export function projectContentEntity(
  contentType: ApiContentTypeKey,
  entity: NamedContentEntity,
): GlobalSearchDocument {
  const projector = CONTENT_PROJECTORS[contentType]
  return {
    id: buildContentDocumentId(contentType, entity.id),
    filterGroup: CONTENT_TYPE_LABEL,
    typeLabel: getContentTypeTerm(contentType).label,
    title: entity.name,
    secondary: projector.secondary(entity),
    target: projector.target(entity),
    fields: projector.fields(entity),
    ...(entity.campaignAccess?.available === false ? { campaignAvailable: false as const } : {}),
  }
}

export { API_CONTENT_TYPE_KEYS }
