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
