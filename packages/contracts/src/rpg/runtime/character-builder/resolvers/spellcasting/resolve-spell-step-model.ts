import type { CharacterClass } from '../../../../content/classes/class'
import { formatSpellLevel } from '../../../../content/spell/levels'
import { CLASS_SPELLCASTING_CHOICE_SUFFIXES } from '../../../../content/classes/spellcasting'
import { formatCompactSelectionSourceLabel } from '../../../character/format-selection-source-label'
import type { CharacterBuildPreview } from '../../preview/preview'
import { isChoiceSetSatisfied, type ChoiceSet } from '../../choice-set'
import type { CharacterBuildContext } from '../../context'
import { indexCharacterBuildCatalog } from '../../context'
import type { CharacterBuilderDraft } from '../../draft/draft'
import { getChoiceSetStepId } from '../../steps'
import type {
  BuilderChoiceBlock,
  BuilderChoiceGrantedRow,
  BuilderChoiceSectionModel,
  BuilderChoiceSelectedRow,
  BuilderFactSummaryRow,
} from '../../builder-choice-section-model'
import { assembleGrantedSpells } from '../../assembly/assemble-granted-spells'
import {
  formatChoiceBlockCompactAddLabel,
  formatChoiceCategorySubhead,
  formatChoiceChosenCounter,
  formatChoicePoolDescription,
  formatChoiceSectionEmptyMessage,
  formatChoiceSingleSetSupportingCopy,
  resolveChoiceAggregateCount,
} from '../../format-choice-step-copy'
import { getAbilityLabel } from '../../../../vocab/ability'
import type { BuilderSpellcastingProfile } from './builder-spellcasting'
import { spellcastingChoiceSetId } from './resolve-spellcasting-choice-sets'
import {
  resolveSpellChoicePresentation,
  sortSpellChoiceSets,
} from './resolve-spell-choice-presentation'
import { lookupSpellInCatalogIndex } from './lookup-spell-in-catalog-index'

export const SPELLS_STALE_REASON = 'This spell is no longer available.' as const

export type SpellStepSectionKind = 'cantrips' | 'spellLevel' | 'deferredPrepared'

export type SpellInteractiveSection = BuilderChoiceSectionModel & {
  kind: SpellStepSectionKind
  spellLevel?: number
}

export type SpellLevelTabModel = {
  level: number
  selectedAtLevel: number
  activityLabel: string
}

export type SpellStepModel = {
  summaryRows: BuilderFactSummaryRow[]
  cantripsSection: SpellInteractiveSection | null
  levelTabs: SpellLevelTabModel[]
  spellLevelSections: SpellInteractiveSection[]
  deferredPreparedSection: SpellInteractiveSection | null
  maxSelectableSpellLevel: number
  hasPendingChoices: boolean
}

export type ResolveSpellStepModelArgs = {
  draft: CharacterBuilderDraft
  context: CharacterBuildContext
  preview: Pick<CharacterBuildPreview, 'spellcasting'> | null
  profile: BuilderSpellcastingProfile
  choiceSets: readonly ChoiceSet[]
}

function isDeferredPreparedChoiceSet(
  choiceSet: ChoiceSet,
  profile: BuilderSpellcastingProfile,
): boolean {
  if (choiceSet.choiceType !== 'spell') return false
  if (profile.spellcasting.spellSelection?.model !== 'prepareFromLearnedCollection') return false
  return (
    choiceSet.id ===
    spellcastingChoiceSetId(profile.classId, CLASS_SPELLCASTING_CHOICE_SUFFIXES.prepared)
  )
}

function spellLevelForOption(
  optionId: string,
  catalogIndex: ReturnType<typeof indexCharacterBuildCatalog>,
): number | undefined {
  return catalogIndex.spells.get(optionId)?.level
}

function optionsAtLevel(
  choiceSet: ChoiceSet,
  level: number,
  catalogIndex: ReturnType<typeof indexCharacterBuildCatalog>,
): ChoiceSet['options'] {
  if (choiceSet.choiceType === 'cantrip') {
    return choiceSet.options.filter((option) => spellLevelForOption(option.id, catalogIndex) === 0)
  }

  return choiceSet.options.filter(
    (option) => spellLevelForOption(option.id, catalogIndex) === level,
  )
}

