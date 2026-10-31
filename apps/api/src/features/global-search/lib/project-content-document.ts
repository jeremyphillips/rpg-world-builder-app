import type {
  ArmorClassRules,
  ApiContentTypeKey,
  CharacterClass,
  ContentMedia,
  Equipment,
  Feat,
  GlobalSearchDocument,
  GlobalSearchField,
  GlobalSearchTarget,
  Location,
  Monster,
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
  formatSpellPickerMetadataGroupLabel,
  equipmentKindToFamilyPath,
  getChallengeRatingLabel,
  getContentTypeTerm,
  formatCreatureSizeList,
  resolveLocationClassificationDisplay,
  getFeatCategoryLabel,
  getOrganizationDomainLabel,
  getOrganizationClassificationDiscoveryText,
  getEquipmentSearchName,
  joinCompactSegments,
  stripHtmlTags,
} from '@rpg/contracts'

import type { WriteEntityBase } from '../../content'
import { resolveGlobalSearchContentDisplayImage } from './resolve-global-search-display-image.lib'

type NamedContentEntity = WriteEntityBase & {
  name: string
  media?: ContentMedia | null
  rulesetId?: string
  campaignAccess?: ResolvedContentCampaignAccess
}

export type { NamedContentEntity }

const CONTENT_TYPE_LABEL = 'content' as const

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
    descriptionField(stripHtmlTags(characterClass.description ?? '')),
  ]
}

function buildClassTarget(characterClass: CharacterClass): GlobalSearchTarget {
  return { kind: 'class', id: characterClass.id }
}

function buildSpellSecondary(spell: Spell): string {
  const summary = buildSpellPickerCompactSummary(spell)
  const labels = summary.groups.map((group) => formatSpellPickerMetadataGroupLabel(group))
  return joinCompactSegments(...labels) ?? ''
}

function buildSpellFields(spell: Spell): GlobalSearchField[] {
  return [labelField(spell.name), keywordField(buildSpellPickerSearchText(spell))]
}

function buildSpellTarget(spell: Spell): GlobalSearchTarget {
  return { kind: 'spell', id: spell.id }
}

function buildSpeciesSecondary(species: Species): string {
  const walkSpeed = species.movement.walk
  return (
    joinCompactSegments(
      formatCreatureSizeList(species.sizes),
      walkSpeed ? `${walkSpeed} ft.` : undefined,
    ) ?? ''
  )
}

function buildSpeciesFields(species: Species): GlobalSearchField[] {
  return [
    labelField(species.name),
    keywordField(species.slug),
    descriptionField(stripHtmlTags(species.description ?? '')),
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
    descriptionField(stripHtmlTags(feat.description ?? '')),
  ]
}

function buildFeatTarget(feat: Feat): GlobalSearchTarget {
  return { kind: 'feat', id: feat.id }
}

function buildMonsterSecondary(monster: Monster): string {
  return (
    joinCompactSegments(
      formatCreatureSizeList(monster.sizes),
      monster.creatureType,
      getChallengeRatingLabel(monster.challengeRating),
    ) ?? getChallengeRatingLabel(monster.challengeRating)
  )
}

function buildMonsterFields(monster: Monster): GlobalSearchField[] {
  return [
    labelField(monster.name),
    keywordField(monster.slug),
    descriptionField(stripHtmlTags(monster.description ?? '')),
  ]
}

function buildMonsterTarget(monster: Monster): GlobalSearchTarget {
  return { kind: 'monster', id: monster.id }
}

function buildEquipmentSecondary(equipment: Equipment, rules: ArmorClassRules): string {
  const summary = buildEquipmentCompactSummary(equipment, { armorClassRules: rules })
  return joinCompactSegments(summary.kindLabel, ...summary.comparisonGroups) ?? summary.kindLabel
}

function buildEquipmentFields(equipment: Equipment, rules: ArmorClassRules): GlobalSearchField[] {
  return [
    labelField(equipment.name),
    keywordField(getEquipmentSearchName(equipment)),
    groupField(buildEquipmentCompactSummary(equipment, { armorClassRules: rules }).kindLabel),
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
  return getOrganizationDomainLabel(organization.organizationDomain)
}

function buildOrganizationFields(organization: Organization): GlobalSearchField[] {
  return [
    labelField(organization.name),
    keywordField(organization.slug),
    keywordField(getOrganizationClassificationDiscoveryText(organization)),
    descriptionField(stripHtmlTags(organization.description ?? '')),
  ]
}

function buildOrganizationTarget(organization: Organization): GlobalSearchTarget {
  return { kind: 'organization', id: organization.id }
}

function buildLocationSecondary(location: Location): string {
  return resolveLocationClassificationDisplay(location).text
}

function buildLocationFields(location: Location): GlobalSearchField[] {
  return [
    labelField(location.name),
    keywordField(location.slug),
    descriptionField(stripHtmlTags(location.description ?? '')),
  ]
}

function buildLocationTarget(location: Location): GlobalSearchTarget {
  return { kind: 'location', id: location.id }
}

type ContentProjectOptions = {
  armorClassRules?: ArmorClassRules
}

type ContentProjector<T extends WriteEntityBase> = {
  secondary: (entity: T, options?: ContentProjectOptions) => string
  fields: (entity: T, options?: ContentProjectOptions) => GlobalSearchField[]
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
    secondary: (entity, options) => {
      if (!options?.armorClassRules) {
        throw new Error('Armor Class rules are required to project equipment')
      }
      return buildEquipmentSecondary(entity as Equipment, options.armorClassRules)
    },
    fields: (entity, options) => {
      if (!options?.armorClassRules) {
        throw new Error('Armor Class rules are required to project equipment')
      }
      return buildEquipmentFields(entity as Equipment, options.armorClassRules)
    },
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
  locations: {
    secondary: (entity) => buildLocationSecondary(entity as Location),
    fields: (entity) => buildLocationFields(entity as Location),
    target: (entity) => buildLocationTarget(entity as Location),
  },
  monsters: {
    secondary: (entity) => buildMonsterSecondary(entity as Monster),
    fields: (entity) => buildMonsterFields(entity as Monster),
    target: (entity) => buildMonsterTarget(entity as Monster),
  },
}

export function projectContentEntity(
  contentType: ApiContentTypeKey,
  entity: NamedContentEntity,
  options?: {
    resolveSpellSchoolDisplay?: (schoolId: string) => GlobalSearchDocument['displayImage']
    armorClassRules?: ArmorClassRules
  },
): GlobalSearchDocument {
  const projector = CONTENT_PROJECTORS[contentType]
  let displayImage = resolveGlobalSearchContentDisplayImage({
    contentType,
    media: entity.media,
    slug: entity.slug,
    catalogLayer: entity.catalogLayer,
    rulesetId: entity.rulesetId,
  })

  if (contentType === 'spells') {
    const school = (entity as Spell).school
    const schoolDisplay = school ? options?.resolveSpellSchoolDisplay?.(school) : undefined
    if (schoolDisplay) {
      displayImage = schoolDisplay
    }
  }

  return {
    id: buildContentDocumentId(contentType, entity.id),
    filterGroup: CONTENT_TYPE_LABEL,
    typeLabel: getContentTypeTerm(contentType).label,
    title: entity.name,
    secondary: projector.secondary(entity, options),
    target: projector.target(entity),
    fields: projector.fields(entity, options),
    ...(entity.campaignAccess?.available === false ? { campaignAvailable: false as const } : {}),
    ...(displayImage ? { displayImage } : {}),
  }
}

export { API_CONTENT_TYPE_KEYS }
