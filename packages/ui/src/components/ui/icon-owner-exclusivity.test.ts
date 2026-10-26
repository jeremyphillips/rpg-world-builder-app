import { describe, expect, it } from 'vitest'

import { buttonVariants } from './button.variants'
import {
  resolveCompactControlIconCompactSmClasses,
  resolveCompactControlRecipeClasses,
  resolveCompactControlStepperButtonClasses,
  type CompactControlRecipeKey,
  type CompactControlStepperButtonSizeKey,
} from './compact-control.styles'
import { badgeSizeVariants } from './badge.variants'
import { chipSizeClass, type ChipSize } from './chip.lib'
import { identityFrameFallbackVariants } from './identity-frame.variants'
import { searchBarLeadingIconVariants } from './search-bar.variants'
import { statusIconVariants } from './status-icon.variants'

const BUTTON_ICON_SIZE_CLASSES = [
  'ui-button--md',
  'ui-button--md-compact',
  'ui-button--xs',
  'ui-button--xs-compact',
  'ui-button--sm',
  'ui-button--sm-compact',
  'ui-button--lg',
  'ui-button--lg-compact',
  'ui-button--icon-md',
  'ui-button--icon-compact',
  'ui-button--icon-xs',
  'ui-button--icon-lg',
  'ui-button__text--default',
  'ui-button__text--default-compact',
  'ui-button__text--sm',
  'ui-button__text--sm-compact',
  'ui-button__text--xs',
  'ui-button__text--xs-compact',
  'ui-button__text--lg',
  'ui-button__text--lg-compact',
  'ui-button--attached-xs',
  'ui-button--attached-sm',
  'ui-button--attached-md',
  'ui-button--attached-lg',
]

const COMPACT_CONTROL_ICON_SIZE_CLASSES = [
  'ui-compact-control--icon-compact',
  'ui-compact-control--icon-compact-sm',
  'ui-compact-control--icon-xs',
  'ui-compact-control--icon-default',
  'ui-compact-control--icon-lg',
  'ui-compact-control--text-with-icon-compact',
  'ui-compact-control--stepper-button-xs',
  'ui-compact-control--stepper-button-sm',
  'ui-compact-control--stepper-button-md',
  'ui-compact-control--stepper-button-lg',
]

const BADGE_ICON_SIZE_CLASSES = ['ui-badge--sm', 'ui-badge--md', 'ui-badge--lg']

const CHIP_ICON_SIZE_CLASSES = ['ui-chip--xs', 'ui-chip--sm', 'ui-chip--md', 'ui-chip--lg']

const IDENTITY_FRAME_FALLBACK_ICON_SIZE_CLASSES = [
  'ui-identity-frame__fallback--xs',
  'ui-identity-frame__fallback--sm',
  'ui-identity-frame__fallback--md',
  'ui-identity-frame__fallback--inline',
]

const SEARCH_BAR_ICON_SIZE_CLASSES = [
  'ui-search-bar__leading-icon--xs',
  'ui-search-bar__leading-icon--sm',
  'ui-search-bar__leading-icon--md',
  'ui-search-bar__leading-icon--lg',
]

const STATUS_ICON_SIZE_CLASSES = ['ui-status-icon--sm', 'ui-status-icon--md', 'ui-status-icon--lg']

function matchingClasses(className: string, registered: readonly string[]): string[] {
  const tokens = new Set(className.split(/\s+/))
  return registered.filter((name) => tokens.has(name))
}

function expectAtMostOne(className: string, registered: readonly string[]) {
  expect(matchingClasses(className, registered).length).toBeLessThanOrEqual(1)
}

