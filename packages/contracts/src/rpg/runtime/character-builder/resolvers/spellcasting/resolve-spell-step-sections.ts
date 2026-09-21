import { formatSpellLevel } from '../../../../content/spell/levels'
import type {
  BuilderChoiceAggregateCount,
  BuilderChoiceBlock,
  BuilderChoiceGrantedRow,
  BuilderChoiceSelectedRow,
} from '../../builder-choice-section-model'
import { resolveChoiceSetRequiredToComplete, type ChoiceSet } from '../../choice-set'
import type { CharacterBuildCatalogIndex } from '../../context'
import type { CharacterBuilderDraft } from '../../draft/draft'
import {
  formatCantripAcquisitionCopy,
  formatSpellAcquisitionCopy,
  spellAcquisitionCopyLines,
} from '../../format-spell-acquisition-copy'
import {
  formatChoiceBlockCompactAddLabel,
  formatChoiceCategorySubhead,
  formatChoiceChosenCounter,
  formatChoicePoolDescription,
  formatChoiceSectionEmptyMessage,
  formatChoiceSingleSetSupportingCopy,
  resolveChoiceBlockAvailabilityMessage,
  resolveChoiceAggregateCount,
} from '../../format-choice-step-copy'
import { resolveChoiceSetAvailability } from '../../resolve-choice-set-availability'
import type { BuilderSpellcastingProfile } from './builder-spellcasting'
import {
  resolveSpellAcquisitionDestination,
  resolveSpellChoiceCounterVerb,
  isClassSpellcastingChoiceSet,
} from './resolve-spell-choice-counter-verb'
import {
  resolveSpellChoicePresentation,
  sortSpellChoiceSets,
} from './resolve-spell-choice-presentation'
import type { SpellInteractiveSection } from './resolve-spell-step-model'
import { lookupSpellInCatalogIndex } from './lookup-spell-in-catalog-index'

export const SPELLS_STALE_REASON = 'This spell is no longer available.' as const
export const SPELL_LEVEL_SLICE_EMPTY_MESSAGE = 'No spells are currently available.' as const

function spellLevelForOption(
  optionId: string,
  catalogIndex: CharacterBuildCatalogIndex,
): number | undefined {
  return lookupSpellInCatalogIndex(optionId, catalogIndex)?.level
}

export function optionsAtLevel(
  choiceSet: ChoiceSet,
  level: number,
  catalogIndex: CharacterBuildCatalogIndex,
): ChoiceSet['options'] {
  if (choiceSet.choiceType === 'cantrip') {
    return choiceSet.options.filter((option) => spellLevelForOption(option.id, catalogIndex) === 0)
  }

  return choiceSet.options.filter(
    (option) => spellLevelForOption(option.id, catalogIndex) === level,
  )
}

export function selectedIdsAtLevel(
  choiceSet: ChoiceSet,
  draft: CharacterBuilderDraft,
  level: number,
  catalogIndex: CharacterBuildCatalogIndex,
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
  catalogIndex: CharacterBuildCatalogIndex,
): boolean {
  if (choiceSet.choiceType === 'cantrip') return false
  const hasOptions = optionsAtLevel(choiceSet, level, catalogIndex).length > 0
  const hasSelections = selectedIdsAtLevel(choiceSet, draft, level, catalogIndex).length > 0
  return hasOptions || hasSelections
}

