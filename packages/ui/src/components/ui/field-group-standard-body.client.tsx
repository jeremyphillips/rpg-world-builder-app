'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import {
  readGroupCollapseOpen,
  writeGroupCollapseOpen,
} from '../../form/config/group-collapse-storage.lib'
import type { FieldSizeToken } from './field-sizing.variants'
import { Collapsible, CollapsibleContent } from './collapsible.client'
import type { FieldGroupChromeClassNames } from './field-group-chrome.variants'
import type { FieldGroupDisclosure } from './field-group-disclosure.types'
import { isLegendDisclosure, resolveDisclosureDefaultOpen } from './field-group-disclosure.types'
import { FieldGroupLegend } from './field-group-legend.client'
import {
  fieldGroupBottomMarginClasses,
  fieldGroupLegendDisclosureContentVariants,
  fieldSetResetClasses,
  fieldStackRhythmVariants,
  resolveFieldGroupBodyGap,
  type FieldGroupLegendSize,
  type FieldRhythm,
} from './field.variants'

function useGroupCollapseState(options: {
  collapseKey: string
  defaultOpen: boolean
  uiStateKey?: string
  persistOpen?: boolean
}): [boolean, (open: boolean) => void] {
  const persistOpen = options.persistOpen ?? true
  const [open, setOpen] = React.useState(() => {
    if (persistOpen && options.uiStateKey) {
      const stored = readGroupCollapseOpen(options.uiStateKey, options.collapseKey)
      if (stored !== undefined) return stored
    }
    return options.defaultOpen
  })

  const onOpenChange = React.useCallback(
    (next: boolean) => {
      setOpen(next)
      if (persistOpen && options.uiStateKey) {
        writeGroupCollapseOpen(options.uiStateKey, options.collapseKey, next)
      }
    },
    [options.collapseKey, options.uiStateKey, persistOpen],
  )

  return [open, onOpenChange]
}

function wrapFieldGroupBody(
  body: React.ReactNode,
  bodyGapClass: string | undefined,
): React.ReactNode {
  if (!bodyGapClass) {
    return body
  }
  return <div className={bodyGapClass}>{body}</div>
}

export type StandardFieldGroupBodyProps = {
  id?: string
  legend?: string
  description?: string
  legendAccessory?: React.ReactNode
  legendAction?: React.ReactNode
  legendSize: FieldGroupLegendSize
  legendTypography: string
  fieldSize: FieldSizeToken
  rhythm: FieldRhythm
  className?: string
  uiStateKey?: string
  collapseKey: string
  chromeClasses: FieldGroupChromeClassNames
  disclosure?: FieldGroupDisclosure
  children: React.ReactNode
}

/** Default fieldset layout with optional legend disclosure. */
// fallow-ignore-next-line complexity
export function StandardFieldGroupBody({
  id,
  legend,
  description,
  legendAccessory,
  legendAction,
  legendSize,
  legendTypography,
  fieldSize,
  rhythm,
  className,
  uiStateKey,
  collapseKey,
  chromeClasses,
  disclosure,
  children,
}: StandardFieldGroupBodyProps) {
  const collapsible = disclosure ? isLegendDisclosure(disclosure) : false
  const legendDisclosure = disclosure && isLegendDisclosure(disclosure) ? disclosure : undefined
  const [open, onOpenChange] = useGroupCollapseState({
    collapseKey,
    defaultOpen: resolveDisclosureDefaultOpen(disclosure),
    uiStateKey,
    persistOpen: legendDisclosure?.persistOpen,
  })

  const hasBody = React.Children.count(children) > 0
  const bodyVisible = hasBody && (!collapsible || open)
  const bodyGapClass =
    legend && bodyVisible
      ? resolveFieldGroupBodyGap({ size: legendSize, rhythm, fieldSize })
      : undefined

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

  const bodyWithGap = wrapFieldGroupBody(body, bodyGapClass)

  const Wrapper = legend ? 'fieldset' : 'div'

  return (
    <Wrapper id={id} className={fieldsetClassName}>
      {legend ? (
        <FieldGroupLegend
          legend={legend}
          description={description}
          legendAccessory={legendAccessory}
          legendAction={legendAction}
          legendSize={legendSize}
          legendTypography={legendTypography}
          rhythm={rhythm}
          legendChromeClassName={chromeClasses.legend}
          collapsible={collapsible}
          open={open}
          onToggle={() => onOpenChange(!open)}
        />
      ) : null}
      {collapsible ? (
        <Collapsible open={open} onOpenChange={onOpenChange} className="min-w-0">
          <CollapsibleContent forceMount className={fieldGroupLegendDisclosureContentVariants()}>
            {bodyWithGap}
          </CollapsibleContent>
        </Collapsible>
      ) : hasBody ? (
        bodyWithGap
      ) : null}
    </Wrapper>
  )
}
