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
  ArrayItemPresentationContext,
  resolveErrorPlacement,
} from '../context/array-item-presentation.context'
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
import { useArrayItemCollapseState } from '../hooks/use-array-item-collapse-state.client'
import {
  useArrayItemIssues,
  useFormValidationPresentation,
} from '../hooks/use-form-validation-presentation.client'
import { useFormUiContext } from '../context/form-ui.context'
import {
  buildValidationSessionExpandKey,
  countInvalidArrayItems,
  countIssuesForArrayPath,
  sortFormIssues,
} from '../errors'
import { resolveIssueProminence } from '../errors/resolve-issue-prominence'
import type { FormIssueScope } from '../errors/form-issue.types'
import { resolveIssueFocusControlId } from '../errors/resolve-issue-focus-target'
import { collectArraySections } from '../errors/resolve-field-order'
import { ArrayLegendIssueLink } from './array-item-issue.client'

function resolveLevelRangeKeys(
  arrayPattern: ArrayConfig['arrayPattern'],
): { min: string; max: string } | undefined {
  if (arrayPattern?.kind !== 'levelRange') return undefined

  const levelKeys = arrayPattern.levelKeys as { min?: string; max?: string } | undefined
  return {
    min: levelKeys?.min ?? 'minLevel',
    max: levelKeys?.max ?? 'maxLevel',
  }
}

