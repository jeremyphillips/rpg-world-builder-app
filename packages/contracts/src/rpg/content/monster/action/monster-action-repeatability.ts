import { getActionPreset, type ActionPresetId } from '../../action/action-presets'
import { PRIMARY_SPELLCASTING_DUPLICATE_MESSAGE } from '../spell-casting-source'
import { isPrimarySpellcastingAction } from '../spell-casting-source'
import type { MonsterActionSection } from '../action-sections'
import { MONSTER_ACTION_SECTIONS } from '../action-sections'
import {
  MONSTER_CONSTRICT_PRESET_DUPLICATE_MESSAGE,
  MONSTER_NATURAL_FORM_DUPLICATE_MESSAGE,
  MONSTER_WEAPON_EQUIPMENT_DUPLICATE_MESSAGE,
  monsterSingletonKindMessage,
} from './repeatability-messages'

export const MONSTER_SINGLETON_KINDS = {
  actions: ['multiattack'] as const,
  bonusActions: ['leap', 'teleport', 'take-actions'] as const,
  reactions: ['parry'] as const,
} as const satisfies Partial<Record<MonsterActionSection, readonly string[]>>

export const MONSTER_SINGLETON_PRESET_IDS = [
  'constrict',
] as const satisfies readonly ActionPresetId[]

export type MonsterActionRowLike = {
  id?: string
  kind?: string
  preset?: string
  form?: string
  equipmentEntryId?: string
  profile?: string
}

export type MonsterActionSectionRows = {
  actions?: readonly MonsterActionRowLike[]
  bonusActions?: readonly MonsterActionRowLike[]
  reactions?: readonly MonsterActionRowLike[]
  legendaryActions?: readonly MonsterActionRowLike[]
}

export type RepeatabilityViolation = {
  message: string
  path: (string | number)[]
}

export type AcquisitionItemState = {
  disabled?: boolean
  note?: string
  focusActionId?: string
}

function sectionRows(
  sections: MonsterActionSectionRows,
  section: MonsterActionSection,
): readonly MonsterActionRowLike[] {
  return sections[section] ?? []
}

function pushSingletonKindViolations(
  sections: MonsterActionSectionRows,
  prefix: (string | number)[],
  violations: RepeatabilityViolation[],
): void {
  for (const section of MONSTER_ACTION_SECTIONS) {
    const kinds = MONSTER_SINGLETON_KINDS[section as keyof typeof MONSTER_SINGLETON_KINDS]
    if (!kinds) continue
    for (const kind of kinds as readonly string[]) {
      const rows = sectionRows(sections, section)
      const matches = rows.flatMap((row, index) => (row.kind === kind ? [index] : []))
      for (const index of matches.slice(1)) {
        violations.push({
          message: monsterSingletonKindMessage(kind),
          path: [...prefix, section, index, 'kind'],
        })
      }
    }
  }
}

function pushConstrictViolations(
  sections: MonsterActionSectionRows,
  prefix: (string | number)[],
  violations: RepeatabilityViolation[],
): void {
  const rows = sectionRows(sections, 'actions')
  const matches = rows.flatMap((row, index) => (row.preset === 'constrict' ? [index] : []))
  for (const index of matches.slice(1)) {
    violations.push({
      message: MONSTER_CONSTRICT_PRESET_DUPLICATE_MESSAGE,
      path: [...prefix, 'actions', index, 'preset'],
    })
  }
}

function pushWeaponEquipmentViolations(
  sections: MonsterActionSectionRows,
  prefix: (string | number)[],
  violations: RepeatabilityViolation[],
): void {
  const seen = new Map<string, number>()
  const rows = sectionRows(sections, 'actions')
  rows.forEach((row, index) => {
    if (row.kind !== 'weapon' || !row.equipmentEntryId) return
    const prior = seen.get(row.equipmentEntryId)
    if (prior !== undefined) {
      violations.push({
        message: MONSTER_WEAPON_EQUIPMENT_DUPLICATE_MESSAGE,
        path: [...prefix, 'actions', index, 'equipmentEntryId'],
      })
      return
    }
    seen.set(row.equipmentEntryId, index)
  })
}

