'use client'

import * as React from 'react'

import { fieldSeparatorVariants, type FieldSeparator } from '../../components/ui/field.variants'
import { useDependsOnValues } from '../config/form-depends-on.client'
import type { FieldConfig, FieldVisibility } from '../field-config'
import { FieldRenderer } from '../renderers/field-renderer.client'

/** Watches `dependsOn` fields and returns a map keyed by relative field names. */
export function useVisibilityValues(
  visibility: FieldVisibility,
  namePrefix?: string,
): Record<string, unknown> {
  return useDependsOnValues(visibility.dependsOn, namePrefix)
}

/** Applies an optional trailing divider wrapper around a leaf field or row. */
export function withFieldSeparator(
  separator: FieldSeparator | undefined,
  content: React.ReactNode,
) {
  if (!separator) return content
  return (
    <div data-field-separator="" className={fieldSeparatorVariants({ tone: separator })}>
      {content}
    </div>
  )
}

export function buildFieldControlId(
  idPrefix: string,
  namePrefix: string | undefined,
  fieldName: string,
): string {
  const fullName = namePrefix ? `${namePrefix}.${fieldName}` : fieldName
  return `${idPrefix}-${fullName.replaceAll('.', '-')}`
}

interface FieldNodeProps {
  config: FieldConfig
  idPrefix: string
  namePrefix?: string
}

/**
 * Subscribes to *only* the field's `dependsOn` values via `useWatch`, so a change
 * elsewhere never re-renders this field. With the form's `shouldUnregister`, the
 * control unmounts (and its value clears) while hidden.
 *
 * When `namePrefix` is set (inside an array item), `dependsOn` names are resolved
 * relative to the item — e.g. `['type']` watches `traits.0.type` — so the
 * `visibleWhen` predicate still uses simple relative names like `values.type`.
 */
export function ConditionalField({ config, idPrefix, namePrefix }: FieldNodeProps) {
  const values = useVisibilityValues(config.visibility!, namePrefix)
  if (!config.visibility!.visibleWhen(values)) return null
  return withFieldSeparator(
    config.separator,
    <FieldRenderer config={config} idPrefix={idPrefix} namePrefix={namePrefix} />,
  )
}

/** Routes a field to the conditional wrapper when it declares `visibility`. */
export function FieldNode({ config, idPrefix, namePrefix }: FieldNodeProps) {
  if (config.visibility) {
    return <ConditionalField config={config} idPrefix={idPrefix} namePrefix={namePrefix} />
  }
  return withFieldSeparator(
    config.separator,
    <FieldRenderer config={config} idPrefix={idPrefix} namePrefix={namePrefix} />,
  )
}
