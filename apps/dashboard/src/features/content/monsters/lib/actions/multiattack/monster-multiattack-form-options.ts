import {
  classifyMultiattackReplacementChoice,
  formatSpellCastAtLevelName,
  MONSTER_ACTION_UNRESOLVED_REFERENCE,
  presentSpellReferenceDisplayName,
  resolveSpellReferenceOutcome,
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
  type SpellCatalogContext,
} from '@rpg/contracts'

import {
  MONSTER_MULTIATTACK_ATTACK_GROUP_LABEL,
  MONSTER_MULTIATTACK_PRIMARY_SEQUENCE_LABEL,
  MONSTER_MULTIATTACK_SEQUENCE_LABEL,
} from '../../monster-form-labels'
import type { MonsterActionSection } from '../references/monster-action-equipment-references'
import { monsterFormSectionRowsFieldName } from '../monster-action-section-access'
import type { MonsterActionDraftRow } from '../monster-action-presets'
import { monsterActionEditorTitles } from '../monster-action-editor-title'
import type { MonsterFormValues } from '../../monster-form-values'
import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'

type Option = { value: string; label: string }

function multiattackSectionRowsFieldTail(section: MonsterActionSection): string {
  const fieldName = monsterFormSectionRowsFieldName(section)
  return fieldName.includes('.') ? fieldName.slice(fieldName.lastIndexOf('.') + 1) : fieldName
}

export type MultiattackSequenceScope = 'primary' | 'alternative'
export type MultiattackSequenceDepth = 'step' | 'choice' | 'menu'

/** Parent hops from `actions.{index}` to the section rows field. */
const MULTIATTACK_SEQUENCE_HOPS: Record<
  MultiattackSequenceScope,
  Record<MultiattackSequenceDepth, number>
> = {
  primary: { step: 4, choice: 6, menu: 3 },
  alternative: { step: 5, choice: 7, menu: 4 },
}

export function multiattackRowsDependsOn(section: MonsterActionSection, hops: number): string {
  return `${'../'.repeat(hops)}${multiattackSectionRowsFieldTail(section)}`
}

export function multiattackSequenceRowsDependsOn(
  section: MonsterActionSection,
  scope: MultiattackSequenceScope,
  depth: MultiattackSequenceDepth,
): string {
  return multiattackRowsDependsOn(section, MULTIATTACK_SEQUENCE_HOPS[scope][depth])
}

/** Watches the owning section's rows from a multiattack primary step field (`steps.0.*`). */
export function multiattackStepScopeSectionRowsDependsOn(section: MonsterActionSection): string {
  return multiattackSequenceRowsDependsOn(section, 'primary', 'step')
}

/** Watches section rows from a use-choice row inside a primary step (`steps.0.choices.0.*`). */
export function multiattackUseChoiceRowSectionRowsDependsOn(section: MonsterActionSection): string {
  return multiattackSequenceRowsDependsOn(section, 'primary', 'choice')
}

/** Watches the section's rows from a multiattack row group (`replacement.*`, `alternative.*`). */
export function multiattackRowScopeSectionRowsDependsOn(section: MonsterActionSection): string {
  return `../../../${multiattackSectionRowsFieldTail(section)}`
}

/** Watches section rows from a replacement choice row (`replacement.choices.0.*`). */
export function multiattackReplacementChoiceRowSectionRowsDependsOn(
  section: MonsterActionSection,
): string {
  return `../../../../../${multiattackSectionRowsFieldTail(section)}`
}

export const MULTIATTACK_ROW_SCOPE_BONUS_ROWS_DEPENDS_ON = '../../../bonusActions' as const

function multiattackBonusRowsDependsOn(sectionRowsDependsOn: string): string {
  const hopPrefix = sectionRowsDependsOn.match(/^(\.\.\/)*/)?.[0] ?? ''
  return `${hopPrefix}bonusActions`
}

