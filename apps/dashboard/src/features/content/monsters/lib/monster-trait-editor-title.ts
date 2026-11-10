import {
  formatCreatureTrait,
  formatMonsterStatBlockSubject,
  resolveTraitName,
  type ContentTrait,
} from '@rpg/contracts'

import type { MasterDetailEditorIdentity } from '../../components/master-detail/master-detail-editor-shell'
import { MONSTER_USE_DEFAULT_NAME_LABEL } from './monster-form-labels'

function isRecord(row: unknown): row is Record<string, unknown> {
  return typeof row === 'object' && row !== null
}

function isTemplateRow(row: unknown): row is {
  id?: string
  templateId: string
  config?: unknown
  nameOverride?: string
} {
  return isRecord(row) && typeof row.templateId === 'string'
}

function isPresetRow(row: unknown): row is { preset: string } & Record<string, unknown> {
  return isRecord(row) && typeof row.preset === 'string' && !isTemplateRow(row)
}

function storedText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function traitOrdinalLabel(ordinal: number): string {
  return `Trait ${ordinal}`
}

function rowId(row: unknown, index: number): string {
  if (isRecord(row) && typeof row.id === 'string' && row.id) return row.id
  return `index:${index}`
}

/** Numbered labels for custom traits whose stored name is empty. */
export function monsterCustomTraitFallbacks(
  rows: readonly unknown[],
  monsterName: string,
): Map<string, string> {
  const taken = new Set<string>()
  const emptyIds: string[] = []
  rows.forEach((row, index) => {
    const title = monsterTraitResolvedTitle(row, monsterName)
    if (title) {
      taken.add(title)
      return
    }
    if (!isPresetRow(row) && !isTemplateRow(row)) emptyIds.push(rowId(row, index))
  })

  const fallbacks = new Map<string, string>()
  let ordinal = 1
  for (const id of emptyIds) {
    let label = traitOrdinalLabel(ordinal)
    while (taken.has(label)) {
      ordinal += 1
      label = traitOrdinalLabel(ordinal)
    }
    fallbacks.set(id, label)
    taken.add(label)
    ordinal += 1
  }
  return fallbacks
}

function templateDerivedName(row: { id?: string; templateId: string; config?: unknown }): string {
  return resolveTraitName({
    kind: 'template',
    id: row.id ?? 'row',
    templateId: row.templateId,
    config: row.config,
  } as ContentTrait)
}

function monsterTraitResolvedTitle(row: unknown, monsterName: string): string {
  if (isTemplateRow(row)) {
    const override = storedText(row.nameOverride)
    return override || templateDerivedName(row)
  }
  if (isPresetRow(row)) {
    const formatted = formatCreatureTrait({
      subject: formatMonsterStatBlockSubject(monsterName),
      trait: row as Parameters<typeof formatCreatureTrait>[0]['trait'],
    })
    return formatted?.name ?? (typeof row.preset === 'string' ? row.preset : '')
  }
  return storedText(isRecord(row) ? row.name : undefined)
}

export function monsterTraitListTitle(
  row: unknown,
  rows: readonly unknown[],
  monsterName: string,
  index: number,
): string {
  const resolved = monsterTraitResolvedTitle(row, monsterName)
  if (resolved) return resolved
  return (
    monsterCustomTraitFallbacks(rows, monsterName).get(rowId(row, index)) ??
    traitOrdinalLabel(index + 1)
  )
}

function templateHeaderIdentity(
  row: { id?: string; templateId: string; config?: unknown; nameOverride?: string },
  title: string,
  fieldId: string,
  identity: MasterDetailEditorIdentity,
): MasterDetailEditorIdentity {
  const derived = templateDerivedName(row)
  const stored = storedText(row.nameOverride)
  const sourceName = stored && stored !== derived ? derived : undefined
  return {
    ...identity,
    title,
    rowKey: fieldId,
    ...(sourceName ? { sourceName } : {}),
    inlineTitle: {
      field: 'nameOverride',
      mode: 'override',
      fallback: derived || title,
      placeholder: derived,
      ...(stored ? { resetLabel: MONSTER_USE_DEFAULT_NAME_LABEL } : {}),
    },
  }
}

function customTraitHeaderIdentity(input: {
  row: unknown
  rows: readonly unknown[]
  monsterName: string
  index: number
  fieldId: string
  lastAddedFieldId: string | null
  identity: MasterDetailEditorIdentity
  title: string
}): MasterDetailEditorIdentity {
  const cleared = input.rows.map((entry, entryIndex) =>
    entryIndex === input.index && isRecord(entry) ? { ...entry, name: '' } : entry,
  )
  const fallback =
    monsterCustomTraitFallbacks(cleared, input.monsterName).get(rowId(input.row, input.index)) ??
    traitOrdinalLabel(input.index + 1)
  const stored = storedText(isRecord(input.row) ? input.row.name : undefined)
  return {
    ...input.identity,
    title: input.title,
    rowKey: input.fieldId,
    inlineTitle: {
      field: 'name',
      mode: 'authored',
      fallback,
      placeholder: fallback,
      initialEdit: input.lastAddedFieldId === input.fieldId && !stored,
    },
  }
}

export function resolveMonsterTraitHeaderIdentity(input: {
  row: unknown
  rows: readonly unknown[]
  monsterName: string
  index: number
  fieldId: string
  lastAddedFieldId: string | null
  identity: MasterDetailEditorIdentity
}): MasterDetailEditorIdentity {
  const title = monsterTraitListTitle(input.row, input.rows, input.monsterName, input.index)
  if (isPresetRow(input.row)) {
    return { ...input.identity, title, rowKey: input.fieldId }
  }
  if (isTemplateRow(input.row)) {
    return templateHeaderIdentity(input.row, title, input.fieldId, input.identity)
  }
  return customTraitHeaderIdentity({ ...input, title })
}
