'use client'

import * as React from 'react'
import { useWatch } from 'react-hook-form'

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
  type FormItem,
  type GroupFieldItem,
  type RowConfig,
  type StackConfig,
  type SwitchFieldConfig,
} from '../field-config'
import { buildFieldControlId, FieldNode, useVisibilityValues } from './form-conditional.client'
import { isLeafSwitch } from './form-group-section.client'

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

/** Layout-only stack; toggle-dependent preset splits the switch from indented dependents. */
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

  if (layout !== 'toggleDependent') {
    return (
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
  }

  const [first, ...dependents] = item.fields
  const toggleSwitch = first && isLeafSwitch(first) ? first : null
  const groupLabelledBy = toggleSwitch
    ? buildFieldControlId(idPrefix, namePrefix, toggleSwitch.name)
    : undefined

  return (
    <div
      data-field-stack=""
      role={groupLabelledBy ? 'group' : undefined}
      aria-labelledby={groupLabelledBy}
      className={cn(fieldStackRhythmVariants({ rhythm }), item.className)}
    >
      <FormSectionContext.Provider value={childContext}>
        {first ? (
          isContainer(first) ? (
            renderNestedItems({
              items: [first],
              idPrefix,
              namePrefix,
              depth: depth + 1,
            })
          ) : (
            <FieldNode config={first} idPrefix={idPrefix} namePrefix={namePrefix} />
          )
        ) : null}
        <StackDependentsRegion
          toggleSwitch={toggleSwitch}
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

interface StackDependentsRegionProps {
  toggleSwitch: SwitchFieldConfig | null
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

/** Indented dependents region with optional chrome; hidden while the gate switch is off. */
function StackDependentsRegion({
  toggleSwitch,
  dependentsChrome,
  dependentsChromeScope = 'wrapper',
  rhythm,
  parentContext,
  dependents,
  idPrefix,
  namePrefix,
  depth,
  renderNestedItems,
}: StackDependentsRegionProps) {
  const switchFieldName = toggleSwitch
    ? namePrefix
      ? `${namePrefix}.${toggleSwitch.name}`
      : toggleSwitch.name
    : ''
  const switchOn = useWatch({
    name: switchFieldName,
    disabled: !toggleSwitch,
  })

  const useArrayItemScope = Boolean(
    dependentsChrome && dependentsChromeScope === 'arrayItems',
  )
  const arrayItemContext = React.useMemo(
    () =>
      useArrayItemScope && dependentsChrome
        ? { ...parentContext, arrayItemTone: dependentsChrome }
        : null,
    [useArrayItemScope, parentContext, dependentsChrome],
  )

  if (dependents.length === 0) return null
  if (toggleSwitch && !switchOn) return null

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
