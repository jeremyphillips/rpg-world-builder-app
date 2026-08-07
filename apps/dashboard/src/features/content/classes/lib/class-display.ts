import {
  formatToolProficiencyPoolLabel,
  getAbilityLabel,
  getArmorCategoryEntry,
  getToolCategoryEntry,
  getWeaponCategoryEntry,
  classSkillChoiceDisplaySummary,
  isMeaningfulToolProficiencyChoice,
  getProficiencyDomainCompactLabel,
  type CharacterClass,
  type ClassFeature,
  type ProficiencyChoice,
} from '@rpg/contracts'

import type { ContentStatRowData } from '../../lib/detail/content-stat-rows'

export const CLASS_STAT_LABELS = {
  hitDie: 'Hit Die',
  primaryAbilities: 'Primary Abilities',
  savingThrows: 'Saving Throws',
} as const

export const CLASS_SECTION_LABELS = {
  proficiencies: 'Proficiencies',
} as const

export const CLASS_PROFICIENCY_GROUP_LABELS = {
  granted: 'Granted Proficiencies',
  choices: 'Proficiency Choices',
} as const

export const CLASS_PROFICIENCY_ROW_LABELS = {
  armorTraining: 'Armor Training',
  weapons: 'Weapons',
  tools: 'Tools',
  skills: getProficiencyDomainCompactLabel('skill'),
  languages: 'Languages',
} as const

export const CLASS_DISPLAY_NONE = 'None' as const

export type ClassDisplaySurface = 'content-detail' | 'builder-sheet'

export type ClassDisplayVocabulary = {
  resolveToolLabel: (slug: string) => string
}

export type ClassProficiencyGrantRow = {
  id: 'armor-training' | 'weapons' | 'tools'
  label: string
  value: string
}

export type ClassProficiencyChoiceRow = {
  id: 'skills' | 'tools' | 'languages'
  label: string
  choose: number
  optionSlugs: string[]
  compactSummary: string
  choicePrefix: string
}

export type ClassProficienciesViewModel = {
  id: 'proficiencies'
  title: string
  granted: ClassProficiencyGrantRow[]
  choices: ClassProficiencyChoiceRow[]
}

export type ClassFeatureDetailItem = {
  id: string
  level: number
  title: string
  bodyHtml?: string
}

export type ClassCardViewModel = {
  label: string
  description: string
}

export type ClassDetailViewModel = {
  statRows: ContentStatRowData[]
  descriptionHtml?: string
  sections: Array<
    ClassProficienciesViewModel | { id: 'features'; title: string; items: ClassFeatureDetailItem[] }
  >
}

export type BuildClassDetailViewModelOptions = {
  surface?: ClassDisplaySurface
  features?: CharacterClass['features']
}

