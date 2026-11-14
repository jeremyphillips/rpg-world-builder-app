/**
 * Field-type-specific registration helpers for the form field error map registry.
 * Keeps `field-error-map.ts` focused on message formatting while isolating
 * composite-field path expansion (level range, inline sentence, etc.).
 */

import type { FieldNoun } from '@rpg/contracts'

import type {
  ChooseFromChipsFieldConfig,
  DiceFormulaFieldConfig,
  RollValueFieldConfig,
  EditableGridFieldConfig,
  FieldConfig,
  InlineSentenceFieldConfig,
  JoinedPairFieldConfig,
  LevelRangeFieldConfig,
} from '../field-config'
import { inlineChooseCountToInlineSentence } from './inline-sentence-legacy-config.lib'
import type { FieldMessageCategory } from './field-error-map-category.lib'

/** Who may own a routed validation issue. */
export type RegistryEntryRole = 'control' | 'slotOwner' | 'hostSlot' | 'array'

export type RegistryEntry = {
  label: string
  category: FieldMessageCategory
  /**
   * `control` — a bound field. `slotOwner` — a slot that declares `issuePaths`.
   * `hostSlot` — a slot with no issue paths. `array` — the array container.
   */
  role: RegistryEntryRole
  /** Mid-sentence singular item label for array min/max copy (from `itemHeader`). */
  itemLabel?: string
  /** Explicit singular/plural noun phrases for generated validation copy. */
  noun?: FieldNoun
  /**
   * Label only this path. Slots and array containers set this so a nested issue
   * does not inherit the parent name.
   */
  exactPath?: boolean
  /**
   * Formats copy for this path, but routing claims the parent control or slot.
   * Roll and dice atoms, and slot `issuePaths` aliases, set this.
   */
  labelOnly?: boolean
}

function controlEntry(
  entry: Omit<RegistryEntry, 'role' | 'labelOnly'>,
  labelOnly = false,
): RegistryEntry {
  return labelOnly ? { ...entry, role: 'control', labelOnly: true } : { ...entry, role: 'control' }
}

type RegistryKey = (name: string) => string

function registerLevelRangeField(
  registry: Map<string, RegistryEntry>,
  key: RegistryKey,
  field: LevelRangeFieldConfig,
): void {
  const entry = controlEntry({ label: field.label, category: 'number' })
  registry.set(key(field.minName ?? field.name), entry)
  registry.set(key(field.maxName ?? 'maxLevel'), entry)
}

function registerChooseFromChipsField(
  registry: Map<string, RegistryEntry>,
  key: RegistryKey,
  field: ChooseFromChipsFieldConfig,
): void {
  registry.set(key(field.chooseName), controlEntry({ label: field.label, category: 'number' }))
}

function registerJoinedPairSegment(
  registry: Map<string, RegistryEntry>,
  key: RegistryKey,
  fieldLabel: string,
  segment: Extract<InlineSentenceFieldConfig['segments'][number], { kind: 'joinedPair' }>,
): void {
  if (segment.start.kind === 'number') {
    registry.set(
      key(segment.start.name),
      controlEntry({
        label: segment.start.ariaLabel ?? fieldLabel,
        category: 'number',
      }),
    )
  } else {
    registry.set(
      key(segment.start.name),
      controlEntry({
        label: segment.start.ariaLabel ?? fieldLabel,
        category: 'choice',
      }),
    )
  }

  if (segment.end.kind === 'select') {
    registry.set(
      key(segment.end.name),
      controlEntry({
        label: segment.end.ariaLabel ?? fieldLabel,
        category: 'choice',
      }),
    )
  }
}

function registerJoinedPairField(
  registry: Map<string, RegistryEntry>,
  key: RegistryKey,
  field: JoinedPairFieldConfig,
): void {
  if (field.start.kind === 'number') {
    registry.set(
      key(field.start.name),
      controlEntry({
        label: field.start.ariaLabel ?? field.label,
        category: 'number',
      }),
    )
  } else {
    registry.set(
      key(field.start.name),
      controlEntry({
        label: field.start.ariaLabel ?? field.label,
        category: 'choice',
      }),
    )
  }

  if (field.end.kind === 'select') {
    registry.set(
      key(field.end.name),
      controlEntry({
        label: field.end.ariaLabel ?? field.label,
        category: 'choice',
      }),
    )
  }
}

