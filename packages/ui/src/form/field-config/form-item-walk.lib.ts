import { resolveColumnsCollapseSequence } from '../config/form-columns-collapse.lib'
import { inlineSentenceUniqueBoundNames } from '../../components/ui/inline-sentence-field.lib'
import { joinedPairBoundNames } from '../../components/ui/joined-pair-field.lib'

import type { FieldConfig } from './field-config.types'
import type {
  ArrayConfig,
  ColumnsConfig,
  DependentConfig,
  FormItem,
  GroupConfig,
  RowConfig,
  SlotConfig,
} from './form-item.types'

/** Narrows a `FormItem` to a container (row/group/columns/dependent/array/slot) vs. a leaf field. */
export function isContainer(
  item: FormItem,
): item is RowConfig | GroupConfig | ColumnsConfig | DependentConfig | ArrayConfig | SlotConfig {
  return 'kind' in item
}

/**
 * Flattens groups/rows into the ordered list of leaf fields, so callers can
 * iterate fields without re-walking the container tree.
 *
 * `ArrayConfig` and `SlotConfig` items are **skipped** — arrays are managed at
 * runtime by `useFieldArray`; slots render custom controls bound to the parent form.
 */
export function flattenFields(items: Array<FormItem | RowConfig>): FieldConfig[] {
  const fields: FieldConfig[] = []
  for (const item of items) {
    if (!('kind' in item)) {
      if (item.type !== 'levelRange') {
        fields.push(item)
      }
    } else if (item.kind === 'array' || item.kind === 'slot') {
      // Intentionally skipped — see JSDoc above.
    } else if (item.kind === 'dependent') {
      fields.push(item.controller)
      fields.push(...flattenFields(item.dependents.fields as Array<FormItem | RowConfig>))
    } else if (item.kind === 'columns') {
      fields.push(
        ...flattenFields(resolveColumnsCollapseSequence(item.columns, item.collapseOrder)),
      )
    } else {
      fields.push(...flattenFields(item.fields as Array<FormItem | RowConfig>))
    }
  }
  return fields
}

/** Whether a field should render given the current values (always-visible if no `visibility`). */
export function isFieldVisible(field: FieldConfig, values: Record<string, unknown>): boolean {
  return field.visibility ? field.visibility.visibleWhen(values) : true
}

/** Whether interactivity gating has disabled the control (field stays mounted). */
export function isFieldInteractivityDisabled(
  field: FieldConfig,
  values: Record<string, unknown>,
): boolean {
  return field.interactivity?.disabledWhen(values) ?? false
}

/** Applies a dotted path prefix to a leaf field config (occupant names for joinedPair). */
export function prefixFieldConfig(field: FieldConfig, prefix: string): FieldConfig {
  const join = (name: string) => (prefix ? `${prefix}.${name}` : name)

  if (field.type === 'joinedPair') {
    return {
      ...field,
      start: { ...field.start, name: join(field.start.name) },
      end: field.end.kind === 'select' ? { ...field.end, name: join(field.end.name) } : field.end,
    }
  }

  return { ...field, name: join(field.name) }
}

/** Primary RHF path for a field config — start occupant for standalone joinedPair. */
export function resolveFieldConfigPrimaryName(field: FieldConfig): string {
  if (field.type === 'joinedPair') return field.start.name
  return field.name
}

/** All RHF paths owned by one field config (segments/occupants included). */
export function resolveFieldConfigBoundNames(field: FieldConfig): string[] {
  if (field.type === 'inlineSentence') {
    return inlineSentenceUniqueBoundNames(field.segments, field.below)
  }
  if (field.type === 'joinedPair') {
    return joinedPairBoundNames(field)
  }
  return [field.name]
}

/** Names of fields currently hidden by their `visibility` predicate. */
export function hiddenFieldNames(items: FormItem[], values: Record<string, unknown>): string[] {
  return flattenFields(items).flatMap((field) =>
    isFieldVisible(field, values) ? [] : resolveFieldConfigBoundNames(field),
  )
}
