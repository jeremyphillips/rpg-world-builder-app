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

const COPY_TOKENS = `
  :root {
    --text-xs: 12px;
    --text-sm: 14px;
    --text-base: 16px;
    --text-heading-card: 19px;
    --text-xs--line-height: 16px;
    --text-sm--line-height: 20px;
    --text-base--line-height: 24px;
    --text-heading-card--line-height: 25px;
    --spacing: 4px;
    --tracking-heading: 0;
  }
`

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
function resolvedCopySize(
  testId: string,
  property: '--ui-copy-title-size' | '--ui-copy-supporting-size',
) {
  let node: Element | null = screen.getByTestId(testId)
  while (node) {
    const specified = getComputedStyle(node).getPropertyValue(property).trim()
    const token = specified.match(/^var\((--[^)]+)\)$/)?.[1]
    if (token && TOKEN_PX[token]) return TOKEN_PX[token]
    node = node.parentElement
  }
  return property === '--ui-copy-title-size' ? '16px' : '14px'
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
})
