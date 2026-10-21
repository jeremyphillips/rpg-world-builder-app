import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

const copyScaleCss = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'copy-scale.css'),
  'utf8',
)
  .replace('@layer components {', '')
  .replace(/\n}\s*$/, '')

const COPY_TOKENS = `:root { --text-xs: 12px; --text-sm: 14px; --text-base: 16px; --text-heading-card: 19px; --text-xs--line-height: --text-sm--line-height: 20px; --text-base--line-height: 24px; --text-heading-card--line-height: 25px; --spacing: 4px; --tracking-heading: 0; }`

function installTokens() {
  const style = document.createElement('style')
  style.textContent = `${COPY_TOKENS}\n${copyScaleCss}`
  document.head.appendChild(style)
}

const TOKEN_PX: Record<string, string> = {
  '--text-xs': '12px',
  '--text-sm': '14px',
  '--text-base': '16px',
  '--text-heading-card': '19px',
}

/** jsdom keeps nested var() unevaluated. Resolve the copy variable the cascade would use. */
type CopySizeProperty =
  | '--ui-copy-title-size'
  | '--ui-copy-supporting-size'
  | '--ui-copy-classification-size'

function resolvedCopySize(testId: string, property: CopySizeProperty) {
  let node: Element | null = screen.getByTestId(testId)
  while (node) {
    const specified = getComputedStyle(node).getPropertyValue(property).trim()
    const token = specified.match(/^var\((--[^)]+)\)$/)?.[1]
    if (token && TOKEN_PX[token]) return TOKEN_PX[token]
    node = node.parentElement
  }
  if (property === '--ui-copy-title-size') return '16px'
  return '14px'
}

/** Resolve --ui-copy-classification-line-height from rem or line-height tokens on ancestors. */
function resolvedClassificationLineHeight(testId: string): string {
  const remPx: Record<string, string> = {
    '1.375rem': '22px',
  }
  let node: Element | null = screen.getByTestId(testId)
  while (node) {
    const specified = getComputedStyle(node)
      .getPropertyValue('--ui-copy-classification-line-height')
      .trim()
    if (remPx[specified]) return remPx[specified]
    const token = specified.match(/^var\((--[^)]+)\)$/)?.[1]
    if (token === '--text-xs--line-height') return '16px'
    if (token === '--text-sm--line-height') return '20px'
    node = node.parentElement
  }
  return '20px'
}

/** Resolve --ui-anatomy-leading-size from rem on ancestors. */
function resolvedAnatomyLeadingSize(testId: string): string {
  const remPx: Record<string, string> = {
    '2.5rem': '40px',
    '3.75rem': '60px',
  }
  let node: Element | null = screen.getByTestId(testId)
  while (node) {
    const specified = getComputedStyle(node).getPropertyValue('--ui-anatomy-leading-size').trim()
    if (remPx[specified]) return remPx[specified]
    node = node.parentElement
  }
  return '40px'
}

/** Resolve --ui-anatomy-row-gap from calc(var(--spacing) * N) on ancestors. */
function resolvedAnatomyRowGap(testId: string): string {
  let node: Element | null = screen.getByTestId(testId)
  while (node) {
    const specified = getComputedStyle(node).getPropertyValue('--ui-anatomy-row-gap').trim()
    const multiplier = specified.match(/\*\s*([\d.]+)\)/)?.[1]
    if (multiplier != null) {
      return `${4 * Number.parseFloat(multiplier)}px`
    }
    node = node.parentElement
  }
  return '4px'
}

/** Resolve --ui-copy-title-line-height from rem or var(--text-sm--line-height) on ancestors. */
function resolvedTitleLineHeight(testId: string): string {
  const remPx: Record<string, string> = {
    '1.375rem': '22px',
    '1.625rem': '26px',
  }
  let node: Element | null = screen.getByTestId(testId)
  while (node) {
    const specified = getComputedStyle(node).getPropertyValue('--ui-copy-title-line-height').trim()
    if (remPx[specified]) return remPx[specified]
    const token = specified.match(/^var\((--[^)]+)\)$/)?.[1]
    if (token === '--text-sm--line-height') return '20px'
    node = node.parentElement
  }
  return '22px'
}