function selectedIdsAtLevel(
  choiceSet: ChoiceSet,
  draft: CharacterBuilderDraft,
  level: number,
  catalogIndex: ReturnType<typeof indexCharacterBuildCatalog>,
): string[] {
  const selections = draft.choiceSelections[choiceSet.id] ?? []
  return selections.filter((optionId) => {
    const spellLevel = spellLevelForOption(optionId, catalogIndex)
    if (choiceSet.choiceType === 'cantrip') return spellLevel === 0
    return spellLevel === level
  })
}

function choiceSetVisibleAtLevel(
  choiceSet: ChoiceSet,
  level: number,
  draft: CharacterBuilderDraft,
  catalogIndex: ReturnType<typeof indexCharacterBuildCatalog>,
): boolean {
  if (choiceSet.choiceType === 'cantrip') return false
  const hasOptions = optionsAtLevel(choiceSet, level, catalogIndex).length > 0
  const hasSelections = selectedIdsAtLevel(choiceSet, draft, level, catalogIndex).length > 0
  return hasOptions || hasSelections
}

function buildSelectedRows(
  choiceSet: ChoiceSet,
  draft: CharacterBuilderDraft,
  level: number | undefined,
  catalogIndex: ReturnType<typeof indexCharacterBuildCatalog>,
): BuilderChoiceSelectedRow[] {
  const selections = draft.choiceSelections[choiceSet.id] ?? []
  const optionIds = new Set(choiceSet.options.map((option) => option.id))

  return selections
    .filter((optionId) => {
      if (level === undefined) return true
      const spellLevel = spellLevelForOption(optionId, catalogIndex)
      if (choiceSet.choiceType === 'cantrip') return spellLevel === 0
      return spellLevel === level
    })
    .map((optionId) => {
      const option = choiceSet.options.find((entry) => entry.id === optionId)
      const isStale = !optionIds.has(optionId)

      return {
        optionId,
        label: option?.label ?? optionId,
        choiceSetId: choiceSet.id,
        isStale,
        staleReason: isStale ? SPELLS_STALE_REASON : undefined,
        isRemovable: true,
      }
    })
}

function buildChoiceBlock(
  choiceSet: ChoiceSet,
  draft: CharacterBuilderDraft,
  presentation: ReturnType<typeof resolveSpellChoicePresentation>,
  level: number | undefined,
  catalogIndex: ReturnType<typeof indexCharacterBuildCatalog>,
): BuilderChoiceBlock {
  const selections = draft.choiceSelections[choiceSet.id] ?? []
  const selectedCount = selections.length
  const filteredOptions =
    level === undefined ? choiceSet.options : optionsAtLevel(choiceSet, level, catalogIndex)

  const selectedAtLevel =
    level === undefined
      ? undefined
      : selectedIdsAtLevel(choiceSet, draft, level, catalogIndex).length

  return {
    choiceSet,
    heading: presentation.heading,
    sourceLine: presentation.sourceLine,
    selectedCount,
    min: choiceSet.min,
    max: choiceSet.max,
    displayCount:
      selectedAtLevel === undefined
        ? undefined
        : {
            selected: selectedAtLevel,
            max: choiceSet.max,
          },
    poolDescription: formatChoicePoolDescription({
      choiceSet: { ...choiceSet, options: filteredOptions },
      spellLevel: level,
    }),
    compactAddLabel: formatChoiceBlockCompactAddLabel(choiceSet, selectedCount),
    isFull: selectedCount >= choiceSet.max,
    isOverSelected: selectedCount > choiceSet.max,
  }
}

function buildGrantedSpellRows(
  draft: CharacterBuilderDraft,
  catalogIndex: ReturnType<typeof indexCharacterBuildCatalog>,
  characterClass: CharacterClass | undefined,
  spellLevel: number,
): BuilderChoiceGrantedRow[] {
  return assembleGrantedSpells(draft, catalogIndex, characterClass).flatMap((entry) => {
    const spell = lookupSpellInCatalogIndex(entry.spellId, catalogIndex)
    if (!spell || spell.level !== spellLevel) return []

    return [
      {
        id: `granted-spell:${spell.id}`,
        label: spell.name,
        sourceLabel: formatCompactSelectionSourceLabel(entry.sources ?? [], catalogIndex),
      },
    ]
  })
}

