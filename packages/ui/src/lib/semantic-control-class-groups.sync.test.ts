import { describe, expect, it } from 'vitest'

import {
  UI_ALERT_APPEARANCE_CLASSES,
  UI_ALERT_DENSITY_CLASSES,
} from '../components/ui/alert.variants'
import { UI_COMPACT_LABEL_APPEARANCE_CLASSES } from '../components/ui/badge-appearance.lib'
import { UI_BORDER_STRENGTH_CLASSES } from '../components/ui/border-strength'
import {
  UI_BUTTON_APPEARANCE_CLASSES,
  UI_BUTTON_SIZE_CLASSES,
  UI_BUTTON_TEXT_GEOMETRY_CLASSES,
  BUTTON_APPEARANCE_SPECS,
  BUTTON_SIZE_SPECS,
  TEXT_BUTTON_SIZE_CLASS,
  UI_BUTTON_ATTACHED_SIZE_CLASS,
  UI_BUTTON_TEXT_SIZE_CLASS,
} from '../components/ui/button.styles'
import {
  UI_CHOICE_CONTROL_INDICATOR_SIZE_CLASSES,
  UI_CHOICE_CONTROL_KIND_CLASSES,
  CHOICE_CONTROL_INDICATOR_SIZE_SPECS,
  CHOICE_CONTROL_KIND_SPECS,
} from '../components/ui/choice-control.styles'
import {
  UI_COMPACT_CONTROL_SIZE_CLASSES,
  COMPACT_CONTROL_RECIPE_SPECS,
} from '../components/ui/compact-control.styles'
import {
  UI_COMPACT_LABEL_SIZE_CLASSES,
  COMPACT_LABEL_SIZES,
} from '../components/ui/compact-label.lib'
import {
  UI_FIELD_CONTROL_DIGITS_SIZE_CLASSES,
  UI_FIELD_CONTROL_MULTILINE_SIZE_CLASSES,
  UI_FIELD_CONTROL_SIZE_CLASSES,
  FIELD_CONTROL_DIGITS_SIZE_SPECS,
  FIELD_CONTROL_MULTILINE_SIZE_SPECS,
  FIELD_CONTROL_SIZE_SPECS,
} from '../components/ui/field-control.styles'
import {
  UI_FIELD_GROUP_SIZE_CLASSES,
  FIELD_GROUP_SIZE_SPECS,
} from '../components/ui/field-group.styles'
import {
  UI_FLOATING_LABEL_SIZE_CLASSES,
  FLOATING_LABEL_SIZE_SPECS,
} from '../components/ui/floating-label-field.styles'
import {
  UI_INTERACTIVE_ROW_HOVER_CLASSES,
  UI_INTERACTIVE_ROW_SELECTED_CLASSES,
  UI_INTERACTIVE_ROW_HOVER_CLASS,
  UI_INTERACTIVE_ROW_SELECTED_CLASS,
  UI_INTERACTIVE_ROW_FILL_SURFACE_CLASS,
  UI_INTERACTIVE_ROW_EMPHASIS_FILL_CLASS,
} from '../components/ui/interactive-row.styles'
import * as classGroups from './semantic-control-class-groups'

function expectSameSet(actual: readonly string[], expected: readonly string[], label: string) {
  expect(new Set(actual), label).toEqual(new Set(expected))
}

