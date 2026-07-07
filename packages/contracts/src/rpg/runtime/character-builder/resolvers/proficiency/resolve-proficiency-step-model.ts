import { getSkillName } from '../../../../content/skill-proficiency'
import { getLanguageLabel } from '../../../../vocab/language'
import { formatVocabularySlugLabel } from '../../../../vocab/format-slug-label'
import { getArmorCategoryLabel } from '../../../../vocab/armor/category'
import { getToolCategoryLabel } from '../../../../vocab/equipment/tool-category'
import { getWeaponCategoryLabel } from '../../../../vocab/weapon/category'
import type { CharacterBuildPreview } from '../../preview'
import { isChoiceSetSatisfied } from '../../choice-set'
import type { ChoiceSet } from '../../choice-set'
import type { CharacterBuildContext } from '../../context'
import { indexCharacterBuildCatalog } from '../../context'
import type { CharacterBuilderDraft } from '../../draft'
import { getChoiceSetStepId } from '../../steps'
import type { Ability } from '../../../../vocab/ability'
import {
  formatProficiencyChoiceSourceLabel,
  formatProficiencySourceLabel,
} from './format-proficiency-source-label'
import { formatSavingThrowProficiencyLabel } from './format-saving-throw-proficiency-label'

export const PROFICIENCY_STEP_SECTION_KINDS = [
  'savingThrows',
  'skills',
  'tools',
  'languages',
  'weapons',
  'armor',
] as const

export type ProficiencyStepSectionKind = (typeof PROFICIENCY_STEP_SECTION_KINDS)[number]

export type ProficiencyGrantedRow = {
  id: string
  label: string
  sourceLabel: string
  kind: ProficiencyStepSectionKind
  sublabel?: string
}

export type ProficiencyChoiceSelectedRow = {
  optionId: string
  label: string
  sourceLabel: string
  isStale: boolean
  staleReason?: string
  isRemovable: true
}

export type ProficiencyChoiceSummary = {
  choiceSet: ChoiceSet
  selectedRows: ProficiencyChoiceSelectedRow[]
  grantedRows: ProficiencyGrantedRow[]
  selectedCount: number
  max: number
  isFull: boolean
  isOverSelected: boolean
}

export type ProficiencyStepSection = {
  kind: ProficiencyStepSectionKind
  heading: string
  intro?: string
  grantedRows: ProficiencyGrantedRow[]
  choices: ProficiencyChoiceSummary[]
}

export type ProficiencyStepModel = {
  sections: ProficiencyStepSection[]
  hasPendingChoices: boolean
}

export const PROFICIENCY_STALE_REASON = 'This proficiency is no longer available.' as const

const PROFICIENCY_SECTION_HEADINGS: Record<ProficiencyStepSectionKind, string> = {
  savingThrows: 'Saving Throws',
  skills: 'Skills',
  tools: 'Tools',
  languages: 'Languages',
  weapons: 'Weapons',
  armor: 'Armor',
}

const PROFICIENCY_CHOICE_TYPE_SECTION: Partial<
  Record<ChoiceSet['choiceType'], ProficiencyStepSectionKind>
> = {
  skillProficiency: 'skills',
  language: 'languages',
  toolProficiency: 'tools',
  weaponProficiency: 'weapons',
  armorTraining: 'armor',
}

export type ResolveProficiencyStepModelArgs = {
  draft: CharacterBuilderDraft
  context: CharacterBuildContext
  preview: Pick<CharacterBuildPreview, 'savingThrows' | 'proficiencies'>
  choiceSets: readonly ChoiceSet[]
}

function emptySection(kind: ProficiencyStepSectionKind): ProficiencyStepSection {
  return {
    kind,
    heading: PROFICIENCY_SECTION_HEADINGS[kind],
    grantedRows: [],
    choices: [],
  }
}

