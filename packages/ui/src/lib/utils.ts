import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

import {
  UI_BUTTON_APPEARANCE_CLASSES,
  UI_BUTTON_SIZE_CLASSES,
  UI_BUTTON_TEXT_GEOMETRY_CLASSES,
  UI_BORDER_STRENGTH_CLASSES,
  UI_DIALOG_PANEL_FILL_CLASSES,
  UI_DIALOG_PANEL_GEOMETRY_CLASSES,
  UI_FIELD_CONTROL_DIGITS_SIZE_CLASSES,
  UI_FIELD_CONTROL_MULTILINE_SIZE_CLASSES,
  UI_FIELD_CONTROL_SIZE_CLASSES,
  UI_FIELD_CONTROL_TRIGGER_FLOW_CLASSES,
  UI_FIELD_CONTROL_WIDTH_CLASSES,
  UI_FLOATING_LABEL_SIZE_CLASSES,
  UI_COMPACT_CONTROL_SIZE_CLASSES,
  UI_BADGE_APPEARANCE_CLASSES,
  UI_BADGE_SIZE_CLASSES,
  UI_CHIP_REMOVE_SIZE_CLASSES,
  UI_CHIP_SIZE_CLASSES,
  UI_ALERT_APPEARANCE_CLASSES,
  UI_ALERT_DENSITY_CLASSES,
  UI_METADATA_LIST_COLUMN_GAP_CLASSES,
  UI_METADATA_LIST_EMPHASIS_CLASSES,
  UI_METADATA_LIST_ROW_GAP_CLASSES,
  UI_METADATA_LIST_SIZE_CLASSES,
  UI_METADATA_LIST_VALUE_TRACK_CLASSES,
  UI_TABS_LIST_APPEARANCE_CLASSES,
  UI_TABS_TRIGGER_APPEARANCE_CLASSES,
  UI_CARD_INTERACTION_CLASSES,
  UI_INSET_PANEL_SIZE_CLASSES,
  UI_LIST_DENSITY_CLASSES,
  UI_INTERACTIVE_ROW_HOVER_CLASSES,
  UI_INTERACTIVE_ROW_SELECTED_CLASSES,
  UI_CHOICE_CONTROL_INDICATOR_SIZE_CLASSES,
  UI_CHOICE_CONTROL_KIND_CLASSES,
  UI_FIELD_GROUP_LAYOUT_CLASSES,
  UI_FIELD_GROUP_SIZE_CLASSES,
  UI_AVATAR_SIZE_CLASSES,
  UI_TOAST_TONE_CLASSES,
  UI_SEMANTIC_TEXT_EMPHASIS_CLASSES,
  UI_SEMANTIC_TEXT_TONE_CLASSES,
} from './semantic-control-class-groups'

const HEADING_STYLE_UTILITIES = [
  'heading-style-display',
  'heading-style-page',
  'heading-style-section',
  'heading-style-subsection',
  'heading-style-group',
  'heading-style-card',
  'heading-style-dialog-title',
  'heading-style-confirm-dialog-title',
  'heading-style-sheet-section',
  'heading-style-hero-title',
  'heading-style-alert',
  'heading-style-nav',
  'heading-style-brand',
  'heading-style-label',
] as const

const EYEBROW_STYLE_UTILITIES = [
  'eyebrow-style-xs',
  'eyebrow-style-sm',
  'eyebrow-style-md',
] as const

const TEXT_ACTION_UTILITIES = ['text-action-inline', 'text-action-standalone'] as const

/** Size-setting roles. Conflicts with font size, weight, and leading — not text color. */
const TEXT_STYLE_UTILITIES = [
  'text-style-caption',
  'text-style-micro',
  'text-style-supporting',
  'text-style-body-compact',
  'text-style-label',
  'text-style-emphasis',
  'text-style-option',
  'text-style-lead',
  'text-style-field-label-sm',
  'text-style-field-label-md',
  'text-style-field-label-lg',
  'text-style-field-legend',
  'text-style-field-legend-sub',
  'text-style-field-legend-compact',
  'text-style-field-hint',
  'text-style-field-hint-compact',
  'text-style-field-group-description',
  'text-style-field-group-description-compact',
  'text-style-field-error',
] as const