describe('semantic-control-class-groups sync', () => {
  it('re-exports twMerge groups from styling owners', () => {
    expectSameSet(
      classGroups.UI_BORDER_STRENGTH_CLASSES,
      UI_BORDER_STRENGTH_CLASSES,
      'border strength',
    )
    expectSameSet(
      classGroups.UI_BUTTON_APPEARANCE_CLASSES,
      UI_BUTTON_APPEARANCE_CLASSES,
      'button appearance',
    )
    expectSameSet(classGroups.UI_BUTTON_SIZE_CLASSES, UI_BUTTON_SIZE_CLASSES, 'button size')
    expectSameSet(
      classGroups.UI_BUTTON_TEXT_GEOMETRY_CLASSES,
      UI_BUTTON_TEXT_GEOMETRY_CLASSES,
      'button text geometry',
    )
    expectSameSet(
      classGroups.UI_FIELD_CONTROL_SIZE_CLASSES,
      UI_FIELD_CONTROL_SIZE_CLASSES,
      'field size',
    )
    expectSameSet(
      classGroups.UI_COMPACT_LABEL_APPEARANCE_CLASSES,
      UI_COMPACT_LABEL_APPEARANCE_CLASSES,
      'compact label appearance',
    )
  })

  it('derives button twMerge classes from specs', () => {
    expectSameSet(
      UI_BUTTON_APPEARANCE_CLASSES,
      BUTTON_APPEARANCE_SPECS.map((spec) => spec.className),
      'button appearance specs',
    )
    expectSameSet(
      UI_BUTTON_SIZE_CLASSES,
      [
        ...BUTTON_SIZE_SPECS.map((spec) => spec.className),
        UI_BUTTON_TEXT_SIZE_CLASS,
        UI_BUTTON_ATTACHED_SIZE_CLASS,
      ],
      'button size specs',
    )
    expectSameSet(
      UI_BUTTON_TEXT_GEOMETRY_CLASSES,
      Object.values(TEXT_BUTTON_SIZE_CLASS).flatMap((byDensity) => Object.values(byDensity)),
      'button text geometry map',
    )
  })

  it('derives field and choice twMerge classes from specs', () => {
    expectSameSet(
      UI_FIELD_CONTROL_SIZE_CLASSES,
      FIELD_CONTROL_SIZE_SPECS.map((spec) => spec.className),
      'field control sizes',
    )
    expectSameSet(
      UI_FIELD_CONTROL_MULTILINE_SIZE_CLASSES,
      FIELD_CONTROL_MULTILINE_SIZE_SPECS.map((spec) => spec.className),
      'field multiline sizes',
    )
    expectSameSet(
      UI_FIELD_CONTROL_DIGITS_SIZE_CLASSES,
      FIELD_CONTROL_DIGITS_SIZE_SPECS.map((spec) => spec.className),
      'field digit sizes',
    )
    expectSameSet(
      UI_CHOICE_CONTROL_KIND_CLASSES,
      CHOICE_CONTROL_KIND_SPECS.map((spec) => spec.className),
      'choice kinds',
    )
    expectSameSet(
      UI_CHOICE_CONTROL_INDICATOR_SIZE_CLASSES,
      CHOICE_CONTROL_INDICATOR_SIZE_SPECS.map((spec) => spec.className),
      'choice indicator sizes',
    )
  })

  it('derives compact label, field group, and floating label classes from specs', () => {
    expectSameSet(
      UI_COMPACT_LABEL_SIZE_CLASSES,
      COMPACT_LABEL_SIZES.map((size) => `ui-compact-label--${size}`),
      'compact label sizes',
    )
    expectSameSet(
      UI_FIELD_GROUP_SIZE_CLASSES,
      FIELD_GROUP_SIZE_SPECS.map((spec) => spec.className),
      'field group sizes',
    )
    expectSameSet(
      UI_FLOATING_LABEL_SIZE_CLASSES,
      FLOATING_LABEL_SIZE_SPECS.map((spec) => spec.className),
      'floating label sizes',
    )
    expectSameSet(
      UI_COMPACT_CONTROL_SIZE_CLASSES.slice(0, COMPACT_CONTROL_RECIPE_SPECS.length),
      COMPACT_CONTROL_RECIPE_SPECS.map((spec) => spec.className),
      'compact control recipes',
    )
  })

  it('derives alert and interactive row classes from vocabulary', () => {
    expect(UI_ALERT_APPEARANCE_CLASSES.every((name) => name.startsWith('ui-alert--'))).toBe(true)
    expect(UI_ALERT_DENSITY_CLASSES.every((name) => name.startsWith('ui-alert--'))).toBe(true)
    expectSameSet(
      UI_INTERACTIVE_ROW_HOVER_CLASSES,
      Object.values(UI_INTERACTIVE_ROW_HOVER_CLASS),
      'interactive row hover',
    )
    expectSameSet(
      UI_INTERACTIVE_ROW_SELECTED_CLASSES,
      [
        ...Object.values(UI_INTERACTIVE_ROW_SELECTED_CLASS),
        UI_INTERACTIVE_ROW_FILL_SURFACE_CLASS,
        UI_INTERACTIVE_ROW_EMPHASIS_FILL_CLASS,
      ],
      'interactive row selected',
    )
  })
})
