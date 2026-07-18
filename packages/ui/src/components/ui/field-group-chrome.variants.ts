import { cva } from 'class-variance-authority'

import { type AlertVariant, ALERT_VARIANTS } from './alert.variants'
import { compactLabelAppearanceToneClasses, type CompactLabelTone } from './compact-label.lib'
import { cn } from '../../lib/utils'
import {
  fieldGroupBodyShellLayoutClasses,
  isCompactLabelTone,
  resolveFieldGroupOutlineToneClasses,
  resolveFieldGroupPanelToneClasses,
  type FieldGroupOutlineTone,
  type FieldGroupPanelTone,
} from './field-surface.variants'

/** Left rail tone for group inset chrome. */
export type FieldGroupInsetTone = 'border' | 'primary'

/** Divider edge and tone for group section separation. */
export type FieldGroupDividerEdge = 'top' | 'bottom'
export type FieldGroupDividerTone = 'border' | 'muted'

/** Accent edge placement for light group emphasis. */
export type FieldGroupAccentEdge = 'top' | 'legendRail'

export type FieldGroupAccentTone = 'border' | 'primary' | CompactLabelTone

/** Callout surfaces reuse alert tokens plus compact-label semantic tones. */
export type FieldGroupCalloutTone = AlertVariant | CompactLabelTone

export interface FieldGroupInsetChrome {
  variant: 'inset'
  tone?: FieldGroupInsetTone
}

export interface FieldGroupPanelChrome {
  variant: 'panel'
  tone?: FieldGroupPanelTone
}

export interface FieldGroupOutlineChrome {
  variant: 'outline'
  tone?: FieldGroupOutlineTone
}

export interface FieldGroupDividerChrome {
  variant: 'divider'
  edge?: FieldGroupDividerEdge
  tone?: FieldGroupDividerTone
}

export interface FieldGroupCalloutChrome {
  variant: 'callout'
  tone?: FieldGroupCalloutTone
}

export interface FieldGroupAccentChrome {
  variant: 'accent'
  edge: FieldGroupAccentEdge
  tone?: FieldGroupAccentTone
}

export interface FieldGroupCollapsibleChrome {
  variant: 'collapsible'
  defaultOpen?: boolean
  /** Stable key for uiStateKey persistence; falls back to group `id` or legend slug. */
  collapseKey?: string
}

/** Visual treatment for the field stack inside a group — variants are mutually exclusive. */
export type FieldGroupFieldsChrome =
  | { variant: 'plain' }
  | FieldGroupInsetChrome
  | FieldGroupPanelChrome
  | FieldGroupOutlineChrome
  | FieldGroupDividerChrome
  | FieldGroupCalloutChrome
  | FieldGroupAccentChrome
  | FieldGroupCollapsibleChrome

/** Spacing above a top divider — 28px (`pt-7`). */
export const fieldGroupDividerTopPaddingClasses = 'pt-7'
/** Spacing below a bottom divider — 28px (`pb-7`). */
export const fieldGroupDividerBottomPaddingClasses = 'pb-7'

const fieldGroupInsetBodyVariants = cva('border-l-2 pl-6 sm:pl-10', {
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
      muted: 'border-border/60',
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

function isAlertVariant(value: string): value is AlertVariant {
  return (ALERT_VARIANTS as readonly string[]).includes(value)
}

function resolveCalloutBodyClasses(tone: FieldGroupCalloutTone = 'info'): string {
  if (isAlertVariant(tone)) {
    const calloutSurface: Record<AlertVariant, string> = {
      default: 'border-border bg-muted text-foreground',
      info: 'border-info-muted bg-info-subtle text-foreground',
      success: 'border-success-muted bg-success-subtle text-foreground',
      warning: 'border-warning-muted bg-warning-subtle text-foreground',
      destructive: 'border-destructive-muted bg-destructive-subtle text-foreground',
    }

    return cn('rounded-lg border p-4', calloutSurface[tone])
  }

  if (isCompactLabelTone(tone)) {
    return cn('rounded-lg border p-4', compactLabelAppearanceToneClasses('soft', tone))
  }

  return cn('rounded-lg border p-4', 'border-border bg-muted text-foreground')
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
  isCollapsible: boolean
  defaultOpen: boolean
  collapseKey?: string
}

const PLAIN_FIELD_GROUP_CHROME: FieldGroupChromeClassNames = {
  fieldset: '',
  body: '',
  legend: '',
  isCollapsible: false,
  defaultOpen: true,
}

function withFieldGroupChrome(
  overrides: Partial<FieldGroupChromeClassNames>,
): FieldGroupChromeClassNames {
  return { ...PLAIN_FIELD_GROUP_CHROME, ...overrides }
}

function resolveInsetChrome(chrome: FieldGroupInsetChrome): FieldGroupChromeClassNames {
  return withFieldGroupChrome({
    body: fieldGroupInsetBodyVariants({ tone: chrome.tone ?? 'border' }),
  })
}

function resolvePanelChrome(chrome: FieldGroupPanelChrome): FieldGroupChromeClassNames {
  return withFieldGroupChrome({
    body: cn(fieldGroupBodyShellLayoutClasses, resolveFieldGroupPanelToneClasses(chrome.tone)),
  })
}

function resolveOutlineChrome(chrome: FieldGroupOutlineChrome): FieldGroupChromeClassNames {
  return withFieldGroupChrome({
    body: cn(
      fieldGroupBodyShellLayoutClasses,
      'bg-transparent',
      resolveFieldGroupOutlineToneClasses(chrome.tone),
    ),
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

function resolveCalloutChrome(chrome: FieldGroupCalloutChrome): FieldGroupChromeClassNames {
  return withFieldGroupChrome({
    body: resolveCalloutBodyClasses(chrome.tone),
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

function resolveCollapsibleChrome(chrome: FieldGroupCollapsibleChrome): FieldGroupChromeClassNames {
  return withFieldGroupChrome({
    isCollapsible: true,
    defaultOpen: chrome.defaultOpen ?? true,
    collapseKey: chrome.collapseKey,
  })
}

/** Resolves fieldset, legend, and body classes for a group fieldsChrome config. */
export function resolveFieldGroupChromeClassNames(
  chrome: FieldGroupFieldsChrome | undefined,
): FieldGroupChromeClassNames {
  const resolved = chrome ?? { variant: 'plain' as const }

  switch (resolved.variant) {
    case 'plain':
      return PLAIN_FIELD_GROUP_CHROME
    case 'inset':
      return resolveInsetChrome(resolved)
    case 'panel':
      return resolvePanelChrome(resolved)
    case 'outline':
      return resolveOutlineChrome(resolved)
    case 'divider':
      return resolveDividerChrome(resolved)
    case 'callout':
      return resolveCalloutChrome(resolved)
    case 'accent':
      return resolveAccentChrome(resolved)
    case 'collapsible':
      return resolveCollapsibleChrome(resolved)
    default:
      return PLAIN_FIELD_GROUP_CHROME
  }
}
