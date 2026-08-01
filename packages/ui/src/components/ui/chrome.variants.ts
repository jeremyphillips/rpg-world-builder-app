import { cn } from '../../lib/utils'
import { type AlertVariant, ALERT_VARIANTS } from './alert.variants'
import { compactLabelAppearanceToneClasses } from './compact-label.lib'
import {
  fieldGroupBodyShellLayoutClasses,
  fieldShellLayoutClasses,
  resolveOutlineBorderClasses,
} from './field-surface.variants'
import { establishSurfaceCurrent } from './surface-current.lib'
import {
  DEFAULT_PANEL_SURFACE,
  resolveSurfaceClasses,
  type SemanticSurfaceTone,
} from './surface.variants'
import type { ChromeConfig, SupportedSemanticChrome } from './visual-vocabulary.types'

export type ChromeBodyLayout = 'group' | 'field' | 'summary-accent' | 'callout'

type SupportedChromeKey = 'warning:faint' | 'warning:subtle' | 'neutral:subtle'

const CHROME_ACCENT_RAIL_LAYOUT_CLASSES =
  'relative before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:rounded-full before:content-[""]'

const CHROME_SHELL_RECIPE: Record<SupportedChromeKey, string> = {
  'warning:faint': 'border border-border-subtle bg-warning-faint',
  'warning:subtle': 'border border-warning-muted bg-warning-subtle',
  'neutral:subtle': cn(
    'border border-border-subtle bg-surface-muted',
    establishSurfaceCurrent('surface-muted'),
  ),
}

const CHROME_ACCENT_RECIPE: Partial<Record<SupportedChromeKey, string>> = {
  'warning:faint': 'before:bg-semantic-warning-accent-faint',
  'warning:subtle': 'before:bg-semantic-warning-border',
}

const CALLOUT_ALERT_SURFACE: Record<AlertVariant, string> = {
  default: cn(
    'border-border bg-surface-muted text-foreground',
    establishSurfaceCurrent('surface-muted'),
  ),
  info: 'border-info-muted bg-info-subtle text-foreground',
  success: 'border-success-muted bg-success-subtle text-foreground',
  warning: 'border-warning-muted bg-warning-subtle text-foreground',
  destructive: 'border-destructive-muted bg-destructive-subtle text-foreground',
}

function chromeKey(chrome: SupportedSemanticChrome): SupportedChromeKey {
  if (chrome.tone === 'warning') {
    return chrome.emphasis === 'faint' ? 'warning:faint' : 'warning:subtle'
  }
  return 'neutral:subtle'
}

function isAlertVariant(value: string): value is AlertVariant {
  return (ALERT_VARIANTS as readonly string[]).includes(value)
}

function resolvePanelSurfaceConfig(chrome: ChromeConfig) {
  const { tone, emphasis, elevation } = chrome

  if (tone && tone !== 'neutral') {
    return {
      tone: tone as SemanticSurfaceTone,
      emphasis: emphasis ?? 'subtle',
      elevation,
    }
  }

  return {
    emphasis: emphasis ?? DEFAULT_PANEL_SURFACE.emphasis,
    elevation: elevation ?? DEFAULT_PANEL_SURFACE.elevation,
  }
}

function resolveChromeBodyLayoutClasses(layout: ChromeBodyLayout, paddingClasses = ''): string {
  switch (layout) {
    case 'field':
      return cn(fieldShellLayoutClasses, paddingClasses)
    case 'summary-accent':
      return 'flex flex-col gap-2 rounded-tr-md rounded-br-md rounded-tl-none rounded-bl-none p-3'
    case 'callout':
      return 'rounded-lg border p-4'
    case 'group':
    default:
      return fieldGroupBodyShellLayoutClasses
  }
}

function resolveCalloutShellClasses(chrome: ChromeConfig): string {
  const tone = chrome.tone ?? 'info'

  if (tone === 'neutral') {
    return compactLabelAppearanceToneClasses('soft', 'neutral')
  }

  if (isAlertVariant(tone)) {
    return CALLOUT_ALERT_SURFACE[tone]
  }

  return resolveSurfaceClasses({ tone, emphasis: chrome.emphasis ?? 'subtle' })
}

export function isSupportedSemanticChrome(
  chrome: ChromeConfig,
): chrome is ChromeConfig & SupportedSemanticChrome {
  if (!chrome.tone || !chrome.emphasis) return false

  if (chrome.tone === 'warning') {
    return chrome.emphasis === 'faint' || chrome.emphasis === 'subtle'
  }

  return chrome.tone === 'neutral' && chrome.emphasis === 'subtle'
}

export function resolveChromeShellClasses(chrome: SupportedSemanticChrome): string {
  return CHROME_SHELL_RECIPE[chromeKey(chrome)]
}

export function resolveChromeAccentClasses(chrome: SupportedSemanticChrome): string {
  const accent = CHROME_ACCENT_RECIPE[chromeKey(chrome)]
  if (!accent) return ''
  return cn(CHROME_ACCENT_RAIL_LAYOUT_CLASSES, accent)
}

export function resolveChromePanelClasses(
  chrome: ChromeConfig,
  layout: ChromeBodyLayout = 'group',
  paddingClasses = '',
): string {
  return cn(
    resolveChromeBodyLayoutClasses(layout, paddingClasses),
    resolveSurfaceClasses(resolvePanelSurfaceConfig(chrome)),
  )
}

export function resolveChromeOutlineClasses(
  chrome: ChromeConfig,
  layout: ChromeBodyLayout = 'group',
  paddingClasses = '',
): string {
  return cn(
    resolveChromeBodyLayoutClasses(layout, paddingClasses),
    layout === 'group' || layout === 'field' ? 'bg-transparent' : '',
    resolveOutlineBorderClasses(chrome.emphasis, chrome.tone, chrome.borderAccent),
  )
}

export function resolveChromeCalloutClasses(chrome: ChromeConfig): string {
  return cn(resolveChromeBodyLayoutClasses('callout'), resolveCalloutShellClasses(chrome))
}

function resolveAccentChromeClasses(chrome: ChromeConfig): string {
  if (!isSupportedSemanticChrome(chrome)) return ''
  return cn(
    resolveChromeBodyLayoutClasses('summary-accent'),
    resolveChromeShellClasses(chrome),
    resolveChromeAccentClasses(chrome),
  )
}

type ChromeResolveOptions = { layout: ChromeBodyLayout; paddingClasses: string }

function resolveVariantChromeClasses(chrome: ChromeConfig, options: ChromeResolveOptions): string {
  if (chrome.variant === 'accent') return resolveAccentChromeClasses(chrome)
  if (chrome.variant === 'panel') {
    return resolveChromePanelClasses(chrome, options.layout, options.paddingClasses)
  }
  if (chrome.variant === 'outline') {
    return resolveChromeOutlineClasses(chrome, options.layout, options.paddingClasses)
  }
  if (chrome.variant === 'callout') return resolveChromeCalloutClasses(chrome)
  return ''
}

export function resolveChromeClasses(
  chrome: ChromeConfig | undefined,
  options?: { layout?: ChromeBodyLayout; paddingClasses?: string },
): string {
  if (!chrome || chrome.variant === 'plain') return ''

  return resolveVariantChromeClasses(chrome, {
    layout: options?.layout ?? 'group',
    paddingClasses: options?.paddingClasses ?? '',
  })
}
