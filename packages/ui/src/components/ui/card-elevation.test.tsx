import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { cardSurfaceVariants } from './card.variants'

const cardCssPath = join(dirname(fileURLToPath(import.meta.url)), 'card.css')

const SHADOW_TOKENS = `
  :root {
    --shadow-surface-subtle: 0 1px 2px rgba(0, 0, 0, 0.06);
    --shadow-surface-raised: inset 0 1px 0 rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.08);
  }
`

const ELEVATION_SHELL_CSS = `
  .ui-card { box-shadow: none; }
  .ui-card--elevation-subtle { box-shadow: var(--shadow-surface-subtle); }
  .ui-card--elevation-raised { box-shadow: var(--shadow-surface-raised); }
`

function installCardElevationCss() {
  const style = document.createElement('style')
  style.textContent = `${SHADOW_TOKENS}\n${ELEVATION_SHELL_CSS}`
  document.head.appendChild(style)
}

function shellBoxShadow(className: string) {
  const { container } = render(<div data-testid="shell" className={className} />)
  return getComputedStyle(container.firstElementChild!).boxShadow
}

describe('card elevation modifiers', () => {
  it('maps elevation props to modifier classes', () => {
    expect(cardSurfaceVariants({ tone: 'strong', elevation: 'flat' })).not.toContain(
      'ui-card--elevation',
    )
    expect(cardSurfaceVariants({ tone: 'strong', elevation: 'subtle' })).toContain(
      'ui-card--elevation-subtle',
    )
    expect(cardSurfaceVariants({ tone: 'strong', elevation: 'raised' })).toContain(
      'ui-card--elevation-raised',
    )
    expect(cardSurfaceVariants({ tone: 'quiet', elevation: 'subtle' })).toContain(
      'ui-card--elevation-subtle',
    )
  })

  it('declares tone-agnostic elevation rules in card.css', () => {
    const source = readFileSync(cardCssPath, 'utf8')
    expect(source).toMatch(/\.ui-card--elevation-subtle[\s\S]*var\(--shadow-surface-subtle\)/)
    expect(source).toMatch(/\.ui-card--elevation-raised[\s\S]*var\(--shadow-surface-raised\)/)
    expect(source).toMatch(/\.ui-card \{[\s\S]*box-shadow:\s*none/)
    expect(source).not.toMatch(/&\.ui-card--quiet[\s\S]*border-radius:\s*var\(--radius-md\)/)
    expect(source).not.toMatch(
      /&\.ui-card--strong[\s\S]*0 1px 2px 0 color-mix\(in oklab, var\(--foreground\) 6%/,
    )
  })

  it('resolves computed box-shadow for tone × elevation', () => {
    installCardElevationCss()
    const flatStrong = shellBoxShadow(cardSurfaceVariants({ tone: 'strong', elevation: 'flat' }))
    expect(flatStrong === 'none' || flatStrong === '').toBe(true)
    const flatQuiet = shellBoxShadow(cardSurfaceVariants({ tone: 'quiet', elevation: 'flat' }))
    expect(flatQuiet === 'none' || flatQuiet === '').toBe(true)
    expect(shellBoxShadow(cardSurfaceVariants({ tone: 'strong', elevation: 'subtle' }))).toBe(
      'var(--shadow-surface-subtle)',
    )
    expect(shellBoxShadow(cardSurfaceVariants({ tone: 'quiet', elevation: 'raised' }))).toBe(
      'var(--shadow-surface-raised)',
    )
  })
})