export function multiattackWatchedSectionRows(
  watched: Record<string, unknown>,
  dependsKey: string,
): MonsterActionDraftRow[] | undefined {
  if (!(dependsKey in watched)) return undefined
  const value = watched[dependsKey]
  if (value === undefined) return undefined
  return Array.isArray(value) ? (value as MonsterActionDraftRow[]) : []
}

export function multiattackDraftRowsFromWatched(
  watched: Record<string, unknown>,
  dependsKey: string,
): MonsterActionDraftRow[] {
  return multiattackWatchedSectionRows(watched, dependsKey) ?? []
}

export function multiattackRowsWithFallback(
  watched: Record<string, unknown>,
  dependsKey: string,
  fallbackRows?: readonly MonsterActionDraftRow[],
): MonsterActionDraftRow[] {
  const fallback = [...(fallbackRows ?? [])]
  const watchedRows = multiattackWatchedSectionRows(watched, dependsKey)
  if (watchedRows === undefined) return fallback
  if (watchedRows.length === 0 && fallback.length > 0) return fallback
  return watchedRows
}

function multiattackEligibilityValues(
  section: MonsterActionSection,
  sectionRows: readonly MonsterActionDraftRow[],
  bonusRows: readonly MonsterActionDraftRow[],
): MonsterFormValues {
  if (section === 'bonusActions') {
    return { bonusActions: [...sectionRows] } as MonsterFormValues
  }
  if (section === 'reactions') {
    return { actions: [...sectionRows], reactions: [...sectionRows] } as MonsterFormValues
  }
  if (section === 'legendaryActions') {
    return { legendaryActions: { actions: [...sectionRows] } } as MonsterFormValues
  }
  return { actions: [...sectionRows], bonusActions: [...bonusRows] } as MonsterFormValues
}

export function multiattackAttackPickerRowsFromWatched(
  section: MonsterActionSection,
  watched: Record<string, unknown>,
): MonsterActionDraftRow[] {
  if (section === 'reactions') {
    return multiattackDraftRowsFromWatched(
      watched,
      multiattackStepScopeSectionRowsDependsOn('actions'),
    )
  }
  return multiattackDraftRowsFromWatched(watched, multiattackStepScopeSectionRowsDependsOn(section))
}

export function multiattackAttackPickerDependsOn(
  section: MonsterActionSection,
  scope: MultiattackSequenceScope = 'primary',
): readonly string[] {
  const deps = [multiattackSequenceRowsDependsOn(section, scope, 'step')]
  if (section === 'reactions') {
    deps.push(multiattackSequenceRowsDependsOn('actions', scope, 'step'))
  }
  return deps
}

export function multiattackExecutableAttackOptionsFromWatched(input: {
  section: MonsterActionSection
  multiattackId: string
  ctx: ContentFormCtx
  watched: Record<string, unknown>
  fallbackRows?: readonly MonsterActionDraftRow[]
  scope?: MultiattackSequenceScope
}): Option[] {
  const scope = input.scope ?? 'primary'
  const sectionKey =
    input.section === 'reactions'
      ? multiattackSequenceRowsDependsOn('actions', scope, 'step')
      : multiattackSequenceRowsDependsOn(input.section, scope, 'step')
  const rows = multiattackRowsWithFallback(input.watched, sectionKey, input.fallbackRows)
  const bonusRows = multiattackDraftRowsFromWatched(
    input.watched,
    multiattackBonusRowsDependsOn(sectionKey),
  )
  return multiattackExecutableAttackOptions(
    rows,
    input.multiattackId,
    multiattackEligibilityValues(input.section, rows, bonusRows),
    input.ctx,
  )
}