describe('icon owner class exclusivity', () => {
  const buttonVariantsInputs = [
    'default',
    'destructive',
    'outline',
    'secondary',
    'ghost',
    'text',
    'attached',
  ] as const
  const buttonSizes = ['default', 'xs', 'sm', 'lg', 'icon', 'icon-xs', 'icon-lg'] as const
  const densities = ['default', 'compact'] as const

  it('emits at most one button icon-size class', () => {
    for (const variant of buttonVariantsInputs) {
      for (const size of buttonSizes) {
        for (const density of densities) {
          expectAtMostOne(buttonVariants({ variant, size, density }), BUTTON_ICON_SIZE_CLASSES)
        }
      }
    }
  })

  it('emits exactly one button icon-size class for labeled, icon, text, and attached buttons', () => {
    expect(matchingClasses(buttonVariants({ size: 'sm' }), BUTTON_ICON_SIZE_CLASSES)).toEqual([
      'ui-button--sm',
    ])
    expect(matchingClasses(buttonVariants({ size: 'icon' }), BUTTON_ICON_SIZE_CLASSES)).toEqual([
      'ui-button--icon-md',
    ])
    expect(
      matchingClasses(buttonVariants({ variant: 'text', size: 'xs' }), BUTTON_ICON_SIZE_CLASSES),
    ).toEqual(['ui-button__text--xs'])
    expect(
      matchingClasses(
        buttonVariants({ variant: 'attached', size: 'lg' }),
        BUTTON_ICON_SIZE_CLASSES,
      ),
    ).toEqual(['ui-button--attached-lg'])
  })

  it('emits one compact-control icon-size class per recipe', () => {
    const recipes = [
      'icon-compact',
      'icon-xs',
      'icon-default',
      'icon-lg',
      'text-with-icon-compact',
    ] as const satisfies readonly CompactControlRecipeKey[]
    for (const recipe of recipes) {
      expect(
        matchingClasses(
          resolveCompactControlRecipeClasses(recipe),
          COMPACT_CONTROL_ICON_SIZE_CLASSES,
        ),
      ).toHaveLength(1)
    }
    expect(
      matchingClasses(
        resolveCompactControlIconCompactSmClasses(),
        COMPACT_CONTROL_ICON_SIZE_CLASSES,
      ),
    ).toEqual(['ui-compact-control--icon-compact-sm'])

    const stepperSizes = [
      'xs',
      'sm',
      'md',
      'lg',
    ] as const satisfies readonly CompactControlStepperButtonSizeKey[]
    for (const size of stepperSizes) {
      expect(
        matchingClasses(
          resolveCompactControlStepperButtonClasses(size),
          COMPACT_CONTROL_ICON_SIZE_CLASSES,
        ),
      ).toHaveLength(1)
    }
  })

  it('emits one badge and one chip icon-size class per size', () => {
    for (const size of ['sm', 'md', 'lg'] as const) {
      expect(matchingClasses(badgeSizeVariants({ size }), BADGE_ICON_SIZE_CLASSES)).toEqual([
        `ui-badge--${size}`,
      ])
    }
    for (const size of ['xs', 'sm', 'md', 'lg'] as const satisfies readonly ChipSize[]) {
      expect(matchingClasses(chipSizeClass(size), CHIP_ICON_SIZE_CLASSES)).toEqual([
        `ui-chip--${size}`,
      ])
    }
  })

  it('emits one identity-frame fallback icon-size class per size', () => {
    for (const size of ['xs', 'sm', 'md', 'inline'] as const) {
      expect(
        matchingClasses(
          identityFrameFallbackVariants({ size }),
          IDENTITY_FRAME_FALLBACK_ICON_SIZE_CLASSES,
        ),
      ).toHaveLength(1)
    }
  })

  it('emits one search-bar leading icon-size class per size', () => {
    for (const size of ['xs', 'sm', 'md', 'lg'] as const) {
      expect(
        matchingClasses(searchBarLeadingIconVariants({ size }), SEARCH_BAR_ICON_SIZE_CLASSES),
      ).toEqual([`ui-search-bar__leading-icon--${size}`])
    }
  })

  it('emits one status-icon size class per size', () => {
    for (const size of ['sm', 'md', 'lg'] as const) {
      expect(matchingClasses(statusIconVariants({ size }), STATUS_ICON_SIZE_CLASSES)).toEqual([
        `ui-status-icon--${size}`,
      ])
    }
  })
})
