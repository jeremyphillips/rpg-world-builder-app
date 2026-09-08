'use client'

import * as React from 'react'
import { useFormContext } from 'react-hook-form'

import { FieldGroup } from '../../components/ui/field-group'
import { FieldChromeShell } from '../../components/ui/field-chrome-shell'
import {
  hasActiveFieldChrome,
  resolveEffectiveFieldChrome,
} from '../../components/ui/field-chrome.variants'
import { fieldStackRhythmVariants } from '../../components/ui/field.variants'
import { resolveFormDensity } from '../form-density'
import { cn } from '../../lib/utils'
import {
  FormSectionContext,
  buildFormSectionChildContext,
  useFormSectionContext,
} from '../context/form-section.context'
import { useFormUiContext } from '../context/form-ui.context'
import {
  resolveGroupHeadingTier,
  resolveGroupLegendSize,
  resolveNamedGroupDepthAfterEntering,
} from '../form-heading.lib'
import { hasNamedGroupHeading, resolveGroupHeading } from '../resolve-container-heading.lib'
import type {
  GroupConfig,
  GroupFieldItem,
  RadioFieldConfig,
  SelectFieldConfig,
  SwitchFieldConfig,
} from '../field-config'
import { normalizeFieldHint } from '../field-config'
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
  const heading = resolveGroupHeading(item)
  const hasNamedHeading = hasNamedGroupHeading(item)
  const groupTier = resolveGroupHeadingTier(parentContext.namedGroupDepth)
  const legendSize = resolveGroupLegendSize(groupTier)
  const groupDensity = item.density ?? parentContext.density
  const { rhythm: groupRhythm, size: groupSize } = resolveFormDensity(groupDensity)
  const childNamedGroupDepth = resolveNamedGroupDepthAfterEntering(
    hasNamedHeading,
    parentContext.namedGroupDepth,
  )
  const groupFieldChrome = resolveEffectiveFieldChrome(
    { chrome: item.fieldChrome },
    {
      fieldChromeCascade: parentContext.fieldChromeCascade,
      fieldChromeSuppressed: Boolean(parentContext.fieldChromeSuppressed),
    },
  )
  const childContext = React.useMemo(
    () =>
      buildFormSectionChildContext(parentContext, depth, {
        density: groupDensity,
        inGroup: true,
        namedGroupDepth: childNamedGroupDepth,
        headingTier: hasNamedHeading ? groupTier : parentContext.headingTier,
        fieldChromeCascade: item.fieldChrome ?? parentContext.fieldChromeCascade,
        fieldChromeSuppressed:
          hasActiveFieldChrome(groupFieldChrome) ||
          parentContext.fieldChromeSuppressed ||
          undefined,
      }),
    [
      parentContext,
      depth,
      groupDensity,
      childNamedGroupDepth,
      groupTier,
      hasNamedHeading,
      item.fieldChrome,
      groupFieldChrome,
    ],
  )
  const description = React.useMemo(() => {
    const hint = heading?.hint ?? item.description
    if (!hint) return undefined
    return typeof hint === 'string' ? hint : normalizeFieldHint(hint).text
  }, [heading?.hint, item.description])

  const nestedFields = renderNestedItems({
    items: item.fields,
    idPrefix,
    namePrefix,
    depth: depth + 1,
  })

  // FieldGroup's body rhythm only gaps its direct children. A shared FieldChromeShell
  // is one child, so sibling field gap must live inside the shell.
  const chromedFields = hasActiveFieldChrome(groupFieldChrome) ? (
    <FieldChromeShell
      chrome={groupFieldChrome}
      size={groupSize}
      className={fieldStackRhythmVariants({ rhythm: groupRhythm })}
    >
      <FormSectionContext.Provider value={childContext}>{nestedFields}</FormSectionContext.Provider>
    </FieldChromeShell>
  ) : (
    <FormSectionContext.Provider value={childContext}>{nestedFields}</FormSectionContext.Provider>
  )

  return (
    <FieldGroup
      id={item.id}
      legend={heading?.label ?? item.legend}
      legendSize={legendSize}
      rhythm={groupRhythm}
      size={groupSize}
      description={description}
      className={cn(
        item.className,
        (parentContext.inGroup || parentContext.inRhythmStack) && 'mb-0',
      )}
      chrome={item.chrome}
      disclosure={item.disclosure}
      uiStateKey={uiStateKey}
      collapseKey={item.id}
      formControl={control}
    >
      {chromedFields}
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

/** Leaf switch, select, or radio — used for dependent-stack `aria-labelledby`. */
export function isLeafController(
  item: GroupFieldItem,
): item is SwitchFieldConfig | SelectFieldConfig | RadioFieldConfig {
  return (
    !('kind' in item) && (item.type === 'switch' || item.type === 'select' || item.type === 'radio')
  )
}