export function multiattackExecutableUseOptionsFromWatched(input: {
  section: MonsterActionSection
  multiattackId: string
  ctx: ContentFormCtx
  watched: Record<string, unknown>
  sectionRowsDependsOn: string
  fallbackRows?: readonly MonsterActionDraftRow[]
}): Option[] {
  const rows = multiattackRowsWithFallback(
    input.watched,
    input.sectionRowsDependsOn,
    input.fallbackRows,
  )
  const bonusRows = multiattackDraftRowsFromWatched(
    input.watched,
    multiattackBonusRowsDependsOn(input.sectionRowsDependsOn),
  )
  return multiattackExecutableUseOptions(
    rows,
    input.multiattackId,
    multiattackEligibilityValues(input.section, rows, bonusRows),
    input.ctx,
  )
}

export function multiattackPrerequisiteOptionsFromWatched(input: {
  section: MonsterActionSection
  multiattackId: string
  ctx: ContentFormCtx
  watched: Record<string, unknown>
}): Option[] {
  const rows = multiattackDraftRowsFromWatched(
    input.watched,
    multiattackRowScopeSectionRowsDependsOn(input.section),
  )
  const bonusRows = multiattackDraftRowsFromWatched(
    input.watched,
    MULTIATTACK_ROW_SCOPE_BONUS_ROWS_DEPENDS_ON,
  )
  return multiattackPrerequisiteOptions(
    rows,
    bonusRows,
    input.multiattackId,
    multiattackEligibilityValues(input.section, rows, bonusRows),
    input.ctx,
  )
}

export function multiattackTargetAttackOptionsFromWatched(input: {
  section: MonsterActionSection
  ctx: ContentFormCtx
  watched: Record<string, unknown>
}): Option[] {
  const steps = input.watched['../../steps']
  const rows = multiattackDraftRowsFromWatched(
    input.watched,
    multiattackRowScopeSectionRowsDependsOn(input.section),
  )
  const replacement =
    input.watched['../../replacement'] && typeof input.watched['../../replacement'] === 'object'
      ? (input.watched['../../replacement'] as MultiattackReplacement)
      : undefined
  const eligibilityValues = multiattackEligibilityValues(input.section, rows, [])
  return multiattackTargetAttackOptionsForReplacement(
    Array.isArray(steps) ? (steps as MultiattackDraftStep[]) : [],
    rows,
    eligibilityValues,
    input.ctx,
    replacement,
  )
}

export function multiattackExecutableAttackOptions(
  rows: readonly MonsterActionDraftRow[],
  multiattackId: string,
  values: MonsterFormValues,
  ctx: ContentFormCtx,
): Option[] {
  const titles = monsterActionEditorTitles(rows, values, ctx, 'actions')
  return rows
    .filter((row) => multiattackRowEligibleForPurpose(row, 'executable-attack', { multiattackId }))
    .map((row) => ({
      value: row.id,
      label: titles.get(row.id) ?? MONSTER_ACTION_UNRESOLVED_REFERENCE,
    }))
}

export function multiattackSequenceMenuContextDependsOn(
  section: MonsterActionSection,
  scope: MultiattackSequenceScope,
): readonly string[] {
  const rowsKey = multiattackSequenceRowsDependsOn(section, scope, 'menu')
  return [rowsKey, multiattackBonusRowsDependsOn(rowsKey)]
}