function registerInlineSentenceField(
  registry: Map<string, RegistryEntry>,
  key: RegistryKey,
  field: InlineSentenceFieldConfig,
): void {
  for (const segment of field.segments) {
    if (segment.kind === 'number') {
      registry.set(key(segment.name), controlEntry({ label: field.label, category: 'number' }))
    }
    if (segment.kind === 'select') {
      registry.set(
        key(segment.name),
        controlEntry({
          label: segment.ariaLabel ?? field.label,
          category: 'choice',
        }),
      )
    }
    if (segment.kind === 'joinedPair') {
      registerJoinedPairSegment(registry, key, field.label, segment)
    }
  }

  if (field.below) {
    registry.set(key(field.below.name), controlEntry({ label: field.label, category: 'multi' }))
  }
}

function registerEditableGridField(
  registry: Map<string, RegistryEntry>,
  key: RegistryKey,
  field: EditableGridFieldConfig,
): void {
  for (const column of field.columns) {
    const columnLabel = typeof column.label === 'string' ? column.label : field.label
    const category = column.control === 'select' ? 'choice' : 'number'
    registry.set(key(`${field.name}.${column.key}`), controlEntry({ label: columnLabel, category }))
  }
}

function registerRollValueField(
  registry: Map<string, RegistryEntry>,
  key: RegistryKey,
  field: RollValueFieldConfig,
): void {
  const entry = controlEntry({ label: field.label, category: 'number' }, true)
  const base = field.name

  registry.set(key(`${base}.dice.count`), entry)
  registry.set(key(`${base}.dice.faces`), entry)
  registry.set(key(`${base}.flatAmount`), entry)
  registry.set(
    key(`${base}.flatOperator`),
    controlEntry({ label: field.label, category: 'choice' }, true),
  )
}

function registerDiceFormulaField(
  registry: Map<string, RegistryEntry>,
  key: RegistryKey,
  field: DiceFormulaFieldConfig,
): void {
  const entry = controlEntry({ label: field.label, category: 'number' }, true)
  const base = field.name

  registry.set(key(`${base}.count`), entry)
  registry.set(key(`${base}.faces`), entry)
  registry.set(key(`${base}.modifier.amount`), entry)
  registry.set(
    key(`${base}.modifier.operator`),
    controlEntry({ label: field.label, category: 'choice' }, true),
  )

  const currencyName = field.currencyUnit?.name
  if (currencyName) {
    registry.set(
      key(currencyName),
      controlEntry({
        label: field.label,
        category: 'choice',
      }),
    )
  }
}

export function registerFieldPaths(
  registry: Map<string, RegistryEntry>,
  prefix: string,
  field: FieldConfig,
  category: FieldMessageCategory,
): void {
  const key: RegistryKey = (name) => (prefix ? `${prefix}.${name}` : name)

  if (field.type === 'levelRange') {
    registerLevelRangeField(registry, key, field as LevelRangeFieldConfig)
    return
  }

  if (field.type === 'joinedPair') {
    registerJoinedPairField(registry, key, field as JoinedPairFieldConfig)
    return
  }

  registry.set(key(field.name), controlEntry({ label: field.label, category, noun: field.noun }))

  if (field.type === 'chooseFromChips') {
    registerChooseFromChipsField(registry, key, field as ChooseFromChipsFieldConfig)
  }

  if (field.type === 'inlineChooseCount') {
    registerInlineSentenceField(registry, key, inlineChooseCountToInlineSentence(field))
  }

  if (field.type === 'inlineSentence') {
    registerInlineSentenceField(registry, key, field as InlineSentenceFieldConfig)
  }

  if (field.type === 'editableGrid') {
    registerEditableGridField(registry, key, field as EditableGridFieldConfig)
  }

  if (field.type === 'diceFormula') {
    registerDiceFormulaField(registry, key, field as DiceFormulaFieldConfig)
  }

  if (field.type === 'rollValue') {
    registerRollValueField(registry, key, field as RollValueFieldConfig)
  }
}