function buildGrantedCantripRows(
  draft: CharacterBuilderDraft,
  catalogIndex: ReturnType<typeof indexCharacterBuildCatalog>,
  characterClass: CharacterClass | undefined,
): BuilderChoiceGrantedRow[] {
  return buildGrantedSpellRows(draft, catalogIndex, characterClass, 0)
}

function spellLevelHeading(level: number): string {
  return `${formatSpellLevel(level)}-Level Spells`
}

function buildCantripsSection(
  choiceSets: readonly ChoiceSet[],
  draft: CharacterBuilderDraft,
  profile: BuilderSpellcastingProfile,
  catalogIndex: ReturnType<typeof indexCharacterBuildCatalog>,
  grantedRows: BuilderChoiceGrantedRow[],
): SpellInteractiveSection | null {
  const cantripChoiceSets = sortSpellChoiceSets(
    choiceSets.filter((choiceSet) => choiceSet.choiceType === 'cantrip'),
  )
  if (cantripChoiceSets.length === 0 && grantedRows.length === 0) return null

  const presentations = cantripChoiceSets.map((choiceSet) => ({
    choiceSet,
    presentation: resolveSpellChoicePresentation(choiceSet, profile.className),
  }))
  const choiceBlocks = presentations.map(({ choiceSet, presentation }) =>
    buildChoiceBlock(choiceSet, draft, presentation, undefined, catalogIndex),
  )
  const selectedRows = presentations.flatMap(({ choiceSet }) =>
    buildSelectedRows(choiceSet, draft, undefined, catalogIndex),
  )

  const singleSetSupportingCopy =
    presentations.length === 1
      ? formatChoiceSingleSetSupportingCopy({
          choiceSet: presentations[0]!.choiceSet,
          heading: presentations[0]!.presentation.heading,
          headingSourceCoverage: presentations[0]!.presentation.headingSourceCoverage,
          hasFixedGrantsInCategory: grantedRows.length > 0,
          subheadStyle: 'spell',
        })
      : undefined

  const aggregateCount =
    choiceBlocks.length === 1
      ? {
          selected: choiceBlocks[0]!.selectedCount,
          max: choiceBlocks[0]!.max,
          label: formatChoiceChosenCounter(choiceBlocks[0]!.selectedCount, choiceBlocks[0]!.max),
        }
      : resolveChoiceAggregateCount(choiceBlocks)

  return {
    id: 'cantrips',
    kind: 'cantrips',
    heading: 'Cantrips',
    subhead:
      singleSetSupportingCopy?.instruction ??
      formatChoiceCategorySubhead('cantrips', cantripChoiceSets, grantedRows.length > 0, 'spell'),
    identityLine: singleSetSupportingCopy?.identityLine,
    aggregateCount,
    selectedRows,
    grantedRows,
    choiceBlocks,
    emptyMessage: formatChoiceSectionEmptyMessage(
      'cantrip',
      'cantrips',
      grantedRows.length > 0,
      'spell',
    ),
    isOverSelected: choiceBlocks.some((block) => block.isOverSelected),
  }
}

