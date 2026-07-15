import {
  MOVEMENT_MODES,
  MOVEMENT_SPEED_FEET,
  defineMessage,
  getMovementModeLabel,
  movementModeSchema,
  type MovementMode,
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
  feet: z.coerce.number().int().min(1),
})

export type MovementRowFormValues = z.input<typeof movementRowFormSchema>

export const DEFAULT_MOVEMENT_ROW: MovementRowFormValues = {
  mode: 'walk',
  feet: '30',
}

const movementModeOptions = MOVEMENT_MODES.map((mode) => ({
  value: mode,
  label: getMovementModeLabel(mode),
}))

const movementFeetOptions = MOVEMENT_SPEED_FEET.map((feet) => ({
  value: String(feet),
  label: String(feet),
}))

export function movementArrayField(): FormItem {
  return {
    kind: 'array',
    name: 'movement',
    legend: 'Movement',
    addLabel: 'Add movement speed',
    min: 1,
    itemVariant: 'compact',
    compactInlineAlign: 'center',
    size: 'md',
    addVariant: 'secondary',
    itemChrome: 'subtle',
    itemHeader: {
      fallback: (index) => `Movement ${index + 1}`,
      primaryField: 'mode',
      formatPrimary: (value, values) => {
        if (typeof value !== 'string') return undefined
        const feet = values?.feet
        if (feet === undefined || feet === '') return getMovementModeLabel(value)
        return `${getMovementModeLabel(value)} ${feet} ft`
      },
    },
    fields: [
      {
        type: 'inlineSentence',
        name: 'movementRow',
        label: 'Movement',
        reorder: 'dragHandle',
        hideLabel: true,
        segments: [
          {
            kind: 'select',
            name: 'mode',
            options: movementModeOptions,
            defaultValue: 'walk',
            width: 'lg',
            ariaLabel: 'Movement mode',
          },
          {
            kind: 'select',
            name: 'feet',
            options: movementFeetOptions,
            defaultValue: '30',
            width: 'sm',
            ariaLabel: 'Movement speed in feet',
          },
          { kind: 'text', value: 'ft', tone: 'label' },
        ],
      },
    ],
  }
}

export function movementRecordToRows(
  movement: MovementSpeeds,
): Array<{ mode: MovementMode; feet: number }> {
  return MOVEMENT_MODES.filter((mode) => movement[mode] !== undefined).map((mode) => ({
    mode,
    feet: movement[mode]!,
  }))
}

export function movementRowsToRecord(rows: MovementRowFormValues[]): MovementSpeeds {
  const record: Partial<Record<MovementMode, number>> = {}
  for (const row of rows) {
    const feet = typeof row.feet === 'number' ? row.feet : Number(row.feet)
    record[row.mode] = feet
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
