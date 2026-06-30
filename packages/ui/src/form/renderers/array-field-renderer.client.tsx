'use client'

import * as React from 'react'
import { useFieldArray } from 'react-hook-form'

import { Button } from '../../components/ui/button.client'
import {
  fieldArrayItemActionRowClasses,
  fieldArrayItemClasses,
  fieldGroupBottomMarginClasses,
  fieldGroupLegendVariants,
  fieldStackRhythmVariants,
  fieldSetResetClasses,
  resolveArrayLegendScale,
} from '../../components/ui/field.variants'
import { cn } from '../../lib/utils'
import {
  FormSectionContext,
  useFormSectionContext,
  type FormSectionContextValue,
} from '../context/form-section.context'
import { buildItemDefaultValues, type ArrayConfig } from '../field-config'
import { buildArraySectionChildContext } from '../containers/form-section-child-context.lib'
import { useVisibilityValues } from '../containers/form-conditional.client'
import { NestedFormItems } from '../containers/form-item-node.client'

export interface ArrayFieldRendererProps {
  config: ArrayConfig
  idPrefix: string
  /** Resolved full RHF field name for the array (e.g. `"traits"` or `"root.0.traits"`). */
  fullName: string
  /** When set, the visible legend is omitted (e.g. accordion trigger labels the section). */
  hideLegend?: boolean
  /** Associates the fieldset with an external heading when `hideLegend` is true. */
  labelledBy?: string
}

/**
 * Renders a repeatable array of field groups backed by RHF's `useFieldArray`.
 * Each item renders as a `<fieldset>` with the item's fields, plus Remove/Move
 * controls. An "Add" button appends a new item with type-appropriate defaults.
 *
 * Must be rendered inside a `FormProvider`.
 */
export function ArrayFieldRenderer({
  config,
  idPrefix,
  fullName,
  hideLegend = false,
  labelledBy,
}: ArrayFieldRendererProps) {
  const { fields, append, remove, move } = useFieldArray({ name: fullName })
  const { rhythm, size } = useFormSectionContext()
  const { addLabel = 'Add item', min = 0, max, legend, legendSize = 'array', itemTitle } = config
  const legendScale = legendSize === 'array' ? resolveArrayLegendScale(size) : 'default'
  const stackClasses = fieldStackRhythmVariants({ rhythm })

  const canRemove = fields.length > min
  const canAdd = max === undefined || fields.length < max

  const itemDefaults = buildItemDefaultValues(config.fields)

  return (
    <fieldset
      className={cn(fieldSetResetClasses, fieldGroupBottomMarginClasses)}
      aria-labelledby={hideLegend ? labelledBy : undefined}
    >
      {hideLegend ? (
        <legend className="sr-only">{legend}</legend>
      ) : (
        <legend className={fieldGroupLegendVariants({ size: legendSize, scale: legendScale })}>
          {legend}
        </legend>
      )}
      <div className={stackClasses}>
        {fields.map((rhfField, index) => {
          const itemPrefix = `${fullName}.${index}`
          const title = itemTitle
            ? itemTitle(rhfField as unknown as Record<string, unknown>, index)
            : undefined

          return (
            <fieldset
              key={rhfField.id}
              className={fieldArrayItemClasses}
              aria-label={title ?? `${legend} item ${index + 1}`}
            >
              {title ? (
                <legend className="px-1 text-xs text-muted-foreground">{title}</legend>
              ) : null}
              <div className={stackClasses}>
                <NestedFormItems
                  items={config.fields}
                  idPrefix={idPrefix}
                  namePrefix={itemPrefix}
                  depth={1}
                />
              </div>
              <div className={fieldArrayItemActionRowClasses}>
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

interface ConditionalArrayFieldProps {
  config: ArrayConfig
  idPrefix: string
  namePrefix?: string
  depth: number
}

/** Hides a nested array when its `visibility` predicate is false. */
export function ConditionalArrayField({
  config,
  idPrefix,
  namePrefix,
  depth,
}: ConditionalArrayFieldProps) {
  const values = useVisibilityValues(config.visibility!, namePrefix)
  const parentContext = useFormSectionContext()
  const childContext = React.useMemo(
    () => buildArraySectionChildContext(parentContext, depth, config),
    [parentContext, depth, config],
  )

  if (!config.visibility!.visibleWhen(values)) return null

  const fullArrayName = namePrefix ? `${namePrefix}.${config.name}` : config.name

  return (
    <FormSectionContext.Provider value={childContext}>
      <ArrayFieldRenderer config={config} idPrefix={idPrefix} fullName={fullArrayName} />
    </FormSectionContext.Provider>
  )
}

interface ArrayFormItemSectionProps {
  item: ArrayConfig
  parentContext: FormSectionContextValue
  idPrefix: string
  namePrefix?: string
  depth: number
}

export function ArrayFormItemSection({
  item,
  parentContext,
  idPrefix,
  namePrefix,
  depth,
}: ArrayFormItemSectionProps) {
  const arrayChildContext = React.useMemo(
    () => buildArraySectionChildContext(parentContext, depth, item),
    [parentContext, depth, item],
  )

  const fullArrayName = namePrefix ? `${namePrefix}.${item.name}` : item.name
  return (
    <FormSectionContext.Provider value={arrayChildContext}>
      <ArrayFieldRenderer config={item} idPrefix={idPrefix} fullName={fullArrayName} />
    </FormSectionContext.Provider>
  )
}