function pushNaturalFormViolations(
  sections: MonsterActionSectionRows,
  prefix: (string | number)[],
  violations: RepeatabilityViolation[],
): void {
  const seen = new Map<string, number>()
  const rows = sectionRows(sections, 'actions')
  rows.forEach((row, index) => {
    if (row.kind !== 'natural-weapon' || !row.form) return
    const prior = seen.get(row.form)
    if (prior !== undefined) {
      violations.push({
        message: MONSTER_NATURAL_FORM_DUPLICATE_MESSAGE,
        path: [...prefix, 'actions', index, 'form'],
      })
      return
    }
    seen.set(row.form, index)
  })
}

/** Publish-time repeatability violations (excludes primary spellcasting — spell-refinements owns that). */
export function collectRepeatabilityViolations(
  sections: MonsterActionSectionRows,
  prefix: (string | number)[] = [],
): RepeatabilityViolation[] {
  const violations: RepeatabilityViolation[] = []
  pushSingletonKindViolations(sections, prefix, violations)
  pushConstrictViolations(sections, prefix, violations)
  pushWeaponEquipmentViolations(sections, prefix, violations)
  pushNaturalFormViolations(sections, prefix, violations)
  return violations
}

function hasSingletonKind(sections: MonsterActionSectionRows, kind: string): boolean {
  for (const section of MONSTER_ACTION_SECTIONS) {
    const kinds = MONSTER_SINGLETON_KINDS[section as keyof typeof MONSTER_SINGLETON_KINDS]
    if (!kinds || !(kinds as readonly string[]).includes(kind)) continue
    if (sectionRows(sections, section).some((row) => row.kind === kind)) return true
  }
  return false
}

function hasConstrictPreset(sections: MonsterActionSectionRows): boolean {
  return sectionRows(sections, 'actions').some((row) => row.preset === 'constrict')
}

function findNaturalByForm(
  sections: MonsterActionSectionRows,
  form: string,
): MonsterActionRowLike | undefined {
  return sectionRows(sections, 'actions').find(
    (row) => row.kind === 'natural-weapon' && row.form === form,
  )
}

function primarySpellcastingRow(
  sections: MonsterActionSectionRows,
): MonsterActionRowLike | undefined {
  return sectionRows(sections, 'actions').find((row) => isPrimarySpellcastingAction(row))
}

function disabledWhenSingleton(
  sections: MonsterActionSectionRows,
  kind: string,
): AcquisitionItemState {
  if (!hasSingletonKind(sections, kind)) return {}
  return { disabled: true, note: monsterSingletonKindMessage(kind) }
}

function acquisitionStateForFixedItem(
  itemId: string,
  sections: MonsterActionSectionRows,
): AcquisitionItemState | undefined {
  if (itemId === 'create:spell') {
    return primarySpellcastingRow(sections)
      ? { disabled: true, note: PRIMARY_SPELLCASTING_DUPLICATE_MESSAGE }
      : {}
  }
  if (itemId === 'preset:multiattack') return disabledWhenSingleton(sections, 'multiattack')
  if (itemId === 'preset:constrict') {
    return hasConstrictPreset(sections)
      ? { disabled: true, note: MONSTER_CONSTRICT_PRESET_DUPLICATE_MESSAGE }
      : {}
  }
  if (itemId === 'reaction:parry') return disabledWhenSingleton(sections, 'parry')
  return undefined
}

function acquisitionStateForBonusItem(
  itemId: string,
  sections: MonsterActionSectionRows,
): AcquisitionItemState | undefined {
  if (!itemId.startsWith('bonus:')) return undefined
  return disabledWhenSingleton(sections, itemId.slice('bonus:'.length))
}

function acquisitionStateForNaturalPreset(
  itemId: string,
  sections: MonsterActionSectionRows,
): AcquisitionItemState {
  if (!itemId.startsWith('natural:')) return {}
  const presetId = itemId.slice('natural:'.length) as ActionPresetId
  const preset = getActionPreset(presetId)
  if (preset?.mechanics !== 'attack-roll') return {}
  const existing = findNaturalByForm(sections, preset.defaults.naturalForm)
  return existing?.id ? { focusActionId: existing.id, note: 'Already added' } : {}
}

/** Acquisition menu state for a known add-menu id. */
export function acquisitionStateForItem(
  itemId: string,
  sections: MonsterActionSectionRows,
): AcquisitionItemState {
  return (
    acquisitionStateForFixedItem(itemId, sections) ??
    acquisitionStateForBonusItem(itemId, sections) ??
    acquisitionStateForNaturalPreset(itemId, sections)
  )
}
