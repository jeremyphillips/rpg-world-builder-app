'use client'

import { useWatch, type ControllerRenderProps } from 'react-hook-form'

import {
  EditableGrid,
  type EditableGridColumn,
  type EditableGridValue,
} from '../components/ui/editable-grid.client'
import {
  editableGridDependsOn,
  type EditableGridColumnConfig,
  type EditableGridFieldConfig,
} from './field-config'

function watchedRecord(dependsOn: string[], watched: unknown[]): Record<string, unknown> {
  const values: Record<string, unknown> = {}
  dependsOn.forEach((name, index) => {
    values[name] = watched[index]
  })
  return values
}

function resolveColumnLabel(
  column: EditableGridColumnConfig,
  watched: Record<string, unknown>,
): string {
  return typeof column.label === 'function' ? column.label(watched) : column.label
}

function isColumnVisible(
  column: EditableGridColumnConfig,
  watched: Record<string, unknown>,
): boolean {
  return column.visibility ? column.visibility.visibleWhen(watched) : true
}

/** Resolves config columns to the primitive grid shape for the current watched values. */
export function resolveEditableGridColumns(
  columns: EditableGridColumnConfig[],
  watched: Record<string, unknown>,
): EditableGridColumn[] {
  return columns
    .filter((column) => isColumnVisible(column, watched))
    .map((column) => ({
      key: column.key,
      label: resolveColumnLabel(column, watched),
      control: column.control,
      min: column.min,
      max: column.max,
    }))
}

export interface EditableGridFieldRendererProps {
  config: EditableGridFieldConfig
  field: ControllerRenderProps
  id: string
  error?: string
  /** Prefix for column `dependsOn` paths inside array items (e.g. `traits.0`). */
  namePrefix?: string
}

/**
 * RHF adapter for `EditableGrid`: watches column dependencies, resolves visibility
 * and dynamic labels, then bridges `field.value` / `field.onChange`.
 */
export function EditableGridFieldRenderer({
  config,
  field,
  id,
  error,
  namePrefix,
}: EditableGridFieldRendererProps) {
  const dependsOn = editableGridDependsOn(config.columns)
  const prefixedDeps = namePrefix ? dependsOn.map((dep) => `${namePrefix}.${dep}`) : dependsOn
  const watchedValues = useWatch({ name: prefixedDeps }) as unknown[]
  const watched = watchedRecord(dependsOn, watchedValues)
  const columns = resolveEditableGridColumns(config.columns, watched)
  const value = (field.value ?? {}) as EditableGridValue

  return (
    <EditableGrid
      id={id}
      legend={config.label}
      info={config.info}
      columns={columns}
      rowCount={config.rowCount}
      value={value}
      onChange={field.onChange}
      error={error}
      templates={config.templates}
      disabled={config.disabled}
    />
  )
}
