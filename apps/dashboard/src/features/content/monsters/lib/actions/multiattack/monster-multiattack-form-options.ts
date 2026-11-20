import {
  formatSpellCastAtLevelName,
  isMultiattackAttackGroup,
  multiattackRowEligibleForPurpose,
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

export function multiattackReplacementChoiceOptions(
  rows: readonly MonsterActionDraftRow[],
  multiattackId: string,
  values: MonsterFormValues,
  ctx: ContentFormCtx,
): Option[] {
  const titles = monsterActionEditorTitles(rows, values, ctx, 'actions')
  return rows
    .filter((row) => multiattackRowEligibleForPurpose(row, 'replacement-choice', { multiattackId }))
    .map((row) => ({ value: row.id, label: titles.get(row.id) ?? row.id }))
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
