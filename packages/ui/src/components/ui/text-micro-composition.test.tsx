import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { SemanticText } from './semantic-text/semantic-text'
import { Text } from './text'

const uiDir = dirname(fileURLToPath(import.meta.url))
const globalsCss = join(uiDir, '../../styles/globals.css')
const semanticTextCss = join(uiDir, 'semantic-text/semantic-text.css')

function readUtilityBlock(css: string, utilityName: string): string {
  const start = css.indexOf(`@utility ${utilityName}`)
  expect(start).toBeGreaterThan(-1)
  const next = css.indexOf('@utility', start + 1)
  return next === -1 ? css.slice(start) : css.slice(start, next)
}

const COMPOSITION_TEST_CSS = `
  :root {
    --text-fine-xs: 10px;
    --text-fine-xs--line-height: 14px;
    --text-xs: 12px;
    --text-xs--line-height: 16px;
    --font-weight-normal: 400;
    --muted-foreground: #666666;
  }
  .text-style-micro {
    font-size: 10px;
    line-height: 14px;
    font-weight: 400;
    color: #666666;
  }
  .ui-semantic-text {
    display: inline-flex;
    font-size: 12px;
    line-height: 16px;
  }
  .text-style-micro .ui-semantic-text {
    font-size: inherit;
    line-height: inherit;
  }
`

function installCompositionStyles(): HTMLStyleElement {
  const style = document.createElement('style')
  style.setAttribute('data-test', 'text-micro-composition')
  style.textContent = COMPOSITION_TEST_CSS
  document.head.appendChild(style)
  return style
}

function px(value: string): number {
  return Number.parseFloat(value)
}

describe('Text micro + SemanticText composition (Phase 1)', () => {
  let styleEl: HTMLStyleElement | undefined

  afterEach(() => {
    styleEl?.remove()
    styleEl = undefined
  })

  it('defines text-style-micro and fine-xs line-height in globals', () => {
    const globals = readFileSync(globalsCss, 'utf8')
    expect(globals).toContain('--text-fine-xs--line-height: 0.875rem')

    const block = readUtilityBlock(globals, 'text-style-micro')
    expect(block).toContain('font-size: var(--text-fine-xs)')
    expect(block).toContain('line-height: var(--text-fine-xs--line-height)')
    expect(block).toContain('font-weight: var(--font-weight-normal)')
    expect(block).toContain('color: var(--muted-foreground)')
    expect(block).toContain('--icon-inline: var(--icon-glyph-xs)')
  })

  it('keeps the micro-scoped inherit rule and standalone xs block on SemanticText', () => {
    const css = readFileSync(semanticTextCss, 'utf8')
    expect(css).toContain('.text-style-micro .ui-semantic-text')
    expect(css).toMatch(/\.ui-semantic-text\s*\{[^}]*font-size:\s*var\(--text-xs\)/)
    expect(css).not.toMatch(/text-style-caption\s+\.ui-semantic-text/)
  })

  it('inherits micro metrics on nested SemanticText and keeps 12px when unowned', () => {
    styleEl = installCompositionStyles()

    const { rerender } = render(
      <Text as="span" variant="micro" data-testid="owner">
        <SemanticText tone="success" emphasis="medium">
          Ready
        </SemanticText>
      </Text>,
    )

    const owner = screen.getByTestId('owner')
    const nested = screen.getByText('Ready')
    expect(nested).toHaveClass('ui-semantic-text')
    expect(px(getComputedStyle(owner).fontSize)).toBe(10)
    expect(px(getComputedStyle(owner).lineHeight)).toBe(14)

    rerender(<SemanticText tone="neutral">Standalone</SemanticText>)
    const standalone = screen.getByText('Standalone')
    expect(px(getComputedStyle(standalone).fontSize)).toBe(12)
    expect(px(getComputedStyle(standalone).lineHeight)).toBe(16)
  })
})
