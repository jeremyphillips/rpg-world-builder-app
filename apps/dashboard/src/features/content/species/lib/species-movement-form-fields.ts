import {
  MOVEMENT_MODES,
  MOVEMENT_SPEED_FEET,
  defineMessage,
  fieldValidationMessages,
  formatFieldMessage,
  getMovementModeLabel,
  movementModeSchema,
  movementSpeedFeetSchema,
  type MovementMode,
  type MovementSpeedFeet,
  type MovementSpeeds,
} from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'
import { disableOptionsUsedInSiblingRows } from '@rpg/ui/form'
import { z } from 'zod'

export const speciesMovementValidationMessages = {
  duplicateMode: defineMessage(
    'validation.species.movement.duplicateMode',
    () => 'Each movement mode can only appear once.',
  ),
}

const movementModeDraftSchema = z.union([movementModeSchema, z.literal('')])
const movementFeetDraftSchema = z.union([movementSpeedFeetSchema, z.literal(''), z.undefined()])

export const movementRowDraftFormSchema = z.object({
  mode: movementModeDraftSchema,
  feet: movementFeetDraftSchema,
})

export type MovementRowDraftFormValues = z.infer<typeof movementRowDraftFormSchema>
export type MovementRowFormValues = {
  mode: MovementMode
  feet: MovementSpeedFeet
}

export const movementRowFormSchema = movementRowDraftFormSchema.superRefine((row, ctx) => {
  refineMovementRowRequired(row, ctx)
})

function refineMovementRowRequired(
  row: MovementRowDraftFormValues,
  ctx: z.RefinementCtx,
  pathPrefix: (string | number)[] = [],
): void {
  if (!row.mode) {
    ctx.addIssue({
      code: 'custom',
      message: formatFieldMessage(fieldValidationMessages.requiredSelect({ label: 'Mode' })),
      path: [...pathPrefix, 'mode'],
    })
  }

  if (row.feet === undefined || row.feet === '') {
    ctx.addIssue({
      code: 'custom',
      message: formatFieldMessage(fieldValidationMessages.requiredSelect({ label: 'Speed' })),
      path: [...pathPrefix, 'feet'],
    })
  }
}

const movementModeOptions = MOVEMENT_MODES.map((mode) => ({
  value: mode,
  label: getMovementModeLabel(mode),
}))

const movementFeetOptions = MOVEMENT_SPEED_FEET.map((feet) => ({
  value: feet,
  label: String(feet),
}))

const ALL_MOVEMENT_MODES_ADDED_REASON = 'All movement modes have been added.'

export function movementArrayField(): FormItem {
  return {
    kind: 'array',
    name: 'movement',
    legend: 'Movement',
    addAction: { label: 'Add movement', layout: 'inline', size: 'sm' },
    min: 1,
    max: MOVEMENT_MODES.length,
    density: 'comfortable',
    appendDefaults: () => ({ mode: '', feet: undefined }),
    resolveCanAppend: (items) => {
      const used = new Set(
        (items as MovementRowDraftFormValues[])
          .map((row) => row.mode)
          .filter((mode): mode is MovementMode => Boolean(mode)),
      )
      return used.size >= MOVEMENT_MODES.length
        ? { enabled: false, reason: ALL_MOVEMENT_MODES_ADDED_REASON }
        : { enabled: true }
    },
    filterSelect: {
      filter: disableOptionsUsedInSiblingRows({ fieldName: 'mode' }),
    },
    item: {
      variant: 'compact',
      headerVisibility: 'hidden',
      reorder: 'dragHandle',
      header: {
        fallback: (index) => `Movement ${index + 1}`,
        primaryField: 'mode',
        formatPrimary: (value, values) => {
          if (typeof value !== 'string' || value === '') return undefined
          const feet = values?.feet
          if (feet === undefined || feet === '') return getMovementModeLabel(value as MovementMode)
          return `${getMovementModeLabel(value as MovementMode)} ${feet} ft`
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

/** Preview-only conversion — omits rows without a selected mode. */
export function movementRowsToRecordForPreview(rows: MovementRowDraftFormValues[]): MovementSpeeds {
  const record: Partial<Record<MovementMode, number>> = {}
  for (const row of rows) {
    if (!row.mode || row.feet === undefined || row.feet === '') continue
    record[row.mode] = row.feet
  }
  return record as MovementSpeeds
}

function isCompleteMovementRow(row: MovementRowDraftFormValues): row is MovementRowFormValues {
  return (
    Boolean(row.mode) &&
    movementModeSchema.safeParse(row.mode).success &&
    row.feet !== undefined &&
    row.feet !== '' &&
    movementSpeedFeetSchema.safeParse(row.feet).success
  )
}

/** Publish conversion — expects validated rows from the publish schema. */
export function movementRowsToRecord(rows: MovementRowDraftFormValues[]): MovementSpeeds {
  const record: Partial<Record<MovementMode, number>> = {}
  for (const row of rows) {
    if (!isCompleteMovementRow(row)) {
      throw new Error('movementRowsToRecord expects validated movement rows.')
    }
    record[row.mode] = row.feet
  }
  return record as MovementSpeeds
}

export function refineSpeciesMovementRows(
  rows: MovementRowDraftFormValues[],
  ctx: z.RefinementCtx,
  pathPrefix: (string | number)[] = ['movement'],
): void {
  const seen = new Set<MovementMode>()
  for (const [index, row] of rows.entries()) {
    if (!row.mode) continue
    if (!movementModeSchema.safeParse(row.mode).success) continue

    const mode = row.mode as MovementMode
    if (seen.has(mode)) {
      ctx.addIssue({
        code: 'custom',
        message: speciesMovementValidationMessages.duplicateMode(),
        path: [...pathPrefix, index, 'mode'],
      })
    }
    seen.add(mode)
  }
}
