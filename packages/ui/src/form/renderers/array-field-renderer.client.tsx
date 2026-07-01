'use client'

import * as React from 'react'
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'

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
import { ArrayFieldContext } from '../context/array-field.context'
import {
  FormSectionContext,
  useFormSectionContext,
  type FormSectionContextValue,
} from '../context/form-section.context'
import { useDependsOnValues } from '../config/form-depends-on.client'
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

interface ArrayFieldItemProps {
  config: ArrayConfig
  idPrefix: string
  fullName: string
  index: number
  itemId: string
  legend: string
  stackClasses: string
  canRemove: boolean
  showMoveButtons: boolean
  isFirst: boolean
  isLast: boolean
  itemTitle?: (values: Record<string, unknown>, index: number) => string
  itemValues: Record<string, unknown>
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
}

function ArrayFieldItem({
  config,
  idPrefix,
  fullName,
  index,
  itemId,
  legend,
  stackClasses,
  canRemove,
  showMoveButtons,
  isFirst,
  isLast,
  itemTitle,
  itemValues,
  onMoveUp,
  onMoveDown,
  onRemove,
}: ArrayFieldItemProps) {
  const itemPrefix = `${fullName}.${index}`
  const title = itemTitle ? itemTitle(itemValues, index) : undefined
  const arrayItems = useWatch({ name: fullName, defaultValue: [] }) as unknown[]
  const watchedValues = useDependsOnValues(config.filterSelectDependsOn ?? [])

  const arrayContext = React.useMemo(
    () => ({
      items: arrayItems ?? [],
      rowIndex: index,
      filterSelectOptions: config.filterSelectOptions,
      watchedValues,
    }),
    [arrayItems, index, config.filterSelectOptions, watchedValues],
  )

  return (
    <fieldset
      key={itemId}
      className={fieldArrayItemClasses}
      aria-label={title ?? `${legend} item ${index + 1}`}
    >
      {title ? <legend className="px-1 text-xs text-muted-foreground">{title}</legend> : null}
      <ArrayFieldContext.Provider value={arrayContext}>
        <div className={stackClasses}>
          <NestedFormItems
            items={config.fields}
            idPrefix={idPrefix}
            namePrefix={itemPrefix}
            depth={1}
          />
        </div>
      </ArrayFieldContext.Provider>
      <div className={fieldArrayItemActionRowClasses}>
        {showMoveButtons ? (
          <>
            <Button
              variant="outline"
              size="sm"
              disabled={isFirst}
              onClick={onMoveUp}
              aria-label={`Move ${legend} item ${index + 1} up`}
            >
              ↑
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isLast}
              onClick={onMoveDown}
              aria-label={`Move ${legend} item ${index + 1} down`}
            >
              ↓
            </Button>
          </>
        ) : null}
        <Button
          variant="outline"
          size="sm"
          disabled={!canRemove}
          onClick={onRemove}
          aria-label={`Remove ${legend} item ${index + 1}`}
        >
          Remove
        </Button>
      </div>
    </fieldset>
  )
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
  const { getValues } = useFormContext()
  const { rhythm, size } = useFormSectionContext()
  const {
    addLabel = 'Add item',
    min = 0,
    max,
    legend,
    legendSize = 'array',
    itemTitle,
    allowReorder = true,
    hideMoveControls = false,
  } = config
  const legendScale = legendSize === 'array' ? resolveArrayLegendScale(size) : 'default'
  const stackClasses = fieldStackRhythmVariants({ rhythm })

  const canRemove = fields.length > min
  const canAdd = max === undefined || fields.length < max
  const showMoveButtons = allowReorder && !hideMoveControls

  const staticItemDefaults = React.useMemo(
    () => buildItemDefaultValues(config.fields),
    [config.fields],
  )

  function appendItem() {
    const nextDefaults = config.appendDefaults
      ? config.appendDefaults((getValues(fullName) as unknown[]) ?? [])
      : staticItemDefaults
    append(nextDefaults)
  }

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
        {fields.map((rhfField, index) => (
          <ArrayFieldItem
            key={rhfField.id}
            config={config}
            idPrefix={idPrefix}
            fullName={fullName}
            index={index}
            itemId={rhfField.id}
            legend={legend}
            stackClasses={stackClasses}
            canRemove={canRemove}
            showMoveButtons={showMoveButtons}
            isFirst={index === 0}
            isLast={index === fields.length - 1}
            itemTitle={itemTitle}
            itemValues={rhfField as unknown as Record<string, unknown>}
            onMoveUp={() => move(index, index - 1)}
            onMoveDown={() => move(index, index + 1)}
            onRemove={() => remove(index)}
          />
        ))}
        {canAdd ? (
          <Button variant="outline" size="sm" onClick={appendItem} aria-label={addLabel}>
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
