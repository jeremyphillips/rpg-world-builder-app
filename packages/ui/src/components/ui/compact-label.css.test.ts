import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const uiDir = join(dirname(fileURLToPath(import.meta.url)), '.')
const stylesDir = join(uiDir, '../../styles')
const formChromePath = join(uiDir, '../../form/chrome/form-chrome.css')

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

describe('pill and badge surfaces', () => {
  const pillCss = readFileSync(join(uiDir, 'pill.css'), 'utf8')
  const badgeCss = readFileSync(join(uiDir, 'badge.css'), 'utf8')
  const uiBorderCss = readFileSync(join(uiDir, 'ui-border.css'), 'utf8')
  const surfaceUtilitiesCss = readFileSync(
    join(stylesDir, 'surface-relative-chrome.utilities.css'),
    'utf8',
  )
  const formChromeCss = readFileSync(formChromePath, 'utf8')

  it('matches border-semantic-neutral-border mix ingredients (surface-relative at use time)', () => {
    const utilityBlock = readUtilityBlock(surfaceUtilitiesCss, 'border-semantic-neutral-border')
    expectSurfaceRelativeNeutralBorderMix(utilityBlock)

    expectSurfaceRelativeNeutralBorderMix(uiBorderCss)
    expect(badgeCss).toContain('--ui-pill-border: var(--ui-border-color)')
    expect(badgeCss).not.toContain('--color-semantic-neutral-border')
    expect(pillCss).toContain('--ui-pill-bg: transparent')
    expect(pillCss).toContain('--ui-pill-border: transparent')
    expect(pillCss).toContain('color: var(--ui-pill-fg, inherit)')
  })

  it('keeps badge and chip size heights on their own modifiers', () => {
    expect(badgeCss).toContain('.ui-badge--sm')
    expect(badgeCss).toContain('height: 1.375rem; /* 22px */')
    expect(badgeCss).toContain('font-size: var(--text-fine-xs);')
    expect(badgeCss).toContain('.ui-badge--md')
    expect(badgeCss).toContain('height: 1.625rem; /* 26px */')
    expect(badgeCss).toContain('font-size: var(--text-xs);')
    expect(badgeCss).toContain('.ui-badge--lg')
    expect(badgeCss).toContain('height: 2rem; /* 32px */')
    expect(badgeCss).toContain('font-size: var(--text-sm);')
    expect(badgeCss).not.toContain('.ui-compact-label')
    expect(pillCss).not.toContain('height:')
  })

  it('applies the surface-relative neutral border mix on each neutral appearance modifier', () => {
    for (const modifier of [
      'ui-badge--outline-neutral',
      'ui-badge--soft-neutral',
      'ui-badge--strong-neutral',
    ]) {
      const block = badgeCss.match(new RegExp(`\\.${modifier}\\s*\\{[^}]+\\}`))?.[0]
      expect(block, modifier).toBeDefined()
      expect(block).toContain('--ui-pill-border: var(--ui-border-color)')
    }
  })

  it('keeps the issue-count compact rule after its size rule', () => {
    const sizeAt = formChromeCss.indexOf('.ui-array-item-issue-count {')
    const compactAt = formChromeCss.indexOf('.ui-array-item-issue-count--compact {')
    expect(sizeAt).toBeGreaterThan(-1)
    expect(compactAt).toBeGreaterThan(sizeAt)
    const compactBlock = formChromeCss.slice(compactAt, formChromeCss.indexOf('}', compactAt))
    expect(compactBlock).toContain('min-width:')
    expect(compactBlock).toContain('justify-content: center')
    expect(compactBlock).toContain('padding-inline:')
    expect(compactBlock).toContain('font-variant-numeric: tabular-nums')
    expect(compactBlock).toContain('line-height: 1')
    expect(formChromeCss).toContain('.ui-pill.ui-array-item-issue-count')
  })
})
