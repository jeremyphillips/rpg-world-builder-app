'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import {
  readGroupCollapseOpen,
  writeGroupCollapseOpen,
} from '../../form/config/group-collapse-storage.lib'
import { accordionContentVariants } from './accordion.variants'
import { Collapsible, CollapsibleContent } from './collapsible.client'
import type { FieldGroupChromeClassNames } from './field-group-chrome.variants'
import type { FieldGroupDisclosure } from './field-group-disclosure.types'
import { isLegendDisclosure, resolveDisclosureDefaultOpen } from './field-group-disclosure.types'
import { FieldGroupLegend } from './field-group-legend.client'
import {
  fieldGroupBottomMarginClasses,
  fieldSetResetClasses,
  fieldStackRhythmVariants,
  type FieldGroupLegendSize,
  type FieldRhythm,
} from './field.variants'

function useGroupCollapseState(options: {
  collapseKey: string
  defaultOpen: boolean
  uiStateKey?: string
}): [boolean, (open: boolean) => void] {
  const [open, setOpen] = React.useState(() => {
    if (options.uiStateKey) {
      const stored = readGroupCollapseOpen(options.uiStateKey, options.collapseKey)
      if (stored !== undefined) return stored
    }
    return options.defaultOpen
  })

  const onOpenChange = React.useCallback(
    (next: boolean) => {
      setOpen(next)
      if (options.uiStateKey) {
        writeGroupCollapseOpen(options.uiStateKey, options.collapseKey, next)
      }
    },
    [options.collapseKey, options.uiStateKey],
  )

  return [open, onOpenChange]
}

export type StandardFieldGroupBodyProps = {
  id?: string
  legend?: string
  description?: string
  legendSize: FieldGroupLegendSize
  legendTypography: string
  rhythm: FieldRhythm
  className?: string
  uiStateKey?: string
  collapseKey: string
  chromeClasses: FieldGroupChromeClassNames
  disclosure?: FieldGroupDisclosure
  children: React.ReactNode
}

/** Default fieldset layout with optional legend disclosure. */
export function StandardFieldGroupBody({
  id,
  legend,
  description,
  legendSize,
  legendTypography,
  rhythm,
  className,
  uiStateKey,
  collapseKey,
  chromeClasses,
  disclosure,
  children,
}: StandardFieldGroupBodyProps) {
  const collapsible = disclosure ? isLegendDisclosure(disclosure) : false
  const [open, onOpenChange] = useGroupCollapseState({
    collapseKey,
    defaultOpen: resolveDisclosureDefaultOpen(disclosure),
    uiStateKey,
  })

  const fieldsetClassName = cn(
    fieldSetResetClasses,
    fieldGroupBottomMarginClasses,
    'min-w-0',
    chromeClasses.fieldset,
    className,
  )

  const body = (
    <div className={cn(fieldStackRhythmVariants({ rhythm }), chromeClasses.body)}>{children}</div>
  )

  const Wrapper = legend ? 'fieldset' : 'div'

  return (
    <Wrapper id={id} className={fieldsetClassName}>
      {legend ? (
        <FieldGroupLegend
          legend={legend}
          description={description}
          legendSize={legendSize}
          legendTypography={legendTypography}
          legendChromeClassName={chromeClasses.legend}
          collapsible={collapsible}
          open={open}
          onToggle={() => onOpenChange(!open)}
        />
      ) : null}
      {collapsible ? (
        <Collapsible open={open} onOpenChange={onOpenChange} className="min-w-0">
          <CollapsibleContent forceMount className={accordionContentVariants()}>
            {body}
          </CollapsibleContent>
        </Collapsible>
      ) : (
        body
      )}
    </Wrapper>
  )
}
