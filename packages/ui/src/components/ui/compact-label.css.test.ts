import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const uiDir = join(dirname(fileURLToPath(import.meta.url)), '.')
const stylesDir = join(uiDir, '../../styles')

function readUtilityBlock(css: string, utilityName: string): string {
  const start = css.indexOf(`@utility ${utilityName}`)
  expect(start).toBeGreaterThan(-1)
  const next = css.indexOf('@utility', start + 1)
  return next === -1 ? css.slice(start) : css.slice(start, next)
}

function expectSurfaceRelativeNeutralBorderMix(block: string): void {
  expect(block).toContain('color-mix')
  expect(block).toContain('in oklch')
  expect(block).toContain('var(--foreground)')
  expect(block).toContain('var(--mix-border-default)')
  expect(block).toContain('var(--surface-current)')
}

describe('compact-label.css neutral borders', () => {
  const compactLabelCss = readFileSync(join(uiDir, 'compact-label.css'), 'utf8')
  const surfaceUtilitiesCss = readFileSync(
    join(stylesDir, 'surface-relative-chrome.utilities.css'),
    'utf8',
  )

  it('matches border-semantic-neutral-border mix ingredients (surface-relative at use time)', () => {
    const utilityBlock = readUtilityBlock(surfaceUtilitiesCss, 'border-semantic-neutral-border')
    expectSurfaceRelativeNeutralBorderMix(utilityBlock)

    expect(compactLabelCss).toContain('--ui-compact-label-border: color-mix(')
    expectSurfaceRelativeNeutralBorderMix(compactLabelCss)
    expect(compactLabelCss).not.toContain('--color-semantic-neutral-border')
  })

  it('applies the surface-relative neutral border mix on each neutral appearance modifier', () => {
    for (const modifier of [
      'ui-compact-label--outline-neutral',
      'ui-compact-label--soft-neutral',
      'ui-compact-label--strong-neutral',
    ]) {
      const block = compactLabelCss.match(new RegExp(`\\.${modifier}\\s*\\{[^}]+\\}`))?.[0]
      expect(block, modifier).toBeDefined()
      expectSurfaceRelativeNeutralBorderMix(block ?? '')
    }
  })
})
