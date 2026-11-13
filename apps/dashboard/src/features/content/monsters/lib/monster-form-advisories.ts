import {
  isWeaponEquipment,
  isWeaponProficientFromGrantSet,
  joinInlineMetadata,
  resolveCreatureMovement,
  resolveEquipmentNotProficientShortLabel,
  type Equipment,
  type MovementMode,
} from '@rpg/contracts'

import { movementRowsToRecordForPreview } from '../../lib/forms/fields/content-movement-form-fields'
import type { MovementRowDraftFormValues } from '../../lib/forms/fields/content-movement-form-fields'
import { equipmentEntryBaseName } from './equipment/monster-equipment-labels'
import { coerceCreatureWeaponProficienciesForForm } from './creature-details/monster-weapon-proficiencies-form.lib'
import {
  MONSTER_ACTION_SECTIONS,
  type MonsterActionSection,
} from './actions/monster-action-equipment-references'
import type { MonsterActionDraftRow } from './actions/monster-action-presets'
import { readWalkSpeed, isLeapWholeFeet } from './actions/leap-distance-options'
import type { MonsterFormValues } from './monster-form-values'

export const TUNNELER_MISSING_BURROW_SPEED_MESSAGE =
  "Tunneler uses half the creature's Burrow Speed, but no Burrow Speed is configured."

export const FLYBY_MISSING_FLY_SPEED_MESSAGE =
  'Flyby only applies while flying, but this creature has no Fly Speed.'

export const LEAP_MISSING_WALK_SPEED_MESSAGE =
  'Leap spends movement, but no Walk Speed is configured.'

export const LEAP_ZERO_WALK_SPEED_MESSAGE = 'Leap spends movement, but Walk Speed is 0.'

export const LEAP_MOVEMENT_EXCEEDS_WALK_SPEED_MESSAGE =
  "Movement spent is greater than this creature's Walk Speed."

export type MonsterFormAdvisory = {
  code:
    | 'weapon-not-equipped'
    | 'weapon-not-proficient'
    | 'tunneler-missing-burrow-speed'
    | 'flyby-missing-fly-speed'
    | 'leap-missing-walk-speed'
    | 'leap-zero-walk-speed'
    | 'leap-movement-exceeds-walk-speed'
    | 'multiattack-unavailable-action'
  message: string
  path: string
}

type SpeedSupport = 'usable' | 'incomplete' | 'absent'

function speedSupport(
  rows: readonly MovementRowDraftFormValues[] | undefined,
  mode: MovementMode,
): SpeedSupport {
  const matching = (rows ?? []).filter((row) => row.mode === mode)
  if (matching.length === 0) return 'absent'
  const resolved = resolveCreatureMovement({
    movement: movementRowsToRecordForPreview([...(rows ?? [])]),
  })
  const feet = resolved[mode]
  if (feet !== undefined && feet > 0) return 'usable'
  const unfinished = matching.some((row) => row.feet === '' || row.feet === undefined)
  if (unfinished && feet === undefined) return 'incomplete'
  return 'absent'
}

function collectTraitSpeedAdvisories(values: MonsterFormValues): MonsterFormAdvisory[] {
  const burrow = speedSupport(values.movement, 'burrow')
  const fly = speedSupport(values.movement, 'fly')
  const advisories: MonsterFormAdvisory[] = []
  ;(values.traits ?? []).forEach((trait, index) => {
    if (!('preset' in trait)) return
    const path = `traits.${index}`
    if (trait.preset === 'tunneler' && burrow === 'absent') {
      advisories.push({
        code: 'tunneler-missing-burrow-speed',
        message: TUNNELER_MISSING_BURROW_SPEED_MESSAGE,
        path,
      })
    }
    if (trait.preset === 'flyby' && fly === 'absent') {
      advisories.push({
        code: 'flyby-missing-fly-speed',
        message: FLYBY_MISSING_FLY_SPEED_MESSAGE,
        path,
      })
    }
  })
  return advisories
}

