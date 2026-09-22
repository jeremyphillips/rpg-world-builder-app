'use client'

import * as React from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'

import { RelationshipField } from '../../../components/ui/relationship-field.client'
import type { FieldHintPosition } from '../../../components/ui/field.variants'
import type { FieldSize } from '../../../components/ui/field.client'
import type { RelationshipFieldConfig } from '../../field-config'
import {
  resolveRelationshipFieldAdapter,
  useRelationshipFieldContext,
} from '../../context/relationship-field.context'
import type { FieldValidationProps } from '../../../components/ui/field-validation-props'
import type { FieldLabelVisibility } from '../../form-heading.lib'

export interface RelationshipFieldRendererProps extends FieldValidationProps {
  config: RelationshipFieldConfig
  controlSize: FieldSize
  id: string
  hint?: string
  hintPosition?: FieldHintPosition
  labelVisibility?: FieldLabelVisibility
  namePrefix?: string
}

function resolveRelationshipFieldName(name: string, namePrefix?: string): string {
  return namePrefix ? `${namePrefix}.${name}` : name
}

/** RHF adapter for `RelationshipField` with vocabulary-driven picker wiring. */
export function RelationshipFieldRenderer({
  config,
  id,
  hint,
  hintPosition,
  labelVisibility,
  namePrefix,
  error,
  invalid,
  describedBy,
}: RelationshipFieldRendererProps) {
  const { context, registry } = useRelationshipFieldContext()
  const adapter = resolveRelationshipFieldAdapter(registry, config.vocabulary)
  const fieldName = resolveRelationshipFieldName(config.name, namePrefix)
  const { control } = useFormContext()
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: fieldName,
  })
  const [pickerOpen, setPickerOpen] = React.useState(false)

  const items = fields.map((field) => field as { id: string } & Record<string, unknown>)
  const edges = items as unknown[]
  const itemCount = items.length
  const canAdd = adapter.canAdd?.(edges, context) ?? !config.disabled
  const cardinality = config.cardinality ?? 'many'

  const handleAdd = async (selection: unknown) => {
    const edge = adapter.createEdge(selection, edges, context)
    if (cardinality === 'one') {
      replace([edge])
    } else {
      append(edge)
    }
    setPickerOpen(false)
  }

  const handleRemove = React.useCallback(
    (index: number) => {
      remove(index)
    },
    [remove],
  )

  const supplementary = adapter.supplementary?.(context)

  return (
    <RelationshipField
      id={id}
      label={config.label}
      labelVisibility={labelVisibility}
      hint={typeof hint === 'string' ? hint : undefined}
      hintPosition={hintPosition}
      required={config.required}
      disabled={config.disabled}
      error={error}
      invalid={invalid}
      describedBy={describedBy}
      itemCount={itemCount}
      emptyLabel={config.emptyLabel}
      addAction={{
        label: config.addActionLabel,
        onSelect: () => setPickerOpen(true),
        disabled: !canAdd,
      }}
      items={edges}
      getItemKey={(edge) => adapter.getItemKey(edge)}
      renderRow={(edge) => {
        const index = edges.findIndex(
          (candidate) => adapter.getItemKey(candidate) === adapter.getItemKey(edge),
        )
        const row = adapter.projectRow(edge, context, {
          onRemove: !config.disabled && index >= 0 ? () => handleRemove(index) : undefined,
        })
        return row.content
      }}
      listAriaLabel={adapter.listAriaLabel ?? config.label}
      supplementary={supplementary}
      picker={adapter.renderPicker({
        open: pickerOpen,
        onOpenChange: setPickerOpen,
        items: edges,
        onAdd: handleAdd,
        context,
        disabled: config.disabled,
      })}
    />
  )
}
