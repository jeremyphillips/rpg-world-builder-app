import {
  classifyMultiattackReplacementChoice,
  formatSpellCastAtLevelName,
  isMultiattackAttackGroup,
  meaningfulMultiattackTargetActionIds,
  multiattackReplacementChoiceKey,
  multiattackRowEligibleForPurpose,
  multiattackSequenceAttackIds,
  siblingMultiattackReplacementChoiceKeys,
  unionPersistedOptions,
  type MultiattackDraftStep,
  type MultiattackReplacement,
  type MultiattackReplacementChoiceRef,
  type Spell,
} from '@rpg/contracts'

import {
  MONSTER_MULTIATTACK_ATTACKS_LABEL,
  MONSTER_MULTIATTACK_SEQUENCE_LABEL,
} from '../../monster-form-labels'
import type { MonsterActionDraftRow } from '../monster-action-presets'
import { monsterActionEditorTitles } from '../monster-action-editor-title'
import type { MonsterFormValues } from '../../monster-form-values'
import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'

type Option = { value: string; label: string }

export function multiattackExecutableAttackOptions(
  rows: readonly MonsterActionDraftRow[],
  multiattackId: string,
  values: MonsterFormValues,
  ctx: ContentFormCtx,
): Option[] {
  const titles = monsterActionEditorTitles(rows, values, ctx, 'actions')
  return rows
    .filter((row) => multiattackRowEligibleForPurpose(row, 'executable-attack', { multiattackId }))
    .map((row) => ({ value: row.id, label: titles.get(row.id) ?? row.id }))
}

export function multiattackExecutableUseOptions(
  rows: readonly MonsterActionDraftRow[],
  multiattackId: string,
  values: MonsterFormValues,
  ctx: ContentFormCtx,
): Option[] {
  const titles = monsterActionEditorTitles(rows, values, ctx, 'actions')
  return rows
    .filter((row) => multiattackRowEligibleForPurpose(row, 'executable-use', { multiattackId }))
    .map((row) => ({ value: row.id, label: titles.get(row.id) ?? row.id }))
}

function parseReplacementChoiceRows(value: unknown): MultiattackReplacementChoiceRef[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((entry) => {
    if (entry === null || typeof entry !== 'object') return []
    const row = entry as { actionId?: unknown; spellId?: unknown }
    return [
      {
        actionId: typeof row.actionId === 'string' ? row.actionId : undefined,
        spellId: typeof row.spellId === 'string' ? row.spellId : undefined,
      },
    ]
  })
}

export function multiattackReplacementChoiceSelectOptions(input: {
  rows: readonly MonsterActionDraftRow[]
  multiattackId: string
  values: MonsterFormValues
  ctx: ContentFormCtx
  steps: readonly MultiattackDraftStep[]
  replacement: Pick<MultiattackReplacement, 'replacesActionId'> | undefined
  siblingChoices: readonly MultiattackReplacementChoiceRef[]
  storedChoice?: MultiattackReplacementChoiceRef
}): Option[] {
  const titles = monsterActionEditorTitles(input.rows, input.values, input.ctx, 'actions')
  const replacement = input.replacement ?? {}
  const current = input.storedChoice ?? {}
  const taken = siblingMultiattackReplacementChoiceKeys(input.siblingChoices, current)

  const selectable = input.rows.flatMap((row) => {
    if (
      !multiattackRowEligibleForPurpose(row, 'replacement-choice', {
        multiattackId: input.multiattackId,
      })
    ) {
      return []
    }
    const baseKey = multiattackReplacementChoiceKey({ actionId: row.id })
    if (taken.has(baseKey)) return []

    const redundancy = classifyMultiattackReplacementChoice({
      steps: input.steps,
      replacement,
      choice: { actionId: row.id },
    })
    if (redundancy !== 'ok') return []

    return [{ value: row.id, label: titles.get(row.id) ?? row.id }]
  })

  const storedActionId = input.storedChoice?.actionId
  if (!storedActionId) return selectable

  const authorizedDisplay = new Map<string, { label: string }>()
  for (const row of input.rows) {
    const label = titles.get(row.id) ?? row.id
    authorizedDisplay.set(row.id, { label })
  }

  return unionPersistedOptions({
    selectable,
    persistedIds: [storedActionId],
    authorizedDisplay,
  })
}

export function multiattackReplacementChoiceOptions(
  rows: readonly MonsterActionDraftRow[],
  multiattackId: string,
  values: MonsterFormValues,
  ctx: ContentFormCtx,
  steps: readonly MultiattackDraftStep[],
  replacement: Pick<MultiattackReplacement, 'replacesActionId'> | undefined,
): Option[] {
  return multiattackReplacementChoiceSelectOptions({
    rows,
    multiattackId,
    values,
    ctx,
    steps,
    replacement,
    siblingChoices: [],
  })
}

