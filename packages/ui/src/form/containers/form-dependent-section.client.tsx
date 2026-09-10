'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import { fieldStackRhythmVariants } from '../../components/ui/field.variants'
import { FieldChromeShell } from '../../components/ui/field-chrome-shell'
import {
  hasActiveFieldChrome,
  resolveEffectiveFieldChrome,
} from '../../components/ui/field-chrome.variants'
import {
  DEFAULT_DEPENDENT_SURFACE,
  resolveDependentPresentation,
} from '../../components/ui/field-dependent.variants'
import { resolveFormDensity } from '../form-density'
import {
  FormSectionContext,
  buildFormSectionChildContext,
  useFormSectionContext,
  type FormSectionContextValue,
} from '../context/form-section.context'
import {
  DEFAULT_DEPENDENT_INSET,
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
  const { rhythm, size } = resolveFormDensity(parentContext.density)
  const dependentChrome = resolveEffectiveFieldChrome(item, {
    fieldChromeCascade: parentContext.fieldChromeCascade,
    fieldChromeSuppressed: Boolean(parentContext.fieldChromeSuppressed),
  })
  const childContext = React.useMemo(
    () =>
      buildFormSectionChildContext(parentContext, depth, {
        fieldChromeCascade: item.dependents.fieldChrome ?? parentContext.fieldChromeCascade,
        fieldChromeSuppressed:
          hasActiveFieldChrome(dependentChrome) || parentContext.fieldChromeSuppressed || undefined,
      }),
    [parentContext, depth, item.dependents.fieldChrome, dependentChrome],
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
          inset={item.dependents.inset}
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

  const chromedStack = hasActiveFieldChrome(dependentChrome) ? (
    <FieldChromeShell chrome={dependentChrome} size={size}>
      {stackBody}
    </FieldChromeShell>
  ) : (
    stackBody
  )

  return <FieldSeparatorWrapper separator={item.separator}>{chromedStack}</FieldSeparatorWrapper>
}

interface DependentFieldsRegionProps {
  dependentsVisibility: FieldVisibility | null
  dependentsChrome: DependentConfig['dependents']
  inset?: boolean
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

function rhythmStack(content: React.ReactNode, rhythm: DependentFieldsRegionProps['rhythm']) {
  return <div className={fieldStackRhythmVariants({ rhythm })}>{content}</div>
}

function wrapDependentFieldsContent({
  chromeWrapperClassName,
  scope,
  rhythm,
  dependentsContent,
  dependentChildContext,
  arrayItemContext,
  useArrayItemScope,
  suppressFieldChrome,
}: {
  chromeWrapperClassName?: string
  scope: DependentConfig['dependents']['scope']
  rhythm: DependentFieldsRegionProps['rhythm']
  dependentsContent: React.ReactNode
  dependentChildContext: FormSectionContextValue
  arrayItemContext: FormSectionContextValue | null
  useArrayItemScope: boolean
  suppressFieldChrome: boolean
}) {
  if (chromeWrapperClassName && scope === 'wrapper') {
    return (
      <FormSectionContext.Provider value={dependentChildContext}>
        <div className={cn(fieldStackRhythmVariants({ rhythm }), chromeWrapperClassName)}>
          {dependentsContent}
        </div>
      </FormSectionContext.Provider>
    )
  }

  if (useArrayItemScope && arrayItemContext) {
    return (
      <FormSectionContext.Provider value={arrayItemContext}>
        {rhythmStack(dependentsContent, rhythm)}
      </FormSectionContext.Provider>
    )
  }

  if (suppressFieldChrome) {
    return (
      <FormSectionContext.Provider value={dependentChildContext}>
        {rhythmStack(dependentsContent, rhythm)}
      </FormSectionContext.Provider>
    )
  }

  return rhythmStack(dependentsContent, rhythm)
}

function DependentFieldsRegionContent({
  dependentsChrome,
  inset = DEFAULT_DEPENDENT_INSET,
  scope = 'wrapper',
  rhythm,
  parentContext,
  dependents,
  idPrefix,
  namePrefix,
  depth,
  renderNestedItems,
}: Omit<DependentFieldsRegionProps, 'dependentsVisibility'>) {
  const presentation = resolveDependentPresentation({ ...dependentsChrome, inset }, rhythm)
  const useArrayItemScope = presentation.chrome === 'panel' && scope === 'arrayItems'
  const arrayItemContext = React.useMemo(
    () =>
      useArrayItemScope
        ? {
            ...parentContext,
            arrayItemSurface: presentation.arrayItemSurface ?? DEFAULT_DEPENDENT_SURFACE,
            arrayItemTone: presentation.arrayItemTone,
          }
        : null,
    [useArrayItemScope, parentContext, presentation.arrayItemSurface, presentation.arrayItemTone],
  )

  const dependentsContent = renderNestedItems({
    items: dependents,
    idPrefix,
    namePrefix,
    depth: depth + 1,
  })

  const chromeWrapperClassName = presentation.chromeWrapperClassName
  const railClassName = presentation.railClassName
  const showRail = Boolean(railClassName && scope === 'wrapper')
  const suppressFieldChrome =
    scope === 'wrapper' && (presentation.chrome === 'panel' || presentation.chrome === 'rail')
  const dependentChildContext = React.useMemo(
    () => (suppressFieldChrome ? { ...parentContext, fieldChromeSuppressed: true } : parentContext),
    [parentContext, suppressFieldChrome],
  )

  return (
    <div
      className={cn(presentation.insetClassName, showRail ? railClassName : undefined)}
      data-field-dependent-fields=""
      {...(showRail ? { 'data-field-dependent-rail': '' } : {})}
    >
      {wrapDependentFieldsContent({
        chromeWrapperClassName,
        scope,
        rhythm,
        dependentsContent,
        dependentChildContext,
        arrayItemContext,
        useArrayItemScope,
        suppressFieldChrome,
      })}
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
