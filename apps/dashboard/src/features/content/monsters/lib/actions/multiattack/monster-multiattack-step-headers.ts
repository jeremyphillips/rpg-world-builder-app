import {
  createSpellCatalogContext,
  formatSpellCastAtLevelName,
  isMultiattackAttackGroup,
  isMultiattackUseClause,
  joinNaturalList,
  MONSTER_ACTION_UNRESOLVED_REFERENCE,
  multiattackPositiveInt,
  presentSpellReferenceDisplayName,
  resolveSpellReferenceOutcome,
  type MultiattackAttackGroup,
  type MultiattackUseChoice,
  type MultiattackUseSingle,
} from '@rpg/contracts'

import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import {
  MONSTER_MULTIATTACK_ATTACK_GROUP_LABEL,
  MONSTER_MULTIATTACK_CHOOSE_AN_ACTION_LABEL,
  MONSTER_MULTIATTACK_CHOOSE_ATTACKS_LABEL,
  MONSTER_MULTIATTACK_CHOOSE_BETWEEN_ACTIONS_LABEL,
  MONSTER_MULTIATTACK_IN_ANY_COMBINATION_LABEL,
  multiattackStepAttackCountLabel,
  multiattackStepUseRepetitionSuffix,
  multiattackUseOneOfActionsLabel,
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

function spellName(spellId: string | undefined, ctx: ContentFormCtx): string | undefined {
  if (!spellId?.trim()) return undefined
  const catalog = createSpellCatalogContext({
    status: ctx.spellCatalogStatus ?? 'pending',
    spellsById: ctx.spellCatalogById,
  })
  const outcome = resolveSpellReferenceOutcome(spellId, catalog)
  if (outcome.status !== 'resolved') {
    return undefined
  }
  return formatSpellCastAtLevelName({
    name: outcome.spell.name,
    castAtLevel: undefined,
    spellLevel: outcome.spell.level,
  })
}

function spellNameForProse(spellId: string | undefined, ctx: ContentFormCtx): string | undefined {
  if (!spellId?.trim()) return undefined
  const catalog = createSpellCatalogContext({
    status: ctx.spellCatalogStatus ?? 'pending',
    spellsById: ctx.spellCatalogById,
  })
  const outcome = resolveSpellReferenceOutcome(spellId, catalog)
  if (outcome.status === 'resolved') {
    return formatSpellCastAtLevelName({
      name: outcome.spell.name,
      castAtLevel: undefined,
      spellLevel: outcome.spell.level,
    })
  }
  return presentSpellReferenceDisplayName(outcome)
}

function attackGroupPrimary(step: MultiattackAttackGroup): string {
  const count = multiattackPositiveInt(step.count)
  if (count === undefined) return MONSTER_MULTIATTACK_ATTACK_GROUP_LABEL
  return multiattackStepAttackCountLabel(count)
}

function attackIds(step: MultiattackAttackGroup): string[] {
  return Array.isArray(step.actionIds)
    ? step.actionIds.filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
    : []
}

function attackGroupSummary(
  step: MultiattackAttackGroup,
  titles: Map<string, string>,
): string | undefined {
  const ids = attackIds(step)
  if (ids.length === 0) return MONSTER_MULTIATTACK_CHOOSE_ATTACKS_LABEL
  const names = ids.map((id) => resolveName(id, titles) ?? MONSTER_ACTION_UNRESOLVED_REFERENCE)
  const list = joinNaturalList(names, { conjunction: 'or' })
  const count = multiattackPositiveInt(step.count)
  if (names.length > 1 && count !== undefined && count > 1) {
    return `${list}, ${MONSTER_MULTIATTACK_IN_ANY_COMBINATION_LABEL}`
  }
  return list
}

function formatMultiattackUseOperation(
  step: Pick<MultiattackUseSingle, 'optional' | 'count'>,
  name: string,
): string {
  const prefix = step.optional === true ? 'Can use' : 'Use'
  const suffix = multiattackStepUseRepetitionSuffix(step.count)
  return suffix ? `${prefix} ${name} ${suffix}` : `${prefix} ${name}`
}

function singleUsePrimary(
  step: MultiattackUseSingle,
  titles: Map<string, string>,
  ctx: ContentFormCtx,
): string {
  const name = resolveName(typeof step.actionId === 'string' ? step.actionId : undefined, titles)
  if (!name) return MONSTER_MULTIATTACK_CHOOSE_AN_ACTION_LABEL
  const spellId = typeof step.spellId === 'string' ? step.spellId : undefined
  const spell = spellNameForProse(spellId, ctx)
  if (spell) {
    const verb = step.optional === true ? 'Can cast' : 'Cast'
    const suffix = multiattackStepUseRepetitionSuffix(step.count)
    return suffix ? `${verb} ${spell} ${suffix}` : `${verb} ${spell}`
  }
  return formatMultiattackUseOperation(step, name)
}

function singleUseSummary(
  step: MultiattackUseSingle,
  titles: Map<string, string>,
  ctx: ContentFormCtx,
): string | undefined {
  const name = resolveName(typeof step.actionId === 'string' ? step.actionId : undefined, titles)
  if (!name) return undefined
  const spellId = typeof step.spellId === 'string' ? step.spellId : undefined
  if (!spellId?.trim()) return undefined
  const spell = spellName(spellId, ctx)
  if (!spell) return MONSTER_ACTION_UNRESOLVED_REFERENCE
  return name
}

function choicePhrase(
  row: unknown,
  titles: Map<string, string>,
  ctx: ContentFormCtx,
): string | undefined {
  if (row === null || typeof row !== 'object') return undefined
  const record = row as { actionId?: unknown; spellId?: unknown }
  const actionId = typeof record.actionId === 'string' ? record.actionId : undefined
  const name = resolveName(actionId, titles)
  if (!name) return undefined
  const spellId = typeof record.spellId === 'string' ? record.spellId : undefined
  if (!spellId?.trim()) return name
  const spell = spellNameForProse(spellId, ctx)
  return `${name} to cast ${spell ?? MONSTER_ACTION_UNRESOLVED_REFERENCE}`
}

function choicePhrases(
  step: MultiattackUseChoice,
  titles: Map<string, string>,
  ctx: ContentFormCtx,
): string[] {
  const choices = Array.isArray(step.choices) ? step.choices : []
  return choices.flatMap((row) => {
    const phrase = choicePhrase(row, titles, ctx)
    return phrase ? [phrase] : []
  })
}

function choiceUsePrimary(phrases: readonly string[]): string {
  if (phrases.length >= 2 && phrases.length <= 3) {
    return `Use ${joinNaturalList(phrases, { conjunction: 'or' })}`
  }
  if (phrases.length > 3) return multiattackUseOneOfActionsLabel(phrases.length)
  return MONSTER_MULTIATTACK_CHOOSE_BETWEEN_ACTIONS_LABEL
}

function choiceUseSummary(phrases: readonly string[]): string | undefined {
  if (phrases.length === 0) return MONSTER_MULTIATTACK_CHOOSE_AN_ACTION_LABEL
  if (phrases.length === 1) return phrases[0]
  if (phrases.length > 3) return joinNaturalList(phrases, { conjunction: 'or' })
  return undefined
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
  if (isMultiattackAttackGroup(step)) return attackGroupPrimary(step)
  if (!isMultiattackUseClause(step)) return MONSTER_MULTIATTACK_ATTACK_GROUP_LABEL
  const useStep = step
  const rows = sectionRowsFromWatched(watched, input.section, input.fallbackRows)
  const titles = monsterActionEditorTitles(
    rows,
    formValuesFromWatched(watched),
    input.ctx,
    input.section,
  )
  if (useStep.mode === 'choice') {
    return choiceUsePrimary(choicePhrases(useStep, titles, input.ctx))
  }
  return singleUsePrimary(useStep, titles, input.ctx)
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
    return attackGroupSummary(step, titles)
  }
  if (!isMultiattackUseClause(step)) return undefined
  const useStep = step
  const rows = sectionRowsFromWatched(watched, input.section, input.fallbackRows)
  const titles = monsterActionEditorTitles(
    rows,
    formValuesFromWatched(watched),
    input.ctx,
    input.section,
  )
  if (useStep.mode === 'choice') {
    return choiceUseSummary(choicePhrases(useStep, titles, input.ctx))
  }
  return singleUseSummary(useStep, titles, input.ctx)
}
