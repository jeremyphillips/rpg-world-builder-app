/** twMerge class groups for semantic control modifiers (see semantic-control-css.md). */

export {
  UI_ALERT_APPEARANCE_CLASSES,
  UI_ALERT_DENSITY_CLASSES,
} from '../components/ui/alert.variants'
export {
  UI_METADATA_LIST_COLUMN_GAP_CLASSES,
  UI_METADATA_LIST_EMPHASIS_CLASSES,
  UI_METADATA_LIST_SIZE_CLASSES,
  UI_METADATA_LIST_VALUE_TRACK_CLASSES,
} from '../components/ui/metadata-list.variants'
export {
  UI_TABS_LIST_APPEARANCE_CLASSES,
  UI_TABS_TRIGGER_APPEARANCE_CLASSES,
} from '../components/ui/tabs.variants'
export { UI_COMPACT_LABEL_APPEARANCE_CLASSES } from '../components/ui/badge-appearance.lib'
export {
  UI_BUTTON_APPEARANCE_CLASSES,
  UI_BUTTON_SIZE_CLASSES,
  UI_BUTTON_TEXT_GEOMETRY_CLASSES,
} from '../components/ui/button.styles'
export { UI_BORDER_STRENGTH_CLASSES } from '../components/ui/border-strength'
/** Inlined — `dialog-panel.variants` imports `cn()` and must not participate in the utils graph. */
export const UI_DIALOG_PANEL_FILL_CLASSES = [
  'ui-dialog-panel--fill-background',
  'ui-dialog-panel--fill-card',
  'ui-dialog-panel--fill-surface-lift',
] as const
export const UI_DIALOG_PANEL_GEOMETRY_CLASSES = [
  'ui-dialog-panel--frame',
  'ui-dialog-panel--side-right',
  'ui-dialog-panel--side-left',
  'ui-dialog-panel--side-bottom',
] as const
/** Inlined — `card.variants` imports `cn()` and must not participate in the utils import graph. */
export const UI_CARD_INTERACTION_CLASSES = ['ui-card--static', 'ui-card--interactive'] as const

/** Inlined — `inset-panel.variants` imports `cn()` and must not participate in the utils import graph. */
export const UI_INSET_PANEL_SIZE_CLASSES = [
  'ui-inset-panel--sm',
  'ui-inset-panel--md',
  'ui-inset-panel--lg',
] as const
export {
  UI_CHOICE_CONTROL_INDICATOR_SIZE_CLASSES,
  UI_CHOICE_CONTROL_KIND_CLASSES,
} from '../components/ui/choice-control.styles'
export { UI_COMPACT_CONTROL_SIZE_CLASSES } from '../components/ui/compact-control.styles'
export { UI_COMPACT_LABEL_SIZE_CLASSES } from '../components/ui/compact-label.lib'
export {
  UI_FIELD_CONTROL_DIGITS_SIZE_CLASSES,
  UI_FIELD_CONTROL_MULTILINE_SIZE_CLASSES,
  UI_FIELD_CONTROL_SIZE_CLASSES,
  UI_FIELD_CONTROL_TRIGGER_FLOW_CLASSES,
  UI_FIELD_CONTROL_WIDTH_CLASSES,
} from '../components/ui/field-control.styles'
export {
  UI_FIELD_GROUP_LAYOUT_CLASSES,
  UI_FIELD_GROUP_SIZE_CLASSES,
} from '../components/ui/field-group.styles'
export { UI_FLOATING_LABEL_SIZE_CLASSES } from '../components/ui/floating-label-field.styles'
export {
  UI_INTERACTIVE_ROW_HOVER_CLASSES,
  UI_INTERACTIVE_ROW_SELECTED_CLASSES,
} from '../components/ui/interactive-row.styles'

/** twMerge group — interactive list row padding sizes. */
export const UI_INTERACTIVE_LIST_ROW_SIZE_CLASSES = [
  'ui-interactive-list__main--sm',
  'ui-interactive-list__main--md',
  'ui-interactive-list__main--lg',
] as const