/** Color-only roles. Conflicts with text color in both directions. */
const TEXT_STYLE_COLOR_UTILITIES = [
  'text-style-body',
  'text-style-muted',
  'text-style-info',
  'text-style-success',
  'text-style-warning',
  'text-style-destructive',
  'text-style-score--muted',
] as const

/** Score numeral base. Weight and color; composes with a size modifier. */
const TEXT_STYLE_SCORE_UTILITIES = ['text-style-score'] as const

/** Score size modifiers. Mutually exclusive; compose with `text-style-score`. */
const TEXT_STYLE_SCORE_SIZE_UTILITIES = [
  'text-style-score--sm',
  'text-style-score--md',
  'text-style-score--lg',
] as const

const EYEBROW_STYLE_CONFLICT_GROUPS = [
  'font-size',
  'font-weight',
  'tracking',
  'text-transform',
] as const

const TYPOGRAPHY_CONFLICT_GROUPS = [
  'font-size',
  'font-weight',
  'tracking',
  'leading',
  'font-family',
  'text-color',
  'text-transform',
] as const

const TEXT_STYLE_SIZE_CONFLICT_GROUPS = [
  'font-size',
  'font-weight',
  'tracking',
  'leading',
  'font-family',
  'text-transform',
] as const

type TypographyClassGroupIds =
  | 'heading-style'
  | 'eyebrow-style'
  | 'text-style'
  | 'text-style-color'
  | 'text-style-score'
  | 'text-style-score-size'
  | 'text-action'
  | 'ui-button-size'
  | 'ui-button-appearance'
  | 'ui-button-text-geometry'
  | 'ui-border-strength'
  | 'ui-dialog-panel-fill'
  | 'ui-dialog-panel-geometry'
  | 'ui-field-control-size'
  | 'ui-field-control-multiline-size'
  | 'ui-field-control-digits-size'
  | 'ui-field-control-filter-appearance'
  | 'ui-field-control-trigger-flow'
  | 'ui-field-control-width'
  | 'ui-floating-label-size'
  | 'ui-field-group-size'
  | 'ui-avatar-size'
  | 'ui-toast-tone'
  | 'ui-semantic-text-tone'
  | 'ui-semantic-text-emphasis'
  | 'ui-field-group-layout'
  | 'ui-compact-control-size'
  | 'ui-badge-size'
  | 'ui-chip-size'
  | 'ui-chip-remove-size'
  | 'ui-badge-appearance'
  | 'ui-alert-appearance'
  | 'ui-alert-density'
  | 'ui-metadata-list-size'
  | 'ui-metadata-list-column-gap'
  | 'ui-metadata-list-row-gap'
  | 'ui-metadata-list-value-track'
  | 'ui-metadata-list-emphasis'
  | 'ui-tabs-list-appearance'
  | 'ui-tabs-trigger-appearance'
  | 'ui-card-interaction'
  | 'ui-inset-panel-size'
  | 'ui-interactive-row-hover'
  | 'ui-interactive-row-selected'
  | 'ui-list-density'
  | 'ui-choice-control-kind'
  | 'ui-choice-control-indicator-size'

/**
 * Custom `text-*` font-size and `font-*` weight utilities from `@theme` in
 * `styles/globals.css`. Register here so `cn()` does not treat them as color
 * utilities and drop them.
 */
