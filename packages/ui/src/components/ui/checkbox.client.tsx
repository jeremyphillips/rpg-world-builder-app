'use client'

import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'

import { cn } from '../../lib/utils'
import type { ChoiceTone } from './choice-control.styles'
import {
  UI_CHOICE_CONTROL_EXPAND_ANCHOR_CLASS,
  UI_CHOICE_CONTROL_EXPAND_CLIP_CLASS,
  UI_CHOICE_CONTROL_EXPAND_LABEL_CLASS,
  UI_CHOICE_CONTROL_EXPAND_RESERVE_CLASS,
  UI_CHOICE_CONTROL_MARK_CLASS,
  checkboxControlClasses,
  type CheckboxAppearance,
  type ChoiceControlFocusContext,
} from './choice-control.variants'

export type CheckboxProps = React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
  appearance?: CheckboxAppearance
  /** Checked indicator color. Unchecked chrome stays neutral. */
  tone?: ChoiceTone
  /** Dense inline headings and row chrome use `embedded`; default forms use `standalone`. */
  focusContext?: ChoiceControlFocusContext
  /**
   * Action word revealed on hover and keyboard focus.
   * Applies only with `appearance="circle"`; other appearances ignore it.
   */
  expandLabel?: string
  /**
   * Other action word included only for intrinsic width, so Equip and Unequip
   * share one open pill size. Not shown and not announced.
   */
  expandLabelReserve?: string
}

const Checkbox = React.forwardRef<React.ComponentRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
  (
    {
      className,
      appearance = 'default',
      tone = 'default',
      focusContext = 'standalone',
      expandLabel,
      expandLabelReserve,
      ...props
    },
    ref,
  ) => {
    const expands = appearance === 'circle' && Boolean(expandLabel)
    const reserve =
      expands && expandLabelReserve && expandLabelReserve !== expandLabel
        ? expandLabelReserve
        : null
    const control = (
      <CheckboxPrimitive.Root
        ref={ref}
        className={cn(
          checkboxControlClasses({ appearance, focusContext, expand: expands }),
          className,
        )}
        {...props}
        data-choice-tone={tone}
      >
        <CheckboxPrimitive.Indicator className={cn(UI_CHOICE_CONTROL_MARK_CLASS)}>
          <Check aria-hidden />
        </CheckboxPrimitive.Indicator>
        {expands ? (
          <span className={UI_CHOICE_CONTROL_EXPAND_CLIP_CLASS}>
            <span className={`${UI_CHOICE_CONTROL_EXPAND_CLIP_CLASS}-inner`}>
              {reserve ? (
                <span className={UI_CHOICE_CONTROL_EXPAND_RESERVE_CLASS} aria-hidden>
                  {reserve}
                </span>
              ) : null}
              <span className={UI_CHOICE_CONTROL_EXPAND_LABEL_CLASS} aria-hidden>
                {expandLabel}
              </span>
            </span>
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
