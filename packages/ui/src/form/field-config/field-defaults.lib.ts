import { defaultDiceFormulaForMode } from '../../components/ui/dice-formula-field.lib'
import {
  isInlineSentenceBoundSegment,
  isInlineSentenceJoinedPairSegment,
} from '../../components/ui/inline-sentence-field.lib'
import type { InlineSentenceSegment } from '../../components/ui/inline-sentence-field.types'
import type { EditableGridValue } from '../../components/ui/editable-grid.client'
import { resolveColumnsCollapseSequence } from '../config/form-columns-collapse.lib'

import type { FieldType } from './field-base.types'
import type { FieldConfig } from './field-config.types'
import type {
  ChooseFromChipsFieldConfig,
  ChipsFieldConfig,
  ComboboxFieldConfig,
  InlineChooseCountFieldConfig,
} from './choice-fields.types'
import type {
  EditableGridColumnConfig,
  EditableGridFieldConfig,
  InlineSentenceFieldConfig,
  JoinedPairFieldConfig,
  LevelRangeFieldConfig,
} from './composite-fields.types'
import type { DiceFormulaFieldConfig } from './dice-fields.types'
import type { FormItem } from './form-item.types'
import { flattenFields } from './form-item-walk.lib'
import { isRowSlotItem } from './row-field.lib'

const TYPE_DEFAULTS: Record<FieldType, unknown> = {
  text: '',
  textSuggestions: '',
  number: undefined,
  textarea: '',
  select: '',
  radio: '',
  radioCard: '',
  segmentedControl: '',
  checkbox: false,
  switch: false,
  json: '',
  richtext: '',
  markdown: '',
  file: [],
  chips: [],
  combobox: [],
  editableGrid: {},
  diceFormula: defaultDiceFormulaForMode('optional'),
  inputSelect: {},
  inputUnit: undefined,
  chooseFromChips: [],
  inlineChooseCount: undefined,
  inlineSentence: undefined,
  joinedPair: undefined,
  levelRange: undefined,
  rollValue: undefined,
}

function assignInlineSentenceJoinedPairDefaults(
  segment: Extract<InlineSentenceSegment, { kind: 'joinedPair' }>,
  values: Record<string, unknown>,
): void {
  const { start, end } = segment
  if (start.kind === 'number') {
    values[start.name] = start.defaultValue ?? TYPE_DEFAULTS.number
  } else if (start.kind === 'select') {
    values[start.name] = start.defaultValue ?? TYPE_DEFAULTS.select
  }
  if (end.kind === 'select') {
    values[end.name] = end.defaultValue ?? TYPE_DEFAULTS.select
  }
}

function assignInlineSentenceDefaults(
  field: InlineSentenceFieldConfig,
  values: Record<string, unknown>,
): void {
  for (const segment of field.segments) {
    if (isInlineSentenceJoinedPairSegment(segment)) {
      assignInlineSentenceJoinedPairDefaults(segment, values)
      continue
    }
    if (!isInlineSentenceBoundSegment(segment)) continue
    const explicit = segment.defaultValue
    if (segment.kind === 'number') {
      values[segment.name] = explicit ?? TYPE_DEFAULTS.number
      continue
    }
    values[segment.name] = explicit ?? TYPE_DEFAULTS.select
  }

  if (field.below) {
    values[field.below.name] = field.below.defaultValue ?? TYPE_DEFAULTS.chips
  }
}

function emptyEditableGridValue(
  columns: EditableGridColumnConfig[],
  rowCount: number,
): EditableGridValue {
  return Object.fromEntries(
    columns.map((column) => [column.key, Array.from({ length: rowCount }, () => null)]),
  )
}

/** Type-appropriate default for a single field; an explicit `defaultValue` wins. */
export function fieldDefaultValue(field: FieldConfig): unknown {
  const explicit = (field as { defaultValue?: unknown }).defaultValue
  if (explicit !== undefined) return explicit
  if (field.type === 'chips' || field.type === 'combobox') {
    const multiField = field as ChipsFieldConfig | ComboboxFieldConfig
    if (multiField.multiple === false) {
      // Optional single-select controls use `undefined` (not `''`) so optional
      // Zod enums validate; required fields keep the empty-string sentinel.
      return field.required ? '' : undefined
    }
    return []
  }
  if (field.type === 'editableGrid') {
    const gridField = field as EditableGridFieldConfig
    return emptyEditableGridValue(gridField.columns, gridField.rowCount)
  }
  if (field.type === 'diceFormula') {
    const diceField = field as DiceFormulaFieldConfig
    return defaultDiceFormulaForMode(
      diceField.modifierMode ?? 'optional',
      diceField.modifierOperators,
    )
  }
  return TYPE_DEFAULTS[field.type]
}

