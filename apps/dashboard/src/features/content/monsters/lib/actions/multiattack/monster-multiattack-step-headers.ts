import {
  formatSpellCastAtLevelName,
  isMultiattackAttackGroup,
  isMultiattackUseClause,
  joinInlineMetadata,
  MONSTER_ACTION_UNRESOLVED_REFERENCE,
  multiattackPositiveInt,
  type MultiattackDraftStep,
  type Spell,
} from '@rpg/contracts'

import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import {
  MONSTER_MULTIATTACK_ANY_COMBINATION_LABEL,
  MONSTER_MULTIATTACK_CHOOSE_AN_ACTION_LABEL,
  MONSTER_MULTIATTACK_CHOOSE_ATTACKS_LABEL,
  MONSTER_MULTIATTACK_CHOOSE_BETWEEN_ACTIONS_LABEL,
  MONSTER_MULTIATTACK_MAKE_ATTACKS_LABEL,
  multiattackStepAttackCountLabel,
  multiattackStepUseRepetitionSuffix,
} from '../../monster-form-labels'
import type { MonsterActionSection } from '../references/monster-action-equipment-references'
import { monsterActionEditorTitles } from '../monster-action-editor-title'
import type { MonsterActionDraftRow } from '../monster-action-presets'
import type { MonsterFormValues } from '../../monster-form-values'
import { multiattackRowsWithFallback } from './monster-multiattack-form-options'
import { multiattackStepScopeSectionRowsDependsOn } from './monster-multiattack-form-options'

export const MULTIATTACK_STEP_HEADER_DEPENDS_ON = [
  '../../../../actions',
  '../../../../equipment',
  '../../../../bonusActions',
] as const

const SECTION_ROWS_WATCH_KEY = '../../../../actions' as const

function sectionRowsFromWatched(
  watched: Record<string, unknown> | undefined,
  section: MonsterActionSection,
  fallbackRows: readonly MonsterActionDraftRow[],
): MonsterActionDraftRow[] {
  const rootActions = watched?.[SECTION_ROWS_WATCH_KEY]
  if (Array.isArray(rootActions) && rootActions.length > 0) {
    return rootActions as MonsterActionDraftRow[]
  }
  const key = multiattackStepScopeSectionRowsDependsOn(section)
  return multiattackRowsWithFallback(watched ?? {}, key, fallbackRows)
}

function formValuesFromWatched(watched: Record<string, unknown> | undefined): MonsterFormValues {
  return {
    actions: watched?.['../../../../actions'],
    equipment: watched?.['../../../../equipment'],
    bonusActions: watched?.['../../../../bonusActions'],
  } as MonsterFormValues
}

function resolveName(
  actionId: string | undefined,
  titles: Map<string, string>,
): string | undefined {
  if (!actionId?.trim()) return undefined
  return titles.get(actionId) ?? MONSTER_ACTION_UNRESOLVED_REFERENCE
}

function spellName(
  spellId: string | undefined,
  spellCatalogById: ReadonlyMap<string, Spell> | undefined,
): string | undefined {
  if (!spellId?.trim()) return undefined
  const catalogSpell = spellCatalogById?.get(spellId)
  if (!catalogSpell?.name) return undefined
  return formatSpellCastAtLevelName({
    name: catalogSpell.name,
    castAtLevel: undefined,
    spellLevel: catalogSpell.level,
  })
}

function attackGroupPrimary(step: MultiattackDraftStep): string {
  const count = multiattackPositiveInt(step.count)
  if (count === undefined) return MONSTER_MULTIATTACK_MAKE_ATTACKS_LABEL
  return multiattackStepAttackCountLabel(count)
}

function attackGroupSummary(
  step: MultiattackDraftStep,
  titles: Map<string, string>,
): string | undefined {
  const ids = Array.isArray(step.actionIds)
    ? step.actionIds.filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
    : []
  if (ids.length === 0) return MONSTER_MULTIATTACK_CHOOSE_ATTACKS_LABEL
  const names = ids.map((id) => resolveName(id, titles) ?? MONSTER_ACTION_UNRESOLVED_REFERENCE)
  const count = multiattackPositiveInt(step.count)
  if (ids.length > 1 && count !== undefined && count > 1) {
    return joinInlineMetadata([...names, MONSTER_MULTIATTACK_ANY_COMBINATION_LABEL])
  }
  return joinInlineMetadata(names)
}