function scrollElementIntoView(element: Element): void {
  if ('scrollIntoView' in element && typeof element.scrollIntoView === 'function') {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

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
  collapsed,
  onToggleCollapse,
  onRemove,
  dragHandleProps,
}: ArrayFieldItemContentProps) {
  const itemPrefix = `${fullName}.${index}`
  const headerConfig = resolveArrayItemHeader(config, legend)
  const primaryField = headerConfig.primaryField
  const watchedPrimary = useWatch({
    name: primaryField ? `${itemPrefix}.${primaryField}` : `${itemPrefix}`,
    disabled: !primaryField,
  })
  const itemValues = (useWatch({ name: itemPrefix }) ?? {}) as Record<string, unknown>
  const arrayItems = useWatch({ name: fullName, defaultValue: [] }) as unknown[]
  const watchedValues = useDependsOnValues(config.filterSelectDependsOn ?? [])
  const arrayItemsSignature = React.useMemo(() => JSON.stringify(arrayItems ?? []), [arrayItems])
  const titleId = `${idPrefix}-${fullName}-${itemId}-title`
  const bodyId = `${idPrefix}-${fullName}-${itemId}-body`
  const { addValidationSessionExpandKeys } = useFormUiContext()
  const validation = useFormValidationPresentation()
  const issueGroup = useArrayItemIssues(fullName, itemPrefix, index)
  const showIssueChrome = validation.shouldShowRowIssues(itemPrefix, issueGroup)

  const levelRangeKeys = React.useMemo(
    () => resolveLevelRangeKeys(config.arrayPattern),
    [config.arrayPattern],
  )

  const arrayContext = React.useMemo(
    () => ({
      items: arrayItems ?? [],
      rowIndex: index,
      fullArrayName: levelRangeKeys ? fullName : undefined,
      levelRangeKeys,
      filterSelectOptions: config.filterSelectOptions,
      watchedValues,
    }),
    [
      arrayItems,
      arrayItemsSignature,
      index,
      fullName,
      levelRangeKeys,
      config.filterSelectOptions,
      watchedValues,
    ],
  )

  const rowSummaryId = `${idPrefix}-${itemPrefix.replaceAll('.', '-')}-summary`
  const suppressFieldErrorText = resolveErrorPlacement(config.errorPlacement, variant, false)

  const fieldsNode = (
    <ArrayItemPresentationContext.Provider value={{ suppressFieldErrorText, rowSummaryId }}>
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
    </ArrayItemPresentationContext.Provider>
  )

  const header = resolveArrayItemHeaderLabels(
    headerConfig,
    itemValues,
    index,
    watchedPrimary,
    legend,
  )
  const gripVisible = showDragHandle && Boolean(dragHandleProps)
  const leadingChrome = { showDragHandle: gripVisible, collapsible }
  const rowLabel = header.ariaLabel

  const focusIssue = React.useCallback(() => {
    const issue = issueGroup.sortedIssues[0]
    if (!issue) return

    if (collapsible) {
      addValidationSessionExpandKeys([
        buildValidationSessionExpandKey(
          fullName,
          index,
          itemValues,
          config.itemCollapseKey ?? 'id',
        ),
      ])
    }

    window.requestAnimationFrame(() => {
      const focusControlId = resolveIssueFocusControlId(issue, idPrefix, config.arrayPattern)
      if (focusControlId) {
        const element = document.getElementById(focusControlId)
        if (element) {
          scrollElementIntoView(element)
          if ('focus' in element && typeof element.focus === 'function') {
            element.focus({ preventScroll: true })
          }
          return
        }
      }

      const rowElement = document.querySelector(`[data-array-item-prefix="${itemPrefix}"]`)
      if (rowElement) scrollElementIntoView(rowElement)
    })
  }, [
    addValidationSessionExpandKeys,
    collapsible,
    config.arrayPattern,
    config.itemCollapseKey,
    fullName,
    idPrefix,
    index,
    issueGroup.sortedIssues,
    itemPrefix,
    itemValues,
  ])

  const issueScope: FormIssueScope = variant === 'compact' ? 'field' : 'item'
  const issueVisibility = variant === 'compact' || !collapsed ? 'visible' : 'collapsed'
  const badgeProminence = resolveIssueProminence(issueScope, issueVisibility)

  const issueSummary = (() => {
    if (!showIssueChrome || issueGroup.totalCount <= 0) return undefined

    if (variant === 'compact' && issueGroup.fieldSummary) {
      return {
        group: issueGroup,
        placement: 'compactSummary' as const,
        summaryId: rowSummaryId,
      }
    }

    if (variant === 'detailed' && (collapsed || issueGroup.headerIssues.length > 0)) {
      return {
        group: issueGroup,
        onPrimaryPress: focusIssue,
        onMorePress: focusIssue,
        placement: (collapsed ? 'collapsed' : 'expanded') as 'collapsed' | 'expanded',
      }
    }

    return undefined
  })()

  return (
    <ArrayItemShell
      titleId={titleId}
      itemPrefix={itemPrefix}
      showDragHandle={gripVisible}
      collapsible={collapsible}
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
            issueSummary={issueSummary}
          >
            {variant === 'compact' ? fieldsNode : null}
          </ArrayItemToolbar>
          {variant === 'detailed' ? (
            <div
              id={bodyId}
              hidden={collapsed || undefined}
              className={arrayItemBodyClasses(leadingChrome)}
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
          issueCount={showIssueChrome ? issueGroup.totalCount : 0}
          issueRowLabel={rowLabel}
          onIssuePress={focusIssue}
          badgeProminence={showIssueChrome ? badgeProminence : 'nav'}
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
  const { addValidationSessionExpandKeys } = useFormUiContext()
  const validation = useFormValidationPresentation()
  const { rhythm, size, depth } = useFormSectionContext()
  const {
    addLabel = 'Add item',
    min = 0,
    max,
    legend,
    legendSize = 'array',
    itemCollapsible = false,
    itemCollapseKey,
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

  const getItemValues = React.useCallback(
    (index: number) => (getValues(`${fullName}.${index}`) ?? {}) as Record<string, unknown>,
    [getValues, fullName],
  )

  const { collapsedIds, toggleCollapse } = useArrayItemCollapseState({
    fullName,
    collapsible,
    fields,
    itemCollapseKey: itemCollapseKey,
    getItemValues,
  })

  const canRemove = fields.length > min
  const canAdd = max === undefined || fields.length < max
  const invalidRowCount = validation.hasAttemptedSubmit
    ? countInvalidArrayItems(validation.issues, fullName)
    : 0
  const arrayIssueCount = validation.hasAttemptedSubmit
    ? countIssuesForArrayPath(validation.issues, fullName)
    : 0

  const focusFirstArrayIssue = React.useCallback(() => {
    const sections = collectArraySections(validation.fields)
    const arrayIssues = validation.issues.filter(
      (issue) => issue.path === fullName || issue.path.startsWith(`${fullName}.`),
    )
    const firstIssue = sortFormIssues(arrayIssues, sections)[0]
    if (!firstIssue || firstIssue.itemIndex === undefined) return

    const itemValues = getItemValues(firstIssue.itemIndex)
    addValidationSessionExpandKeys([
      buildValidationSessionExpandKey(
        fullName,
        firstIssue.itemIndex,
        itemValues,
        config.itemCollapseKey ?? 'id',
      ),
    ])

    window.requestAnimationFrame(() => {
      const focusControlId = resolveIssueFocusControlId(firstIssue, idPrefix, config.arrayPattern)
      if (focusControlId) {
        const element = document.getElementById(focusControlId)
        if (element) {
          scrollElementIntoView(element)
          if ('focus' in element && typeof element.focus === 'function') {
            element.focus({ preventScroll: true })
          }
          return
        }
      }

      const rowElement = document.querySelector(
        `[data-array-item-prefix="${firstIssue.itemPrefix}"]`,
      )
      if (rowElement) scrollElementIntoView(rowElement)
    })
  }, [
    addValidationSessionExpandKeys,
    config.arrayPattern,
    config.itemCollapseKey,
    fullName,
    getItemValues,
    idPrefix,
    validation.fields,
    validation.issues,
  ])

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

  const showLegend = legend.trim().length > 0

  return (
    <fieldset
      id={config.id}
      className={cn(
        fieldSetResetClasses,
        !nested && fieldGroupBottomMarginClasses,
        config.className,
      )}
    >
      {showLegend ? (
        <legend className={fieldGroupLegendVariants({ size: legendSize, scale: legendScale })}>
          {legend}
          <ArrayLegendIssueLink
            issueCount={arrayIssueCount}
            invalidRowCount={invalidRowCount}
            sectionLabel={legend}
            onPress={focusFirstArrayIssue}
          />
        </legend>
      ) : null}
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