function assignLevelRangeDefaults(
  field: LevelRangeFieldConfig,
  values: Record<string, unknown>,
): void {
  const minName = field.minName ?? field.name
  const maxName = field.maxName ?? 'maxLevel'
  values[minName] = field.defaultMinValue ?? TYPE_DEFAULTS.number
  values[maxName] = field.defaultMaxValue ?? TYPE_DEFAULTS.number
}

function assignDependentFieldDefaults(field: FieldConfig, values: Record<string, unknown>): void {
  if (field.type === 'chooseFromChips') {
    const chooseField = field as ChooseFromChipsFieldConfig
    values[chooseField.chooseName] = chooseField.chooseDefaultValue ?? TYPE_DEFAULTS.number
    return
  }

  if (field.type !== 'inlineChooseCount') return

  const inlineField = field as InlineChooseCountFieldConfig
  const selectName = inlineField.selectName
  if (!selectName) return

  values[selectName] =
    inlineField.selectDefaultValue ?? (inlineField.selectRequired ? '' : undefined)
}

function assignJoinedPairDefaults(
  field: JoinedPairFieldConfig,
  values: Record<string, unknown>,
): void {
  const { start, end } = field
  if (start.kind === 'number') {
    values[start.name] = start.defaultValue ?? TYPE_DEFAULTS.number
  } else {
    values[start.name] = start.defaultValue ?? TYPE_DEFAULTS.select
  }
  if (end.kind === 'select') {
    values[end.name] = end.defaultValue ?? TYPE_DEFAULTS.select
  }
}

function assignFieldDefaultValues(field: FieldConfig, values: Record<string, unknown>): void {
  if (field.type === 'inlineSentence') {
    assignInlineSentenceDefaults(field, values)
    return
  }

  if (field.type === 'joinedPair') {
    assignJoinedPairDefaults(field, values)
    return
  }

  if (field.type === 'levelRange') {
    assignLevelRangeDefaults(field as LevelRangeFieldConfig, values)
    return
  }

  if (field.type === 'rollValue') {
    // Dice suggestions are presentation-only. They are not form defaultValues.
    return
  }

  values[field.name] = fieldDefaultValue(field)
  assignDependentFieldDefaults(field, values)
}

/**
 * Builds the default values for one array item from its field configs.
 * Pass the result to `useFieldArray`'s `append()` when adding a new row.
 */
export function buildItemDefaultValues(itemFields: FormItem[]): Record<string, unknown> {
  const values: Record<string, unknown> = {}
  for (const field of flattenFields(itemFields)) {
    assignFieldDefaultValues(field, values)
  }
  return values
}

/** Builds the `defaultValues` object RHF needs from a form's items. */
export function buildDefaultValues(items: FormItem[]): Record<string, unknown> {
  const values: Record<string, unknown> = {}
  for (const item of items) {
    if (!('kind' in item)) {
      assignFieldDefaultValues(item, values)
    } else if (item.kind === 'row') {
      for (const field of item.fields) {
        if (isRowSlotItem(field)) continue
        assignFieldDefaultValues(field, values)
      }
    } else if (item.kind === 'group') {
      Object.assign(values, buildDefaultValues(item.fields as FormItem[]))
    } else if (item.kind === 'columns') {
      Object.assign(
        values,
        buildDefaultValues(resolveColumnsCollapseSequence(item.columns, item.collapseOrder)),
      )
    } else if (item.kind === 'dependent') {
      assignFieldDefaultValues(item.controller, values)
      Object.assign(values, buildDefaultValues(item.dependents.fields as FormItem[]))
    } else if (item.kind === 'array') {
      values[item.name] = []
    } else if (item.kind === 'slot') {
      // Slot values come from the form's defaultValues.
    }
  }
  return values
}
