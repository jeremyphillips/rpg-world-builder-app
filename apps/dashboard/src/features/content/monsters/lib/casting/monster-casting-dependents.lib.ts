import { resolveMonsterActionIdentity, type Ability, type MonsterActionDraft } from '@rpg/contracts'

import { masterDetailItemTitle } from '../../../lib/master-detail/master-detail-constants'
import { MONSTER_ACTION_ITEM_NOUN } from '../monster-form-labels'

type CastingRow = {
  id: string
  kind: string
  name?: string
  castingAbility?: { kind?: string; ability?: string; entryId?: string }
  bonusSource?: {
    kind?: string
    castingAbility?: { kind?: string; ability?: Ability; entryId?: string }
  }
  dcSource?: {
    kind?: string
    castingAbility?: { kind?: string; ability?: Ability; entryId?: string }
  }
  savingThrow?: {
    dcSource?: {
      kind?: string
      castingAbility?: { kind?: string; entryId?: string }
    }
  }
}

import {
  monsterFormSectionRows,
  type MonsterFormActionSectionBody,
} from '../actions/monster-action-section-access'
import type { FormCastingSections } from './spellcasting-sources.lib'

function sharedEntryId(
  casting: { kind?: string; entryId?: string } | undefined,
): string | undefined {
  if (casting?.kind !== 'shared') return undefined
  return casting.entryId
}

function rowUsesCastingSource(row: CastingRow, sourceId: string): boolean {
  if (row.kind === 'spell') return sharedEntryId(row.castingAbility) === sourceId
  if (row.kind === 'attack' && row.bonusSource?.kind === 'spellcasting') {
    return sharedEntryId(row.bonusSource.castingAbility) === sourceId
  }
  if (row.kind === 'save' && row.dcSource?.kind === 'spellcasting') {
    return sharedEntryId(row.dcSource.castingAbility) === sourceId
  }
  if (row.savingThrow?.dcSource?.kind === 'spellcasting') {
    return sharedEntryId(row.savingThrow.dcSource.castingAbility) === sourceId
  }
  return false
}

export function monsterCastingDependentLabels(
  values: FormCastingSections,
  sourceId: string,
  equipmentCatalogStatus: 'pending' | 'ready' | 'error' = 'ready',
): string[] {
  const rows = [
    ...monsterFormSectionRows(values as MonsterFormActionSectionBody, 'actions'),
    ...monsterFormSectionRows(values as MonsterFormActionSectionBody, 'bonusActions'),
    ...monsterFormSectionRows(values as MonsterFormActionSectionBody, 'reactions'),
    ...monsterFormSectionRows(values as MonsterFormActionSectionBody, 'legendaryActions'),
  ] as CastingRow[]
  return rows.flatMap((row) => {
    if (row.id === sourceId || !rowUsesCastingSource(row, sourceId)) return []
    const identity = resolveMonsterActionIdentity({
      action: row as MonsterActionDraft,
      equipmentCatalogStatus,
    })
    return [
      identity.displayName.trim() || masterDetailItemTitle(undefined, MONSTER_ACTION_ITEM_NOUN),
    ]
  })
}