export function buildSelectedRows(
  choiceSet: ChoiceSet,
  draft: CharacterBuilderDraft,
  level: number | undefined,
  catalogIndex: CharacterBuildCatalogIndex,
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

export function buildChoiceBlock(
  choiceSet: ChoiceSet,
  draft: CharacterBuilderDraft,
  presentation: ReturnType<typeof resolveSpellChoicePresentation>,
  level: number | undefined,
  catalogIndex: CharacterBuildCatalogIndex,
  profile: BuilderSpellcastingProfile,
): BuilderChoiceBlock {
  const selections = draft.choiceSelections[choiceSet.id] ?? []
  const selectedCount = selections.length
  const filteredOptions =
    level === undefined ? choiceSet.options : optionsAtLevel(choiceSet, level, catalogIndex)
  const sliceHasOptions = filteredOptions.length > 0

  const selectedAtLevel =
    level === undefined
      ? undefined
      : selectedIdsAtLevel(choiceSet, draft, level, catalogIndex).length

  const sliceEmptyMessage =
    level !== undefined && !sliceHasOptions && selectedAtLevel === 0
      ? SPELL_LEVEL_SLICE_EMPTY_MESSAGE
      : undefined

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
    poolDescription:
      sliceEmptyMessage ??
      formatChoicePoolDescription({
        choiceSet: { ...choiceSet, options: filteredOptions },
        spellLevel: level,
      }),
    availabilityMessage: resolveChoiceBlockAvailabilityMessage(choiceSet, selections),
    counterVerb: resolveSpellChoiceCounterVerb(choiceSet, profile),
    requiredToComplete: resolveChoiceSetRequiredToComplete(choiceSet),
    effectiveRequiredCount: resolveChoiceSetAvailability(choiceSet).effectiveRequiredCount,
    compactAddLabel: formatChoiceBlockCompactAddLabel(choiceSet, selectedCount),
    isFull: selectedCount >= choiceSet.max,
    isOverSelected: selectedCount > choiceSet.max,
    isInteractive: sliceHasOptions || (selectedAtLevel !== undefined && selectedAtLevel > 0),
  }
}

export function buildClassAcquisitionAggregateCount(
  choiceSet: ChoiceSet,
  draft: CharacterBuilderDraft,
  profile: BuilderSpellcastingProfile,
): BuilderChoiceAggregateCount {
  const selectedCount = (draft.choiceSelections[choiceSet.id] ?? []).length
  const verb = resolveSpellChoiceCounterVerb(choiceSet, profile)
  const requiredToComplete = resolveChoiceSetRequiredToComplete(choiceSet)
  const { effectiveRequiredCount } = resolveChoiceSetAvailability(choiceSet)

  return {
    selected: selectedCount,
    max: choiceSet.max,
    label: formatChoiceChosenCounter(selectedCount, choiceSet.max, verb),
    verb,
    requiredToComplete,
    effectiveRequiredCount,
  }
}

function buildClassCantripAcquisitionCopy(
  choiceSet: ChoiceSet,
  profile: BuilderSpellcastingProfile,
): string[] {
  return spellAcquisitionCopyLines(
    formatCantripAcquisitionCopy(
      profile.className,
      choiceSet.max,
      resolveChoiceSetRequiredToComplete(choiceSet),
    ),
  )
}

export function buildClassSpellAcquisitionCopy(
  choiceSet: ChoiceSet,
  profile: BuilderSpellcastingProfile,
): string[] {
  return spellAcquisitionCopyLines(
    formatSpellAcquisitionCopy({
      spellSelection: profile.spellcasting.spellSelection,
      className: profile.className,
      max: choiceSet.max,
      requiredToComplete: resolveChoiceSetRequiredToComplete(choiceSet),
      destination: resolveSpellAcquisitionDestination(choiceSet, profile),
    }),
  )
}

export function hasEligibleOptionsAtLevel(
  choiceSets: readonly ChoiceSet[],
  level: number,
  catalogIndex: CharacterBuildCatalogIndex,
): boolean {
  return choiceSets.some((choiceSet) => optionsAtLevel(choiceSet, level, catalogIndex).length > 0)
}

