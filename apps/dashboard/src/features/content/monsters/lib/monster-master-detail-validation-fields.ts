import type { ArrayResolveFieldsFn } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import { collectMonsterFormAdvisories } from './monster-form-advisories'
import { monsterEquipmentCatalog } from './monster-form-derivation'
import type { MonsterFormValues } from './monster-form-values'
import { monsterActionDetailFields } from './actions/monster-action-detail-fields'
import type { MonsterActionSection } from './actions/monster-action-equipment-references'
import type { MonsterActionDraftRow } from './actions/monster-action-presets'
import { sharedCastingOptions } from './actions/monster-action-casting-summary'
import { monsterTraitDetailFields, monsterTraitItemFields } from './monster-trait-form-fields'

function resolveMonsterActionRowId(action: MonsterActionDraftRow, index: number): string {
  if (typeof action.id === 'string' && action.id.length > 0) return action.id
  return `index:${index}`
}

function isMonsterActionDraftRow(row: unknown): row is MonsterActionDraftRow {
  return row !== null && typeof row === 'object' && 'kind' in row
}

/** Placeholder tree when the array is empty but the error map still registers `*.0`. */
const EMPTY_ACTION_ROW_VALIDATION_FIELDS: readonly { type: 'text'; name: string; label: string }[] =
  [{ type: 'text', name: 'name', label: 'Name' }]

type MonsterActionRowResolveContext = {
  ctx: ContentFormCtx
  section: MonsterActionSection
  /** When omitted, routing uses row-local paths only (tab resolver). */
  readValues?: () => MonsterFormValues | undefined
}

export function monsterActionRowResolveFields(
  input: MonsterActionRowResolveContext,
): ArrayResolveFieldsFn {
  const { ctx, section, readValues } = input
  return (row, index) => {
    if (!isMonsterActionDraftRow(row)) {
      return [...EMPTY_ACTION_ROW_VALIDATION_FIELDS]
    }
    const values = readValues?.()
    const action = row
    const actionId = resolveMonsterActionRowId(action, index)
    const namePrefix = `${section}.${index}`
    return monsterActionDetailFields({
      ctx,
      action,
      section,
      namePrefix,
      equipmentOptions: [],
      equipment: values?.equipment,
      sharedCastingOptions: sharedCastingOptions(values ?? {}, actionId),
      advisories: values ? collectMonsterFormAdvisories(values, monsterEquipmentCatalog(ctx)) : [],
      attackOptions: [],
      referenceOptions: [],
      sourceSpellOptions: [],
    })
  }
}

type MonsterTraitRowResolveContext = {
  ctx: ContentFormCtx
  readValues?: () => MonsterFormValues | undefined
}

export function monsterTraitRowResolveFields(
  input: MonsterTraitRowResolveContext,
): ArrayResolveFieldsFn {
  const { ctx, readValues } = input
  return (row, index) => {
    const values = readValues?.()
    const rowPath = `traits.${index}`
    if (row === undefined || row === null) {
      return monsterTraitItemFields({ rowPath, sharedCastingOptions: [] })
    }
    return monsterTraitDetailFields({
      row,
      rowPath,
      ctx,
      monsterName: values?.name ?? '',
      advisories: values ? collectMonsterFormAdvisories(values, monsterEquipmentCatalog(ctx)) : [],
      sharedCastingOptions: values ? sharedCastingOptions(values, '') : [],
    })
  }
}
