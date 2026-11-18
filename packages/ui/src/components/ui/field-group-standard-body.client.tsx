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
  fieldAnatomyStackVariants,
  fieldGroupLegendDisclosureContentVariants,
  fieldSetResetClasses,
  fieldStackRhythmVariants,
  resolveFieldGroupBodyGap,
  resolveFieldScaleLegendBodyMargin,
  type FieldGroupLegendSize,
  type FieldRhythm,
  type FormHeadingScale,
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
  bodyRelationshipClass: string | undefined,
): React.ReactNode {
  if (!bodyRelationshipClass) {
    return body
  }
  return <div className={bodyRelationshipClass}>{body}</div>
}

export type StandardFieldGroupBodyProps = {
  id?: string
  legend?: string
  legendSrOnly?: boolean
  hint?: string
  legendAccessory?: React.ReactNode
  legendAction?: React.ReactNode
  legendSize: FieldGroupLegendSize
  headingScale?: FormHeadingScale
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
  legendSrOnly = false,
  hint,
  legendAccessory,
  legendAction,
  legendSize,
  headingScale,
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
  const generatedHintId = React.useId()
  const hintId = hint ? (id ? `${id}-hint` : generatedHintId) : undefined
  const bodyVisible = hasBody && (!collapsible || open)
  const useLeafAnatomyStack = headingScale === 'field' && Boolean(legend) && !legendSrOnly
  const bodyGapClass =
    legend && bodyVisible && !legendSrOnly && headingScale !== 'field'
      ? resolveFieldGroupBodyGap({ size: legendSize, rhythm })
      : undefined
  const fieldScaleBodyMargin =
    headingScale === 'field' && Boolean(legend) && !legendSrOnly && bodyVisible
      ? resolveFieldScaleLegendBodyMargin(fieldSize)
      : undefined
  const bodyMarginClass = fieldScaleBodyMargin && !hint ? fieldScaleBodyMargin : undefined
  const hintMarginClass = fieldScaleBodyMargin && hint ? fieldScaleBodyMargin : undefined
  const bodyRelationshipClass = cn(bodyGapClass, bodyMarginClass)

  const fieldsetClassName = cn(
    fieldSetResetClasses,
    'min-w-0',
    chromeClasses.fieldset,
    useLeafAnatomyStack && fieldAnatomyStackVariants({ size: fieldSize }),
    className,
  )

  const body = (
    <div className={cn(fieldStackRhythmVariants({ rhythm }), chromeClasses.body)}>{children}</div>
  )

  // Keep one wrapper element across open and closed. Adding the gap div only
  // while open remounts the body, and `shouldUnregister` then clears values.
  const bodyWithGap = collapsible ? (
    <div className={bodyRelationshipClass}>{body}</div>
  ) : (
    wrapFieldGroupBody(body, bodyRelationshipClass)
  )

  const Wrapper = legend ? 'fieldset' : 'div'
  const groupDescribedBy = hint && hintId ? hintId : undefined

  return (
    <Wrapper id={id} className={fieldsetClassName} aria-describedby={groupDescribedBy}>
      {legend ? (
        <FieldGroupLegend
          legend={legend}
          legendSrOnly={legendSrOnly}
          hint={hint}
          hintId={hintId}
          legendAccessory={legendAccessory}
          legendAction={legendAction}
          legendSize={legendSize}
          fieldSize={fieldSize}
          headingScale={headingScale}
          rhythm={rhythm}
          legendChromeClassName={chromeClasses.legend}
          hintMarginClass={hintMarginClass}
          collapsible={collapsible}
          open={open}
          onToggle={() => onOpenChange(!open)}
        />
      ) : null}
      {collapsible ? (
        <Collapsible open={open} onOpenChange={onOpenChange} className="min-w-0">
          <CollapsibleContent forceMount className={fieldGroupLegendDisclosureContentVariants}>
            {bodyWithGap}
          </CollapsibleContent>
        </Collapsible>
      ) : hasBody ? (
        bodyWithGap
      ) : null}
    </Wrapper>
  )
}
