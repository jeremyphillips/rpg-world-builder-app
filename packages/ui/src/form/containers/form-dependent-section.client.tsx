'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import {
  fieldStackRhythmVariants,
  fieldToggleDependentIndentClasses,
} from '../../components/ui/field.variants'
import {
  DEFAULT_DEPENDENT_SURFACE,
  resolveDependentChromePresentation,
} from '../../components/ui/field-dependent.variants'
import { resolveFormDensity } from '../form-density'
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
  const { rhythm } = resolveFormDensity(parentContext.density)
  const childContext = React.useMemo(
    () => buildFormSectionChildContext(parentContext, depth),
    [parentContext, depth],
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
          dependentsChrome={item.dependents}
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
  dependentsChrome: DependentConfig['dependents']
  scope?: DependentConfig['dependents']['scope']
  rhythm: ReturnType<typeof resolveFormDensity>['rhythm']
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
  dependentsChrome,
  scope = 'wrapper',
  rhythm,
  parentContext,
  dependents,
  idPrefix,
  namePrefix,
  depth,
  renderNestedItems,
}: Omit<DependentFieldsRegionProps, 'dependentsVisibility'>) {
  const chromePresentation = resolveDependentChromePresentation(dependentsChrome, rhythm)
  const useArrayItemScope = chromePresentation.chrome === 'panel' && scope === 'arrayItems'
  const arrayItemContext = React.useMemo(
    () =>
      useArrayItemScope
        ? {
            ...parentContext,
            arrayItemSurface: chromePresentation.arrayItemSurface ?? DEFAULT_DEPENDENT_SURFACE,
            arrayItemTone: chromePresentation.arrayItemTone,
          }
        : null,
    [
      useArrayItemScope,
      parentContext,
      chromePresentation.arrayItemSurface,
      chromePresentation.arrayItemTone,
    ],
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

  const chromeWrapperClassName =
    chromePresentation.chrome !== 'none' ? chromePresentation.wrapperClassName : undefined

  return (
    <div className={fieldToggleDependentIndentClasses} data-field-dependent-fields="">
      {chromeWrapperClassName && scope === 'wrapper' ? (
        <div className={cn(fieldStackRhythmVariants({ rhythm }), chromeWrapperClassName)}>
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
