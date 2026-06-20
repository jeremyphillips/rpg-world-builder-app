'use client'

import { useFieldArray, useWatch } from 'react-hook-form'

import { Button } from '../components/ui/button.client'
import { FieldGroup } from '../components/ui/field-group'
import { FieldRow } from '../components/ui/field-row'
import { FieldRenderer } from './field-renderer.client'
import {
  buildItemDefaultValues,
  isContainer,
  type ArrayConfig,
  type FieldConfig,
  type FormItem,
  type RowConfig,
} from './field-config'

export interface FormItemsProps {
  items: Array<FormItem | RowConfig>
  idPrefix: string
  /**
   * Dotted path prefix for array item fields (e.g. `"traits.0"`). Passed down
   * so leaf renderers and conditional watchers resolve to the correct RHF names.
   */
  namePrefix?: string
}

/** Renders an ordered list of fields/rows/groups/arrays, recursing into containers. */
export function FormItems({ items, idPrefix, namePrefix }: FormItemsProps) {
  return (
    <>
      {items.map((item, index) => {
        if (!isContainer(item)) {
          return (
            <FieldNode
              key={namePrefix ? `${namePrefix}.${item.name}` : item.name}
              config={item}
              idPrefix={idPrefix}
              namePrefix={namePrefix}
            />
          )
        }
        if (item.kind === 'row') {
          return (
            <FieldRow key={`row-${index}`} className={item.className}>
              {item.fields.map((field) => (
                <FieldNode
                  key={namePrefix ? `${namePrefix}.${field.name}` : field.name}
                  config={field}
                  idPrefix={idPrefix}
                  namePrefix={namePrefix}
                />
              ))}
            </FieldRow>
          )
        }
        if (item.kind === 'group') {
          return (
            <FieldGroup
              key={`group-${index}`}
              legend={item.legend}
              description={item.description}
              className={item.className}
            >
              <FormItems items={item.fields} idPrefix={idPrefix} namePrefix={namePrefix} />
            </FieldGroup>
          )
        }
        // kind === 'array' — resolve full RHF name when nested inside an item
        const fullArrayName = namePrefix ? `${namePrefix}.${item.name}` : item.name
        return (
          <ArrayFieldRenderer
            key={`array-${fullArrayName}`}
            config={item}
            idPrefix={idPrefix}
            fullName={fullArrayName}
          />
        )
      })}
    </>
  )
}

interface FieldNodeProps {
  config: FieldConfig
  idPrefix: string
  namePrefix?: string
}

/** Routes a field to the conditional wrapper when it declares `visibility`. */
function FieldNode({ config, idPrefix, namePrefix }: FieldNodeProps) {
  if (config.visibility) {
    return <ConditionalField config={config} idPrefix={idPrefix} namePrefix={namePrefix} />
  }
  return <FieldRenderer config={config} idPrefix={idPrefix} namePrefix={namePrefix} />
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
function ConditionalField({ config, idPrefix, namePrefix }: FieldNodeProps) {
  const { dependsOn, visibleWhen } = config.visibility!
  const prefixedDeps = namePrefix ? dependsOn.map((dep) => `${namePrefix}.${dep}`) : dependsOn
  const watched = useWatch({ name: prefixedDeps }) as unknown[]
  const values: Record<string, unknown> = {}
  dependsOn.forEach((name, index) => {
    values[name] = watched[index]
  })
  if (!visibleWhen(values)) return null
  return <FieldRenderer config={config} idPrefix={idPrefix} namePrefix={namePrefix} />
}

export interface ArrayFieldRendererProps {
  config: ArrayConfig
  idPrefix: string
  /** Resolved full RHF field name for the array (e.g. `"traits"` or `"root.0.traits"`). */
  fullName: string
}

/**
 * Renders a repeatable array of field groups backed by RHF's `useFieldArray`.
 * Each item renders as a `<fieldset>` with the item's fields, plus Remove/Move
 * controls. An "Add" button appends a new item with type-appropriate defaults.
 *
 * Must be rendered inside a `FormProvider`.
 */
export function ArrayFieldRenderer({ config, idPrefix, fullName }: ArrayFieldRendererProps) {
  const { fields, append, remove, move } = useFieldArray({ name: fullName })
  const { addLabel = 'Add item', min = 0, max, legend, itemTitle } = config

  const canRemove = fields.length > min
  const canAdd = max === undefined || fields.length < max

  const itemDefaults = buildItemDefaultValues(config.fields)

  return (
    <fieldset className="min-w-0 border-0 p-0">
      <legend className="mb-1 text-sm font-semibold leading-none">{legend}</legend>
      <div className="space-y-3">
        {fields.map((rhfField, index) => {
          const itemPrefix = `${fullName}.${index}`
          const title = itemTitle
            ? itemTitle(rhfField as unknown as Record<string, unknown>, index)
            : undefined

          return (
            <fieldset
              key={rhfField.id}
              className="rounded-md border border-border p-4"
              aria-label={title ?? `${legend} item ${index + 1}`}
            >
              {title ? (
                <legend className="px-1 text-xs text-muted-foreground">{title}</legend>
              ) : null}
              <div className="space-y-4">
                <FormItems items={config.fields} idPrefix={idPrefix} namePrefix={itemPrefix} />
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                  aria-label={`Move ${legend} item ${index + 1} up`}
                >
                  ↑
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={index === fields.length - 1}
                  onClick={() => move(index, index + 1)}
                  aria-label={`Move ${legend} item ${index + 1} down`}
                >
                  ↓
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canRemove}
                  onClick={() => remove(index)}
                  aria-label={`Remove ${legend} item ${index + 1}`}
                >
                  Remove
                </Button>
              </div>
            </fieldset>
          )
        })}
        {canAdd ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => append(itemDefaults)}
            aria-label={addLabel}
          >
            {addLabel}
          </Button>
        ) : null}
      </div>
    </fieldset>
  )
}
