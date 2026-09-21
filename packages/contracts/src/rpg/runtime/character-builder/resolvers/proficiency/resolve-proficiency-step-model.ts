import { getSkillName } from '../../../../content/skill-proficiency'
import { getLanguageLabel } from '../../../../vocab/language'
import { formatVocabularySlugLabel } from '../../../../vocab/format-slug-label'
import { getArmorCategorySummaryLabel } from '../../../../vocab/armor/category'
import { getToolCategoryLabel } from '../../../../vocab/equipment/tool-category'
import { getWeaponCategorySummaryLabel } from '../../../../vocab/weapon/category'
import { getProficiencyDomainCompactLabel } from '../../../../vocab/proficiency'
import { getAbilityLabel } from '../../../../vocab/ability'
import type { CharacterBuildPreview } from '../../preview/preview'
import { isChoiceSetSatisfied, type ChoiceSet } from '../../choice-set'
import type { CharacterBuildContext } from '../../context'
import { indexCharacterBuildCatalog } from '../../context'
import type { CharacterBuilderDraft } from '../../draft/draft'
import { getChoiceSetStepId } from '../../steps'
import type { Ability } from '../../../../vocab/ability'
import { isClassProgressionApplicable } from '../../progression/character-level-policy'
import { buildSelectionSourceLabelCatalogIndex } from '../../../character/format-selection-source-label'
import {
  formatCompactProficiencySourceLabel,
  formatGrantCardProficiencySourceLabel,
} from './format-proficiency-source-label'
import type { CharacterSelectionSource } from '../../../character/sheet/selection-sources'
import { isFixedProficiencyGrant } from './proficiency-grant-classification'
import {
  formatProficiencyCategorySubhead,
  formatProficiencyChoiceBlockCompactAddLabel,
  formatProficiencyPoolDescription,
  formatProficiencySectionEmptyMessage,
  formatProficiencySingleSetSupportingCopy,
  resolveProficiencyAggregateCount,
} from './format-proficiency-step-copy'
import type {
  BuilderChoiceBlock,
  BuilderChoiceGrantedRow,
  BuilderChoiceSelectedRow,
  BuilderChoiceSectionModel,
} from '../../builder-choice-section-model'
import {
  resolveProficiencyChoicePresentation,
  sortProficiencyChoiceSets,
} from './resolve-proficiency-choice-presentation'

export const PROFICIENCY_STEP_SECTION_KINDS = [
  'savingThrows',
  'skills',
  'tools',
  'languages',
  'weapons',
  'armor',
] as const

export type ProficiencyStepSectionKind = (typeof PROFICIENCY_STEP_SECTION_KINDS)[number]

/** Summary-only fixed grants — skills, tools, and languages render as section grant cards. */
export const PROFICIENCY_SUMMARY_SECTION_KINDS = ['savingThrows', 'weapons', 'armor'] as const

export type ProficiencySummarySectionKind = (typeof PROFICIENCY_SUMMARY_SECTION_KINDS)[number]

/** Section kinds that render fixed grants as grant cards instead of summary rows. */
export const PROFICIENCY_SECTION_CARD_KINDS = ['skills', 'tools', 'languages'] as const

export type ProficiencySectionCardKind = (typeof PROFICIENCY_SECTION_CARD_KINDS)[number]

export type ProficiencyGrantedRow = {
  id: string
  label: string
  kind: ProficiencyStepSectionKind
  sources: CharacterSelectionSource[]
  sublabel?: string
}

export type GrantedProficiencySourceGroup = {
  sourceLabel: string
  valueLabels: string[]
  /** Placeholder when no granted values exist yet (styled italic + muted in UI). */
  unsetText?: string
}

export type GrantedProficiencySummaryRow = {
  kind: ProficiencyStepSectionKind
  label: string
  sourceGroups: GrantedProficiencySourceGroup[]
}

export type ProficiencyChoiceSelectedRow = BuilderChoiceSelectedRow

export type ProficiencyChoiceBlock = BuilderChoiceBlock

export type ProficiencyInteractiveSection = BuilderChoiceSectionModel & {
  kind: ProficiencyStepSectionKind
}

export type { ProficiencyAggregateCount } from './format-proficiency-step-copy'

export type ProficiencyStepModel = {
  fixedGrants: GrantedProficiencySummaryRow[]
  sections: ProficiencyInteractiveSection[]
  hasPendingChoices: boolean
  hasUnresolvedPrerequisites: boolean
}

export const PROFICIENCY_STALE_REASON = 'This proficiency is no longer available.' as const

