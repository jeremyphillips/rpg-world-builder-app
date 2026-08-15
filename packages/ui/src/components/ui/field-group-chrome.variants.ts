import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import type { CompactLabelTone } from './compact-label.lib'
import { resolveChromeClasses } from './chrome.variants'
import { isCompactLabelTone } from './field-surface.variants'
import {
  resolveFieldGroupInsetPaddingClasses,
  fieldRailInnerPaddingClasses,
  type FieldRhythm,
} from './field.variants'
import type {
  ChromeBorderAccent,
  ChromeConfig,
  SemanticTone,
  SurfaceElevation,
  VisualEmphasis,
} from './visual-vocabulary.types'

/** Left rail tone for group rail chrome. */
export type FieldGroupRailTone = 'border' | 'primary'

/** @deprecated Use {@link FieldGroupRailTone}. */
export type FieldGroupInsetTone = FieldGroupRailTone

/** Divider edge and tone for group section separation. */
export type FieldGroupDividerEdge = 'top' | 'bottom'
export type FieldGroupDividerTone = 'border' | 'muted'

/** Accent edge placement for light group emphasis. */
export type FieldGroupAccentEdge = 'top' | 'legendRail'

export type FieldGroupAccentTone = 'border' | 'primary' | CompactLabelTone

export type FieldGroupPanelChrome = {
  variant: 'panel'
  tone?: SemanticTone
  emphasis?: VisualEmphasis
  elevation?: SurfaceElevation
}

export type FieldGroupOutlineChrome = {
  variant: 'outline'
  tone?: SemanticTone
  emphasis?: VisualEmphasis
  borderAccent?: ChromeBorderAccent
}

export type FieldGroupCalloutChrome = {
  variant: 'callout'
  tone?: SemanticTone
  emphasis?: VisualEmphasis
}

type FieldGroupComposableChrome =
  | FieldGroupPanelChrome
  | FieldGroupOutlineChrome
  | FieldGroupCalloutChrome

export interface FieldGroupRailChrome {
  variant: 'rail'
  tone?: FieldGroupRailTone
}

/** @deprecated Use {@link FieldGroupRailChrome} with `variant: 'rail'`. */
export interface FieldGroupInsetChrome {
  variant: 'inset'
  tone?: FieldGroupRailTone
}

export interface FieldGroupDividerChrome {
  variant: 'divider'
  edge?: FieldGroupDividerEdge
  tone?: FieldGroupDividerTone
}

export interface FieldGroupAccentChrome {
  variant: 'accent'
  edge: FieldGroupAccentEdge
  tone?: FieldGroupAccentTone
}

/** Visual treatment for the field stack inside a group — variants are mutually exclusive. */
export type FieldGroupChrome =
  | { variant: 'plain' }
  | FieldGroupRailChrome
  | FieldGroupInsetChrome
  | FieldGroupDividerChrome
  | FieldGroupAccentChrome
  | FieldGroupComposableChrome

/** Spacing above a top divider — 28px (`pt-7`). */
export const fieldGroupDividerTopPaddingClasses = 'pt-7'
/** Spacing below a bottom divider — 28px (`pb-7`). */
export const fieldGroupDividerBottomPaddingClasses = 'pb-7'

const fieldGroupRailBodyVariants = cva('border-l-2', {
  variants: {
    tone: {
      border: 'border-border',
      primary: 'border-primary',
    },
  },
  defaultVariants: {
    tone: 'border',
  },
})

const fieldGroupDividerContainerVariants = cva('', {
  variants: {
    edge: {
      top: cn('border-t', fieldGroupDividerTopPaddingClasses),
      bottom: cn('border-b', fieldGroupDividerBottomPaddingClasses),
    },
    tone: {
      border: 'border-border',
      muted: 'border-border-subtle',
    },
  },
  defaultVariants: {
    edge: 'top',
    tone: 'border',
  },
})

const fieldGroupAccentContainerVariants = cva('', {
  variants: {
    edge: {
      top: 'border-t-2 pt-4',
      legendRail: '',
    },
    tone: {
      border: 'border-border',
      primary: 'border-primary',
      neutral: '',
      info: '',
      success: '',
      warning: '',
      destructive: '',
    },
  },
  compoundVariants: [
    { edge: 'top', tone: 'neutral', class: 'border-semantic-neutral-border' },
    { edge: 'top', tone: 'info', class: 'border-semantic-info-border' },
    { edge: 'top', tone: 'success', class: 'border-semantic-success-border' },
    { edge: 'top', tone: 'warning', class: 'border-semantic-warning-border' },
    { edge: 'top', tone: 'destructive', class: 'border-semantic-destructive-border' },
  ],
  defaultVariants: {
    edge: 'top',
    tone: 'border',
  },
})

