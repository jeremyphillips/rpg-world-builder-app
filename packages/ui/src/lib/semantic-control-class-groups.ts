/** twMerge class groups for semantic control modifiers (see semantic-control-css.md). */

export const UI_BUTTON_SIZE_CLASSES = [
  'ui-button--xs',
  'ui-button--xs-compact',
  'ui-button--sm',
  'ui-button--sm-compact',
  'ui-button--md',
  'ui-button--md-compact',
  'ui-button--lg',
  'ui-button--lg-compact',
  'ui-button--icon-xs',
  'ui-button--icon-compact',
  'ui-button--icon-md',
  'ui-button--icon-lg',
  'ui-button--text',
  'ui-button--attached',
] as const

export const UI_BUTTON_APPEARANCE_CLASSES = [
  'ui-button--primary',
  'ui-button--destructive',
  'ui-button--warning',
  'ui-button--secondary',
  'ui-button--outline',
  'ui-button--ghost',
] as const

export const UI_BUTTON_TEXT_GEOMETRY_CLASSES = [
  'ui-button__text--default',
  'ui-button__text--default-compact',
  'ui-button__text--xs',
  'ui-button__text--xs-compact',
  'ui-button__text--sm',
  'ui-button__text--sm-compact',
  'ui-button__text--lg',
  'ui-button__text--lg-compact',
] as const

export const UI_FIELD_CONTROL_FILTER_APPEARANCE_CLASSES = [
  'ui-field-control--filter-outline',
  'ui-field-control--filter-ghost',
] as const

export const UI_FIELD_CONTROL_SIZE_CLASSES = [
  'ui-field-control--sm',
  'ui-field-control--md',
  'ui-field-control--lg',
] as const

export const UI_FIELD_CONTROL_MULTILINE_SIZE_CLASSES = [
  'ui-field-control--multiline-sm',
  'ui-field-control--multiline-md',
  'ui-field-control--multiline-lg',
] as const

export const UI_FIELD_CONTROL_DIGITS_SIZE_CLASSES = [
  'ui-field-control--digits-sm',
  'ui-field-control--digits-md',
  'ui-field-control--digits-lg',
] as const

export const UI_FIELD_CONTROL_TRIGGER_FLOW_CLASSES = [
  'ui-field-control--trigger-fill',
  'ui-field-control--trigger-fit',
  'ui-field-control--trigger-segment',
] as const

export const UI_FIELD_CONTROL_WIDTH_CLASSES = [
  'ui-field-control--width-xs',
  'ui-field-control--width-sm',
  'ui-field-control--width-md',
  'ui-field-control--width-lg',
  'ui-field-control--width-xl',
  'ui-field-control--width-auto',
  'ui-field-control--width-full',
  'ui-field-control--width-1/2',
  'ui-field-control--width-1/3',
  'ui-field-control--width-2/3',
  'ui-field-control--width-1/4',
  'ui-field-control--width-3/4',
] as const

export const UI_FLOATING_LABEL_SIZE_CLASSES = [
  'ui-floating-label-field--sm',
  'ui-floating-label-field--md',
] as const

export const UI_FIELD_GROUP_SIZE_CLASSES = [
  'ui-field-group--sm',
  'ui-field-group--md',
  'ui-field-group--lg',
] as const

export const UI_FIELD_GROUP_LAYOUT_CLASSES = [
  'ui-field-group--stretch',
  'ui-field-group--intrinsic',
  'ui-field-group--flow-col',
] as const

export const UI_CHOICE_CONTROL_KIND_CLASSES = [
  'ui-choice-control--checkbox',
  'ui-choice-control--radio',
  'ui-choice-control--switch',
] as const

export const UI_CHOICE_CONTROL_INDICATOR_SIZE_CLASSES = [
  'ui-choice-control--indicator-sm',
  'ui-choice-control--indicator-lg',
] as const

export const UI_COMPACT_LABEL_SIZE_CLASSES = [
  'ui-compact-label--sm',
  'ui-compact-label--md',
  'ui-compact-label--lg',
] as const

export const UI_COMPACT_LABEL_APPEARANCE_CLASSES = [
  'ui-compact-label--outline-neutral',
  'ui-compact-label--outline-info',
  'ui-compact-label--outline-success',
  'ui-compact-label--outline-warning',
  'ui-compact-label--outline-destructive',
  'ui-compact-label--soft-neutral',
  'ui-compact-label--soft-info',
  'ui-compact-label--soft-success',
  'ui-compact-label--soft-warning',
  'ui-compact-label--soft-destructive',
  'ui-compact-label--strong-neutral',
  'ui-compact-label--strong-info',
  'ui-compact-label--strong-success',
  'ui-compact-label--strong-warning',
  'ui-compact-label--strong-destructive',
] as const

export const UI_CARD_INTERACTION_CLASSES = ['ui-card--static', 'ui-card--interactive'] as const

export const UI_ALERT_APPEARANCE_CLASSES = [
  'ui-alert--default',
  'ui-alert--info',
  'ui-alert--success',
  'ui-alert--warning',
  'ui-alert--destructive',
] as const

export const UI_ALERT_DENSITY_CLASSES = ['ui-alert--comfortable', 'ui-alert--compact'] as const

export const UI_INSET_PANEL_SIZE_CLASSES = [
  'ui-inset-panel--sm',
  'ui-inset-panel--md',
  'ui-inset-panel--lg',
] as const

export const UI_INTERACTIVE_ROW_HOVER_CLASSES = [
  'ui-interactive-row--hover-none',
  'ui-interactive-row--hover-selectable',
  'ui-interactive-row--hover-navigation',
  'ui-interactive-row--hover-selected',
  'ui-interactive-row--hover-surface',
] as const

export const UI_INTERACTIVE_ROW_SELECTED_CLASSES = [
  'ui-interactive-row--selected-none',
  'ui-interactive-row--selected-fill',
  'ui-interactive-row--selected-bordered',
  'ui-interactive-row--fill-surface',
] as const

export const UI_INTERACTIVE_LIST_ROW_SIZE_CLASSES = [
  'ui-interactive-list__main--sm',
  'ui-interactive-list__main--md',
  'ui-interactive-list__main--lg',
] as const

export const UI_COMPACT_CONTROL_SIZE_CLASSES = [
  'ui-compact-control--icon-compact',
  'ui-compact-control--icon-compact-sm',
  'ui-compact-control--icon-xs',
  'ui-compact-control--icon-default',
  'ui-compact-control--icon-lg',
  'ui-compact-control--text-compact',
  'ui-compact-control--text-with-icon-compact',
  'ui-compact-control--min-height-compact',
  'ui-compact-control--segment-sm',
  'ui-compact-control--tabs-pill',
  'ui-compact-control--menu-item-sm',
  'ui-compact-control--menu-item-md',
  'ui-compact-control--menu-item-lg',
  'ui-compact-control--stepper-button-xs',
  'ui-compact-control--stepper-button-sm',
  'ui-compact-control--stepper-button-md',
  'ui-compact-control--stepper-button-lg',
  'ui-compact-control--gap-xs',
  'ui-compact-control--gap-sm',
  'ui-compact-control--gap-md',
] as const