function buildSpellLevelSection(
  level: number,
  choiceSets: readonly ChoiceSet[],
  draft: CharacterBuilderDraft,
  profile: BuilderSpellcastingProfile,
  catalogIndex: ReturnType<typeof indexCharacterBuildCatalog>,
  grantedRows: BuilderChoiceGrantedRow[],
): SpellInteractiveSection {
  const visibleChoiceSets = sortSpellChoiceSets(
    choiceSets.filter((choiceSet) =>
      choiceSetVisibleAtLevel(choiceSet, level, draft, catalogIndex),
    ),
  )

  const presentations = visibleChoiceSets.map((choiceSet) => ({
    choiceSet,
    presentation: resolveSpellChoicePresentation(choiceSet, profile.className),
  }))
  const choiceBlocks = presentations.map(({ choiceSet, presentation }) =>
    buildChoiceBlock(choiceSet, draft, presentation, level, catalogIndex),
  )
  const selectedRows = presentations.flatMap(({ choiceSet }) =>
    buildSelectedRows(choiceSet, draft, level, catalogIndex),
  )

  const singleSetSupportingCopy =
    presentations.length === 1
      ? (() => {
          const choiceSet = presentations[0]!.choiceSet
          const filteredOptions = optionsAtLevel(choiceSet, level, catalogIndex)
          return formatChoiceSingleSetSupportingCopy({
            choiceSet: { ...choiceSet, options: filteredOptions },
            heading: presentations[0]!.presentation.heading,
            headingSourceCoverage: presentations[0]!.presentation.headingSourceCoverage,
            hasFixedGrantsInCategory: grantedRows.length > 0,
            subheadStyle: 'spell',
            spellLevel: level,
          })
        })()
      : undefined

  const singleIdentityLine =
    presentations.length === 1 ? presentations[0]!.presentation.identityLine : undefined

  const aggregateCount =
    choiceBlocks.length === 1
      ? (() => {
          const block = choiceBlocks[0]!
          const counter = block.displayCount ?? {
            selected: block.selectedCount,
            max: block.max,
          }
          return {
            selected: counter.selected,
            max: counter.max,
            label: formatChoiceChosenCounter(counter.selected, counter.max),
          }
        })()
      : null

  return {
    id: `spell-level-${level}`,
    kind: 'spellLevel',
    spellLevel: level,
    heading: spellLevelHeading(level),
    subhead:
      singleSetSupportingCopy?.instruction ??
      formatChoiceCategorySubhead('spells', visibleChoiceSets, grantedRows.length > 0, 'spell'),
    identityLine: singleSetSupportingCopy?.identityLine ?? singleIdentityLine,
    aggregateCount,
    selectedRows,
    grantedRows,
    choiceBlocks,
    emptyMessage: formatChoiceSectionEmptyMessage(
      'spell',
      'spells',
      grantedRows.length > 0,
      'spell',
    ),
    isOverSelected: choiceBlocks.some((block) => block.isOverSelected),
  }
}

function buildDeferredPreparedSection(
  choiceSet: ChoiceSet,
  draft: CharacterBuilderDraft,
  profile: BuilderSpellcastingProfile,
  catalogIndex: ReturnType<typeof indexCharacterBuildCatalog>,
): SpellInteractiveSection {
  const presentation = resolveSpellChoicePresentation(choiceSet, profile.className)
  const choiceBlock = buildChoiceBlock(choiceSet, draft, presentation, undefined, catalogIndex)
  const selectedRows = buildSelectedRows(choiceSet, draft, undefined, catalogIndex)
  const supportingCopy = formatChoiceSingleSetSupportingCopy({
    choiceSet,
    heading: presentation.heading,
    headingSourceCoverage: presentation.headingSourceCoverage,
    hasFixedGrantsInCategory: false,
    subheadStyle: 'spell',
  })

  return {
    id: choiceSet.id,
    kind: 'deferredPrepared',
    heading: presentation.heading,
    subhead: supportingCopy.instruction,
    identityLine: presentation.identityLine ?? supportingCopy.identityLine,
    aggregateCount: {
      selected: choiceBlock.selectedCount,
      max: choiceBlock.max,
      label: formatChoiceChosenCounter(choiceBlock.selectedCount, choiceBlock.max),
    },
    selectedRows,
    grantedRows: [],
    choiceBlocks: [choiceBlock],
    emptyMessage: formatChoiceSectionEmptyMessage('spell', 'spells', false, 'spell'),
    isOverSelected: choiceBlock.isOverSelected,
  }
}

