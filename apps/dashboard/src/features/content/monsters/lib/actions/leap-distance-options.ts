import {
  LEAP_DISTANCE_MAX,
  LEAP_MOVEMENT_MAX,
  MEASURED_RANGE_FEET,
  resolveCreatureMovement,
  type MovementSpeeds,
} from '@rpg/contracts'
import type { JoinedPairFieldConfig } from '@rpg/ui/form'

import {
  distanceAmountOptions,
  distanceJoinedPairField,
} from '../../../lib/forms/fields/content-distance-form-fields'
import {
  movementRowsToRecordForPreview,
  type MovementRowDraftFormValues,
} from '../../../lib/forms/fields/content-movement-form-fields'
import {
  MONSTER_LEAP_DISTANCE_HINT,
  MONSTER_LEAP_DISTANCE_LABEL,
  MONSTER_LEAP_MOVEMENT_HINT,
  MONSTER_LEAP_MOVEMENT_LABEL,
  formatLeapWalkSpeedHint,
} from '../monster-form-labels'

export type WalkSpeedState =
  | { status: 'missing' }
  | { status: 'incomplete' }
  | { status: 'zero' }
  | { status: 'usable'; feet: number }

function isMovementRow(value: unknown): value is MovementRowDraftFormValues {
  return typeof value === 'object' && value !== null && 'mode' in value
}

/** Positive whole feet. Preset steps are not required. */
export function isLeapWholeFeet(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1
}

/** Authored Walk row only. A blank feet value is incomplete. Zero is not missing. */
export function readWalkSpeed(movement: unknown): WalkSpeedState {
  if (!Array.isArray(movement)) return { status: 'missing' }
  const rows = movement.filter(isMovementRow)
  const walk = rows.filter((row) => row.mode === 'walk')
  if (walk.length === 0) return { status: 'missing' }
  const resolved: MovementSpeeds = resolveCreatureMovement({
    movement: movementRowsToRecordForPreview(rows),
  })
  const feet = resolved.walk
  const unfinished = walk.some((row) => row.feet === '' || row.feet === undefined)
  if (unfinished && feet === undefined) return { status: 'incomplete' }
  if (feet === 0) return { status: 'zero' }
  if (feet !== undefined && feet > 0) return { status: 'usable', feet }
  return { status: 'missing' }
}

/** Preset jump distances strictly above the selected cost. An empty cost shows the full ladder. */
export function leapJumpPresetFeet(movementSpent: unknown): readonly number[] {
  if (!isLeapWholeFeet(movementSpent)) return MEASURED_RANGE_FEET
  return MEASURED_RANGE_FEET.filter((feet) => feet > movementSpent)
}

/**
 * Preset costs strictly below the selected jump.
 * A usable Walk Speed also drops presets above that speed. Zero and missing speeds do not.
 */
export function leapMovementPresetFeet(
  jumpDistance: unknown,
  walk: WalkSpeedState,
): readonly number[] {
  return MEASURED_RANGE_FEET.filter((feet) => {
    if (isLeapWholeFeet(jumpDistance) && feet >= jumpDistance) return false
    if (walk.status === 'usable' && feet > walk.feet) return false
    return true
  })
}

const WALK_SPEED_DEPENDENCY = '../../movement'

function withResolvedOptions(
  field: JoinedPairFieldConfig,
  optionsResolve: NonNullable<
    Extract<JoinedPairFieldConfig['start'], { kind: 'select' }>['optionsResolve']
  >,
): JoinedPairFieldConfig {
  if (field.start.kind !== 'select') return field
  return { ...field, start: { ...field.start, optionsResolve } }
}

/** Jump distance and Movement spent, with Leap filtering and the Walk Speed hint. */
export function leapDistanceFields(): [JoinedPairFieldConfig, JoinedPairFieldConfig] {
  const jump = withResolvedOptions(
    distanceJoinedPairField({
      amountName: 'distanceFeet',
      label: MONSTER_LEAP_DISTANCE_LABEL,
      presets: MEASURED_RANGE_FEET,
      allowCustom: true,
      customMin: 1,
      customMax: LEAP_DISTANCE_MAX,
      required: true,
      hint: { text: MONSTER_LEAP_DISTANCE_HINT },
    }),
    {
      dependsOn: ['movementFeet'],
      optionsWhen: (values) => distanceAmountOptions(leapJumpPresetFeet(values.movementFeet)),
    },
  )
  const movement = withResolvedOptions(
    distanceJoinedPairField({
      amountName: 'movementFeet',
      label: MONSTER_LEAP_MOVEMENT_LABEL,
      presets: MEASURED_RANGE_FEET,
      allowCustom: true,
      customMin: 1,
      customMax: LEAP_MOVEMENT_MAX,
      required: true,
      hint: {
        position: 'below-control',
        resolve: {
          dependsOn: [WALK_SPEED_DEPENDENCY],
          hintWhen: (values) => {
            const walk = readWalkSpeed(values[WALK_SPEED_DEPENDENCY])
            return walk.status === 'usable'
              ? formatLeapWalkSpeedHint(walk.feet)
              : MONSTER_LEAP_MOVEMENT_HINT
          },
        },
      },
    }),
    {
      dependsOn: ['distanceFeet', WALK_SPEED_DEPENDENCY],
      optionsWhen: (values) =>
        distanceAmountOptions(
          leapMovementPresetFeet(values.distanceFeet, readWalkSpeed(values[WALK_SPEED_DEPENDENCY])),
        ),
    },
  )
  return [jump, movement]
}
