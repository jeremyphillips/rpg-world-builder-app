import {
  EXTRA_MOVEMENT_MODES,
  MOVEMENT_MODES,
  MOVEMENT_SPEED_FEET,
  addCustomRefinementIssue,
  defineMessage,
  extraMovementModeSchema,
  fieldValidationMessages,
  getMovementModeLabel,
  movementAlternativeSchema,
  movementModeSchema,
  movementSpeedFeetSchema,
  type ExtraMovementMode,
  type MovementAlternative,
  type MovementMode,
  type MovementSpeedFeet,
  type MovementSpeeds,
} from '@rpg/contracts'
import type { ArrayConfig, FieldVisibility, FormItem } from '@rpg/ui/form'
import { disableOptionsUsedInSiblingRows } from '@rpg/ui/form'
import { z } from 'zod'

export const MOVEMENT_FIELD_LABEL = 'Movement'
export const MOVEMENT_MODE_FIELD_LABEL = 'Mode'
export const MOVEMENT_SPEED_FIELD_LABEL = 'Speed'
export const CREATURE_FLY_HOVER_LABEL = 'Can hover'
export const MOVEMENT_ARRAY_EMPTY_STATE_PRIMARY = 'No modes added.'

export const movementValidationMessages = {
  duplicateMode: defineMessage(
    'validation.content.movement.duplicateMode',
    () => 'Each movement mode can only appear once.',
  ),
  alternativeOverlap: defineMessage(
    'validation.content.movement.alternativeOverlap',
    () => 'This mode cannot appear in both fixed movement and the available alternatives.',
  ),
  alternativeDuplicateMode: defineMessage(
    'validation.content.movement.alternativeDuplicateMode',
    () => 'Alternative movement modes must be distinct.',
  ),
  alternativeMinModes: defineMessage(
    'validation.content.movement.alternativeMinModes',
    () => 'Select at least two alternative movement modes.',
  ),
}

export const MOVEMENT_ALTERNATIVE_HEADING = 'Alternative movement'
export const MOVEMENT_ALTERNATIVE_HINT =
  'Select two or more modes. The GM chooses one for the creature, in addition to its regular movement speeds.'
export const MOVEMENT_ALTERNATIVE_AVAILABLE_MODES_LABEL = 'Available modes'

export type MovementAlternativeFormValues = {
  modes: ExtraMovementMode[]
  feet: MovementSpeedFeet | '' | undefined
}

/** Orders alternative modes for stable persistence and display. */
export function orderMovementAlternativeModes(
  modes: readonly ExtraMovementMode[],
): ExtraMovementMode[] {
  const selected = new Set(modes)
  return EXTRA_MOVEMENT_MODES.filter((mode) => selected.has(mode))
}

const extraMovementModeOptions = EXTRA_MOVEMENT_MODES.map((mode) => ({
  value: mode,
  label: getMovementModeLabel(mode),
}))

function movementModesUsedInFixedRows(
  rows: MovementRowDraftFormValues[] | undefined,
): Set<MovementMode> {
  const used = new Set<MovementMode>()
  for (const row of rows ?? []) {
    if (row.mode && movementModeSchema.safeParse(row.mode).success) {
      used.add(row.mode as MovementMode)
    }
  }
  return used
}

function movementAlternativeSelectedModes(
  alternative: MovementAlternativeFormValues | undefined,
): ExtraMovementMode[] {
  const raw = alternative?.modes ?? []
  return raw.filter(
    (mode): mode is ExtraMovementMode => extraMovementModeSchema.safeParse(mode).success,
  )
}

/** Chip options: hide fixed modes unless already selected (conflicts stay visible and deselectable). */
export function movementAlternativeChipOptions(watched: Record<string, unknown>) {
  const fixedUsed = movementModesUsedInFixedRows(
    watched.movement as MovementRowDraftFormValues[] | undefined,
  )
  const selected = movementAlternativeSelectedModes(
    watched.movementAlternative as MovementAlternativeFormValues | undefined,
  )
  return EXTRA_MOVEMENT_MODES.filter((mode) => !fixedUsed.has(mode) || selected.includes(mode)).map(
    (mode) => ({
      value: mode,
      label: getMovementModeLabel(mode),
    }),
  )
}

export function movementAlternativeRecordToForm(
  alternative?: MovementAlternative,
): MovementAlternativeFormValues | undefined {
  if (!alternative) return undefined
  return {
    modes: orderMovementAlternativeModes(alternative.modes),
    feet: alternative.feet,
  }
}

export function movementAlternativeFormToSchema(
  values: MovementAlternativeFormValues | undefined,
): MovementAlternative | undefined {
  if (!values) return undefined
  if (values.feet === undefined || values.feet === '') return undefined
  const parsed = movementAlternativeSchema.safeParse({
    modes: orderMovementAlternativeModes(values.modes),
    feet: values.feet,
  })
  return parsed.success ? parsed.data : undefined
}

