import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  isSupportedSemanticChrome,
  resolveChromeAccentClasses,
  resolveChromeClasses,
  resolveChromeShellClasses,
} from './chrome.variants'

const APPROVED_CHROME_SHELL_TOKENS = [
  'border',
  'border-border-subtle',
  'border-warning-muted',
  'bg-warning-faint',
  'bg-warning-subtle',
  'bg-surface-muted',
] as const

const APPROVED_CHROME_ACCENT_TOKENS = [
  'relative',
  'before:absolute',
  'before:inset-y-2',
  'before:left-0',
  'before:w-0.5',
  'before:rounded-full',
  'before:content-[""]',
  'before:bg-semantic-warning-accent-faint',
  'before:bg-semantic-warning-border',
] as const

const APPROVED_CHROME_LAYOUT_TOKENS = [
  'flex',
  'flex-col',
  'gap-2',
  'rounded-md',
  'p-3',
  ...APPROVED_CHROME_SHELL_TOKENS,
  ...APPROVED_CHROME_ACCENT_TOKENS,
] as const

function expectOnlyApprovedTokens(classes: string, approved: readonly string[]) {
  const tokens = classes.split(/\s+/).filter(Boolean)
  for (const token of tokens) {
    expect(approved).toContain(token)
  }
}

describe('chrome.variants', () => {
  it('resolves warning faint shell with neutral perimeter and faint wash', () => {
    const classes = resolveChromeShellClasses({ tone: 'warning', emphasis: 'faint' })
    expect(classes).toContain('bg-warning-faint')
    expect(classes).toContain('border-border-subtle')
    expect(classes).not.toContain('bg-warning-subtle')
    expectOnlyApprovedTokens(classes, APPROVED_CHROME_SHELL_TOKENS)
  })

  it('resolves warning subtle shell with semantic perimeter', () => {
    const classes = resolveChromeShellClasses({ tone: 'warning', emphasis: 'subtle' })
    expect(classes).toContain('bg-warning-subtle')
    expect(classes).toContain('border-warning-muted')
    expectOnlyApprovedTokens(classes, APPROVED_CHROME_SHELL_TOKENS)
  })

  it('resolves neutral subtle shell without accent rail', () => {
    const classes = resolveChromeShellClasses({ tone: 'neutral', emphasis: 'subtle' })
    expect(classes).toContain('bg-surface-muted')
    expect(resolveChromeAccentClasses({ tone: 'neutral', emphasis: 'subtle' })).toBe('')
  })

  it('resolves warning faint accent pseudo-rail', () => {
    const classes = resolveChromeAccentClasses({ tone: 'warning', emphasis: 'faint' })
    expect(classes).toContain('before:bg-semantic-warning-accent-faint')
    expect(classes).not.toContain('border-l-2')
    expectOnlyApprovedTokens(classes, APPROVED_CHROME_ACCENT_TOKENS)
  })

  it('composes accent chrome shell and rail', () => {
    const classes = resolveChromeClasses({
      variant: 'accent',
      tone: 'warning',
      emphasis: 'faint',
    })
    expect(classes).toContain('bg-warning-faint')
    expect(classes).toContain('before:bg-semantic-warning-accent-faint')
    expectOnlyApprovedTokens(classes, APPROVED_CHROME_LAYOUT_TOKENS)
  })

  it('resolves panel chrome with default subtle wash', () => {
    const classes = resolveChromeClasses({ variant: 'panel' })
    expect(classes).toContain('bg-surface-subtle')
    expect(classes).toContain('p-4')
  })

  it('resolves callout info shell', () => {
    const classes = resolveChromeClasses({ variant: 'callout', tone: 'info' })
    expect(classes).toContain('bg-info-subtle')
    expect(classes).toContain('rounded-lg')
  })

  it('returns empty classes for plain or unsupported chrome', () => {
    expect(resolveChromeClasses(undefined)).toBe('')
    expect(resolveChromeClasses({ variant: 'plain' })).toBe('')
    expect(resolveChromeClasses({ variant: 'accent', tone: 'info', emphasis: 'subtle' })).toBe('')
  })

  it('narrows supported semantic chrome combos', () => {
    expect(
      isSupportedSemanticChrome({ variant: 'accent', tone: 'warning', emphasis: 'faint' }),
    ).toBe(true)
    expect(
      isSupportedSemanticChrome({ variant: 'accent', tone: 'destructive', emphasis: 'faint' }),
    ).toBe(false)
  })
})

describe('warning-faint semantic tokens', () => {
  const tokensDir = join(dirname(fileURLToPath(import.meta.url)), '../../styles/tokens')
  const globalsCss = join(dirname(fileURLToPath(import.meta.url)), '../../styles/globals.css')

  it('declares warning-faint tokens in semantic themes and globals', () => {
    const semanticLight = readFileSync(join(tokensDir, 'semantic-light.css'), 'utf8')
    const semanticDark = readFileSync(join(tokensDir, 'semantic-dark.css'), 'utf8')
    const globals = readFileSync(globalsCss, 'utf8')

    for (const css of [semanticLight, semanticDark, globals]) {
      expect(css).toContain('--warning-faint')
      expect(css).toContain('--semantic-warning-accent-faint')
    }
  })
})
