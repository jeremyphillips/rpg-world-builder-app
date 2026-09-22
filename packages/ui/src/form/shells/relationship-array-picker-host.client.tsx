'use client'

import * as React from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import { collectRelationshipArrayBindings } from '../config/array/collect-relationship-array-bindings'
import { getArrayFieldMutators } from '../context/array-field-mutators.registry'
import {
  resolveRelationshipFieldAdapter,
  useRelationshipFieldContext,
} from '../context/relationship-field.context'
import { useRelationshipArrayController } from '../context/relationship-array-controller.context'
import type { FormItem } from '../field-config'

type RelationshipArrayPickerBridgeProps = {
  fieldPath: string
  vocabulary: string
  cardinality: 'one' | 'many'
}

function RelationshipArrayPickerBridge({
  fieldPath,
  vocabulary,
  cardinality,
}: RelationshipArrayPickerBridgeProps) {
  const { context, registry } = useRelationshipFieldContext()
  const adapter = resolveRelationshipFieldAdapter(registry, vocabulary)
  const { openFieldPath, close } = useRelationshipArrayController()
  const { control } = useFormContext()
  const watchedItems = useWatch({ control, name: fieldPath })
  const items = React.useMemo(() => watchedItems ?? [], [watchedItems])

  const handleAdd = React.useCallback(
    async (selection: unknown) => {
      const edge = adapter.createEdge(selection, items, context)
      const mutators = getArrayFieldMutators(control, fieldPath)
      if (!mutators) return

      if (cardinality === 'one') {
        mutators.replace([edge as Record<string, unknown>])
      } else {
        mutators.append(edge as Record<string, unknown>)
      }
      close()
    },
    [adapter, cardinality, close, context, control, fieldPath, items],
  )

  return adapter.renderPicker({
    open: openFieldPath === fieldPath,
    onOpenChange: (open) => {
      if (!open && openFieldPath === fieldPath) {
        close()
      }
    },
    items,
    onAdd: handleAdd,
    context,
  })
}

export type RelationshipArrayPickerHostProps = {
  fields: FormItem[]
}

/** Mounts vocabulary pickers for arrays declaring `addAction.relationship`. */
export function RelationshipArrayPickerHost({ fields }: RelationshipArrayPickerHostProps) {
  const bindings = React.useMemo(() => collectRelationshipArrayBindings(fields), [fields])

  if (bindings.length === 0) {
    return null
  }

  return (
    <>
      {bindings.map((binding) => (
        <RelationshipArrayPickerBridge key={binding.fieldPath} {...binding} />
      ))}
    </>
  )
}