export function refineMovementAlternativeForm(
  alternative: MovementAlternativeFormValues | undefined,
  movementRows: MovementRowDraftFormValues[],
  ctx: z.RefinementCtx,
  pathPrefix: (string | number)[] = ['movementAlternative'],
): void {
  if (!alternative) return
  const modes = movementAlternativeSelectedModes(alternative)
  const modesPath = [...pathPrefix, 'modes'] as const

  if (modes.length > 0 && modes.length < 2) {
    addCustomRefinementIssue(ctx, movementValidationMessages.alternativeMinModes(), [...modesPath])
  }

  if (new Set(modes).size !== modes.length) {
    addCustomRefinementIssue(ctx, movementValidationMessages.alternativeDuplicateMode(), [
      ...modesPath,
    ])
  }

  const fixedModes = movementModesUsedInFixedRows(movementRows)
  const hasOverlap = modes.some((mode) => fixedModes.has(mode))
  if (hasOverlap) {
    addCustomRefinementIssue(ctx, movementValidationMessages.alternativeOverlap(), [...modesPath])
  }
}

export function movementAlternativeGroupField(): FormItem {
  return {
    kind: 'group',
    name: 'movementAlternative',
    heading: {
      label: MOVEMENT_ALTERNATIVE_HEADING,
      hint: MOVEMENT_ALTERNATIVE_HINT,
    },
    headingScale: 'field',
    optionalDisclosure: {
      intent: 'add',
      addLabel: 'Add alternative movement',
      removeLabel: 'Remove alternative movement',
      expandWhenPopulated: true,
      watchPaths: ['movementAlternative'],
      clearPaths: ['movementAlternative'],
      seedWhen: () => ({ modes: [], feet: undefined }),
    },
    fields: [
      {
        type: 'chips',
        name: 'modes',
        label: MOVEMENT_ALTERNATIVE_AVAILABLE_MODES_LABEL,
        required: true,
        min: 2,
        max: EXTRA_MOVEMENT_MODES.length,
        width: 'full',
        options: extraMovementModeOptions,
        optionsResolve: {
          dependsOn: ['movement', 'movementAlternative'],
          optionsWhen: movementAlternativeChipOptions,
        },
      },
      {
        kind: 'row',
        fields: [
          {
            type: 'joinedPair',
            label: MOVEMENT_SPEED_FIELD_LABEL,
            width: 'auto',
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

const movementModeDraftSchema = z.union([movementModeSchema, z.literal('')])
const movementFeetDraftSchema = z.union([movementSpeedFeetSchema, z.literal(''), z.undefined()])

export const movementAlternativeFormSchema = z.object({
  modes: z.array(extraMovementModeSchema),
  feet: movementFeetDraftSchema,
})

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
    addCustomRefinementIssue(
      ctx,
      fieldValidationMessages.requiredSelect({ label: MOVEMENT_MODE_FIELD_LABEL }),
      [...pathPrefix, 'mode'],
    )
  }

  if (row.feet === undefined || row.feet === '') {
    addCustomRefinementIssue(
      ctx,
      fieldValidationMessages.requiredSelect({ label: MOVEMENT_SPEED_FIELD_LABEL }),
      [...pathPrefix, 'feet'],
    )
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

export function movementArrayField(): ArrayConfig {
  return {
    kind: 'array',
    name: 'movement',
    heading: { label: MOVEMENT_FIELD_LABEL },
    headingScale: 'field',
    emptyStatePrimary: MOVEMENT_ARRAY_EMPTY_STATE_PRIMARY,
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
            label: MOVEMENT_MODE_FIELD_LABEL,
            required: true,
            options: movementModeOptions,
            width: 'md',
          },
          {
            type: 'joinedPair',
            label: MOVEMENT_SPEED_FIELD_LABEL,
            width: 'auto',
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

export function movementRowsIncludeFly(rows: MovementRowDraftFormValues[] | undefined): boolean {
  if (!rows) return false
  return rows.some((row) => row.mode === 'fly')
}

export function visibleWhenMovementIncludesFly(): FieldVisibility {
  return {
    dependsOn: ['movement'],
    visibleWhen: (watched) =>
      movementRowsIncludeFly(watched['movement'] as MovementRowDraftFormValues[] | undefined),
  }
}

export function creatureFlyHoverSwitchField(): FormItem {
  return {
    type: 'switch',
    name: 'hover',
    label: CREATURE_FLY_HOVER_LABEL,
    visibility: visibleWhenMovementIncludesFly(),
  }
}

export type MovementWithHoverGroupOptions = {
  includeMovementAlternative?: boolean
}

export function movementWithHoverGroup(options?: MovementWithHoverGroupOptions): FormItem {
  const fields: FormItem[] = [movementArrayField(), creatureFlyHoverSwitchField()]
  if (options?.includeMovementAlternative) {
    fields.push(movementAlternativeGroupField())
  }
  return {
    kind: 'group',
    density: 'comfortable',
    fields,
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

export function refineMovementRows(
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
      addCustomRefinementIssue(ctx, movementValidationMessages.duplicateMode(), [
        ...pathPrefix,
        index,
        'mode',
      ])
    }
    seen.add(mode)
  }
}
