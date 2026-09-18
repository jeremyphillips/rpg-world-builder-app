'use client'

import * as React from 'react'

import { FormFieldChromeShell } from '../../context/form-field-chrome-shell.client'
import {
  hasActiveFieldChrome,
  resolveEffectiveFieldChrome,
} from '../../../components/ui/field-chrome.variants'
import { fieldGroupBottomMarginClasses } from '../../../components/ui/field.variants'
import {
  FormSectionContext,
  type FormSectionContextValue,
} from '../../context/form-section.context'
import { buildArraySectionChildContext } from '../../containers/form-section-child-context.lib'
import { resolveFormDensity } from '../../form-density'
import type { ArrayConfig } from '../../field-config'
import { ArrayFieldRenderer } from './array-field-renderer.client'

export interface ArrayFormItemSectionProps {
  item: ArrayConfig
  parentContext: FormSectionContextValue
  idPrefix: string
  namePrefix?: string
  depth: number
}

/** Form-item wrapper for `kind: 'array'` — resolves section context and RHF name prefix. */
export function ArrayFormItemSection({
  item,
  parentContext,
  idPrefix,
  namePrefix,
  depth,
}: ArrayFormItemSectionProps) {
  const arrayDensity = item.density ?? parentContext.density
  const { size: arraySize } = resolveFormDensity(arrayDensity)
  const arrayFieldChrome = resolveEffectiveFieldChrome(
    { chrome: item.fieldChrome },
    {
      fieldChromeCascade: parentContext.fieldChromeCascade,
      fieldChromeSuppressed: Boolean(parentContext.fieldChromeSuppressed),
    },
  )
  const wrapSectionChrome = hasActiveFieldChrome(arrayFieldChrome)
  const inParentRhythm = Boolean(parentContext.inGroup || parentContext.inRhythmStack)

  const arrayChildContext = React.useMemo(
    () =>
      buildArraySectionChildContext(parentContext, depth, item, {
        sectionChromeActive: wrapSectionChrome,
      }),
    [parentContext, depth, item, wrapSectionChrome],
  )

  const fullArrayName = namePrefix ? `${namePrefix}.${item.name}` : item.name
  const renderer = (
    <FormSectionContext.Provider value={arrayChildContext}>
      <ArrayFieldRenderer
        config={item}
        idPrefix={idPrefix}
        fullName={fullArrayName}
        sectionLayout={{ wrapSectionChrome, inParentRhythm }}
      />
    </FormSectionContext.Provider>
  )

  if (!wrapSectionChrome) return renderer

  return (
    <FormFieldChromeShell
      chrome={arrayFieldChrome}
      size={arraySize}
      className={inParentRhythm ? undefined : fieldGroupBottomMarginClasses}
    >
      {renderer}
    </FormFieldChromeShell>
  )
}