function singleUsePrimary(step: MultiattackDraftStep, titles: Map<string, string>): string {
  const name = resolveName(typeof step.actionId === 'string' ? step.actionId : undefined, titles)
  if (!name) return MONSTER_MULTIATTACK_CHOOSE_AN_ACTION_LABEL
  const prefix = step.optional === true ? 'Can use' : 'Use'
  let title = `${prefix} ${name}`
  const suffix = multiattackStepUseRepetitionSuffix(step.count)
  if (suffix) title = joinInlineMetadata([title, suffix])
  return title
}

function singleUseSummary(
  step: MultiattackDraftStep,
  titles: Map<string, string>,
  ctx: ContentFormCtx,
): string | undefined {
  const name = resolveName(typeof step.actionId === 'string' ? step.actionId : undefined, titles)
  if (!name) return undefined
  const spell = spellName(
    typeof step.spellId === 'string' ? step.spellId : undefined,
    ctx.spellCatalogById,
  )
  return spell ? joinInlineMetadata([name, spell]) : name
}

function choiceUsePrimary(): string {
  return MONSTER_MULTIATTACK_CHOOSE_BETWEEN_ACTIONS_LABEL
}

function choiceUseSummary(
  step: MultiattackDraftStep,
  titles: Map<string, string>,
  ctx: ContentFormCtx,
): string | undefined {
  const choices = Array.isArray(step.choices) ? step.choices : []
  if (choices.length === 0) return MONSTER_MULTIATTACK_CHOOSE_AN_ACTION_LABEL
  const segments = choices.flatMap((row) => {
    if (row === null || typeof row !== 'object') return []
    const actionId = typeof row.actionId === 'string' ? row.actionId : undefined
    const name = resolveName(actionId, titles)
    if (!name) return []
    const spell = spellName(
      typeof row.spellId === 'string' ? row.spellId : undefined,
      ctx.spellCatalogById,
    )
    return [spell ? joinInlineMetadata([name, spell]) : name]
  })
  if (segments.length === 0) return MONSTER_MULTIATTACK_CHOOSE_AN_ACTION_LABEL
  return joinInlineMetadata(segments)
}

export function multiattackStepHeaderPrimary(
  step: Record<string, unknown>,
  _index: number,
  watched: Record<string, unknown> | undefined,
  input: {
    section: MonsterActionSection
    fallbackRows: readonly MonsterActionDraftRow[]
    ctx: ContentFormCtx
  },
): string | undefined {
  if (isMultiattackAttackGroup(step)) return attackGroupPrimary(step as MultiattackDraftStep)
  if (!isMultiattackUseClause(step)) return MONSTER_MULTIATTACK_MAKE_ATTACKS_LABEL
  const useStep = step as MultiattackDraftStep
  if (useStep.mode === 'choice' || (Array.isArray(useStep.choices) && useStep.choices.length > 0)) {
    return choiceUsePrimary()
  }
  const rows = sectionRowsFromWatched(watched, input.section, input.fallbackRows)
  const titles = monsterActionEditorTitles(
    rows,
    formValuesFromWatched(watched),
    input.ctx,
    input.section,
  )
  return singleUsePrimary(useStep, titles)
}

export function multiattackStepHeaderSummary(
  step: Record<string, unknown>,
  _index: number,
  watched: Record<string, unknown> | undefined,
  input: {
    section: MonsterActionSection
    fallbackRows: readonly MonsterActionDraftRow[]
    ctx: ContentFormCtx
  },
): string | undefined {
  if (isMultiattackAttackGroup(step)) {
    const rows = sectionRowsFromWatched(watched, input.section, input.fallbackRows)
    const titles = monsterActionEditorTitles(
      rows,
      formValuesFromWatched(watched),
      input.ctx,
      input.section,
    )
    return attackGroupSummary(step as MultiattackDraftStep, titles)
  }
  if (!isMultiattackUseClause(step)) return undefined
  const useStep = step as MultiattackDraftStep
  const rows = sectionRowsFromWatched(watched, input.section, input.fallbackRows)
  const titles = monsterActionEditorTitles(
    rows,
    formValuesFromWatched(watched),
    input.ctx,
    input.section,
  )
  if (useStep.mode === 'choice' || (Array.isArray(useStep.choices) && useStep.choices.length > 0)) {
    return choiceUseSummary(useStep, titles, input.ctx)
  }
  return singleUseSummary(useStep, titles, input.ctx)
}
