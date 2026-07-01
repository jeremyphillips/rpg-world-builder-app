'use client'

import * as React from 'react'
import type { CSSProperties } from 'react'
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { CSS } from '@dnd-kit/utilities'

import { Button } from '../../components/ui/button.client'
import {
  fieldArrayItemListClasses,
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
import {
  isNestedArraySection,
  resolveArrayItemHeader,
  resolveArrayItemHeaderLabels,
  resolveArrayItemReorder,
  resolveArrayItemVariant,
} from '../config/array-item-config.lib'
import { buildItemDefaultValues, type ArrayConfig } from '../field-config'
import { buildArraySectionChildContext } from '../containers/form-section-child-context.lib'
import { useVisibilityValues } from '../containers/form-conditional.client'
import { NestedFormItems } from '../containers/form-item-node.client'
import { ArrayItemToolbar } from './array-item-header.client'
import { ArrayItemActionsRail, ArrayItemShell } from './array-item-shell.client'
import { arrayItemBodyClasses } from './array-item-toolbar.variants'
import { resolveSortableArrayMove } from './sortable-array-list.lib'

export interface ArrayFieldRendererProps {
  config: ArrayConfig
  idPrefix: string
  /** Resolved full RHF field name for the array (e.g. `"traits"` or `"root.0.traits"`). */
  fullName: string
}

interface ArrayFieldItemContentProps {
  config: ArrayConfig
  idPrefix: string
  fullName: string
  index: number
  itemId: string
  legend: string
  itemBodyStackClasses: string
  canRemove: boolean
  showDragHandle: boolean
  collapsible: boolean
  variant: 'compact' | 'detailed'
  sortable: boolean
  collapsed: boolean
  onToggleCollapse: () => void
  onRemove: () => void
  dragHandleProps?: {
    attributes: ReturnType<typeof useSortable>['attributes']
    listeners: ReturnType<typeof useSortable>['listeners']
    isDragging: boolean
  }
}

function ArrayFieldItemContent({
  config,
  idPrefix,
  fullName,
  index,
  itemId,
  legend,
  itemBodyStackClasses,
  canRemove,
  showDragHandle,
  collapsible,
  variant,
  sortable,
  collapsed,
  onToggleCollapse,
  onRemove,
  dragHandleProps,
}: ArrayFieldItemContentProps) {
  const itemPrefix = `${fullName}.${index}`
  const headerConfig = resolveArrayItemHeader(config)
  const primaryField = headerConfig.primaryField
  const watchedPrimary = useWatch({
    name: primaryField ? `${itemPrefix}.${primaryField}` : `${itemPrefix}`,
    disabled: !primaryField,
  })
  const itemValues = (useWatch({ name: itemPrefix }) ?? {}) as Record<string, unknown>
  const arrayItems = useWatch({ name: fullName, defaultValue: [] }) as unknown[]
  const watchedValues = useDependsOnValues(config.filterSelectDependsOn ?? [])
  const titleId = `${idPrefix}-${fullName}-${itemId}-title`
  const bodyId = `${idPrefix}-${fullName}-${itemId}-body`

  const arrayContext = React.useMemo(
    () => ({
      items: arrayItems ?? [],
      rowIndex: index,
      filterSelectOptions: config.filterSelectOptions,
      watchedValues,
    }),
    [arrayItems, index, config.filterSelectOptions, watchedValues],
  )

  const fieldsNode = (
    <ArrayFieldContext.Provider value={arrayContext}>
      <div className={itemBodyStackClasses}>
        <NestedFormItems
          items={config.fields}
          idPrefix={idPrefix}
          namePrefix={itemPrefix}
          depth={1}
        />
      </div>
    </ArrayFieldContext.Provider>
  )

  const header = resolveArrayItemHeaderLabels(
    headerConfig,
    itemValues,
    index,
    watchedPrimary,
    legend,
  )

  return (
    <ArrayItemShell
      titleId={titleId}
      dragging={dragHandleProps?.isDragging}
      main={
        <>
          <ArrayItemToolbar
            legend={legend}
            index={index}
            headerConfig={headerConfig}
            itemValues={itemValues}
            watchedPrimary={watchedPrimary}
            showDragHandle={showDragHandle}
            dragHandleProps={
              dragHandleProps
                ? {
                    ariaLabel: '',
                    attributes: dragHandleProps.attributes,
                    listeners: dragHandleProps.listeners,
                  }
                : undefined
            }
            collapsible={collapsible}
            collapsed={collapsed}
            onToggleCollapse={onToggleCollapse}
            bodyId={bodyId}
            titleId={titleId}
            compact={variant === 'compact'}
          >
            {variant === 'compact' ? fieldsNode : null}
          </ArrayItemToolbar>
          {variant === 'detailed' ? (
            <div
              id={bodyId}
              hidden={collapsed || undefined}
              className={arrayItemBodyClasses({ collapsible, sortable })}
              aria-hidden={collapsed}
            >
              {fieldsNode}
            </div>
          ) : null}
        </>
      }
      actions={
        <ArrayItemActionsRail
          removeAriaLabel={`Remove ${header.ariaLabel}`}
          canRemove={canRemove}
          onRemove={onRemove}
          compact={variant === 'compact'}
        />
      }
    />
  )
}

interface SortableArrayFieldItemProps extends ArrayFieldItemProps {}

function SortableArrayFieldItem({
  collapsedIds,
  onToggleCollapse,
  itemId,
  ...props
}: SortableArrayFieldItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: itemId,
  })

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <ArrayFieldItemContent
        {...props}
        itemId={itemId}
        collapsed={collapsedIds.has(itemId)}
        onToggleCollapse={() => onToggleCollapse(itemId)}
        dragHandleProps={{ attributes, listeners, isDragging }}
      />
    </div>
  )
}