const twMerge = extendTailwindMerge<TypographyClassGroupIds>({
  extend: {
    theme: {
      text: [
        'fine-xs',
        'fine-sm',
        'fine-md',
        'md',
        'eyebrow-xs',
        'eyebrow-sm',
        'eyebrow-md',
        'badge-sm',
        'badge-md',
        'table-body',
        'table-stat',
        'control-action-xs',
      ],
      'font-weight': [
        'heading-display',
        'heading',
        'heading-group',
        'heading-label',
        'body',
        'body-emphasis',
        'field-label',
        'meta',
        'data-name',
        'data-stat',
      ],
      tracking: ['heading', 'eyebrow-xs', 'eyebrow'],
    },
    classGroups: {
      'heading-style': [...HEADING_STYLE_UTILITIES],
      'eyebrow-style': [...EYEBROW_STYLE_UTILITIES],
      'text-style': [...TEXT_STYLE_UTILITIES],
      'text-style-color': [...TEXT_STYLE_COLOR_UTILITIES],
      'text-style-score': [...TEXT_STYLE_SCORE_UTILITIES],
      'text-style-score-size': [...TEXT_STYLE_SCORE_SIZE_UTILITIES],
      'text-action': [...TEXT_ACTION_UTILITIES],
      'ui-button-size': [...UI_BUTTON_SIZE_CLASSES],
      'ui-button-appearance': [...UI_BUTTON_APPEARANCE_CLASSES],
      'ui-button-text-geometry': [...UI_BUTTON_TEXT_GEOMETRY_CLASSES],
      'ui-border-strength': [...UI_BORDER_STRENGTH_CLASSES],
      'ui-dialog-panel-fill': [...UI_DIALOG_PANEL_FILL_CLASSES],
      'ui-dialog-panel-geometry': [...UI_DIALOG_PANEL_GEOMETRY_CLASSES],
      'ui-field-control-size': [...UI_FIELD_CONTROL_SIZE_CLASSES],
      'ui-field-control-multiline-size': [...UI_FIELD_CONTROL_MULTILINE_SIZE_CLASSES],
      'ui-field-control-digits-size': [...UI_FIELD_CONTROL_DIGITS_SIZE_CLASSES],
      'ui-field-control-trigger-flow': [...UI_FIELD_CONTROL_TRIGGER_FLOW_CLASSES],
      'ui-field-control-width': [...UI_FIELD_CONTROL_WIDTH_CLASSES],
      'ui-floating-label-size': [...UI_FLOATING_LABEL_SIZE_CLASSES],
      'ui-compact-control-size': [...UI_COMPACT_CONTROL_SIZE_CLASSES],
      'ui-badge-size': [...UI_BADGE_SIZE_CLASSES],
      'ui-chip-size': [...UI_CHIP_SIZE_CLASSES],
      'ui-chip-remove-size': [...UI_CHIP_REMOVE_SIZE_CLASSES],
      'ui-badge-appearance': [...UI_BADGE_APPEARANCE_CLASSES],
      'ui-alert-appearance': [...UI_ALERT_APPEARANCE_CLASSES],
      'ui-alert-density': [...UI_ALERT_DENSITY_CLASSES],
      'ui-metadata-list-size': [...UI_METADATA_LIST_SIZE_CLASSES],
      'ui-metadata-list-column-gap': [...UI_METADATA_LIST_COLUMN_GAP_CLASSES],
      'ui-metadata-list-row-gap': [...UI_METADATA_LIST_ROW_GAP_CLASSES],
      'ui-metadata-list-value-track': [...UI_METADATA_LIST_VALUE_TRACK_CLASSES],
      'ui-metadata-list-emphasis': [...UI_METADATA_LIST_EMPHASIS_CLASSES],
      'ui-tabs-list-appearance': [...UI_TABS_LIST_APPEARANCE_CLASSES],
      'ui-tabs-trigger-appearance': [...UI_TABS_TRIGGER_APPEARANCE_CLASSES],
      'ui-card-interaction': [...UI_CARD_INTERACTION_CLASSES],
      'ui-inset-panel-size': [...UI_INSET_PANEL_SIZE_CLASSES],
      'ui-interactive-row-hover': [...UI_INTERACTIVE_ROW_HOVER_CLASSES],
      'ui-interactive-row-selected': [...UI_INTERACTIVE_ROW_SELECTED_CLASSES],
      'ui-list-density': [...UI_LIST_DENSITY_CLASSES],
      'ui-choice-control-kind': [...UI_CHOICE_CONTROL_KIND_CLASSES],
      'ui-choice-control-indicator-size': [...UI_CHOICE_CONTROL_INDICATOR_SIZE_CLASSES],
      'ui-field-group-size': [...UI_FIELD_GROUP_SIZE_CLASSES],
      'ui-field-group-layout': [...UI_FIELD_GROUP_LAYOUT_CLASSES],
      'ui-avatar-size': [...UI_AVATAR_SIZE_CLASSES],
      'ui-toast-tone': [...UI_TOAST_TONE_CLASSES],
      'ui-semantic-text-tone': [...UI_SEMANTIC_TEXT_TONE_CLASSES],
      'ui-semantic-text-emphasis': [...UI_SEMANTIC_TEXT_EMPHASIS_CLASSES],
    },
    conflictingClassGroups: {
      'heading-style': [...TYPOGRAPHY_CONFLICT_GROUPS],
      'eyebrow-style': [...EYEBROW_STYLE_CONFLICT_GROUPS],
      'text-style': [...TEXT_STYLE_SIZE_CONFLICT_GROUPS],
      'text-style-color': ['text-color'],
      'text-style-score': ['font-weight'],
      'text-style-score-size': ['font-size', 'leading'],
      'text-action': ['text-action'],
      'ui-button-size': ['ui-button-size'],
      'ui-button-appearance': ['ui-button-appearance'],
      'ui-button-text-geometry': ['ui-button-text-geometry'],
      'ui-border-strength': ['ui-border-strength', 'ui-toast-tone'],
      'ui-dialog-panel-fill': ['ui-dialog-panel-fill'],
      'ui-dialog-panel-geometry': ['ui-dialog-panel-geometry'],
      'ui-field-control-size': ['ui-field-control-size'],
      'ui-field-control-multiline-size': ['ui-field-control-multiline-size'],
      'ui-field-control-digits-size': ['ui-field-control-digits-size'],
      'ui-field-control-filter-appearance': ['ui-field-control-filter-appearance'],
      'ui-field-control-trigger-flow': ['ui-field-control-trigger-flow'],
      'ui-field-control-width': ['ui-field-control-width'],
      'ui-floating-label-size': ['ui-floating-label-size'],
      'ui-compact-control-size': ['ui-compact-control-size'],
      'ui-badge-size': ['ui-badge-size'],
      'ui-chip-size': ['ui-chip-size'],
      'ui-chip-remove-size': ['ui-chip-remove-size'],
      'ui-badge-appearance': ['ui-badge-appearance'],
      'ui-alert-appearance': ['ui-alert-appearance'],
      'ui-alert-density': ['ui-alert-density'],
      'ui-metadata-list-size': ['ui-metadata-list-size'],
      'ui-metadata-list-column-gap': ['ui-metadata-list-column-gap'],
      'ui-metadata-list-row-gap': ['ui-metadata-list-row-gap'],
      'ui-metadata-list-value-track': ['ui-metadata-list-value-track'],
      'ui-metadata-list-emphasis': ['ui-metadata-list-emphasis'],
      'ui-card-interaction': ['ui-card-interaction'],
      'ui-inset-panel-size': ['ui-inset-panel-size'],
      'ui-interactive-row-hover': ['ui-interactive-row-hover'],
      'ui-interactive-row-selected': ['ui-interactive-row-selected'],
      'ui-list-density': ['ui-list-density', 'p', 'px', 'py', 'ps', 'pe', 'pt', 'pb'],
      p: ['ui-list-density'],
      px: ['ui-list-density'],
      py: ['ui-list-density'],
      'ui-choice-control-kind': ['ui-choice-control-kind'],
      'ui-choice-control-indicator-size': ['ui-choice-control-indicator-size'],
      'ui-field-group-size': ['ui-field-group-size'],
      'ui-field-group-layout': ['ui-field-group-layout'],
      'ui-avatar-size': ['ui-avatar-size'],
      'ui-toast-tone': ['ui-toast-tone', 'ui-border-strength'],
      'ui-semantic-text-tone': ['ui-semantic-text-tone'],
      'ui-semantic-text-emphasis': ['ui-semantic-text-emphasis'],
      'font-size': ['heading-style', 'eyebrow-style', 'text-style', 'text-style-score-size'],
      'font-weight': ['heading-style', 'eyebrow-style', 'text-style', 'text-style-score'],
      tracking: ['heading-style', 'eyebrow-style'],
      leading: ['heading-style', 'text-style', 'text-style-score-size'],
      'text-color': ['text-style-color'],
      'font-family': ['heading-style'],
      'text-transform': ['heading-style', 'eyebrow-style'],
    },
  },
})

/**
 * Merge conditional class names and de-duplicate conflicting Tailwind classes.
 * The single composition helper used by every component in this package.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