function resolveCantripAggregateCount(
  classCantripChoiceSet: ChoiceSet | undefined,
  choiceBlocks: BuilderChoiceBlock[],
  draft: CharacterBuilderDraft,
  profile: BuilderSpellcastingProfile,
): BuilderChoiceAggregateCount | null {
  if (classCantripChoiceSet) {
    return buildClassAcquisitionAggregateCount(classCantripChoiceSet, draft, profile)
  }

  if (choiceBlocks.length !== 1) {
    return resolveChoiceAggregateCount(choiceBlocks)
  }

  const block = choiceBlocks[0]!
  const verb = resolveSpellChoiceCounterVerb(block.choiceSet, profile)
  return {
    selected: block.selectedCount,
    max: block.max,
    label: formatChoiceChosenCounter(block.selectedCount, block.max, verb),
    verb,
    requiredToComplete: resolveChoiceSetRequiredToComplete(block.choiceSet),
  }
}

function resolveCantripSubhead(
  subheadLines: string[] | undefined,
  singleSetSupportingCopy: ReturnType<typeof formatChoiceSingleSetSupportingCopy> | undefined,
  cantripChoiceSets: readonly ChoiceSet[],
  hasFixedGrants: boolean,
): string {
  if (subheadLines?.length) return ''

  return (
    singleSetSupportingCopy?.instruction ??
    formatChoiceCategorySubhead('cantrips', cantripChoiceSets, hasFixedGrants, 'spell')
  )
}

