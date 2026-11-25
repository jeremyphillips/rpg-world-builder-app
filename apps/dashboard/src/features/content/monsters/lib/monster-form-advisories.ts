import {
  CHALLENGE_RATING_MECHANICS,
  collectFormAvailabilityAdvisories,
  multiattackStepReferencedActionIds,
  type ChallengeRating,
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
import { equipmentEntryBaseName } from './equipment/monster-equipment-entry-name'
import { coerceCreatureWeaponProficienciesForForm } from './creature-details/monster-weapon-proficiencies-form.lib'
import {
  MONSTER_ACTION_SECTIONS,
  type MonsterActionSection,
} from './actions/references/monster-action-equipment-references'
import type { MonsterActionDraftRow } from './actions/monster-action-presets'
import { readWalkSpeed, isLeapWholeFeet } from './actions/leap-distance-options'
import type { MonsterFormValues } from './monster-form-values'
import {
  monsterFormSectionRowNamePrefix,
  monsterFormSectionRows,
} from './actions/monster-action-section-access'

export const TUNNELER_MISSING_BURROW_SPEED_MESSAGE =
  "Tunneler uses half the creature's Burrow Speed, but no Burrow Speed is configured."

export const FLYBY_MISSING_FLY_SPEED_MESSAGE =
  'Flyby only applies while flying, but this creature has no Fly Speed.'

export const LEAP_MISSING_WALK_SPEED_MESSAGE =
  'Leap spends movement, but no Walk Speed is configured.'

export const LEAP_ZERO_WALK_SPEED_MESSAGE = 'Leap spends movement, but Walk Speed is 0.'

export const LEAP_MOVEMENT_EXCEEDS_WALK_SPEED_MESSAGE =
  "Movement spent is greater than this creature's Walk Speed."

export const LEGENDARY_ACTIONS_BELOW_CR_10_MESSAGE =
  "Legendary Actions are uncommon below CR 10. The SRD's only example is the Unicorn at CR 5. Consider whether the extra actions fit this creature's intended challenge."

export const LEGENDARY_ACTION_POOL_OUTSIDE_SRD_MESSAGE =
  'SRD monsters with Legendary Actions have 3 uses. This creature has {normal}. Review the intended action economy.'

export const IN_LAIR_USE_COUNT_OUTSIDE_SRD_MESSAGE =
  'SRD examples increase this use count by 1 in a lair. This creature has {normal} normally and {inLair} in its lair.'

export const LEGENDARY_RESISTANCE_USES_OUTSIDE_SRD_MESSAGE =
  'In the SRD, Legendary Resistance has 3, 4, or 6 uses per day. This creature has {normal}.'

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
    | 'form-restricted-reference'
    | 'form-restricted-multiattack'
    | 'legendary-actions-below-cr-10'
    | 'legendary-action-pool-outside-srd'
    | 'in-lair-use-count-outside-srd'
    | 'legendary-resistance-uses-outside-srd'
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
  return monsterFormSectionRows(values, section)
}

function multiattackStepTargetIds(step: unknown): readonly string[] {
  if (!step || typeof step !== 'object') return []
  return multiattackStepReferencedActionIds(
    step as Parameters<typeof multiattackStepReferencedActionIds>[0],
  )
}

