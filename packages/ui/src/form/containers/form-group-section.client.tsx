'use client'

import * as React from 'react'
import { useFormContext } from 'react-hook-form'

import { FieldGroup } from '../../components/ui/field-group'
import { FieldChromeShell } from '../../components/ui/field-chrome-shell'
import {
  hasActiveFieldChrome,
  resolveEffectiveFieldChrome,
} from '../../components/ui/field-chrome.variants'
import {
  isDialogDisclosure,
  isInlineDisclosure,
} from '../../components/ui/field-group-disclosure.types'
import {
  fieldGroupBottomMarginClasses,
  fieldGroupSectionOuterMarginResetClasses,
  fieldSetChromeContainClasses,
  fieldStackRhythmVariants,
} from '../../components/ui/field.variants'
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
import type { FieldChrome } from '../../components/ui/field-chrome.variants'

interface GroupFieldSectionProps {
  item: GroupConfig
  idPrefix: string
  namePrefix?: string
  depth: number
  renderNestedItems: RenderNestedFormItems
}

interface GroupContainerLayout {
  chromeActive: boolean
  wrapEntireGroup: boolean
  skipNestedFieldChrome: boolean
  inParentRhythm: boolean
}

function resolveGroupContainerLayout(
  groupFieldChrome: FieldChrome | undefined,
  disclosure: GroupConfig['disclosure'],
  parentContext: ReturnType<typeof useFormSectionContext>,
): GroupContainerLayout {
  const chromeActive = hasActiveFieldChrome(groupFieldChrome)
  const inlineDisclosure = Boolean(disclosure && isInlineDisclosure(disclosure))
  const dialogDisclosure = Boolean(disclosure && isDialogDisclosure(disclosure))
  return {
    chromeActive,
    wrapEntireGroup: chromeActive && !inlineDisclosure && !dialogDisclosure,
    skipNestedFieldChrome: inlineDisclosure,
    inParentRhythm: Boolean(parentContext.inGroup || parentContext.inRhythmStack),
  }
}

function GroupFieldStackBody({
  nestedFields,
  chromeActive,
  wrapEntireGroup,
  skipNestedFieldChrome,
  groupFieldChrome,
  groupSize,
  groupRhythm,
}: {
  nestedFields: React.ReactNode
  chromeActive: boolean
  wrapEntireGroup: boolean
  skipNestedFieldChrome: boolean
  groupFieldChrome: FieldChrome | undefined
  groupSize: ReturnType<typeof resolveFormDensity>['size']
  groupRhythm: ReturnType<typeof resolveFormDensity>['rhythm']
}) {
  if (!chromeActive || wrapEntireGroup || skipNestedFieldChrome) return nestedFields

  return (
    <FieldChromeShell
      chrome={groupFieldChrome}
      size={groupSize}
      className={fieldStackRhythmVariants({ rhythm: groupRhythm })}
    >
      {nestedFields}
    </FieldChromeShell>
  )
}

function GroupFieldOuterChrome({
  wrapEntireGroup,
  groupFieldChrome,
  groupSize,
  inParentRhythm,
  children,
}: {
  wrapEntireGroup: boolean
  groupFieldChrome: FieldChrome | undefined
  groupSize: ReturnType<typeof resolveFormDensity>['size']
  inParentRhythm: boolean
  children: React.ReactNode
}) {
  if (!wrapEntireGroup) return children

  return (
    <FieldChromeShell
      chrome={groupFieldChrome}
      size={groupSize}
      className={inParentRhythm ? undefined : fieldGroupBottomMarginClasses}
    >
      {children}
    </FieldChromeShell>
  )
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

  const nestedFields = (
    <FormSectionContext.Provider value={childContext}>
      {renderNestedItems({
        items: item.fields,
        idPrefix,
        namePrefix,
        depth: depth + 1,
      })}
    </FormSectionContext.Provider>
  )

  const { chromeActive, wrapEntireGroup, skipNestedFieldChrome, inParentRhythm } =
    resolveGroupContainerLayout(groupFieldChrome, item.disclosure, parentContext)

  const groupBody = (
    <GroupFieldStackBody
      nestedFields={nestedFields}
      chromeActive={chromeActive}
      wrapEntireGroup={wrapEntireGroup}
      skipNestedFieldChrome={skipNestedFieldChrome}
      groupFieldChrome={groupFieldChrome}
      groupSize={groupSize}
      groupRhythm={groupRhythm}
    />
  )

  const group = (
    <FieldGroup
      id={item.id}
      legend={heading?.label ?? item.legend}
      legendSize={legendSize}
      rhythm={groupRhythm}
      size={groupSize}
      description={description}
      className={cn(
        item.className,
        wrapEntireGroup && fieldSetChromeContainClasses,
        (inParentRhythm || wrapEntireGroup) && fieldGroupSectionOuterMarginResetClasses,
      )}
      chrome={item.chrome}
      fieldChrome={groupFieldChrome}
      disclosure={item.disclosure}
      uiStateKey={uiStateKey}
      collapseKey={item.id}
      formControl={control}
    >
      {groupBody}
    </FieldGroup>
  )

  return (
    <GroupFieldOuterChrome
      wrapEntireGroup={wrapEntireGroup}
      groupFieldChrome={groupFieldChrome}
      groupSize={groupSize}
      inParentRhythm={inParentRhythm}
    >
      {group}
    </GroupFieldOuterChrome>
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