function buildSavingThrowRows(
  preview: Pick<CharacterBuildPreview, 'savingThrows'>,
  catalogIndex: ReturnType<typeof indexCharacterBuildCatalog>,
  classId: string | undefined,
): ProficiencyGrantedRow[] {
  if (!classId) return []

  return preview.savingThrows
    .filter((save) => save.proficient)
    .map((save) => ({
      id: `saving-throw:${save.ability}`,
      kind: 'savingThrows' as const,
      label: formatSavingThrowProficiencyLabel(save.ability as Ability),
      sourceLabel: formatProficiencySourceLabel(
        [{ kind: 'classFeature', sourceId: classId, grantId: 'saving-throws' }],
        catalogIndex,
      ),
    }))
}

function skillGrantedRows(
  preview: Pick<CharacterBuildPreview, 'proficiencies'>,
  catalogIndex: ReturnType<typeof indexCharacterBuildCatalog>,
): ProficiencyGrantedRow[] {
  return preview.proficiencies.skills
    .filter((entry) => entry.sources?.some((source) => source.grantId === 'skill-proficiencies'))
    .map((entry) => ({
      id: `skill:${entry.skill}`,
      kind: 'skills' as const,
      label: getSkillName(entry.skill),
      sourceLabel: formatProficiencySourceLabel(entry.sources, catalogIndex),
    }))
}

function weaponGrantedRows(
  preview: Pick<CharacterBuildPreview, 'proficiencies'>,
  catalogIndex: ReturnType<typeof indexCharacterBuildCatalog>,
): ProficiencyGrantedRow[] {
  return preview.proficiencies.weapons
    .filter((entry) => entry.weaponCategory !== undefined)
    .map((entry) => ({
      id: `weapon-category:${entry.weaponCategory}`,
      kind: 'weapons' as const,
      label: getWeaponCategoryLabel(entry.weaponCategory!),
      sourceLabel: formatProficiencySourceLabel(entry.sources, catalogIndex, {
        rowKind: 'weaponCategory',
      }),
    }))
}

function armorGrantedRows(
  preview: Pick<CharacterBuildPreview, 'proficiencies'>,
  catalogIndex: ReturnType<typeof indexCharacterBuildCatalog>,
): ProficiencyGrantedRow[] {
  return preview.proficiencies.armor.map((entry) => ({
    id: `armor-category:${entry.armorCategory}`,
    kind: 'armor' as const,
    label: getArmorCategoryLabel(entry.armorCategory),
    sourceLabel: formatProficiencySourceLabel(entry.sources, catalogIndex, {
      rowKind: 'armorCategory',
    }),
  }))
}

function toolGrantedRows(
  preview: Pick<CharacterBuildPreview, 'proficiencies'>,
  catalogIndex: ReturnType<typeof indexCharacterBuildCatalog>,
): ProficiencyGrantedRow[] {
  return preview.proficiencies.tools.map((entry) => {
    const id = entry.toolId ? `tool:${entry.toolId}` : `tool-category:${entry.toolCategory}`
    const label = entry.toolId
      ? formatVocabularySlugLabel(entry.toolId)
      : getToolCategoryLabel(entry.toolCategory!)

    return {
      id,
      kind: 'tools' as const,
      label,
      sourceLabel: formatProficiencySourceLabel(entry.sources, catalogIndex, {
        rowKind: entry.toolCategory ? 'toolCategory' : 'default',
      }),
    }
  })
}

function languageGrantedRows(
  preview: Pick<CharacterBuildPreview, 'proficiencies'>,
  catalogIndex: ReturnType<typeof indexCharacterBuildCatalog>,
  choiceSetIds: ReadonlySet<string>,
): ProficiencyGrantedRow[] {
  return preview.proficiencies.languages
    .filter((entry) =>
      entry.sources?.every(
        (source) => source.grantId === undefined || !choiceSetIds.has(source.grantId),
      ),
    )
    .map((entry) => ({
      id: `language:${entry.language}`,
      kind: 'languages' as const,
      label: getLanguageLabel(entry.language),
      sourceLabel: formatProficiencySourceLabel(entry.sources, catalogIndex),
    }))
}

