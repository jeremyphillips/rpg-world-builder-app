'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import {
  fieldStackRhythmVariants,
  fieldToggleDependentIndentClasses,
  type FieldRhythm,
} from '../../components/ui/field.variants'
import { resolveFieldDependentsChromeClasses } from '../../components/ui/field-dependent.variants'
import {
  FormSectionContext,
  buildFormSectionChildContext,
  useFormSectionContext,
  type FormSectionContextValue,
} from '../context/form-section.context'
import {
  resolveDependentsVisibility,
  type DependentConfig,
  type FieldVisibility,
  type FormItem,
  type GroupFieldItem,
  type RowConfig,
} from '../field-config'
import {
  buildFieldControlId,
  FieldNode,
  FieldSeparatorWrapper,
  useVisibilityValues,
} from './form-conditional.client'
import { isLeafController } from './form-group-section.client'

export interface RenderNestedFormItemsProps {
  items: Array<FormItem | RowConfig>
  idPrefix: string
  namePrefix?: string
  depth: number
}

export type RenderNestedFormItems = (props: RenderNestedFormItemsProps) => React.ReactNode

interface DependentSectionProps {
  item: DependentConfig
  idPrefix: string
  namePrefix?: string
  depth: number
  renderNestedItems: RenderNestedFormItems
}

/** Controller field plus gated dependents with optional chrome. */
export function DependentSection({
  item,
  idPrefix,
  namePrefix,
  depth,
  renderNestedItems,
}: DependentSectionProps) {
  const parentContext = useFormSectionContext()
  const rhythm = item.rhythm ?? 'compact'
  const childContext = React.useMemo(
    () => buildFormSectionChildContext(parentContext, depth, { rhythm }),
    [parentContext, depth, rhythm],
  )
  const controller = item.controller
  const dependents = item.dependents.fields
  const dependentsVisibility = resolveDependentsVisibility(item, controller)
  const groupLabelledBy = isLeafController(controller)
    ? buildFieldControlId(idPrefix, namePrefix, controller.name)
    : undefined

  const stackBody = (
    <div
      id={item.id}
      data-field-dependent=""
      role={groupLabelledBy ? 'group' : undefined}
      aria-labelledby={groupLabelledBy}
      className={cn(fieldStackRhythmVariants({ rhythm }), item.className)}
    >
      <FormSectionContext.Provider value={childContext}>
        <FieldNode config={controller} idPrefix={idPrefix} namePrefix={namePrefix} />
        <DependentFieldsRegion
          dependentsVisibility={dependentsVisibility}
          surface={item.dependents.surface}
          status={item.dependents.status}
          scope={item.dependents.scope}
          rhythm={rhythm}
          parentContext={childContext}
          dependents={dependents}
          idPrefix={idPrefix}
          namePrefix={namePrefix}
          depth={depth}
          renderNestedItems={renderNestedItems}
        />
      </FormSectionContext.Provider>
    </div>
  )

  return <FieldSeparatorWrapper separator={item.separator}>{stackBody}</FieldSeparatorWrapper>
}

interface DependentFieldsRegionProps {
  dependentsVisibility: FieldVisibility | null
  surface?: DependentConfig['dependents']['surface']
  status?: DependentConfig['dependents']['status']
  scope?: DependentConfig['dependents']['scope']
  rhythm: FieldRhythm
  parentContext: FormSectionContextValue
  dependents: GroupFieldItem[]
  idPrefix: string
  namePrefix?: string
  depth: number
  renderNestedItems: RenderNestedFormItems
}

function DependentFieldsRegion(props: DependentFieldsRegionProps) {
  if (props.dependents.length === 0) return null
  const { dependentsVisibility, ...contentProps } = props
  if (dependentsVisibility) {
    return (
      <GatedDependentFieldsRegion {...contentProps} dependentsVisibility={dependentsVisibility} />
    )
  }
  return <DependentFieldsRegionContent {...props} />
}

function GatedDependentFieldsRegion({
  dependentsVisibility,
  ...props
}: Omit<DependentFieldsRegionProps, 'dependentsVisibility'> & {
  dependentsVisibility: FieldVisibility
}) {
  const values = useVisibilityValues(dependentsVisibility, props.namePrefix)
  if (!dependentsVisibility.visibleWhen(values)) return null
  return <DependentFieldsRegionContent {...props} />
}

function DependentFieldsRegionContent({
  surface,
  status,
  scope = 'wrapper',
  rhythm,
  parentContext,
  dependents,
  idPrefix,
  namePrefix,
  depth,
  renderNestedItems,
}: Omit<DependentFieldsRegionProps, 'dependentsVisibility'>) {
  const hasChrome = surface !== undefined || status !== undefined
  const useArrayItemScope = hasChrome && scope === 'arrayItems'
  const arrayItemContext = React.useMemo(
    () =>
      useArrayItemScope
        ? {
            ...parentContext,
            arrayItemSurface: surface ?? 'subtle',
            arrayItemStatus: status,
          }
        : null,
    [useArrayItemScope, parentContext, surface, status],
  )

  const dependentsContent = renderNestedItems({
    items: dependents,
    idPrefix,
    namePrefix,
    depth: depth + 1,
  })

  const rhythmWrapper = (content: React.ReactNode) => (
    <div className={fieldStackRhythmVariants({ rhythm })}>{content}</div>
  )

  return (
    <div className={fieldToggleDependentIndentClasses} data-field-dependent-fields="">
      {hasChrome && scope === 'wrapper' ? (
        <div
          className={cn(
            fieldStackRhythmVariants({ rhythm }),
            resolveFieldDependentsChromeClasses({ surface, status }),
          )}
        >
          {dependentsContent}
        </div>
      ) : useArrayItemScope && arrayItemContext ? (
        <FormSectionContext.Provider value={arrayItemContext}>
          {rhythmWrapper(dependentsContent)}
        </FormSectionContext.Provider>
      ) : (
        rhythmWrapper(dependentsContent)
      )}
    </div>
  )
}

interface ConditionalDependentProps {
  item: DependentConfig
  idPrefix: string
  namePrefix?: string
  depth: number
  renderNestedItems: RenderNestedFormItems
}

/** Hides a dependent section when its `visibility` predicate is false. */
export function ConditionalDependent({
  item,
  idPrefix,
  namePrefix,
  depth,
  renderNestedItems,
}: ConditionalDependentProps) {
  const values = useVisibilityValues(item.visibility!, namePrefix)
  if (!item.visibility!.visibleWhen(values)) return null
  return (
    <DependentSection
      item={item}
      idPrefix={idPrefix}
      namePrefix={namePrefix}
      depth={depth}
      renderNestedItems={renderNestedItems}
    />
  )
}
