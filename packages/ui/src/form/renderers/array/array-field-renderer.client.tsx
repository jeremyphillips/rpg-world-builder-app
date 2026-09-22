'use client'

/**
 * Entry component for repeatable array fields (`kind: 'array'`).
 * Dispatched from `form-item-node.client.tsx` via `ArrayFormItemSection` or
 * `ConditionalArrayField`.
 */
import * as React from 'react'
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'

import { registerArrayFieldMutators } from '../../context/array-field-mutators.registry'
import type { ArrayConfig } from '../../field-config'
import { type ArrayFieldItemContentProps } from './array-field-item-content.client'
import { ArrayFieldRendererFieldset } from './array-field-renderer-fieldset.client'
import { useArrayFieldRendererState } from './use-array-field-renderer-state.client'

export type { ArrayFieldItemContentProps }

export interface ArrayFieldSectionLayout {
  wrapSectionChrome: boolean
  inParentRhythm: boolean
}

export interface ArrayFieldRendererProps {
  config: ArrayConfig
  idPrefix: string
  /** Resolved full RHF field name for the array (e.g. `"traits"` or `"root.0.traits"`). */
  fullName: string
  sectionLayout?: ArrayFieldSectionLayout
}

/**
 * Renders a repeatable array of field groups backed by RHF's `useFieldArray`.
 * Each item renders with header chrome (drag handle, optional collapse, remove)
 * and an "Add" button below the list.
 *
 * Must be rendered inside a `FormProvider`.
 */
export function ArrayFieldRenderer({
  config,
  idPrefix,
  fullName,
  sectionLayout,
}: ArrayFieldRendererProps) {
  const form = useFormContext()
  const { fields, append, remove, move, replace } = useFieldArray({ name: fullName })
  const { getValues } = form
  const watchedItems = useWatch({ name: fullName }) as unknown[] | undefined

  const state = useArrayFieldRendererState({
    config,
    idPrefix,
    fullName,
    fields,
    append,
    remove,
    getValues,
    watchedItems,
    wrapSectionChrome: sectionLayout?.wrapSectionChrome,
  })

  React.useEffect(() => {
    return registerArrayFieldMutators(form.control, fullName, {
      getValues: () => fields.map((_, index) => form.getValues(`${fullName}.${index}`)),
      remove,
      append: state.appendItemWithDefaults,
      replace: (items) => {
        replace(items)
      },
    })
  }, [form, fullName, fields, remove, replace, state.appendItemWithDefaults])

  return (
    <ArrayFieldRendererFieldset
      config={config}
      sectionLayout={sectionLayout}
      state={state}
      fields={fields}
      onMove={move}
    />
  )
}