describe('canonical copy scale', () => {
  it('uses comfortable 16/14 when no density ancestor is present', () => {
    installTokens()
    render(
      <>
        <span className="ui-copy-title" data-testid="title">
          Title
        </span>
        <span className="ui-copy-supporting" data-testid="supporting">
          Support
        </span>
      </>,
    )

    expect(getComputedStyle(screen.getByTestId('title')).fontSize).toContain('var(--text-base)')
    expect(getComputedStyle(screen.getByTestId('supporting')).fontSize).toContain('var(--text-sm)')
    expect(resolvedCopySize('title', '--ui-copy-title-size')).toBe('16px')
    expect(resolvedCopySize('supporting', '--ui-copy-supporting-size')).toBe('14px')
    expect(
      getComputedStyle(document.documentElement).getPropertyValue('--ui-copy-classification-size'),
    ).toContain('var(--text-sm)')
  })

  it('inherits the surface density and lets an explicit child density override it', () => {
    installTokens()
    render(
      <div className="ui-destination-list ui-destination-list--compact">
        <span className="ui-copy-title" data-testid="inherited">
          Inherited
        </span>
        <div className="dash-entity-anatomy dash-entity-anatomy--spacious">
          <span className="ui-copy-title" data-testid="override">
            Override
          </span>
          <span className="ui-copy-supporting" data-testid="override-supporting">
            Support
          </span>
        </div>
      </div>,
    )

    expect(resolvedCopySize('inherited', '--ui-copy-title-size')).toBe('14px')
    expect(resolvedCopySize('override', '--ui-copy-title-size')).toBe('19px')
    expect(resolvedCopySize('override-supporting', '--ui-copy-supporting-size')).toBe('14px')
    expect(resolvedCopySize('override', '--ui-copy-classification-size')).toBe('16px')
    expect(
      getComputedStyle(screen.getByTestId('inherited').parentElement!).getPropertyValue(
        '--ui-anatomy-trailing-gap',
      ),
    ).toContain('* 2')
    expect(
      getComputedStyle(screen.getByTestId('override').parentElement!).getPropertyValue(
        '--ui-anatomy-trailing-gap',
      ),
    ).toContain('* 3')
    expect(
      getComputedStyle(screen.getByTestId('override').parentElement!).getPropertyValue(
        '--entity-leading-content-gap',
      ),
    ).toContain('* 3')
  })

  it('publishes spacious 19/14 from a card shell', () => {
    installTokens()
    render(
      <div className="ui-card ui-card--spacious">
        <span className="ui-copy-title" data-testid="title">
          Title
        </span>
        <span className="ui-copy-supporting" data-testid="supporting">
          Support
        </span>
      </div>,
    )

    expect(resolvedCopySize('title', '--ui-copy-title-size')).toBe('19px')
    expect(resolvedCopySize('supporting', '--ui-copy-supporting-size')).toBe('14px')
    expect(resolvedCopySize('title', '--ui-copy-classification-size')).toBe('16px')
    expect(resolvedClassificationLineHeight('title')).toBe('22px')
  })

  it('publishes classification 12 / 14 / 16px by density', () => {
    installTokens()
    render(
      <>
        <div className="ui-card ui-card--compact">
          <span data-testid="compact-class">x</span>
        </div>
        <div className="ui-card ui-card--comfortable">
          <span data-testid="comfortable-class">x</span>
        </div>
        <div className="ui-card ui-card--spacious">
          <span data-testid="spacious-class">x</span>
        </div>
        <span data-testid="root-class">x</span>
      </>,
    )

    expect(resolvedCopySize('compact-class', '--ui-copy-classification-size')).toBe('12px')
    expect(resolvedClassificationLineHeight('compact-class')).toBe('16px')
    expect(resolvedCopySize('comfortable-class', '--ui-copy-classification-size')).toBe('14px')
    expect(resolvedClassificationLineHeight('comfortable-class')).toBe('20px')
    expect(resolvedCopySize('spacious-class', '--ui-copy-classification-size')).toBe('16px')
    expect(resolvedClassificationLineHeight('spacious-class')).toBe('22px')
    expect(resolvedCopySize('root-class', '--ui-copy-classification-size')).toBe('14px')
    expect(resolvedClassificationLineHeight('root-class')).toBe('20px')
  })

  it('maps interactive list size onto the same ladder', () => {
    installTokens()
    render(
      <>
        <div className="ui-interactive-list__main--sm">
          <span className="ui-copy-title" data-testid="sm">
            Small
          </span>
        </div>
        <div className="ui-interactive-list__main--md">
          <span className="ui-copy-title" data-testid="md">
            Medium
          </span>
        </div>
        <div className="ui-interactive-list__main--lg">
          <span className="ui-copy-title" data-testid="lg">
            Large
          </span>
        </div>
      </>,
    )

    expect(resolvedCopySize('sm', '--ui-copy-title-size')).toBe('14px')
    expect(resolvedCopySize('md', '--ui-copy-title-size')).toBe('16px')
    expect(resolvedCopySize('lg', '--ui-copy-title-size')).toBe('19px')
  })

  it('publishes anatomy row gap 2 / 4 / 6px by density', () => {
    installTokens()
    render(
      <>
        <div className="ui-card ui-card--compact" data-testid="compact">
          <span data-testid="compact-gap">x</span>
        </div>
        <div className="ui-card ui-card--comfortable" data-testid="comfortable">
          <span data-testid="comfortable-gap">x</span>
        </div>
        <div className="ui-card ui-card--spacious" data-testid="spacious">
          <span data-testid="spacious-gap">x</span>
        </div>
        <span data-testid="root-gap">x</span>
      </>,
    )

    expect(resolvedAnatomyRowGap('compact-gap')).toBe('2px')
    expect(resolvedAnatomyRowGap('comfortable-gap')).toBe('4px')
    expect(resolvedAnatomyRowGap('spacious-gap')).toBe('6px')
    expect(resolvedAnatomyRowGap('root-gap')).toBe('4px')
  })

  it('publishes anatomy leading size 40 / 40 / 60px by density', () => {
    installTokens()
    render(
      <>
        <div className="ui-card ui-card--compact">
          <span data-testid="compact-leading">x</span>
        </div>
        <div className="ui-card ui-card--comfortable">
          <span data-testid="comfortable-leading">x</span>
        </div>
        <div className="ui-card ui-card--spacious">
          <span data-testid="spacious-leading">x</span>
        </div>
        <span data-testid="root-leading">x</span>
      </>,
    )

    expect(resolvedAnatomyLeadingSize('compact-leading')).toBe('40px')
    expect(resolvedAnatomyLeadingSize('comfortable-leading')).toBe('40px')
    expect(resolvedAnatomyLeadingSize('spacious-leading')).toBe('60px')
    expect(resolvedAnatomyLeadingSize('root-leading')).toBe('40px')
  })

  it('lets a nested density override anatomy row gap', () => {
    installTokens()
    render(
      <div className="ui-destination-list ui-destination-list--compact">
        <div className="dash-entity-anatomy dash-entity-anatomy--spacious">
          <span data-testid="nested-gap">x</span>
        </div>
      </div>,
    )

    expect(resolvedAnatomyRowGap('nested-gap')).toBe('6px')
  })

  it('applies heading weight on ui-copy-title via copy-scale.css', () => {
    expect(copyScaleCss).toMatch(
      /\.ui-copy-title[\s\S]*font-weight:\s*var\(--font-weight-heading\)/,
    )
  })

  it('publishes anatomy title line-height 20 / 22 / 26px by density', () => {
    installTokens()
    render(
      <>
        <div className="ui-card ui-card--compact">
          <span className="ui-copy-title" data-testid="compact-lh">
            x
          </span>
        </div>
        <div className="ui-card ui-card--comfortable">
          <span className="ui-copy-title" data-testid="comfortable-lh">
            x
          </span>
        </div>
        <div className="ui-card ui-card--spacious">
          <span className="ui-copy-title" data-testid="spacious-lh">
            x
          </span>
        </div>
        <span className="ui-copy-title" data-testid="root-lh">
          x
        </span>
      </>,
    )

    expect(resolvedTitleLineHeight('compact-lh')).toBe('20px')
    expect(resolvedTitleLineHeight('comfortable-lh')).toBe('22px')
    expect(resolvedTitleLineHeight('spacious-lh')).toBe('26px')
    expect(resolvedTitleLineHeight('root-lh')).toBe('22px')
  })
})