function buildChoiceSummary(
  choiceSet: ChoiceSet,
  draft: CharacterBuilderDraft,
): ProficiencyChoiceSummary {
  const selections = draft.choiceSelections[choiceSet.id] ?? []
  const optionIds = new Set(choiceSet.options.map((option) => option.id))

  const selectedRows: ProficiencyChoiceSelectedRow[] = selections.map((optionId) => {
    const option = choiceSet.options.find((entry) => entry.id === optionId)
    const isStale = !optionIds.has(optionId)

    return {
      optionId,
      label: option?.label ?? optionId,
      sourceLabel: formatProficiencyChoiceSourceLabel(choiceSet.label),
      isStale,
      staleReason: isStale ? PROFICIENCY_STALE_REASON : undefined,
      isRemovable: true,
    }
  })

  return {
    choiceSet,
    selectedRows,
    grantedRows: [],
    selectedCount: selections.length,
    max: choiceSet.max,
    isFull: selections.length >= choiceSet.max,
    isOverSelected: selections.length > choiceSet.max,
  }
}

function appendChoice(
  sections: Map<ProficiencyStepSectionKind, ProficiencyStepSection>,
  choiceSet: ChoiceSet,
  draft: CharacterBuilderDraft,
): void {
  const sectionKind = PROFICIENCY_CHOICE_TYPE_SECTION[choiceSet.choiceType]
  if (!sectionKind) return

  const section = sections.get(sectionKind) ?? emptySection(sectionKind)
  section.choices.push(buildChoiceSummary(choiceSet, draft))
  sections.set(sectionKind, section)
}

/** Builds the proficiencies step view model for dashboard rendering. */
export function resolveProficiencyStepModel({
  draft,
  context,
  preview,
  choiceSets,
}: ResolveProficiencyStepModelArgs): ProficiencyStepModel {
  const catalogIndex = indexCharacterBuildCatalog(context.catalog)
  const classId = draft.class.classId
  const proficiencyChoiceSets = choiceSets.filter(
    (choiceSet) => getChoiceSetStepId(choiceSet) === 'proficiencies',
  )
  const choiceSetIds = new Set(proficiencyChoiceSets.map((choiceSet) => choiceSet.id))

  const sections = new Map<ProficiencyStepSectionKind, ProficiencyStepSection>()

  const savingThrowRows = buildSavingThrowRows(preview, catalogIndex, classId)
  if (savingThrowRows.length > 0) {
    sections.set('savingThrows', {
      ...emptySection('savingThrows'),
      grantedRows: savingThrowRows,
    })
  }

  const skillRows = skillGrantedRows(preview, catalogIndex)
  if (skillRows.length > 0) {
    sections.set('skills', { ...emptySection('skills'), grantedRows: skillRows })
  }

  const weaponRows = weaponGrantedRows(preview, catalogIndex)
  if (weaponRows.length > 0) {
    sections.set('weapons', { ...emptySection('weapons'), grantedRows: weaponRows })
  }

  const armorRows = armorGrantedRows(preview, catalogIndex)
  if (armorRows.length > 0) {
    sections.set('armor', { ...emptySection('armor'), grantedRows: armorRows })
  }

  const toolRows = toolGrantedRows(preview, catalogIndex)
  if (toolRows.length > 0) {
    sections.set('tools', { ...emptySection('tools'), grantedRows: toolRows })
  }

  const languageRows = languageGrantedRows(preview, catalogIndex, choiceSetIds)
  if (languageRows.length > 0) {
    sections.set('languages', { ...emptySection('languages'), grantedRows: languageRows })
  }

  for (const choiceSet of proficiencyChoiceSets) {
    appendChoice(sections, choiceSet, draft)
  }

  const visibleSections = PROFICIENCY_STEP_SECTION_KINDS.flatMap((kind) => {
    const section = sections.get(kind)
    if (!section) return []
    if (section.grantedRows.length === 0 && section.choices.length === 0) return []
    return [section]
  })

  const hasPendingChoices = proficiencyChoiceSets.some(
    (choiceSet) =>
      choiceSet.required &&
      !isChoiceSetSatisfied(choiceSet, draft.choiceSelections[choiceSet.id] ?? []),
  )

  return {
    sections: visibleSections,
    hasPendingChoices,
  }
}