/** Attack group plus one item per executable-use action. Omits empty groups. */
export function multiattackSequenceAddMenuItems(input: {
  section: MonsterActionSection
  scope: MultiattackSequenceScope
  multiattackId: string
  ctx: ContentFormCtx
  watched: Record<string, unknown>
  fallbackRows?: readonly MonsterActionDraftRow[]
}) {
  const rowsKey = multiattackSequenceRowsDependsOn(input.section, input.scope, 'menu')
  const rows = multiattackRowsWithFallback(input.watched, rowsKey, input.fallbackRows)
  const bonusRows = multiattackDraftRowsFromWatched(
    input.watched,
    multiattackBonusRowsDependsOn(rowsKey),
  )
  const values = multiattackEligibilityValues(input.section, rows, bonusRows)
  const items: {
    id: string
    label: string
    groupId: string
    appendDefaults: () => Record<string, unknown>
  }[] = []
  const attackOptions = multiattackExecutableAttackOptions(
    rows,
    input.multiattackId,
    values,
    input.ctx,
  )
  if (attackOptions.length > 0) {
    items.push({
      id: 'attack-group',
      label: MONSTER_MULTIATTACK_ATTACK_GROUP_LABEL,
      groupId: 'attack',
      appendDefaults: () => ({ actionIds: [] }),
    })
  }
  for (const option of multiattackExecutableUseOptions(
    rows,
    input.multiattackId,
    values,
    input.ctx,
  )) {
    items.push({
      id: `use:${option.value}`,
      label: option.label,
      groupId: 'other-actions',
      appendDefaults: () => ({ kind: 'use', mode: 'single', actionId: option.value }),
    })
  }
  return items
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
    .map((row) => ({
      value: row.id,
      label: titles.get(row.id) ?? MONSTER_ACTION_UNRESOLVED_REFERENCE,
    }))
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

    return [{ value: row.id, label: titles.get(row.id) ?? MONSTER_ACTION_UNRESOLVED_REFERENCE }]
  })

  const storedActionId = input.storedChoice?.actionId
  if (!storedActionId) return selectable

  const authorizedDisplay = new Map<string, { label: string }>()
  for (const row of input.rows) {
    const label = titles.get(row.id) ?? MONSTER_ACTION_UNRESOLVED_REFERENCE
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
  section: MonsterActionSection
  sectionRowsDependsOn: string
  multiattackId: string
  ctx: ContentFormCtx
  watched: Record<string, unknown>
}): Option[] {
  const liveRows = multiattackWatchedSectionRows(input.watched, input.sectionRowsDependsOn)
  const rows = liveRows && liveRows.length > input.rows.length ? liveRows : [...input.rows]
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

  const bonusRows = multiattackDraftRowsFromWatched(
    input.watched,
    multiattackBonusRowsDependsOn(input.sectionRowsDependsOn),
  )

  const eligibilityValues = multiattackEligibilityValues(input.section, rows, bonusRows)

  return multiattackReplacementChoiceSelectOptions({
    rows,
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
    .map((row) => ({
      value: row.id,
      label: titles.get(row.id) ?? MONSTER_ACTION_UNRESOLVED_REFERENCE,
    }))
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
  return [...ids].map((id) => ({
    value: id,
    label: titles.get(id) ?? MONSTER_ACTION_UNRESOLVED_REFERENCE,
  }))
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
    label: titles.get(id) ?? MONSTER_ACTION_UNRESOLVED_REFERENCE,
  }))
}

export function multiattackSpellOptionsForAction(
  actionId: string,
  actionRows: readonly MonsterActionDraftRow[],
  spellCatalog: SpellCatalogContext,
): Option[] {
  const source = actionRows.find((row) => row.id === actionId && row.kind === 'spell')
  if (!source || source.kind !== 'spell') return []
  return (source.spells ?? []).flatMap((spell) => {
    if (!spell.spellId) return []
    const outcome = resolveSpellReferenceOutcome(spell.spellId, spellCatalog)
    const label =
      outcome.status === 'resolved'
        ? formatSpellCastAtLevelName({
            name: outcome.spell.name,
            castAtLevel: spell.castAtLevel,
            spellLevel: outcome.spell.level,
          })
        : presentSpellReferenceDisplayName(outcome)
    return [{ value: spell.spellId, label }]
  })
}

export function multiattackPrimarySequenceHeading(action: MultiattackDraft): string {
  const hasAlternative = action.alternative !== undefined
  if (hasAlternative) return MONSTER_MULTIATTACK_PRIMARY_SEQUENCE_LABEL
  return MONSTER_MULTIATTACK_SEQUENCE_LABEL
}