function formatSlugLabel(slug: string): string {
  return slug
    .split('-')
    .map((part) => (part.length > 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join(' ')
}

function formatArmorCategoryDisplay(category: string): string {
  if (category === 'shields') return 'Shields'

  const label = getArmorCategoryEntry(category)?.label
  if (label) {
    return label.replace(/ Armor$/, ' armor')
  }

  return category
}

function formatWeaponCategoryDisplay(category: string): string {
  const label = getWeaponCategoryEntry(category)?.label
  if (label) {
    return label.replace(/ Weapon$/, ' weapons')
  }

  return category
}

function formatToolCategoryDisplay(category: string): string {
  const label = getToolCategoryEntry(category)?.label
  return label ?? category
}

function joinDisplayList(values: string[]): string {
  return values.length > 0 ? values.join(', ') : CLASS_DISPLAY_NONE
}

function formatGrantedArmorValue(armor: CharacterClass['proficiencies']['armor']): string {
  return joinDisplayList(armor.categories.map(formatArmorCategoryDisplay))
}

function formatGrantedWeaponsValue(weapons: CharacterClass['proficiencies']['weapons']): string {
  const parts = [
    ...weapons.categories.map(formatWeaponCategoryDisplay),
    ...weapons.items.map(formatSlugLabel),
  ]

  return joinDisplayList(parts)
}

function formatGrantedToolsValue(
  tools: NonNullable<CharacterClass['proficiencies']['tools']>,
  vocabulary: ClassDisplayVocabulary,
): string {
  const parts = [
    ...tools.categories.map(formatToolCategoryDisplay),
    ...tools.items.map((slug) => vocabulary.resolveToolLabel(slug)),
  ]

  return joinDisplayList(parts)
}

function hasGrantedTools(tools: CharacterClass['proficiencies']['tools'] | undefined): boolean {
  if (!tools) return false
  return tools.categories.length > 0 || tools.items.length > 0
}

function buildGrantedProficiencyRows(
  characterClass: CharacterClass,
  vocabulary: ClassDisplayVocabulary,
): ClassProficiencyGrantRow[] {
  const { proficiencies } = characterClass
  const rows: ClassProficiencyGrantRow[] = [
    {
      id: 'armor-training',
      label: CLASS_PROFICIENCY_ROW_LABELS.armorTraining,
      value: formatGrantedArmorValue(proficiencies.armor),
    },
    {
      id: 'weapons',
      label: CLASS_PROFICIENCY_ROW_LABELS.weapons,
      value: formatGrantedWeaponsValue(proficiencies.weapons),
    },
  ]

  if (hasGrantedTools(proficiencies.tools)) {
    rows.push({
      id: 'tools',
      label: CLASS_PROFICIENCY_ROW_LABELS.tools,
      value: formatGrantedToolsValue(proficiencies.tools!, vocabulary),
    })
  }

  return rows
}

function buildChoicePrefix(choose: number): string {
  return `Choose ${choose} from`
}

function buildCompactSummary(choose: number, optionCount: number): string {
  if (choose === 0 || optionCount === 0) return CLASS_DISPLAY_NONE
  return `${buildChoicePrefix(choose)} ${optionCount} options`
}

function buildProficiencyChoiceRow({
  id,
  label,
  choose,
  optionSlugs,
}: {
  id: ClassProficiencyChoiceRow['id']
  label: string
  choose: number
  optionSlugs: string[]
}): ClassProficiencyChoiceRow {
  return {
    id,
    label,
    choose,
    optionSlugs,
    choicePrefix: choose > 0 && optionSlugs.length > 0 ? buildChoicePrefix(choose) : '',
    compactSummary: buildCompactSummary(choose, optionSlugs.length),
  }
}

function buildSkillsChoiceRow(characterClass: CharacterClass): ClassProficiencyChoiceRow {
  const { choose, optionSlugs } = classSkillChoiceDisplaySummary(characterClass)

  return buildProficiencyChoiceRow({
    id: 'skills',
    label: CLASS_PROFICIENCY_ROW_LABELS.skills,
    choose,
    optionSlugs,
  })
}

function buildToolsChoiceRow(characterClass: CharacterClass): ClassProficiencyChoiceRow {
  const choice = (characterClass.characterCreation?.proficiencies?.tools?.choices ?? []).find(
    isMeaningfulToolProficiencyChoice,
  )

  if (!choice) {
    return buildProficiencyChoiceRow({
      id: 'tools',
      label: CLASS_PROFICIENCY_ROW_LABELS.tools,
      choose: 0,
      optionSlugs: [],
    })
  }

  if (choice.pool) {
    const poolLabel = formatToolProficiencyPoolLabel(choice.pool)
    return {
      id: 'tools',
      label: CLASS_PROFICIENCY_ROW_LABELS.tools,
      choose: choice.choose,
      optionSlugs: [],
      choicePrefix: `Choose ${choice.choose} from`,
      compactSummary: `Choose ${choice.choose} from ${poolLabel}`,
    }
  }

  const legacyFrom = (choice as ProficiencyChoice).from ?? []
  return buildProficiencyChoiceRow({
    id: 'tools',
    label: CLASS_PROFICIENCY_ROW_LABELS.tools,
    choose: choice.choose,
    optionSlugs: legacyFrom,
  })
}

function buildLanguagesChoiceRow(): ClassProficiencyChoiceRow {
  return buildProficiencyChoiceRow({
    id: 'languages',
    label: CLASS_PROFICIENCY_ROW_LABELS.languages,
    choose: 0,
    optionSlugs: [],
  })
}

function buildProficiencyChoiceRows(
  characterClass: CharacterClass,
  surface: ClassDisplaySurface,
): ClassProficiencyChoiceRow[] {
  const skills = buildSkillsChoiceRow(characterClass)
  const tools = buildToolsChoiceRow(characterClass)
  const languages = buildLanguagesChoiceRow()

  if (surface === 'builder-sheet') {
    return [skills, tools].filter((row) => row.compactSummary !== CLASS_DISPLAY_NONE)
  }

  return [skills, tools, languages]
}

function buildClassStatRows(
  characterClass: CharacterClass,
  surface: ClassDisplaySurface,
): ContentStatRowData[] {
  const hitDieValue =
    surface === 'builder-sheet'
      ? `d${characterClass.hitDie}`
      : `d${characterClass.hitDie} per level`

  return [
    {
      label: CLASS_STAT_LABELS.hitDie,
      value: hitDieValue,
    },
    {
      label: CLASS_STAT_LABELS.primaryAbilities,
      value: characterClass.primaryAbilities.map(getAbilityLabel).join(', '),
    },
    {
      label: CLASS_STAT_LABELS.savingThrows,
      value: characterClass.proficiencies.savingThrows.map(getAbilityLabel).join(', '),
    },
  ]
}

function mapFeatureToDetailItem(feature: ClassFeature): ClassFeatureDetailItem {
  return {
    id: feature.id,
    level: feature.level,
    title: feature.name,
    bodyHtml: feature.description,
  }
}

function sortFeatures(features: readonly ClassFeature[]): ClassFeature[] {
  return [...features].sort((a, b) => a.level - b.level || a.name.localeCompare(b.name))
}

function buildFeaturesSection(
  characterClass: CharacterClass,
  features: readonly ClassFeature[],
): Extract<ClassDetailViewModel['sections'][number], { id: 'features' }> {
  return {
    id: 'features',
    title: `${characterClass.name} Class Features`,
    items: sortFeatures(features).map(mapFeatureToDetailItem),
  }
}

export function buildClassCardViewModel(characterClass: CharacterClass): ClassCardViewModel {
  const abilities = characterClass.primaryAbilities.map(getAbilityLabel).join(' or ')

  return {
    label: characterClass.name,
    description: `${abilities} · d${characterClass.hitDie} Hit Die`,
  }
}

export function buildClassDetailViewModel(
  characterClass: CharacterClass,
  vocabulary: ClassDisplayVocabulary,
  options: BuildClassDetailViewModelOptions = {},
): ClassDetailViewModel {
  const surface = options.surface ?? 'content-detail'
  const features = options.features ?? characterClass.features
  const visibleFeatures =
    surface === 'builder-sheet' ? features.filter((feature) => feature.level === 1) : features

  const sections: ClassDetailViewModel['sections'] = [
    {
      id: 'proficiencies',
      title: CLASS_SECTION_LABELS.proficiencies,
      granted: buildGrantedProficiencyRows(characterClass, vocabulary),
      choices: buildProficiencyChoiceRows(characterClass, surface),
    },
  ]

  if (visibleFeatures.length > 0) {
    sections.push(buildFeaturesSection(characterClass, visibleFeatures))
  }

  return {
    statRows: buildClassStatRows(characterClass, surface),
    descriptionHtml: characterClass.description,
    sections,
  }
}