function sectionRows(
  values: MonsterFormValues,
  section: MonsterActionSection,
): MonsterActionDraftRow[] {
  const rows = values[section]
  return Array.isArray(rows) ? (rows as MonsterActionDraftRow[]) : []
}

function appendMultiattackAdvisories(
  advisories: MonsterFormAdvisory[],
  values: MonsterFormValues,
  section: MonsterActionSection,
  action: MonsterActionDraftRow,
  index: number,
): void {
  if (action.kind !== 'multiattack') return
  const path = `${section}.${index}`
  const seen = new Set<string>()
  for (const step of action.steps ?? []) {
    for (const actionId of step.actionIds ?? []) {
      if (seen.has(actionId)) continue
      const target = sectionRows(values, 'actions').find((row) => row.id === actionId)
      if (!target || target.available !== false) continue
      seen.add(actionId)
      const name = target.name?.trim() || 'An attack'
      advisories.push({
        code: 'multiattack-unavailable-action',
        message: `${name} is unavailable, so this multiattack cannot use it.`,
        path,
      })
    }
  }
}

function appendWeaponAdvisories(
  advisories: MonsterFormAdvisory[],
  values: MonsterFormValues,
  equipmentById: ReadonlyMap<string, Equipment>,
  section: MonsterActionSection,
  action: MonsterActionDraftRow,
  index: number,
): void {
  if (action.kind !== 'weapon' || !action.equipmentEntryId) return
  const entry = (values.equipment ?? []).find((row) => row.entryId === action.equipmentEntryId)
  if (!entry) return
  const item = equipmentById.get(entry.equipmentId)
  const name = equipmentEntryBaseName(entry, equipmentById)
  const path = `${section}.${index}`
  if (!entry.equipped) {
    advisories.push({
      code: 'weapon-not-equipped',
      message: `${name} is not equipped.`,
      path,
    })
  }
  if (!item || !isWeaponEquipment(item)) return
  const proficient = isWeaponProficientFromGrantSet(
    item,
    coerceCreatureWeaponProficienciesForForm(values.proficiencies?.weapons),
  )
  if (proficient) return
  advisories.push({
    code: 'weapon-not-proficient',
    message: joinInlineMetadata([resolveEquipmentNotProficientShortLabel(), 'PB not included']),
    path,
  })
}

function appendLeapAdvisories(
  advisories: MonsterFormAdvisory[],
  values: MonsterFormValues,
  section: MonsterActionSection,
  action: MonsterActionDraftRow,
  index: number,
): void {
  if (action.kind !== 'leap') return
  if (!isLeapWholeFeet(action.distanceFeet) || !isLeapWholeFeet(action.movementFeet)) return
  const walk = readWalkSpeed(values.movement)
  const path = `${section}.${index}`
  if (walk.status === 'missing') {
    advisories.push({
      code: 'leap-missing-walk-speed',
      message: LEAP_MISSING_WALK_SPEED_MESSAGE,
      path,
    })
    return
  }
  if (walk.status === 'zero') {
    advisories.push({
      code: 'leap-zero-walk-speed',
      message: LEAP_ZERO_WALK_SPEED_MESSAGE,
      path,
    })
    return
  }
  if (walk.status === 'usable' && action.movementFeet > walk.feet) {
    advisories.push({
      code: 'leap-movement-exceeds-walk-speed',
      message: LEAP_MOVEMENT_EXCEEDS_WALK_SPEED_MESSAGE,
      path,
    })
  }
}

export function collectMonsterFormAdvisories(
  values: MonsterFormValues,
  equipmentById: ReadonlyMap<string, Equipment>,
): MonsterFormAdvisory[] {
  const advisories: MonsterFormAdvisory[] = []

  for (const section of MONSTER_ACTION_SECTIONS) {
    sectionRows(values, section).forEach((action, index) => {
      if (action.kind === 'multiattack') {
        appendMultiattackAdvisories(advisories, values, section, action, index)
        return
      }
      appendWeaponAdvisories(advisories, values, equipmentById, section, action, index)
      appendLeapAdvisories(advisories, values, section, action, index)
    })
  }

  return [...advisories, ...collectTraitSpeedAdvisories(values)]
}
