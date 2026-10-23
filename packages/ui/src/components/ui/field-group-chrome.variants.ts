import { cn } from '../../lib/utils'
import type { BorderStrength } from './border-strength'
import { borderStrength } from './border-strength'
import { resolveChromeClasses } from './chrome.variants'
import type { FieldRhythm } from './field.variants'
import { resolveFieldRailClasses, type FieldRailTone } from './field-rail.variants'
import type {
  ChromeBorderAccent,
  ChromeConfig,
  SemanticTone,
  SurfaceElevation,
  VisualEmphasis,
} from './visual-vocabulary.types'

/** Neutral structural rail vs brand accent on the field stack. */
export type FieldGroupRailTone = FieldRailTone

/** Divider border contrast — not a color tone. */
export type FieldGroupDividerStrength = Extract<BorderStrength, 'default' | 'subtle'>

/** Divider edge for group section separation. */
export type FieldGroupDividerEdge = 'top' | 'bottom'

/** Accent edge placement for light group emphasis. */
export type FieldGroupAccentEdge = 'top' | 'legendRail'

/** Status hues for accent chrome (neutral and primary use {@link FieldGroupRailTone}). */
export type FieldGroupAccentStatusTone = Exclude<SemanticTone, 'neutral'>

export type FieldGroupAccentTone = FieldGroupRailTone | FieldGroupAccentStatusTone

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

/** Rail stack chrome — `inset` is an alias with the same shape as `rail` (prefer `rail`). */
type FieldGroupRailStackChrome =
  | FieldGroupRailChrome
  | { variant: 'inset'; tone?: FieldGroupRailTone }

export interface FieldGroupDividerChrome {
  variant: 'divider'
  edge?: FieldGroupDividerEdge
  strength?: FieldGroupDividerStrength
}

export interface FieldGroupAccentChrome {
  variant: 'accent'
  edge: FieldGroupAccentEdge
  tone?: FieldGroupAccentTone
}

/** Visual treatment for the field stack inside a group — variants are mutually exclusive. */
export type FieldGroupChrome =
  | { variant: 'plain' }
  | FieldGroupRailStackChrome
  | FieldGroupDividerChrome
  | FieldGroupAccentChrome
  | FieldGroupComposableChrome

function resolveFieldGroupRailInsetClass(rhythm: FieldRhythm): string {
  return rhythm === 'compact'
    ? 'ui-field-group-chrome--rail-compact'
    : 'ui-field-group-chrome--rail-comfortable'
}

function resolveFieldGroupDividerFieldsetClasses(chrome: FieldGroupDividerChrome): string {
  const edge = chrome.edge ?? 'top'
  const strength = chrome.strength ?? 'default'
  return cn(
    edge === 'top' ? 'ui-field-group-chrome--divider-top' : 'ui-field-group-chrome--divider-bottom',
    borderStrength(strength),
  )
}

function resolveAccentTopFieldsetClasses(tone: FieldGroupAccentTone = 'neutral'): string {
  const base = 'ui-field-group-chrome--accent-top'
  if (tone === 'neutral') {
    return cn(base, borderStrength('default'))
  }
  if (tone === 'primary') {
    return cn(base, 'ui-field-group-chrome--accent-top-tone-primary')
  }
  return cn(base, `ui-field-group-chrome--accent-top-tone-${tone}`)
}

function resolveLegendRailClasses(tone: FieldGroupAccentTone = 'neutral'): string {
  const base = 'ui-field-group-chrome__legend-rail'
  if (tone === 'neutral') {
    return cn(base, 'ui-border--default', 'ui-field-group-chrome__legend-rail--tone-neutral')
  }
  if (tone === 'primary') {
    return cn(base, 'ui-field-group-chrome__legend-rail--tone-primary')
  }
  return cn(base, `ui-field-group-chrome__legend-rail--tone-${tone}`)
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
  chrome: FieldGroupRailStackChrome,
  rhythm: FieldRhythm,
): FieldGroupChromeClassNames {
  const tone = chrome.tone ?? 'neutral'
  return withFieldGroupChrome({
    body: cn(resolveFieldRailClasses(tone), resolveFieldGroupRailInsetClass(rhythm)),
  })
}

function resolveComposableChrome(chrome: FieldGroupComposableChrome): FieldGroupChromeClassNames {
  return withFieldGroupChrome({
    body: resolveChromeClasses(chrome as ChromeConfig),
  })
}

function resolveDividerChrome(chrome: FieldGroupDividerChrome): FieldGroupChromeClassNames {
  return withFieldGroupChrome({
    fieldset: resolveFieldGroupDividerFieldsetClasses(chrome),
  })
}

function resolveAccentChrome(chrome: FieldGroupAccentChrome): FieldGroupChromeClassNames {
  const tone = chrome.tone ?? 'neutral'
  return withFieldGroupChrome({
    fieldset: chrome.edge === 'top' ? resolveAccentTopFieldsetClasses(tone) : '',
    legend: chrome.edge === 'legendRail' ? resolveLegendRailClasses(tone) : '',
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
  rail: (chrome, rhythm) => resolveGroupRailChrome(chrome as FieldGroupRailStackChrome, rhythm),
  inset: (chrome, rhythm) => resolveGroupRailChrome(chrome as FieldGroupRailStackChrome, rhythm),
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