interface ArrayFieldItemProps extends Omit<
  ArrayFieldItemContentProps,
  'dragHandleProps' | 'collapsed' | 'onToggleCollapse'
> {
  collapsedIds: ReadonlySet<string>
  onToggleCollapse: (itemId: string) => void
}

function ArrayFieldItem({ collapsedIds, onToggleCollapse, itemId, ...props }: ArrayFieldItemProps) {
  const collapsed = collapsedIds.has(itemId)

  return (
    <ArrayFieldItemContent
      {...props}
      itemId={itemId}
      collapsed={collapsed}
      onToggleCollapse={() => onToggleCollapse(itemId)}
    />
  )
}

/**
 * Renders a repeatable array of field groups backed by RHF's `useFieldArray`.
 * Each item renders with header chrome (drag handle, optional collapse, remove)
 * and an "Add" button below the list.
 *
 * Must be rendered inside a `FormProvider`.
 */
export function ArrayFieldRenderer({ config, idPrefix, fullName }: ArrayFieldRendererProps) {
  const { fields, append, remove, move } = useFieldArray({ name: fullName })
  const { getValues } = useFormContext()
  const { rhythm, size, depth } = useFormSectionContext()
  const {
    addLabel = 'Add item',
    min = 0,
    max,
    legend,
    legendSize = 'array',
    itemCollapsible = false,
  } = config
  const legendScale = legendSize === 'array' ? resolveArrayLegendScale(size) : 'default'
  const itemListClasses = fieldArrayItemListClasses({ rhythm, size })
  const itemBodyStackClasses = fieldStackRhythmVariants({ rhythm })
  const nested = isNestedArraySection(depth)
  const variant = resolveArrayItemVariant(config, { nested })
  const reorder = resolveArrayItemReorder(config)
  const sortable = reorder === 'dragHandle'
  const sortableEnabled = sortable && fields.length > 1
  const showDragHandle = sortableEnabled
  const collapsible = itemCollapsible && variant === 'detailed' && !nested

  const [collapsedIds, setCollapsedIds] = React.useState<ReadonlySet<string>>(() => new Set())

  const toggleCollapse = React.useCallback((itemId: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) next.delete(itemId)
      else next.add(itemId)
      return next
    })
  }, [])

  const canRemove = fields.length > min
  const canAdd = max === undefined || fields.length < max

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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const resolved = resolveSortableArrayMove(fields, event)
    if (resolved) move(resolved.from, resolved.to)
  }

  const itemProps = (rhfField: (typeof fields)[number], index: number) => ({
    config,
    idPrefix,
    fullName,
    index,
    itemId: rhfField.id,
    legend,
    itemBodyStackClasses,
    canRemove,
    showDragHandle,
    collapsible,
    variant,
    sortable,
    collapsedIds,
    onToggleCollapse: toggleCollapse,
    onRemove: () => remove(index),
  })

  const list = (
    <>
      {fields.map((rhfField, index) =>
        sortableEnabled ? (
          <SortableArrayFieldItem key={rhfField.id} {...itemProps(rhfField, index)} />
        ) : (
          <ArrayFieldItem key={rhfField.id} {...itemProps(rhfField, index)} />
        ),
      )}
    </>
  )

  return (
    <fieldset className={cn(fieldSetResetClasses, fieldGroupBottomMarginClasses)}>
      <legend className={fieldGroupLegendVariants({ size: legendSize, scale: legendScale })}>
        {legend}
      </legend>
      <div className={itemListClasses}>
        {sortableEnabled ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={fields.map((field) => field.id)}
              strategy={verticalListSortingStrategy}
            >
              {list}
            </SortableContext>
          </DndContext>
        ) : (
          list
        )}
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