const fieldGroupAccentLegendRailVariants = cva('relative w-full', {
  variants: {
    tone: {
      border: 'before:bg-border',
      primary: 'before:bg-primary',
      neutral: 'before:bg-semantic-neutral-border',
      info: 'before:bg-semantic-info-border',
      success: 'before:bg-semantic-success-border',
      warning: 'before:bg-semantic-warning-border',
      destructive: 'before:bg-semantic-destructive-border',
    },
  },
  defaultVariants: {
    tone: 'border',
  },
})

export function resolveFieldGroupAccentLegendRailClasses(
  tone: FieldGroupAccentTone = 'border',
): string {
  const resolvedTone = isCompactLabelTone(tone) ? tone : tone
  return cn(
    fieldGroupAccentLegendRailVariants({ tone: resolvedTone as FieldGroupAccentTone }),
    'before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:rounded-full',
  )
}

function resolveAccentTone(
  tone: FieldGroupAccentTone | undefined,
): NonNullable<Parameters<typeof fieldGroupAccentContainerVariants>[0]>['tone'] {
  if (!tone || tone === 'border' || tone === 'primary') {
    return tone ?? 'border'
  }

  if (isCompactLabelTone(tone)) {
    return tone
  }

  return 'border'
}

export interface FieldGroupChromeClassNames {
  fieldset: string
  body: string
  legend: string
}

const PLAIN_FIELD_GROUP_CHROME: FieldGroupChromeClassNames = {
  fieldset: '',
  body: '',
  legend: '',
}

function withFieldGroupChrome(
  overrides: Partial<FieldGroupChromeClassNames>,
): FieldGroupChromeClassNames {
  return { ...PLAIN_FIELD_GROUP_CHROME, ...overrides }
}

function resolveGroupRailChrome(
  chrome: FieldGroupRailChrome | FieldGroupInsetChrome,
  rhythm: FieldRhythm,
): FieldGroupChromeClassNames {
  const padding =
    chrome.variant === 'inset'
      ? resolveFieldGroupInsetPaddingClasses(rhythm)
      : fieldRailInnerPaddingClasses

  return withFieldGroupChrome({
    body: cn(fieldGroupRailBodyVariants({ tone: chrome.tone ?? 'border' }), padding),
  })
}

function resolveComposableChrome(chrome: FieldGroupComposableChrome): FieldGroupChromeClassNames {
  return withFieldGroupChrome({
    body: resolveChromeClasses(chrome as ChromeConfig),
  })
}

function resolveDividerChrome(chrome: FieldGroupDividerChrome): FieldGroupChromeClassNames {
  return withFieldGroupChrome({
    fieldset: fieldGroupDividerContainerVariants({
      edge: chrome.edge ?? 'top',
      tone: chrome.tone ?? 'border',
    }),
  })
}

function resolveAccentChrome(chrome: FieldGroupAccentChrome): FieldGroupChromeClassNames {
  const tone = resolveAccentTone(chrome.tone)
  return withFieldGroupChrome({
    fieldset: chrome.edge === 'top' ? fieldGroupAccentContainerVariants({ edge: 'top', tone }) : '',
    legend:
      chrome.edge === 'legendRail' ? resolveFieldGroupAccentLegendRailClasses(chrome.tone) : '',
  })
}

export type ResolveFieldGroupChromeOptions = {
  /** Inset left padding density — follows group `rhythm` when omitted. */
  rhythm?: FieldRhythm
}

type GroupChromeResolver = (
  chrome: FieldGroupChrome,
  rhythm: FieldRhythm,
) => FieldGroupChromeClassNames

const GROUP_CHROME_RESOLVERS: Partial<Record<FieldGroupChrome['variant'], GroupChromeResolver>> = {
  plain: () => PLAIN_FIELD_GROUP_CHROME,
  rail: (chrome, rhythm) => resolveGroupRailChrome(chrome as FieldGroupRailChrome, rhythm),
  inset: (chrome, rhythm) => resolveGroupRailChrome(chrome as FieldGroupInsetChrome, rhythm),
  panel: (chrome) => resolveComposableChrome(chrome as FieldGroupPanelChrome),
  outline: (chrome) => resolveComposableChrome(chrome as FieldGroupOutlineChrome),
  callout: (chrome) => resolveComposableChrome(chrome as FieldGroupCalloutChrome),
  divider: (chrome) => resolveDividerChrome(chrome as FieldGroupDividerChrome),
  accent: (chrome) => resolveAccentChrome(chrome as FieldGroupAccentChrome),
}

/** Resolves fieldset, legend, and body classes for a group chrome config. */
export function resolveFieldGroupChromeClassNames(
  chrome: FieldGroupChrome | undefined,
  options?: ResolveFieldGroupChromeOptions,
): FieldGroupChromeClassNames {
  const rhythm = options?.rhythm ?? 'comfortable'
  const resolved = chrome ?? { variant: 'plain' as const }
  const resolve = GROUP_CHROME_RESOLVERS[resolved.variant]
  return resolve ? resolve(resolved, rhythm) : PLAIN_FIELD_GROUP_CHROME
}
