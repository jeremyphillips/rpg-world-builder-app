import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

import {
  UI_BUTTON_APPEARANCE_CLASSES,
  UI_BUTTON_SIZE_CLASSES,
  UI_BUTTON_TEXT_GEOMETRY_CLASSES,
  UI_FIELD_CONTROL_DIGITS_SIZE_CLASSES,
  UI_FIELD_CONTROL_FILTER_APPEARANCE_CLASSES,
  UI_FIELD_CONTROL_MULTILINE_SIZE_CLASSES,
  UI_FIELD_CONTROL_SIZE_CLASSES,
  UI_FIELD_CONTROL_TRIGGER_FLOW_CLASSES,
  UI_FIELD_CONTROL_WIDTH_CLASSES,
  UI_FLOATING_LABEL_SIZE_CLASSES,
  UI_COMPACT_CONTROL_SIZE_CLASSES,
  UI_COMPACT_LABEL_APPEARANCE_CLASSES,
  UI_COMPACT_LABEL_SIZE_CLASSES,
  UI_CARD_INTERACTION_CLASSES,
  UI_INSET_PANEL_SIZE_CLASSES,
  UI_INTERACTIVE_LIST_ROW_SIZE_CLASSES,
  UI_INTERACTIVE_ROW_HOVER_CLASSES,
  UI_INTERACTIVE_ROW_SELECTED_CLASSES,
  UI_CHOICE_CONTROL_INDICATOR_SIZE_CLASSES,
  UI_CHOICE_CONTROL_KIND_CLASSES,
  UI_FIELD_GROUP_LAYOUT_CLASSES,
  UI_FIELD_GROUP_SIZE_CLASSES,
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

const TEXT_STYLE_UTILITIES = [
  'text-style-body',
  'text-style-muted',
  'text-style-small',
  'text-style-caption',
  'text-style-supporting',
  'text-style-label',
  'text-style-emphasis',
  'text-style-option',
  'text-style-lead',
  'text-style-info',
  'text-style-success',
  'text-style-warning',
  'text-style-destructive',
  'text-style-field-label-sm',
  'text-style-field-label-md',
  'text-style-field-label-lg',
  'text-style-field-legend',
  'text-style-field-legend-sub',
  'text-style-field-legend-compact',
  'text-style-field-hint',
  'text-style-field-hint-compact',
  'text-style-field-error',
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

type TypographyClassGroupIds =
  | 'heading-style'
  | 'eyebrow-style'
  | 'text-style'
  | 'text-action'
  | 'ui-button-size'
  | 'ui-button-appearance'
  | 'ui-button-text-geometry'
  | 'ui-field-control-size'
  | 'ui-field-control-multiline-size'
  | 'ui-field-control-digits-size'
  | 'ui-field-control-filter-appearance'
  | 'ui-field-control-trigger-flow'
  | 'ui-field-control-width'
  | 'ui-floating-label-size'
  | 'ui-field-group-size'
  | 'ui-field-group-layout'
  | 'ui-compact-control-size'
  | 'ui-compact-label-size'
  | 'ui-compact-label-appearance'
  | 'ui-card-interaction'
  | 'ui-inset-panel-size'
  | 'ui-interactive-row-hover'
  | 'ui-interactive-row-selected'
  | 'ui-interactive-list-row-size'
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
        'heading-1',
        'heading-2',
        'heading-3',
        'heading-4',
        'heading-5',
        'heading-display',
        'heading-page',
        'heading-section',
        'heading-subsection',
        'heading-group',
        'heading-card',
        'heading-dialog-title',
        'heading-dialog-title-md',
        'heading-confirm-dialog-title',
        'heading-sheet-section',
        'heading-compact',
        'heading-label',
        '2xs-meta',
        'xs-meta',
        'sm-meta',
        'md',
        'eyebrow-xs',
        'eyebrow-sm',
        'eyebrow-md',
        'badge-sm',
        'badge-md',
        'table-body',
        'table-stat',
        'field-group-legend',
        'field-subgroup-legend',
        'field-array-legend',
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
      'text-action': [...TEXT_ACTION_UTILITIES],
      'ui-button-size': [...UI_BUTTON_SIZE_CLASSES],
      'ui-button-appearance': [...UI_BUTTON_APPEARANCE_CLASSES],
      'ui-button-text-geometry': [...UI_BUTTON_TEXT_GEOMETRY_CLASSES],
      'ui-field-control-size': [...UI_FIELD_CONTROL_SIZE_CLASSES],
      'ui-field-control-multiline-size': [...UI_FIELD_CONTROL_MULTILINE_SIZE_CLASSES],
      'ui-field-control-digits-size': [...UI_FIELD_CONTROL_DIGITS_SIZE_CLASSES],
      'ui-field-control-filter-appearance': [...UI_FIELD_CONTROL_FILTER_APPEARANCE_CLASSES],
      'ui-field-control-trigger-flow': [...UI_FIELD_CONTROL_TRIGGER_FLOW_CLASSES],
      'ui-field-control-width': [...UI_FIELD_CONTROL_WIDTH_CLASSES],
      'ui-floating-label-size': [...UI_FLOATING_LABEL_SIZE_CLASSES],
      'ui-compact-control-size': [...UI_COMPACT_CONTROL_SIZE_CLASSES],
      'ui-compact-label-size': [...UI_COMPACT_LABEL_SIZE_CLASSES],
      'ui-compact-label-appearance': [...UI_COMPACT_LABEL_APPEARANCE_CLASSES],
      'ui-card-interaction': [...UI_CARD_INTERACTION_CLASSES],
      'ui-inset-panel-size': [...UI_INSET_PANEL_SIZE_CLASSES],
      'ui-interactive-row-hover': [...UI_INTERACTIVE_ROW_HOVER_CLASSES],
      'ui-interactive-row-selected': [...UI_INTERACTIVE_ROW_SELECTED_CLASSES],
      'ui-interactive-list-row-size': [...UI_INTERACTIVE_LIST_ROW_SIZE_CLASSES],
      'ui-choice-control-kind': [...UI_CHOICE_CONTROL_KIND_CLASSES],
      'ui-choice-control-indicator-size': [...UI_CHOICE_CONTROL_INDICATOR_SIZE_CLASSES],
      'ui-field-group-size': [...UI_FIELD_GROUP_SIZE_CLASSES],
      'ui-field-group-layout': [...UI_FIELD_GROUP_LAYOUT_CLASSES],
    },
    conflictingClassGroups: {
      'heading-style': [...TYPOGRAPHY_CONFLICT_GROUPS],
      'eyebrow-style': [...EYEBROW_STYLE_CONFLICT_GROUPS],
      'text-style': [...TYPOGRAPHY_CONFLICT_GROUPS],
      'text-action': ['text-action'],
      'ui-button-size': ['ui-button-size'],
      'ui-button-appearance': ['ui-button-appearance'],
      'ui-button-text-geometry': ['ui-button-text-geometry'],
      'ui-field-control-size': ['ui-field-control-size'],
      'ui-field-control-multiline-size': ['ui-field-control-multiline-size'],
      'ui-field-control-digits-size': ['ui-field-control-digits-size'],
      'ui-field-control-filter-appearance': ['ui-field-control-filter-appearance'],
      'ui-field-control-trigger-flow': ['ui-field-control-trigger-flow'],
      'ui-field-control-width': ['ui-field-control-width'],
      'ui-floating-label-size': ['ui-floating-label-size'],
      'ui-compact-control-size': ['ui-compact-control-size'],
      'ui-compact-label-size': ['ui-compact-label-size'],
      'ui-compact-label-appearance': ['ui-compact-label-appearance'],
      'ui-card-interaction': ['ui-card-interaction'],
      'ui-inset-panel-size': ['ui-inset-panel-size'],
      'ui-interactive-row-hover': ['ui-interactive-row-hover'],
      'ui-interactive-row-selected': ['ui-interactive-row-selected'],
      'ui-interactive-list-row-size': [
        'ui-interactive-list-row-size',
        'p',
        'px',
        'py',
        'ps',
        'pe',
        'pt',
        'pb',
      ],
      p: ['ui-interactive-list-row-size'],
      px: ['ui-interactive-list-row-size'],
      py: ['ui-interactive-list-row-size'],
      'ui-choice-control-kind': ['ui-choice-control-kind'],
      'ui-choice-control-indicator-size': ['ui-choice-control-indicator-size'],
      'ui-field-group-size': ['ui-field-group-size'],
      'ui-field-group-layout': ['ui-field-group-layout'],
      'font-size': ['heading-style', 'eyebrow-style', 'text-style'],
      'font-weight': ['heading-style', 'eyebrow-style', 'text-style'],
      tracking: ['heading-style', 'eyebrow-style'],
      leading: ['heading-style', 'text-style'],
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
