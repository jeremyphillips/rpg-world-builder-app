import { getActionPreset, type ActionPresetId } from '../../action/action-presets'
import { PRIMARY_SPELLCASTING_DUPLICATE_MESSAGE } from '../spell-casting-source'
import { isPrimarySpellcastingAction } from '../spell-casting-source'
import {
  monsterActionSectionRowPath,
  monsterActionSectionRows,
  type MonsterActionSectionBody,
} from '../action-section-access'
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

export type MonsterActionSectionRows = MonsterActionSectionBody

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
  return monsterActionSectionRows<MonsterActionRowLike>(sections, section)
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
          path: [...prefix, ...monsterActionSectionRowPath(section, index, 'kind')],
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
  pushShapeShiftViolations(sections, prefix, violations)
  return violations
}

function pushShapeShiftViolations(
  sections: MonsterActionSectionRows,
  prefix: (string | number)[],
  violations: RepeatabilityViolation[],
): void {
  const matches: { section: MonsterActionSection; index: number }[] = []
  for (const section of MONSTER_ACTION_SECTIONS) {
    sectionRows(sections, section).forEach((row, index) => {
      if (row.kind === 'shape-shift') matches.push({ section, index })
    })
  }
  for (const match of matches.slice(1)) {
    violations.push({
      message: monsterSingletonKindMessage('shape-shift'),
      path: [...prefix, ...monsterActionSectionRowPath(match.section, match.index, 'kind')],
    })
  }
}

function hasSingletonKindInSection(
  sections: MonsterActionSectionRows,
  section: MonsterActionSection,
  kind: string,
): boolean {
  const kinds = MONSTER_SINGLETON_KINDS[section as keyof typeof MONSTER_SINGLETON_KINDS]
  if (!kinds || !(kinds as readonly string[]).includes(kind)) return false
  return sectionRows(sections, section).some((row) => row.kind === kind)
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
  section: MonsterActionSection,
  kind: string,
): AcquisitionItemState {
  if (!hasSingletonKindInSection(sections, section, kind)) return {}
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
  if (itemId === 'preset:multiattack') {
    return disabledWhenSingleton(sections, 'actions', 'multiattack')
  }
  if (itemId === 'preset:constrict') {
    return hasConstrictPreset(sections)
      ? { disabled: true, note: MONSTER_CONSTRICT_PRESET_DUPLICATE_MESSAGE }
      : {}
  }
  if (itemId === 'reaction:parry') {
    return disabledWhenSingleton(sections, 'reactions', 'parry')
  }
  if (itemId === 'create:shape-shift') {
    for (const section of MONSTER_ACTION_SECTIONS) {
      if (sectionRows(sections, section).some((row) => row.kind === 'shape-shift')) {
        return { disabled: true, note: monsterSingletonKindMessage('shape-shift') }
      }
    }
    return {}
  }
  return undefined
}

function acquisitionStateForBonusItem(
  itemId: string,
  sections: MonsterActionSectionRows,
): AcquisitionItemState | undefined {
  if (!itemId.startsWith('bonus:')) return undefined
  return disabledWhenSingleton(sections, 'bonusActions', itemId.slice('bonus:'.length))
}

const PORTABLE_CREATE_KINDS = new Set(['leap', 'teleport', 'take-actions'])

function portableCreateKindFromItemId(itemId: string): string | undefined {
  const prefix = 'create:'
  if (!itemId.startsWith(prefix)) return undefined
  const kind = itemId.slice(prefix.length)
  return PORTABLE_CREATE_KINDS.has(kind) ? kind : undefined
}

function singletonLockSectionForPortableKind(
  kind: string,
  menuSection: MonsterActionSection | undefined,
): MonsterActionSection | undefined {
  if (kind === 'teleport' && menuSection) return menuSection
  if (menuSection === 'bonusActions') return 'bonusActions'
  return undefined
}

function acquisitionStateForPortableCreateItem(
  itemId: string,
  sections: MonsterActionSectionRows,
  section?: MonsterActionSection,
): AcquisitionItemState | undefined {
  const kind = portableCreateKindFromItemId(itemId)
  if (!kind) return undefined
  const lockSection = singletonLockSectionForPortableKind(kind, section)
  if (!lockSection) return {}
  return disabledWhenSingleton(sections, lockSection, kind)
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
  options?: { section?: MonsterActionSection },
): AcquisitionItemState {
  return (
    acquisitionStateForFixedItem(itemId, sections) ??
    acquisitionStateForBonusItem(itemId, sections) ??
    acquisitionStateForPortableCreateItem(itemId, sections, options?.section) ??
    acquisitionStateForNaturalPreset(itemId, sections)
  )
}