function appendMultiattackAdvisories(
  advisories: MonsterFormAdvisory[],
  values: MonsterFormValues,
  section: MonsterActionSection,
  action: MonsterActionDraftRow,
  index: number,
): void {
  if (action.kind !== 'multiattack') return
  const path = `${monsterFormSectionRowNamePrefix(section)}.${index}`
  const seen = new Set<string>()
  for (const step of action.steps ?? []) {
    for (const actionId of multiattackStepTargetIds(step)) {
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
  const path = `${monsterFormSectionRowNamePrefix(section)}.${index}`
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
  const path = `${monsterFormSectionRowNamePrefix(section)}.${index}`
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

function pushInLairUseCountAdvisory(
  advisories: MonsterFormAdvisory[],
  lairOn: boolean,
  path: string,
  normal: number,
  inLair: number,
): void {
  if (lairOn && inLair === normal + 1) return
  advisories.push({
    code: 'in-lair-use-count-outside-srd',
    message: IN_LAIR_USE_COUNT_OUTSIDE_SRD_MESSAGE.replace('{normal}', String(normal)).replace(
      '{inLair}',
      String(inLair),
    ),
    path,
  })
}

function appendLegendaryBelowCr10Advisory(
  advisories: MonsterFormAdvisory[],
  challengeRating: MonsterFormValues['challengeRating'],
): void {
  if (typeof challengeRating !== 'string') return
  if (CHALLENGE_RATING_MECHANICS[challengeRating as ChallengeRating].value >= 10) return
  advisories.push({
    code: 'legendary-actions-below-cr-10',
    message: LEGENDARY_ACTIONS_BELOW_CR_10_MESSAGE,
    path: 'legendaryActions.uses.normal',
  })
}

function appendLegendaryPoolSizeAdvisory(
  advisories: MonsterFormAdvisory[],
  normalPool: number | undefined,
): void {
  if (typeof normalPool !== 'number' || normalPool === 3) return
  advisories.push({
    code: 'legendary-action-pool-outside-srd',
    message: LEGENDARY_ACTION_POOL_OUTSIDE_SRD_MESSAGE.replace('{normal}', String(normalPool)),
    path: 'legendaryActions.uses.normal',
  })
}

function appendLegendaryInLairPoolAdvisory(
  advisories: MonsterFormAdvisory[],
  lairOn: boolean,
  normalPool: number | undefined,
  inLairPool: number | undefined,
): void {
  if (typeof normalPool !== 'number' || typeof inLairPool !== 'number') return
  pushInLairUseCountAdvisory(
    advisories,
    lairOn,
    'legendaryActions.uses.inLair',
    normalPool,
    inLairPool,
  )
}

function collectLegendaryActionPoolAdvisories(values: MonsterFormValues): MonsterFormAdvisory[] {
  const hasLegendaryRows = (values.legendaryActions?.actions?.length ?? 0) > 0
  if (!hasLegendaryRows) return []

  const advisories: MonsterFormAdvisory[] = []
  const normalPool = values.legendaryActions?.uses?.normal
  appendLegendaryBelowCr10Advisory(advisories, values.challengeRating)
  appendLegendaryPoolSizeAdvisory(advisories, normalPool)
  appendLegendaryInLairPoolAdvisory(
    advisories,
    values.lair?.enabled === true,
    normalPool,
    values.legendaryActions?.uses?.inLair,
  )
  return advisories
}

const SRD_LEGENDARY_RESISTANCE_USES = new Set([3, 4, 6])

function legendaryResistanceUsesFromTrait(
  trait: NonNullable<MonsterFormValues['traits']>[number],
): { normal?: number; inLair?: number } | undefined {
  if (
    !('kind' in trait) ||
    trait.kind !== 'template' ||
    trait.templateId !== 'legendary-resistance'
  ) {
    return undefined
  }
  const config = trait.config
  if (!config || typeof config !== 'object' || Array.isArray(config)) return undefined
  return (config as { uses?: { normal?: number; inLair?: number } }).uses
}

function appendLegendaryResistanceTraitAdvisories(
  advisories: MonsterFormAdvisory[],
  traitIndex: number,
  uses: { normal?: number; inLair?: number },
  lairOn: boolean,
): void {
  const resistanceNormal = uses.normal
  if (
    typeof resistanceNormal === 'number' &&
    !SRD_LEGENDARY_RESISTANCE_USES.has(resistanceNormal)
  ) {
    advisories.push({
      code: 'legendary-resistance-uses-outside-srd',
      message: LEGENDARY_RESISTANCE_USES_OUTSIDE_SRD_MESSAGE.replace(
        '{normal}',
        String(resistanceNormal),
      ),
      path: `traits.${traitIndex}.config.uses.normal`,
    })
  }
  if (typeof resistanceNormal === 'number' && typeof uses.inLair === 'number') {
    pushInLairUseCountAdvisory(
      advisories,
      lairOn,
      `traits.${traitIndex}.config.uses.inLair`,
      resistanceNormal,
      uses.inLair,
    )
  }
}

function collectLegendaryResistanceTraitAdvisories(
  traits: MonsterFormValues['traits'],
  lairOn: boolean,
): MonsterFormAdvisory[] {
  const advisories: MonsterFormAdvisory[] = []
  for (const [index, trait] of (traits ?? []).entries()) {
    const uses = legendaryResistanceUsesFromTrait(trait)
    if (!uses) continue
    appendLegendaryResistanceTraitAdvisories(advisories, index, uses, lairOn)
  }
  return advisories
}

function collectLairAndLegendaryAdvisories(values: MonsterFormValues): MonsterFormAdvisory[] {
  const lairOn = values.lair?.enabled === true
  return [
    ...collectLegendaryActionPoolAdvisories(values),
    ...collectLegendaryResistanceTraitAdvisories(values.traits, lairOn),
  ]
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

  return [
    ...advisories,
    ...collectTraitSpeedAdvisories(values),
    ...collectFormAvailabilityAdvisories(
      values as Parameters<typeof collectFormAvailabilityAdvisories>[0],
    ),
    ...collectLairAndLegendaryAdvisories(values),
  ]
}
