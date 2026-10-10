import { UI_CHOICE_CONTROL_BLOCK_CLASS } from './choice-control.styles'
import { interactiveFocusVariants } from './interactive-focus.variants'

/**
 * @deprecated Prefer {@link UI_CHOICE_CONTROL_BLOCK_CLASS} and kind modifiers in choice-control.css.
 * Shell presentation (border, shadow, states) lives on `.ui-choice-control`.
 */
export const choiceControlIndicatorShellClasses = UI_CHOICE_CONTROL_BLOCK_CLASS

/** Focus ring for standalone choice indicators. */
export const choiceControlIndicatorFocusClasses = interactiveFocusVariants({
  context: 'standalone',
})

/** @deprecated Checked border is defined in choice-control.css. */
export const choiceControlIndicatorCheckedBorderClasses = ''

/** @deprecated Group-checked border is defined in choice-control.css. */
export const choiceControlIndicatorGroupCheckedBorderClasses = ''

/** @deprecated Invalid border is defined in choice-control.css. */
export const choiceControlIndicatorInvalidClasses = ''

/** @deprecated Disabled chrome is defined in choice-control.css. */
export const choiceControlIndicatorDisabledClasses = ''
