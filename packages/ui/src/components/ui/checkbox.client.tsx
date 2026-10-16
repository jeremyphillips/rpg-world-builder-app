'use client'

import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'

import { cn } from '../../lib/utils'
import {
  UI_CHOICE_CONTROL_EXPAND_ANCHOR_CLASS,
  UI_CHOICE_CONTROL_EXPAND_LABEL_CLASS,
  UI_CHOICE_CONTROL_MARK_CLASS,
  checkboxControlClasses,
  type CheckboxAppearance,
  type ChoiceControlFocusContext,
} from './choice-control.variants'

export type CheckboxProps = React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
  appearance?: CheckboxAppearance
  /** Dense inline headings and row chrome use `embedded`; default forms use `standalone`. */
  focusContext?: ChoiceControlFocusContext
  /**
   * Action word revealed on hover and keyboard focus.
   * Applies only with `appearance="circle"`; other appearances ignore it.
   */
  expandLabel?: string
}

const Checkbox = React.forwardRef<React.ComponentRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
  (
    { className, appearance = 'default', focusContext = 'standalone', expandLabel, ...props },
    ref,
  ) => {
    const expands = appearance === 'circle' && Boolean(expandLabel)
    const control = (
      <CheckboxPrimitive.Root
        ref={ref}
        className={cn(
          checkboxControlClasses({ appearance, focusContext, expand: expands }),
          className,
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator className={cn(UI_CHOICE_CONTROL_MARK_CLASS)}>
          <Check aria-hidden />
        </CheckboxPrimitive.Indicator>
        {expands ? (
          <span className={UI_CHOICE_CONTROL_EXPAND_LABEL_CLASS} aria-hidden>
            {expandLabel}
          </span>
        ) : null}
      </CheckboxPrimitive.Root>
    )

    if (!expands) return control

    return <span className={UI_CHOICE_CONTROL_EXPAND_ANCHOR_CLASS}>{control}</span>
  },
)
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
