import { cn } from '../../lib/utils'
import type { ChromeConfig, SupportedSemanticChrome } from './visual-vocabulary.types'

type SupportedChromeKey = 'warning:faint' | 'warning:subtle' | 'neutral:subtle'

const CHROME_ACCENT_RAIL_LAYOUT_CLASSES =
  'relative before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:content-[""]'

const CHROME_SHELL_RECIPE: Record<SupportedChromeKey, string> = {
  'warning:faint': 'border border-border-subtle bg-warning-faint',
  'warning:subtle': 'border border-warning-muted bg-warning-subtle',
  'neutral:subtle': 'border border-border-subtle bg-surface-muted',
}

const CHROME_ACCENT_RECIPE: Partial<Record<SupportedChromeKey, string>> = {
  'warning:faint': 'before:bg-semantic-warning-accent-faint',
  'warning:subtle': 'before:bg-semantic-warning-border',
}

function chromeKey(chrome: SupportedSemanticChrome): SupportedChromeKey {
  if (chrome.tone === 'warning') {
    return chrome.emphasis === 'faint' ? 'warning:faint' : 'warning:subtle'
  }
  return 'neutral:subtle'
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

export function resolveChromeClasses(chrome: ChromeConfig | undefined): string {
  if (!chrome || chrome.variant === 'plain') return ''

  if (chrome.variant === 'accent' && isSupportedSemanticChrome(chrome)) {
    return cn(
      'flex flex-col gap-2 rounded-md p-3',
      resolveChromeShellClasses(chrome),
      resolveChromeAccentClasses(chrome),
    )
  }

  return ''
}