const PROFICIENCY_SECTION_HEADINGS: Record<ProficiencyStepSectionKind, string> = {
  savingThrows: 'Saving Throws',
  skills: getProficiencyDomainCompactLabel('skill'),
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

function buildSavingThrowRows(
  preview: Pick<CharacterBuildPreview, 'savingThrows'>,
  classId: string | undefined,
): ProficiencyGrantedRow[] {
  if (!classId) return []

  return preview.savingThrows
    .filter((save) => save.proficient)
    .map((save) => ({
      id: `saving-throw:${save.ability}`,
      kind: 'savingThrows' as const,
      label: getAbilityLabel(save.ability as Ability),
      sources: [{ kind: 'classFeature', sourceId: classId, grantId: 'saving-throws' }],
    }))
}

function skillGrantedRows(
  preview: Pick<CharacterBuildPreview, 'proficiencies'>,
  choiceSetIds: ReadonlySet<string>,
): ProficiencyGrantedRow[] {
  return preview.proficiencies.skills
    .filter((entry) => isFixedProficiencyGrant(entry.sources, choiceSetIds))
    .map((entry) => ({
      id: `skill:${entry.skill}`,
      kind: 'skills' as const,
      label: getSkillName(entry.skill),
      sources: entry.sources ?? [],
    }))
}

function weaponGrantedRows(
  preview: Pick<CharacterBuildPreview, 'proficiencies'>,
  choiceSetIds: ReadonlySet<string>,
): ProficiencyGrantedRow[] {
  return preview.proficiencies.weapons
    .filter((entry) => isFixedProficiencyGrant(entry.sources, choiceSetIds))
    .map((entry) => {
      const id = entry.weaponId
        ? `weapon:${entry.weaponId}`
        : `weapon-category:${entry.weaponCategory}`
      const label = entry.weaponId
        ? formatVocabularySlugLabel(entry.weaponId)
        : getWeaponCategorySummaryLabel(entry.weaponCategory!)

      return {
        id,
        kind: 'weapons' as const,
        label,
        sources: entry.sources ?? [],
      }
    })
}

function armorGrantedRows(
  preview: Pick<CharacterBuildPreview, 'proficiencies'>,
  choiceSetIds: ReadonlySet<string>,
): ProficiencyGrantedRow[] {
  return preview.proficiencies.armor
    .filter((entry) => isFixedProficiencyGrant(entry.sources, choiceSetIds))
    .map((entry) => ({
      id: `armor-category:${entry.armorCategory}`,
      kind: 'armor' as const,
      label: getArmorCategorySummaryLabel(entry.armorCategory),
      sources: entry.sources ?? [],
    }))
}

function toolGrantedRows(
  preview: Pick<CharacterBuildPreview, 'proficiencies'>,
  choiceSetIds: ReadonlySet<string>,
): ProficiencyGrantedRow[] {
  return preview.proficiencies.tools
    .filter((entry) => isFixedProficiencyGrant(entry.sources, choiceSetIds))
    .map((entry) => {
      const id = entry.toolId ? `tool:${entry.toolId}` : `tool-category:${entry.toolCategory}`
      const label = entry.toolId
        ? formatVocabularySlugLabel(entry.toolId)
        : getToolCategoryLabel(entry.toolCategory!)

      return {
        id,
        kind: 'tools' as const,
        label,
        sources: entry.sources ?? [],
      }
    })
}

function languageGrantedRows(
  preview: Pick<CharacterBuildPreview, 'proficiencies'>,
  choiceSetIds: ReadonlySet<string>,
): ProficiencyGrantedRow[] {
  return preview.proficiencies.languages
    .filter((entry) => isFixedProficiencyGrant(entry.sources, choiceSetIds))
    .map((entry) => ({
      id: `language:${entry.language}`,
      kind: 'languages' as const,
      label: getLanguageLabel(entry.language),
      sources: entry.sources ?? [],
    }))
}

function collectFixedGrantedRows(
  preview: Pick<CharacterBuildPreview, 'savingThrows' | 'proficiencies'>,
  classId: string | undefined,
  choiceSetIds: ReadonlySet<string>,
): ProficiencyGrantedRow[] {
  return [
    ...buildSavingThrowRows(preview, classId),
    ...skillGrantedRows(preview, choiceSetIds),
    ...weaponGrantedRows(preview, choiceSetIds),
    ...armorGrantedRows(preview, choiceSetIds),
    ...toolGrantedRows(preview, choiceSetIds),
    ...languageGrantedRows(preview, choiceSetIds),
  ]
}

function toChoiceGrantedRow(
  row: ProficiencyGrantedRow,
  labelCatalogIndex: ReturnType<typeof buildSelectionSourceLabelCatalogIndex>,
): BuilderChoiceGrantedRow {
  return {
    id: row.id,
    label: row.label,
    sublabel: row.sublabel,
    sourceLabel: formatGrantCardProficiencySourceLabel(row.sources, labelCatalogIndex),
  }
}

function grantedRowsForKind(
  rows: readonly ProficiencyGrantedRow[],
  kind: ProficiencyStepSectionKind,
  labelCatalogIndex: ReturnType<typeof buildSelectionSourceLabelCatalogIndex>,
): BuilderChoiceGrantedRow[] {
  return rows
    .filter((row) => row.kind === kind)
    .map((row) => toChoiceGrantedRow(row, labelCatalogIndex))
}

function groupGrantedRowsIntoSummary(
  rows: readonly ProficiencyGrantedRow[],
  labelCatalogIndex: ReturnType<typeof buildSelectionSourceLabelCatalogIndex>,
): GrantedProficiencySummaryRow[] {
  const rowsByKind = new Map<ProficiencyStepSectionKind, Map<string, string[]>>()

  for (const row of rows) {
    const sourceLabel = formatCompactProficiencySourceLabel(row.sources, labelCatalogIndex)
    const bySource = rowsByKind.get(row.kind) ?? new Map<string, string[]>()
    const valueLabels = bySource.get(sourceLabel) ?? []
    valueLabels.push(row.label)
    bySource.set(sourceLabel, valueLabels)
    rowsByKind.set(row.kind, bySource)
  }

  return PROFICIENCY_SUMMARY_SECTION_KINDS.flatMap((kind) => {
    const bySource = rowsByKind.get(kind)
    if (!bySource || bySource.size === 0) return []

    return [
      {
        kind,
        label: PROFICIENCY_SECTION_HEADINGS[kind],
        sourceGroups: [...bySource.entries()].map(([sourceLabel, valueLabels]) => ({
          sourceLabel,
          valueLabels,
        })),
      },
    ]
  })
}

function buildSelectedRows(
  choiceSet: ChoiceSet,
  draft: CharacterBuilderDraft,
): ProficiencyChoiceSelectedRow[] {
  const selections = draft.choiceSelections[choiceSet.id] ?? []
  const optionIds = new Set(choiceSet.options.map((option) => option.id))

  return selections.map((optionId) => {
    const option = choiceSet.options.find((entry) => entry.id === optionId)
    const isStale = !optionIds.has(optionId)

    return {
      optionId,
      label: option?.label ?? optionId,
      choiceSetId: choiceSet.id,
      isStale,
      staleReason: isStale ? PROFICIENCY_STALE_REASON : undefined,
      isRemovable: true,
    }
  })
}

function buildChoiceBlock(
  choiceSet: ChoiceSet,
  draft: CharacterBuilderDraft,
  presentation: ReturnType<typeof resolveProficiencyChoicePresentation>,
): ProficiencyChoiceBlock {
  const selections = draft.choiceSelections[choiceSet.id] ?? []
  const selectedCount = selections.length

  return {
    choiceSet,
    heading: presentation.heading,
    sourceLine: presentation.sourceLine,
    selectedCount,
    min: choiceSet.min,
    max: choiceSet.max,
    poolDescription: formatProficiencyPoolDescription(choiceSet),
    compactAddLabel: formatProficiencyChoiceBlockCompactAddLabel(choiceSet, selectedCount),
    isFull: selectedCount >= choiceSet.max,
    isOverSelected: selectedCount > choiceSet.max,
  }
}

function buildGrantOnlySection(
  kind: ProficiencySectionCardKind,
  grantedRows: BuilderChoiceGrantedRow[],
): ProficiencyInteractiveSection {
  return {
    id: kind,
    kind,
    heading: PROFICIENCY_SECTION_HEADINGS[kind],
    subhead: formatProficiencyCategorySubhead(kind, [], grantedRows.length > 0),
    aggregateCount: null,
    selectedRows: [],
    grantedRows,
    choiceBlocks: [],
    emptyMessage: formatProficiencySectionEmptyMessage(kind, grantedRows.length > 0),
    isOverSelected: false,
  }
}

function buildInteractiveSection(
  kind: ProficiencyStepSectionKind,
  choiceSets: readonly ChoiceSet[],
  draft: CharacterBuilderDraft,
  grantedRows: BuilderChoiceGrantedRow[],
): ProficiencyInteractiveSection {
  const hasFixedGrantsInCategory = grantedRows.length > 0
  const sortedChoiceSets = sortProficiencyChoiceSets(choiceSets)
  const presentations = sortedChoiceSets.map((choiceSet) => ({
    choiceSet,
    presentation: resolveProficiencyChoicePresentation(choiceSet),
  }))
  const choiceBlocks = presentations.map(({ choiceSet, presentation }) =>
    buildChoiceBlock(choiceSet, draft, presentation),
  )
  const selectedRows = presentations.flatMap(({ choiceSet }) => buildSelectedRows(choiceSet, draft))

  const singleSetSupportingCopy =
    presentations.length === 1
      ? formatProficiencySingleSetSupportingCopy({
          choiceSet: presentations[0]!.choiceSet,
          heading: presentations[0]!.presentation.heading,
          headingSourceCoverage: presentations[0]!.presentation.headingSourceCoverage,
          hasFixedGrantsInCategory,
        })
      : undefined

  return {
    id: kind,
    kind,
    heading: PROFICIENCY_SECTION_HEADINGS[kind],
    subhead:
      singleSetSupportingCopy?.instruction ??
      formatProficiencyCategorySubhead(kind, sortedChoiceSets, hasFixedGrantsInCategory),
    identityLine: singleSetSupportingCopy?.identityLine,
    aggregateCount: resolveProficiencyAggregateCount(choiceBlocks),
    selectedRows,
    grantedRows,
    choiceBlocks,
    emptyMessage: formatProficiencySectionEmptyMessage(kind, hasFixedGrantsInCategory),
    isOverSelected: choiceBlocks.some((block) => block.isOverSelected),
  }
}

/** Builds the proficiencies step view model for dashboard rendering. */
export function resolveProficiencyStepModel({
  draft,
  context,
  preview,
  choiceSets,
}: ResolveProficiencyStepModelArgs): ProficiencyStepModel {
  const catalogIndex = indexCharacterBuildCatalog(context.catalog)
  const labelCatalogIndex = buildSelectionSourceLabelCatalogIndex({
    catalogIndex,
    characterCreationRules: context.characterCreationRules,
  })
  const classId = draft.class.classId
  const proficiencyChoiceSets = choiceSets.filter(
    (choiceSet) => getChoiceSetStepId(choiceSet) === 'proficiencies',
  )
  const choiceSetIds = new Set(proficiencyChoiceSets.map((choiceSet) => choiceSet.id))

  const grantedRows = collectFixedGrantedRows(preview, classId, choiceSetIds)
  const summaryGrantedRows = grantedRows.filter((row) =>
    PROFICIENCY_SUMMARY_SECTION_KINDS.includes(row.kind as ProficiencySummarySectionKind),
  )
  const fixedGrants = groupGrantedRowsIntoSummary(summaryGrantedRows, labelCatalogIndex)

  const choiceSetsByKind = new Map<ProficiencyStepSectionKind, ChoiceSet[]>()
  for (const choiceSet of proficiencyChoiceSets) {
    const sectionKind = PROFICIENCY_CHOICE_TYPE_SECTION[choiceSet.choiceType]
    if (!sectionKind) continue

    const existing = choiceSetsByKind.get(sectionKind) ?? []
    existing.push(choiceSet)
    choiceSetsByKind.set(sectionKind, existing)
  }

  const sections = PROFICIENCY_STEP_SECTION_KINDS.flatMap((kind) => {
    const categoryChoiceSets = choiceSetsByKind.get(kind) ?? []
    const sectionGrantedRows = grantedRowsForKind(grantedRows, kind, labelCatalogIndex)

    if (categoryChoiceSets.length > 0) {
      return [buildInteractiveSection(kind, categoryChoiceSets, draft, sectionGrantedRows)]
    }

    if (
      PROFICIENCY_SECTION_CARD_KINDS.includes(kind as ProficiencySectionCardKind) &&
      sectionGrantedRows.length > 0
    ) {
      return [buildGrantOnlySection(kind as ProficiencySectionCardKind, sectionGrantedRows)]
    }

    return []
  })

  const hasPendingChoices = proficiencyChoiceSets.some(
    (choiceSet) =>
      choiceSet.required &&
      !isChoiceSetSatisfied(choiceSet, draft.choiceSelections[choiceSet.id] ?? []),
  )

  const hasUnresolvedPrerequisites = !classId && isClassProgressionApplicable(draft.class.level)

  return {
    fixedGrants,
    sections,
    hasPendingChoices,
    hasUnresolvedPrerequisites,
  }
}