function buildSummaryRows(
  profile: BuilderSpellcastingProfile,
  preview: Pick<CharacterBuildPreview, 'spellcasting'> | null,
): BuilderFactSummaryRow[] {
  const spellcasting = preview?.spellcasting
  const pending = 'Pending ability scores'

  return [
    {
      id: 'ability',
      label: 'Spellcasting ability',
      value: getAbilityLabel(profile.ability),
      icon: 'spellcasting-ability',
    },
    {
      id: 'save-dc',
      label: 'Spell save DC',
      value: spellcasting?.saveDc !== undefined ? String(spellcasting.saveDc) : pending,
      icon: 'spell-save-dc',
    },
    {
      id: 'attack',
      label: 'Spell attack',
      value:
        spellcasting?.attackBonus !== undefined
          ? spellcasting.attackBonus >= 0
            ? `+${spellcasting.attackBonus}`
            : String(spellcasting.attackBonus)
          : pending,
      icon: 'spell-attack',
    },
  ]
}

function countSelectedAtLevel(
  acquisitionChoiceSets: readonly ChoiceSet[],
  draft: CharacterBuilderDraft,
  level: number,
  catalogIndex: ReturnType<typeof indexCharacterBuildCatalog>,
): number {
  return acquisitionChoiceSets.reduce((count, choiceSet) => {
    return count + selectedIdsAtLevel(choiceSet, draft, level, catalogIndex).length
  }, 0)
}

function formatSpellLevelTabActivityLabel(selectedAtLevel: number): string {
  return selectedAtLevel > 0 ? `${selectedAtLevel} selected` : '—'
}

function buildLevelTabs(
  maxLevel: number,
  acquisitionChoiceSets: readonly ChoiceSet[],
  draft: CharacterBuilderDraft,
  catalogIndex: ReturnType<typeof indexCharacterBuildCatalog>,
): SpellLevelTabModel[] {
  return Array.from({ length: maxLevel }, (_, index) => {
    const level = index + 1
    const selectedAtLevel = countSelectedAtLevel(acquisitionChoiceSets, draft, level, catalogIndex)
    return {
      level,
      selectedAtLevel,
      activityLabel: formatSpellLevelTabActivityLabel(selectedAtLevel),
    }
  })
}

/** Builds the spells step view model for dashboard rendering. */
export function resolveSpellStepModel({
  draft,
  context,
  preview,
  profile,
  choiceSets,
}: ResolveSpellStepModelArgs): SpellStepModel {
  const catalogIndex = indexCharacterBuildCatalog(context.catalog)
  const characterClass = catalogIndex.classes.get(profile.classId)
  const spellsChoiceSets = choiceSets.filter(
    (choiceSet) => getChoiceSetStepId(choiceSet) === 'spells',
  )

  const deferredPrepared = spellsChoiceSets.find((choiceSet) =>
    isDeferredPreparedChoiceSet(choiceSet, profile),
  )
  const acquisitionChoiceSets = spellsChoiceSets.filter(
    (choiceSet) => choiceSet.choiceType === 'spell' && choiceSet.id !== deferredPrepared?.id,
  )

  const grantedCantripRows = buildGrantedCantripRows(draft, catalogIndex, characterClass)
  const cantripsSection = buildCantripsSection(
    spellsChoiceSets,
    draft,
    profile,
    catalogIndex,
    grantedCantripRows,
  )

  const maxSelectableSpellLevel = profile.maxSelectableSpellLevel
  const spellLevelSections = Array.from({ length: maxSelectableSpellLevel }, (_, index) => {
    const level = index + 1
    const grantedRows = buildGrantedSpellRows(draft, catalogIndex, characterClass, level)
    return buildSpellLevelSection(
      level,
      acquisitionChoiceSets,
      draft,
      profile,
      catalogIndex,
      grantedRows,
    )
  })

  const levelTabs = buildLevelTabs(
    maxSelectableSpellLevel,
    acquisitionChoiceSets,
    draft,
    catalogIndex,
  )

  const deferredPreparedSection = deferredPrepared
    ? buildDeferredPreparedSection(deferredPrepared, draft, profile, catalogIndex)
    : null

  const hasPendingChoices = spellsChoiceSets.some(
    (choiceSet) =>
      choiceSet.required &&
      !isChoiceSetSatisfied(choiceSet, draft.choiceSelections[choiceSet.id] ?? []),
  )

  return {
    summaryRows: buildSummaryRows(profile, preview),
    cantripsSection,
    levelTabs,
    spellLevelSections,
    deferredPreparedSection,
    maxSelectableSpellLevel,
    hasPendingChoices,
  }
}
