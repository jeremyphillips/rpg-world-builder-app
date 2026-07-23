'use client'

import * as React from 'react'
import { useFormContext } from 'react-hook-form'

import { FieldGroup } from '../../components/ui/field-group'
import { resolveFieldStackRhythm } from '../../components/ui/field.variants'
import { cn } from '../../lib/utils'
import {
  FormSectionContext,
  buildFormSectionChildContext,
  useFormSectionContext,
} from '../context/form-section.context'
import { useFormUiContext } from '../context/form-ui.context'
import type {
  GroupConfig,
  GroupFieldItem,
  SelectFieldConfig,
  SwitchFieldConfig,
} from '../field-config'
import { useVisibilityValues } from './form-conditional.client'
import type { RenderNestedFormItems } from './form-dependent-section.client'

interface GroupFieldSectionProps {
  item: GroupConfig
  idPrefix: string
  namePrefix?: string
  depth: number
  renderNestedItems: RenderNestedFormItems
}

export function GroupFieldSection({
  item,
  idPrefix,
  namePrefix,
  depth,
  renderNestedItems,
}: GroupFieldSectionProps) {
  const parentContext = useFormSectionContext()
  const { uiStateKey } = useFormUiContext()
  const { control } = useFormContext()
  const legendSize = item.legendSize ?? (parentContext.inGroup ? 'subsection' : 'section')
  const groupRhythm = resolveFieldStackRhythm({
    explicit: item.rhythm,
    inherited: parentContext.rhythm,
  })
  const childContext = React.useMemo(
    () =>
      buildFormSectionChildContext(parentContext, depth, { rhythm: groupRhythm, inGroup: true }),
    [parentContext, depth, groupRhythm],
  )

  return (
    <FieldGroup
      id={item.id}
      legend={item.legend}
      legendSize={legendSize}
      rhythm={groupRhythm}
      description={item.description}
      className={cn(
        item.className,
        (parentContext.inGroup || parentContext.inRhythmStack) && 'mb-0',
      )}
      fieldsChrome={item.fieldsChrome}
      uiStateKey={uiStateKey}
      collapseKey={item.id}
      formControl={control}
    >
      <FormSectionContext.Provider value={childContext}>
        {renderNestedItems({
          items: item.fields,
          idPrefix,
          namePrefix,
          depth: depth + 1,
        })}
      </FormSectionContext.Provider>
    </FieldGroup>
  )
}

interface ConditionalGroupProps {
  item: GroupConfig
  idPrefix: string
  namePrefix?: string
  depth: number
  renderNestedItems: RenderNestedFormItems
}

/** Hides a nested group when its `visibility` predicate is false. */
export function ConditionalGroup({
  item,
  idPrefix,
  namePrefix,
  depth,
  renderNestedItems,
}: ConditionalGroupProps) {
  const values = useVisibilityValues(item.visibility!, namePrefix)
  if (!item.visibility!.visibleWhen(values)) return null
  return (
    <GroupFieldSection
      item={item}
      idPrefix={idPrefix}
      namePrefix={namePrefix}
      depth={depth}
      renderNestedItems={renderNestedItems}
    />
  )
}

export function isLeafSwitch(item: GroupFieldItem): item is SwitchFieldConfig {
  return !('kind' in item) && item.type === 'switch'
}

/** Leaf switch or select — used for dependent-stack `aria-labelledby`. */
export function isLeafController(
  item: GroupFieldItem,
): item is SwitchFieldConfig | SelectFieldConfig {
  return !('kind' in item) && (item.type === 'switch' || item.type === 'select')
}
