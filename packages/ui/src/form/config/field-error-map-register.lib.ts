/**
 * Field-type-specific registration helpers for the form field error map registry.
 * Keeps `field-error-map.ts` focused on message formatting while isolating
 * composite-field path expansion (level range, inline sentence, etc.).
 */

import type {
  ChooseFromChipsFieldConfig,
  FieldConfig,
  InlineChooseCountFieldConfig,
  InlineSentenceFieldConfig,
  LevelRangeFieldConfig,
} from '../field-config'
import type { FieldMessageCategory } from './field-error-map-category.lib'

export type RegistryEntry = {
  label: string
  category: FieldMessageCategory
}

type RegistryKey = (name: string) => string

function registerLevelRangeField(
  registry: Map<string, RegistryEntry>,
  key: RegistryKey,
  field: LevelRangeFieldConfig,
): void {
  const entry: RegistryEntry = { label: field.label, category: 'number' }
  registry.set(key(field.minName ?? field.name), entry)
  registry.set(key(field.maxName ?? 'maxLevel'), entry)
}

function registerChooseFromChipsField(
  registry: Map<string, RegistryEntry>,
  key: RegistryKey,
  field: ChooseFromChipsFieldConfig,
): void {
  registry.set(key(field.chooseName), { label: field.label, category: 'number' })
}

function registerInlineChooseCountField(
  registry: Map<string, RegistryEntry>,
  key: RegistryKey,
  field: InlineChooseCountFieldConfig,
  label: string,
): void {
  if (!field.selectName) return

  registry.set(key(field.selectName), {
    label: field.selectLabel ?? label,
    category: 'choice',
  })
}

function registerInlineSentenceField(
  registry: Map<string, RegistryEntry>,
  key: RegistryKey,
  field: InlineSentenceFieldConfig,
): void {
  for (const segment of field.segments) {
    if (segment.kind === 'number') {
      registry.set(key(segment.name), { label: field.label, category: 'number' })
    }
    if (segment.kind === 'select') {
      registry.set(key(segment.name), {
        label: segment.ariaLabel ?? field.label,
        category: 'choice',
      })
    }
  }

  if (field.below) {
    registry.set(key(field.below.name), { label: field.label, category: 'multi' })
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

  registry.set(key(field.name), { label: field.label, category })

  if (field.type === 'chooseFromChips') {
    registerChooseFromChipsField(registry, key, field as ChooseFromChipsFieldConfig)
  }

  if (field.type === 'inlineChooseCount') {
    registerInlineChooseCountField(
      registry,
      key,
      field as InlineChooseCountFieldConfig,
      field.label,
    )
  }

  if (field.type === 'inlineSentence') {
    registerInlineSentenceField(registry, key, field as InlineSentenceFieldConfig)
  }
}
