'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import {
  fieldStackRhythmVariants,
  fieldToggleDependentIndentClasses,
  type FieldStackRhythm,
} from '../../components/ui/field.variants'
import { fieldStackDependentsChromeVariants } from '../../components/ui/field-stack.variants'
import {
  FormSectionContext,
  buildFormSectionChildContext,
  useFormSectionContext,
  type FormSectionContextValue,
} from '../context/form-section.context'
import {
  isContainer,
  resolveDependentsVisibility,
  type FieldVisibility,
  type FormItem,
  type GroupFieldItem,
  type RowConfig,
  type StackConfig,
} from '../field-config'
import {
  buildFieldControlId,
  FieldNode,
  useVisibilityValues,
  withFieldSeparator,
} from './form-conditional.client'
import { isLeafController } from './form-group-section.client'

export interface RenderNestedFormItemsProps {
  items: Array<FormItem | RowConfig>
  idPrefix: string
  namePrefix?: string
  depth: number
}

export type RenderNestedFormItems = (props: RenderNestedFormItemsProps) => React.ReactNode

interface StackSectionProps {
  item: StackConfig
  idPrefix: string
  namePrefix?: string
  depth: number
  renderNestedItems: RenderNestedFormItems
}

/** Layout-only stack; dependent preset splits the controller from indented dependents. */
export function StackSection({
  item,
  idPrefix,
  namePrefix,
  depth,
  renderNestedItems,
}: StackSectionProps) {
  const parentContext = useFormSectionContext()
  const rhythm = item.rhythm ?? 'compact'
  const childContext = React.useMemo(
    () => buildFormSectionChildContext(parentContext, depth, { rhythm }),
    [parentContext, depth, rhythm],
  )
  const layout = item.layout ?? 'default'
  let stackBody: React.ReactNode

  if (layout !== 'dependent') {
    stackBody = (
      <div data-field-stack="" className={cn(fieldStackRhythmVariants({ rhythm }), item.className)}>
        <FormSectionContext.Provider value={childContext}>
          {renderNestedItems({
            items: item.fields,
            idPrefix,
            namePrefix,
            depth: depth + 1,
          })}
        </FormSectionContext.Provider>
      </div>
    )
  } else {
    const [controllerField, ...dependents] = item.fields
    const controller = controllerField && isLeafController(controllerField) ? controllerField : null
    const dependentsVisibility = resolveDependentsVisibility(item, controllerField)
    const groupLabelledBy = controller
      ? buildFieldControlId(idPrefix, namePrefix, controller.name)
      : undefined

    stackBody = (
      <div
        data-field-stack=""
        role={groupLabelledBy ? 'group' : undefined}
        aria-labelledby={groupLabelledBy}
        className={cn(fieldStackRhythmVariants({ rhythm }), item.className)}
      >
        <FormSectionContext.Provider value={childContext}>
          {controllerField ? (
            isContainer(controllerField) ? (
              renderNestedItems({
                items: [controllerField],
                idPrefix,
                namePrefix,
                depth: depth + 1,
              })
            ) : (
              <FieldNode config={controllerField} idPrefix={idPrefix} namePrefix={namePrefix} />
            )
          ) : null}
          <StackDependentsRegion
            dependentsVisibility={dependentsVisibility}
            dependentsChrome={item.dependentsChrome}
            dependentsChromeScope={item.dependentsChromeScope}
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
  }

  return withFieldSeparator(item.separator, stackBody)
}

interface StackDependentsRegionProps {
  dependentsVisibility: FieldVisibility | null
  dependentsChrome?: StackConfig['dependentsChrome']
  dependentsChromeScope?: StackConfig['dependentsChromeScope']
  rhythm: FieldStackRhythm
  parentContext: FormSectionContextValue
  dependents: GroupFieldItem[]
  idPrefix: string
  namePrefix?: string
  depth: number
  renderNestedItems: RenderNestedFormItems
}

/** Indented dependents region with optional chrome; hidden when the visibility gate is false. */
function StackDependentsRegion(props: StackDependentsRegionProps) {
  if (props.dependents.length === 0) return null
  const { dependentsVisibility, ...contentProps } = props
  if (dependentsVisibility) {
    return (
      <GatedStackDependentsRegion {...contentProps} dependentsVisibility={dependentsVisibility} />
    )
  }
  return <StackDependentsRegionContent {...props} />
}

function GatedStackDependentsRegion({
  dependentsVisibility,
  ...props
}: Omit<StackDependentsRegionProps, 'dependentsVisibility'> & {
  dependentsVisibility: FieldVisibility
}) {
  const values = useVisibilityValues(dependentsVisibility, props.namePrefix)
  if (!dependentsVisibility.visibleWhen(values)) return null
  return <StackDependentsRegionContent {...props} />
}

function StackDependentsRegionContent({
  dependentsChrome,
  dependentsChromeScope = 'wrapper',
  rhythm,
  parentContext,
  dependents,
  idPrefix,
  namePrefix,
  depth,
  renderNestedItems,
}: Omit<StackDependentsRegionProps, 'dependentsVisibility'>) {
  const useArrayItemScope = Boolean(dependentsChrome && dependentsChromeScope === 'arrayItems')
  const arrayItemContext = React.useMemo(
    () =>
      useArrayItemScope && dependentsChrome
        ? { ...parentContext, arrayItemTone: dependentsChrome }
        : null,
    [useArrayItemScope, parentContext, dependentsChrome],
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
    <div className={fieldToggleDependentIndentClasses} data-field-stack-dependents="">
      {dependentsChrome && dependentsChromeScope === 'wrapper' ? (
        <div
          className={cn(
            fieldStackRhythmVariants({ rhythm }),
            fieldStackDependentsChromeVariants({ tone: dependentsChrome }),
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

interface ConditionalStackProps {
  item: StackConfig
  idPrefix: string
  namePrefix?: string
  depth: number
  renderNestedItems: RenderNestedFormItems
}

/** Hides a stack when its `visibility` predicate is false. */
export function ConditionalStack({
  item,
  idPrefix,
  namePrefix,
  depth,
  renderNestedItems,
}: ConditionalStackProps) {
  const values = useVisibilityValues(item.visibility!, namePrefix)
  if (!item.visibility!.visibleWhen(values)) return null
  return (
    <StackSection
      item={item}
      idPrefix={idPrefix}
      namePrefix={namePrefix}
      depth={depth}
      renderNestedItems={renderNestedItems}
    />
  )
}
