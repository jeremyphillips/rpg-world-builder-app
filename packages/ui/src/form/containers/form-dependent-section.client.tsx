'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import { fieldStackRhythmVariants } from '../../components/ui/field.variants'
import { FormFieldChromeShell } from '../context/form-field-chrome-shell.client'
import {
  hasActiveFieldChrome,
  resolveEffectiveFieldChrome,
} from '../../components/ui/field-chrome.variants'
import {
  dependentSectionStackClasses,
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
import { DependentSwitchController } from './dependent-switch-controller.client'

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
  const nestSurfaceHost = hasActiveFieldChrome(dependentChrome)
    ? 'field-container'
    : parentContext.surfaceHost

  const stackBody = (
    <div
      id={item.id}
      data-field-dependent=""
      role={groupLabelledBy ? 'group' : undefined}
      aria-labelledby={groupLabelledBy}
      className={cn(dependentSectionStackClasses, item.className)}
    >
      <FormSectionContext.Provider value={childContext}>
        {item.confirmBeforeClear && controller.type === 'switch' ? (
          <DependentSwitchController
            item={item}
            controller={controller}
            idPrefix={idPrefix}
            namePrefix={namePrefix}
          />
        ) : (
          <FieldNode config={controller} idPrefix={idPrefix} namePrefix={namePrefix} />
        )}
        <DependentFieldsRegion
          dependentsVisibility={dependentsVisibility}
          dependentsChrome={item.dependents}
          rhythm={rhythm}
          parentContext={childContext}
          surfaceHost={nestSurfaceHost}
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
    <FormFieldChromeShell chrome={dependentChrome} size={size}>
      {stackBody}
    </FormFieldChromeShell>
  ) : (
    stackBody
  )

  return <FieldSeparatorWrapper separator={item.separator}>{chromedStack}</FieldSeparatorWrapper>
}

interface DependentFieldsRegionProps {
  dependentsVisibility: FieldVisibility | null
  dependentsChrome: DependentConfig['dependents']
  rhythm: ReturnType<typeof resolveFormDensity>['rhythm']
  parentContext: FormSectionContextValue
  surfaceHost?: FormSectionContextValue['surfaceHost']
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
  rhythm,
  parentContext,
  surfaceHost,
  dependents,
  idPrefix,
  namePrefix,
  depth,
  renderNestedItems,
}: Omit<DependentFieldsRegionProps, 'dependentsVisibility'>) {
  const presentation = resolveDependentPresentation(dependentsChrome, rhythm, { surfaceHost })
  const dependentsContent = renderNestedItems({
    items: dependents,
    idPrefix,
    namePrefix,
    depth: depth + 1,
  })
  const suppressFieldChrome = presentation.showNest
  const dependentChildContext = suppressFieldChrome
    ? { ...parentContext, fieldChromeSuppressed: true }
    : parentContext

  const fieldsStack = (
    <FormSectionContext.Provider value={dependentChildContext}>
      <div className={fieldStackRhythmVariants({ rhythm })}>{dependentsContent}</div>
    </FormSectionContext.Provider>
  )

  if (!presentation.showNest) {
    return (
      <div className="" data-field-dependent-fields="">
        {fieldsStack}
      </div>
    )
  }

  return (
    <div
      className={cn(presentation.railClassName, presentation.nestShellClassName)}
      data-field-dependent-fields=""
      data-field-dependent-nest=""
    >
      {fieldsStack}
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
