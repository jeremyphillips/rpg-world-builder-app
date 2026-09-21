import type { CharacterClass } from '../../../../content/classes/class'
import { formatSpellLevel } from '../../../../content/spell/levels'
import { CLASS_SPELLCASTING_CHOICE_SUFFIXES } from '../../../../content/classes/spellcasting'
import { formatGrantCardSelectionSourceLabel } from '../../../character/format-selection-source-label'
import type { CharacterBuildPreview } from '../../preview/preview'
import type { ChoiceSet } from '../../choice-set'
import type { CharacterBuildContext } from '../../context'
import { indexCharacterBuildCatalog } from '../../context'
import type { CharacterBuilderDraft } from '../../draft/draft'
import { getChoiceSetStepId } from '../../steps'
import type {
  BuilderChoiceAggregateCount,
  BuilderChoiceGrantedRow,
  BuilderChoiceSectionModel,
  BuilderFactSummaryRow,
} from '../../builder-choice-section-model'
import { assembleGrantedSpells } from '../../assembly/assemble-granted-spells'
import type { ChoiceCounterVerb } from '../../format-spell-acquisition-copy'
import { isChoiceSetBuilderComplete } from '../../resolve-choice-set-availability'
import { getAbilityLabel } from '../../../../vocab/ability'
import type { BuilderSpellcastingProfile } from './builder-spellcasting'
import { spellcastingChoiceSetId } from './resolve-spellcasting-choice-sets'
import {
  findClassSpellAcquisitionChoiceSet,
  resolveSpellChoiceCounterVerb,
} from './resolve-spell-choice-counter-verb'
import { lookupSpellInCatalogIndex } from './lookup-spell-in-catalog-index'
import {
  buildCantripsSection,
  buildClassAcquisitionAggregateCount,
  buildClassSpellAcquisitionCopy,
  buildDeferredPreparedSection,
  buildSpellLevelSection,
  hasEligibleOptionsAtLevel,
  selectedIdsAtLevel,
} from './resolve-spell-step-sections'

export { SPELLS_STALE_REASON, SPELL_LEVEL_SLICE_EMPTY_MESSAGE } from './resolve-spell-step-sections'
export const SPELLS_STEP_PENDING_ABILITY_LABEL = 'Calculated after ability scores' as const

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

export type SpellAcquisitionHeader = {
  heading: string
  subheadLines: string[]
  aggregateCount: BuilderChoiceAggregateCount
  counterVerb: ChoiceCounterVerb
}

export type SpellStepModel = {
  summaryRows: BuilderFactSummaryRow[]
  cantripsSection: SpellInteractiveSection | null
  acquisitionHeader: SpellAcquisitionHeader | null
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
        sourceLabel: formatGrantCardSelectionSourceLabel(entry.sources ?? [], catalogIndex),
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

function buildSummaryRows(
  profile: BuilderSpellcastingProfile,
  preview: Pick<CharacterBuildPreview, 'spellcasting'> | null,
): BuilderFactSummaryRow[] {
  const spellcasting = preview?.spellcasting
  const pending = SPELLS_STEP_PENDING_ABILITY_LABEL

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
      value: spellcasting?.saveDc !== undefined ? String(spellcasting.saveDc) : undefined,
      unsetText: spellcasting?.saveDc === undefined ? pending : undefined,
      icon: 'spell-save-dc',
    },
    {
      id: 'attack',
      label: 'Spell attack modifier',
      value:
        spellcasting?.attackBonus !== undefined
          ? spellcasting.attackBonus >= 0
            ? `+${spellcasting.attackBonus}`
            : String(spellcasting.attackBonus)
          : undefined,
      unsetText: spellcasting?.attackBonus === undefined ? pending : undefined,
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

function formatSpellLevelTabActivityLabel(
  selectedAtLevel: number,
  hasEligibleOptions: boolean,
): string {
  if (!hasEligibleOptions) return 'No options'
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
    const hasEligibleOptions = hasEligibleOptionsAtLevel(acquisitionChoiceSets, level, catalogIndex)
    return {
      level,
      selectedAtLevel,
      activityLabel: formatSpellLevelTabActivityLabel(selectedAtLevel, hasEligibleOptions),
    }
  })
}

function buildAcquisitionHeader(
  classAcquisitionChoiceSet: ChoiceSet,
  draft: CharacterBuilderDraft,
  profile: BuilderSpellcastingProfile,
  minLevel: number,
  maxLevel: number,
): SpellAcquisitionHeader {
  const heading =
    minLevel === maxLevel
      ? `${formatSpellLevel(minLevel)}-Level Spells`
      : `${formatSpellLevel(minLevel)}–${formatSpellLevel(maxLevel)}-Level Spells`

  return {
    heading,
    subheadLines: buildClassSpellAcquisitionCopy(classAcquisitionChoiceSet, profile),
    aggregateCount: buildClassAcquisitionAggregateCount(classAcquisitionChoiceSet, draft, profile),
    counterVerb: resolveSpellChoiceCounterVerb(classAcquisitionChoiceSet, profile),
  }
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
  const classAcquisitionChoiceSet = findClassSpellAcquisitionChoiceSet(
    acquisitionChoiceSets,
    profile,
  )
  const foldClassAcquisitionIntoSection = maxSelectableSpellLevel === 1

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
      classAcquisitionChoiceSet,
      foldClassAcquisitionIntoSection,
    )
  })

  const levelTabs = buildLevelTabs(
    maxSelectableSpellLevel,
    acquisitionChoiceSets,
    draft,
    catalogIndex,
  )

  const acquisitionHeader =
    !foldClassAcquisitionIntoSection && classAcquisitionChoiceSet
      ? buildAcquisitionHeader(
          classAcquisitionChoiceSet,
          draft,
          profile,
          1,
          maxSelectableSpellLevel,
        )
      : null

  const deferredPreparedSection = deferredPrepared
    ? buildDeferredPreparedSection(deferredPrepared, draft, profile, catalogIndex)
    : null

  const hasPendingChoices = spellsChoiceSets.some(
    (choiceSet) =>
      choiceSet.required &&
      !isChoiceSetBuilderComplete(choiceSet, draft.choiceSelections[choiceSet.id] ?? []),
  )

  return {
    summaryRows: buildSummaryRows(profile, preview),
    cantripsSection,
    acquisitionHeader,
    levelTabs,
    spellLevelSections,
    deferredPreparedSection,
    maxSelectableSpellLevel,
    hasPendingChoices,
  }
}