export function buildCantripsSection(
  choiceSets: readonly ChoiceSet[],
  draft: CharacterBuilderDraft,
  profile: BuilderSpellcastingProfile,
  catalogIndex: CharacterBuildCatalogIndex,
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
    buildChoiceBlock(choiceSet, draft, presentation, undefined, catalogIndex, profile),
  )
  const selectedRows = presentations.flatMap(({ choiceSet }) =>
    buildSelectedRows(choiceSet, draft, undefined, catalogIndex),
  )

  const classCantripChoiceSet = cantripChoiceSets.find(isClassSpellcastingChoiceSet)
  const singleSetSupportingCopy =
    presentations.length === 1 && !classCantripChoiceSet
      ? formatChoiceSingleSetSupportingCopy({
          choiceSet: presentations[0]!.choiceSet,
          heading: presentations[0]!.presentation.heading,
          headingSourceCoverage: presentations[0]!.presentation.headingSourceCoverage,
          hasFixedGrantsInCategory: grantedRows.length > 0,
          subheadStyle: 'spell',
        })
      : undefined

  const subheadLines = classCantripChoiceSet
    ? buildClassCantripAcquisitionCopy(classCantripChoiceSet, profile)
    : undefined

  return {
    id: 'cantrips',
    kind: 'cantrips',
    heading: 'Cantrips',
    subhead: resolveCantripSubhead(
      subheadLines,
      singleSetSupportingCopy,
      cantripChoiceSets,
      grantedRows.length > 0,
    ),
    subheadLines,
    identityLine: classCantripChoiceSet ? undefined : singleSetSupportingCopy?.identityLine,
    aggregateCount: resolveCantripAggregateCount(
      classCantripChoiceSet,
      choiceBlocks,
      draft,
      profile,
    ),
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

type LevelSectionBuildState = {
  level: number
  draft: CharacterBuilderDraft
  profile: BuilderSpellcastingProfile
  catalogIndex: CharacterBuildCatalogIndex
  grantedRows: BuilderChoiceGrantedRow[]
  classAcquisitionChoiceSet: ChoiceSet | undefined
  foldClassAcquisitionIntoSection: boolean
  levelChoiceSets: ChoiceSet[]
  choiceBlocks: BuilderChoiceBlock[]
  selectedRows: BuilderChoiceSelectedRow[]
  classBlockAtLevel: BuilderChoiceBlock | undefined
  featureBlocks: BuilderChoiceBlock[]
  primaryBlock: BuilderChoiceBlock | undefined
}

function filterLevelChoiceSets(
  choiceSets: readonly ChoiceSet[],
  level: number,
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
  classAcquisitionChoiceSet: ChoiceSet | undefined,
): ChoiceSet[] {
  return sortSpellChoiceSets(
    choiceSets.filter((choiceSet) => {
      if (classAcquisitionChoiceSet && choiceSet.id === classAcquisitionChoiceSet.id) {
        return true
      }
      return choiceSetVisibleAtLevel(choiceSet, level, draft, catalogIndex)
    }),
  )
}

function countFeatureChoiceSetsAtLevel(
  levelChoiceSets: readonly ChoiceSet[],
  classAcquisitionChoiceSet: ChoiceSet | undefined,
  level: number,
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
): number {
  return levelChoiceSets
    .filter(
      (choiceSet) => !classAcquisitionChoiceSet || choiceSet.id !== classAcquisitionChoiceSet.id,
    )
    .filter((choiceSet) => choiceSetVisibleAtLevel(choiceSet, level, draft, catalogIndex)).length
}

function buildLevelPresentations(
  levelChoiceSets: readonly ChoiceSet[],
  level: number,
  draft: CharacterBuilderDraft,
  profile: BuilderSpellcastingProfile,
  catalogIndex: CharacterBuildCatalogIndex,
  classAcquisitionChoiceSet: ChoiceSet | undefined,
  foldClassAcquisitionIntoSection: boolean,
  featureCountAtLevel: number,
) {
  return levelChoiceSets.map((choiceSet) => {
    const presentation = resolveSpellChoicePresentation(choiceSet, profile.className)
    const isSliceEmptyClassBlock =
      classAcquisitionChoiceSet &&
      choiceSet.id === classAcquisitionChoiceSet.id &&
      !foldClassAcquisitionIntoSection &&
      featureCountAtLevel > 0 &&
      optionsAtLevel(choiceSet, level, catalogIndex).length === 0 &&
      selectedIdsAtLevel(choiceSet, draft, level, catalogIndex).length === 0

    return {
      choiceSet,
      presentation: isSliceEmptyClassBlock
        ? { ...presentation, heading: `${profile.className} Spells` }
        : presentation,
    }
  })
}

function resolvePrimarySpellLevelBlock(
  foldClassAcquisitionIntoSection: boolean,
  classBlockAtLevel: BuilderChoiceBlock | undefined,
  featureBlocks: BuilderChoiceBlock[],
): BuilderChoiceBlock | undefined {
  if (foldClassAcquisitionIntoSection && classBlockAtLevel) {
    return classBlockAtLevel
  }
  if (featureBlocks.length === 1) {
    return featureBlocks[0]
  }
  if (classBlockAtLevel && featureBlocks.length === 0) {
    return classBlockAtLevel
  }
  return undefined
}

function resolveFeatureBlockAggregateCount(
  primaryBlock: BuilderChoiceBlock,
  profile: BuilderSpellcastingProfile,
): BuilderChoiceAggregateCount {
  const selected = primaryBlock.displayCount?.selected ?? primaryBlock.selectedCount
  const max = primaryBlock.displayCount?.max ?? primaryBlock.max
  const verb = resolveSpellChoiceCounterVerb(primaryBlock.choiceSet, profile)

  return {
    selected,
    max,
    label: formatChoiceChosenCounter(selected, max, verb),
    verb,
    requiredToComplete: resolveChoiceSetRequiredToComplete(primaryBlock.choiceSet),
    effectiveRequiredCount: resolveChoiceSetAvailability(primaryBlock.choiceSet)
      .effectiveRequiredCount,
  }
}

function resolveSpellLevelAggregateCount(
  state: LevelSectionBuildState,
): BuilderChoiceAggregateCount | null {
  if (state.foldClassAcquisitionIntoSection && state.classAcquisitionChoiceSet) {
    return buildClassAcquisitionAggregateCount(
      state.classAcquisitionChoiceSet,
      state.draft,
      state.profile,
    )
  }

  if (
    state.primaryBlock &&
    state.featureBlocks.length === 0 &&
    !state.foldClassAcquisitionIntoSection &&
    state.primaryBlock === state.classBlockAtLevel
  ) {
    return null
  }

  if (state.primaryBlock && state.featureBlocks.length === 1 && !state.classBlockAtLevel) {
    return resolveFeatureBlockAggregateCount(state.primaryBlock, state.profile)
  }

  return null
}

function resolveLevelSliceEmptyMessage(
  level: number,
  choiceSets: readonly ChoiceSet[],
  choiceBlocks: readonly BuilderChoiceBlock[],
  grantedRows: readonly BuilderChoiceGrantedRow[],
  catalogIndex: CharacterBuildCatalogIndex,
): string | undefined {
  const hasEligibleAtLevel = hasEligibleOptionsAtLevel(choiceSets, level, catalogIndex)
  const hasInteractiveBlocks = choiceBlocks.some((block) => block.isInteractive !== false)

  if (hasEligibleAtLevel || hasInteractiveBlocks || grantedRows.length > 0) {
    return undefined
  }

  return `No ${formatSpellLevel(level).toLowerCase()}-level spells are currently available for this class.`
}

function shouldShowLevelChoiceBlock(
  block: BuilderChoiceBlock,
  classAcquisitionChoiceSet: ChoiceSet | undefined,
  featureBlocks: readonly BuilderChoiceBlock[],
): boolean {
  if (!classAcquisitionChoiceSet || block.choiceSet.id !== classAcquisitionChoiceSet.id) {
    return true
  }

  if (block.isInteractive !== false) {
    return true
  }

  if (featureBlocks.some((featureBlock) => featureBlock.isInteractive !== false)) {
    return true
  }

  return featureBlocks.length > 0
}

function resolveVisibleLevelChoiceBlocks(
  choiceBlocks: readonly BuilderChoiceBlock[],
  levelSliceEmptyMessage: string | undefined,
  classAcquisitionChoiceSet: ChoiceSet | undefined,
  featureBlocks: readonly BuilderChoiceBlock[],
): BuilderChoiceBlock[] {
  if (levelSliceEmptyMessage !== undefined) return []

  return choiceBlocks.filter((block) =>
    shouldShowLevelChoiceBlock(block, classAcquisitionChoiceSet, featureBlocks),
  )
}

function resolveLevelSectionSubheadPresentation(
  levelSliceEmptyMessage: string | undefined,
  state: LevelSectionBuildState,
  subheadLines: string[] | undefined,
  singleSetSupportingCopy: ReturnType<typeof formatChoiceSingleSetSupportingCopy> | undefined,
): { subhead: string; subheadLines: string[] | undefined } {
  if (levelSliceEmptyMessage !== undefined) {
    return { subhead: '', subheadLines: undefined }
  }

  return {
    subhead: resolveSpellLevelSubhead(state, subheadLines, singleSetSupportingCopy),
    subheadLines,
  }
}

function resolveLevelSectionIdentityLine(
  levelSliceEmptyMessage: string | undefined,
  foldClassAcquisitionIntoSection: boolean,
  state: LevelSectionBuildState,
  singleSetSupportingCopy: ReturnType<typeof formatChoiceSingleSetSupportingCopy> | undefined,
): string | undefined {
  if (levelSliceEmptyMessage !== undefined) return undefined
  if (foldClassAcquisitionIntoSection && state.classBlockAtLevel) return undefined
  return singleSetSupportingCopy?.identityLine
}

function resolveSpellLevelSubhead(
  state: LevelSectionBuildState,
  subheadLines: string[] | undefined,
  singleSetSupportingCopy: ReturnType<typeof formatChoiceSingleSetSupportingCopy> | undefined,
): string {
  if (subheadLines?.length) return ''

  if (singleSetSupportingCopy?.instruction) {
    return singleSetSupportingCopy.instruction
  }

  if (state.featureBlocks.length > 1) {
    return formatChoiceCategorySubhead(
      'spells',
      state.levelChoiceSets,
      state.grantedRows.length > 0,
      'spell',
    )
  }

  if (state.classBlockAtLevel) return ''

  return formatChoiceCategorySubhead(
    'spells',
    state.levelChoiceSets,
    state.grantedRows.length > 0,
    'spell',
  )
}

function createLevelSectionBuildState(
  level: number,
  choiceSets: readonly ChoiceSet[],
  draft: CharacterBuilderDraft,
  profile: BuilderSpellcastingProfile,
  catalogIndex: CharacterBuildCatalogIndex,
  grantedRows: BuilderChoiceGrantedRow[],
  classAcquisitionChoiceSet: ChoiceSet | undefined,
  foldClassAcquisitionIntoSection: boolean,
): LevelSectionBuildState {
  const levelChoiceSets = filterLevelChoiceSets(
    choiceSets,
    level,
    draft,
    catalogIndex,
    classAcquisitionChoiceSet,
  )
  const featureCountAtLevel = countFeatureChoiceSetsAtLevel(
    levelChoiceSets,
    classAcquisitionChoiceSet,
    level,
    draft,
    catalogIndex,
  )
  const presentations = buildLevelPresentations(
    levelChoiceSets,
    level,
    draft,
    profile,
    catalogIndex,
    classAcquisitionChoiceSet,
    foldClassAcquisitionIntoSection,
    featureCountAtLevel,
  )
  const choiceBlocks = presentations.map(({ choiceSet, presentation }) =>
    buildChoiceBlock(choiceSet, draft, presentation, level, catalogIndex, profile),
  )
  const selectedRows = presentations.flatMap(({ choiceSet }) =>
    buildSelectedRows(choiceSet, draft, level, catalogIndex),
  )
  const classBlockAtLevel = classAcquisitionChoiceSet
    ? choiceBlocks.find((block) => block.choiceSet.id === classAcquisitionChoiceSet.id)
    : undefined
  const featureBlocks = choiceBlocks.filter(
    (block) => !classAcquisitionChoiceSet || block.choiceSet.id !== classAcquisitionChoiceSet.id,
  )
  const primaryBlock = resolvePrimarySpellLevelBlock(
    foldClassAcquisitionIntoSection,
    classBlockAtLevel,
    featureBlocks,
  )

  return {
    level,
    draft,
    profile,
    catalogIndex,
    grantedRows,
    classAcquisitionChoiceSet,
    foldClassAcquisitionIntoSection,
    levelChoiceSets,
    choiceBlocks,
    selectedRows,
    classBlockAtLevel,
    featureBlocks,
    primaryBlock,
  }
}

export function buildSpellLevelSection(
  level: number,
  choiceSets: readonly ChoiceSet[],
  draft: CharacterBuilderDraft,
  profile: BuilderSpellcastingProfile,
  catalogIndex: CharacterBuildCatalogIndex,
  grantedRows: BuilderChoiceGrantedRow[],
  classAcquisitionChoiceSet: ChoiceSet | undefined,
  foldClassAcquisitionIntoSection: boolean,
): SpellInteractiveSection {
  const state = createLevelSectionBuildState(
    level,
    choiceSets,
    draft,
    profile,
    catalogIndex,
    grantedRows,
    classAcquisitionChoiceSet,
    foldClassAcquisitionIntoSection,
  )

  const singleSetSupportingCopy =
    state.primaryBlock &&
    !(state.foldClassAcquisitionIntoSection && state.classBlockAtLevel === state.primaryBlock)
      ? formatChoiceSingleSetSupportingCopy({
          choiceSet: {
            ...state.primaryBlock.choiceSet,
            options: optionsAtLevel(state.primaryBlock.choiceSet, level, catalogIndex),
          },
          heading: resolveSpellChoicePresentation(state.primaryBlock.choiceSet, profile.className)
            .heading,
          headingSourceCoverage: resolveSpellChoicePresentation(
            state.primaryBlock.choiceSet,
            profile.className,
          ).headingSourceCoverage,
          hasFixedGrantsInCategory: grantedRows.length > 0,
          subheadStyle: 'spell',
          spellLevel: level,
        })
      : undefined

  const subheadLines =
    foldClassAcquisitionIntoSection && classAcquisitionChoiceSet
      ? buildClassSpellAcquisitionCopy(classAcquisitionChoiceSet, profile)
      : undefined

  const levelSliceEmptyMessage = resolveLevelSliceEmptyMessage(
    level,
    choiceSets,
    state.choiceBlocks,
    grantedRows,
    catalogIndex,
  )
  const visibleChoiceBlocks = resolveVisibleLevelChoiceBlocks(
    state.choiceBlocks,
    levelSliceEmptyMessage,
    classAcquisitionChoiceSet,
    state.featureBlocks,
  )
  const { subhead, subheadLines: resolvedSubheadLines } = resolveLevelSectionSubheadPresentation(
    levelSliceEmptyMessage,
    state,
    subheadLines,
    singleSetSupportingCopy,
  )

  return {
    id: `spell-level-${level}`,
    kind: 'spellLevel',
    spellLevel: level,
    heading: `${formatSpellLevel(level)}-Level Spells`,
    subhead,
    subheadLines: resolvedSubheadLines,
    identityLine: resolveLevelSectionIdentityLine(
      levelSliceEmptyMessage,
      foldClassAcquisitionIntoSection,
      state,
      singleSetSupportingCopy,
    ),
    aggregateCount: resolveSpellLevelAggregateCount(state),
    levelSliceEmptyMessage,
    selectedRows:
      visibleChoiceBlocks.length > 0
        ? state.selectedRows.filter((row) =>
            visibleChoiceBlocks.some((block) => block.choiceSet.id === row.choiceSetId),
          )
        : [],
    grantedRows,
    choiceBlocks: visibleChoiceBlocks,
    emptyMessage: formatChoiceSectionEmptyMessage(
      'spell',
      'spells',
      grantedRows.length > 0,
      'spell',
    ),
    isOverSelected: visibleChoiceBlocks.some((block) => block.isOverSelected),
  }
}

export function buildDeferredPreparedSection(
  choiceSet: ChoiceSet,
  draft: CharacterBuilderDraft,
  profile: BuilderSpellcastingProfile,
  catalogIndex: CharacterBuildCatalogIndex,
): SpellInteractiveSection {
  const presentation = resolveSpellChoicePresentation(choiceSet, profile.className)
  const choiceBlock = buildChoiceBlock(
    choiceSet,
    draft,
    presentation,
    undefined,
    catalogIndex,
    profile,
  )
  const selectedRows = buildSelectedRows(choiceSet, draft, undefined, catalogIndex)
  const acquisitionCopy = formatSpellAcquisitionCopy({
    spellSelection: profile.spellcasting.spellSelection,
    className: profile.className,
    max: choiceSet.max,
    requiredToComplete: resolveChoiceSetRequiredToComplete(choiceSet),
    destination: 'deferredPrepared',
  })

  return {
    id: choiceSet.id,
    kind: 'deferredPrepared',
    heading: presentation.heading,
    subhead: '',
    subheadLines: spellAcquisitionCopyLines(acquisitionCopy),
    identityLine: undefined,
    aggregateCount: buildClassAcquisitionAggregateCount(choiceSet, draft, profile),
    selectedRows,
    grantedRows: [],
    choiceBlocks: [choiceBlock],
    emptyMessage: formatChoiceSectionEmptyMessage('spell', 'spells', false, 'spell'),
    isOverSelected: choiceBlock.isOverSelected,
  }
}
