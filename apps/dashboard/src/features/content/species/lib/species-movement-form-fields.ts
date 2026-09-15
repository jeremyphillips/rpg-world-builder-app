import {
  MOVEMENT_MODES,
  MOVEMENT_SPEED_FEET,
  defineMessage,
  getMovementModeLabel,
  movementModeSchema,
  movementSpeedFeetSchema,
  type MovementMode,
  type MovementSpeedFeet,
  type MovementSpeeds,
} from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'
import { z } from 'zod'

export const speciesMovementValidationMessages = {
  duplicateMode: defineMessage(
    'validation.species.movement.duplicateMode',
    () => 'Each movement mode can only appear once.',
  ),
}

export const movementRowFormSchema = z.object({
  mode: movementModeSchema,
  feet: movementSpeedFeetSchema,
})

export type MovementRowFormValues = z.infer<typeof movementRowFormSchema>

export const DEFAULT_MOVEMENT_ROW: MovementRowFormValues = {
  mode: 'walk',
  feet: 30,
}

const movementModeOptions = MOVEMENT_MODES.map((mode) => ({
  value: mode,
  label: getMovementModeLabel(mode),
}))

const movementFeetOptions = MOVEMENT_SPEED_FEET.map((feet) => ({
  value: feet,
  label: String(feet),
}))

export function movementArrayField(): FormItem {
  return {
    kind: 'array',
    name: 'movement',
    legend: 'Movement',
    addAction: { label: 'Add movement', layout: 'inline', size: 'sm' },
    min: 1,
    density: 'comfortable',
    item: {
      variant: 'compact',
      headerVisibility: 'hidden',
      reorder: 'dragHandle',
      header: {
        fallback: (index) => `Movement ${index + 1}`,
        primaryField: 'mode',
        formatPrimary: (value, values) => {
          if (typeof value !== 'string') return undefined
          const feet = values?.feet
          if (feet === undefined || feet === '') return getMovementModeLabel(value)
          return `${getMovementModeLabel(value)} ${feet} ft`
        },
      },
    },
    fields: [
      {
        kind: 'row',
        fields: [
          {
            type: 'select',
            name: 'mode',
            label: 'Mode',
            required: true,
            options: movementModeOptions,
            defaultValue: 'walk',
            width: 'md',
          },
          {
            type: 'joinedPair',
            label: 'Speed',
            required: true,
            start: {
              kind: 'select',
              name: 'feet',
              options: movementFeetOptions,
              defaultValue: 30,
              digits: 3,
              ariaLabel: 'Speed value',
            },
            end: {
              kind: 'label',
              text: 'ft.',
              ariaLabel: 'Speed unit',
            },
          },
        ],
      },
    ],
  }
}

export function movementRecordToRows(movement: MovementSpeeds): MovementRowFormValues[] {
  return MOVEMENT_MODES.filter((mode) => movement[mode] !== undefined).map((mode) => ({
    mode,
    feet: movement[mode]! as MovementSpeedFeet,
  }))
}

export function movementRowsToRecord(rows: MovementRowFormValues[]): MovementSpeeds {
  const record: Partial<Record<MovementMode, number>> = {}
  for (const row of rows) {
    record[row.mode] = row.feet
  }
  return record as MovementSpeeds
}

export function refineSpeciesMovementRows(
  rows: MovementRowFormValues[],
  ctx: z.RefinementCtx,
  pathPrefix: (string | number)[] = ['movement'],
): void {
  const seen = new Set<MovementMode>()
  for (const [index, row] of rows.entries()) {
    if (seen.has(row.mode)) {
      ctx.addIssue({
        code: 'custom',
        message: speciesMovementValidationMessages.duplicateMode(),
        path: [...pathPrefix, index, 'mode'],
      })
    }
    seen.add(row.mode)
  }
}