export function multiattackReplacementChoiceOptionsFromWatched(input: {
  rows: readonly MonsterActionDraftRow[]
  multiattackId: string
  ctx: ContentFormCtx
  watched: Record<string, unknown>
}): Option[] {
  const steps = Array.isArray(input.watched['../../../steps'])
    ? (input.watched['../../../steps'] as MultiattackDraftStep[])
    : []
  const replacesActionId =
    typeof input.watched['../../replacesActionId'] === 'string'
      ? input.watched['../../replacesActionId']
      : undefined
  const siblingChoices = parseReplacementChoiceRows(input.watched['../../choices'])
  const actionId = typeof input.watched.actionId === 'string' ? input.watched.actionId : undefined
  const spellId = typeof input.watched.spellId === 'string' ? input.watched.spellId : undefined

  const eligibilityValues = { actions: input.rows } as MonsterFormValues

  return multiattackReplacementChoiceSelectOptions({
    rows: input.rows,
    multiattackId: input.multiattackId,
    values: eligibilityValues,
    ctx: input.ctx,
    steps,
    replacement: { replacesActionId },
    siblingChoices,
    storedChoice: { actionId, spellId },
  })
}

export function multiattackPrerequisiteOptions(
  actionRows: readonly MonsterActionDraftRow[],
  bonusRows: readonly MonsterActionDraftRow[],
  multiattackId: string,
  values: MonsterFormValues,
  ctx: ContentFormCtx,
): Option[] {
  const combined = [...actionRows, ...bonusRows]
  const titles = new Map([
    ...monsterActionEditorTitles(actionRows, values, ctx, 'actions'),
    ...monsterActionEditorTitles(bonusRows, values, ctx, 'bonusActions'),
  ])
  return combined
    .filter((row) => multiattackRowEligibleForPurpose(row, 'prerequisite', { multiattackId }))
    .map((row) => ({ value: row.id, label: titles.get(row.id) ?? row.id }))
}

type MultiattackDraft = Extract<MonsterActionDraftRow, { kind: 'multiattack' }>

export function multiattackTargetAttackOptions(
  steps: MultiattackDraft['steps'] | undefined,
  rows: readonly MonsterActionDraftRow[],
  values: MonsterFormValues,
  ctx: ContentFormCtx,
): Option[] {
  const titles = monsterActionEditorTitles(rows, values, ctx, 'actions')
  const ids = new Set<string>()
  for (const step of steps ?? []) {
    if (!isMultiattackAttackGroup(step)) continue
    if (step.actionIds?.length === 1) {
      ids.add(step.actionIds[0]!)
    }
  }
  return [...ids].map((id) => ({ value: id, label: titles.get(id) ?? id }))
}

export function multiattackTargetAttackOptionsForReplacement(
  steps: MultiattackDraft['steps'] | undefined,
  rows: readonly MonsterActionDraftRow[],
  values: MonsterFormValues,
  ctx: ContentFormCtx,
  replacement: MultiattackReplacement | undefined,
): Option[] {
  const titles = monsterActionEditorTitles(rows, values, ctx, 'actions')
  const meaningful = new Set(meaningfulMultiattackTargetActionIds(steps ?? []))
  const stored = replacement?.replacesActionId
  const singleIdOptions = multiattackTargetAttackOptions(steps, rows, values, ctx)
  if (replacement?.count !== 1) {
    return singleIdOptions.filter(
      (option) => meaningful.has(option.value) || option.value === stored,
    )
  }
  return multiattackSequenceAttackIds(steps ?? []).map((id) => ({
    value: id,
    label: titles.get(id) ?? id,
  }))
}

export function multiattackSpellOptionsForAction(
  actionId: string,
  actionRows: readonly MonsterActionDraftRow[],
  spellCatalogById: ReadonlyMap<string, Spell> | undefined,
): Option[] {
  const source = actionRows.find((row) => row.id === actionId && row.kind === 'spell')
  if (!source || source.kind !== 'spell') return []
  return (source.spells ?? []).flatMap((spell) => {
    if (!spell.spellId) return []
    const catalogSpell = spellCatalogById?.get(spell.spellId)
    return [
      {
        value: spell.spellId,
        label: formatSpellCastAtLevelName({
          name: catalogSpell?.name ?? spell.spellId,
          castAtLevel: spell.castAtLevel,
          spellLevel: catalogSpell?.level,
        }),
      },
    ]
  })
}

export function multiattackPrimarySequenceHeading(action: MultiattackDraft): string {
  const hasUse = (action.steps ?? []).some((step) => !isMultiattackAttackGroup(step))
  const hasAlternative = action.alternative !== undefined
  if (hasUse || hasAlternative) return MONSTER_MULTIATTACK_SEQUENCE_LABEL
  return MONSTER_MULTIATTACK_ATTACKS_LABEL
}
