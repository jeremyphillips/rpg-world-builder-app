import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { SemanticText } from './semantic-text/semantic-text'
import { Text } from './text'

const uiDir = dirname(fileURLToPath(import.meta.url))
const tailwindThemeCss = join(uiDir, '../../styles/tokens/tailwind-theme.css')
const typographyUtilitiesCss = join(uiDir, '../../styles/typography.utilities.css')
const semanticTextCss = join(uiDir, 'semantic-text/semantic-text.css')

function readUtilityBlock(css: string, utilityName: string): string {
  const start = css.indexOf(`@utility ${utilityName}`)
  expect(start).toBeGreaterThan(-1)
  const next = css.indexOf('@utility', start + 1)
  return next === -1 ? css.slice(start) : css.slice(start, next)
}

const PREVIEW_RAIL_COMPOSITION_CSS = `
  .text-style-micro {
    font-size: 10px;
    line-height: 14px;
  }
  .ui-semantic-text {
    display: inline-flex;
  }
`

function installPreviewRailStyles(): HTMLStyleElement {
  const style = document.createElement('style')
  style.setAttribute('data-test', 'preview-rail-micro')
  style.textContent = PREVIEW_RAIL_COMPOSITION_CSS
  document.head.appendChild(style)
  return style
}

function px(value: string): number {
  return Number.parseFloat(value)
}

describe('Text micro + SemanticText (PreviewRail composition)', () => {
  let styleEl: HTMLStyleElement | undefined

  afterEach(() => {
    styleEl?.remove()
    styleEl = undefined
  })

  it('defines text-style-micro with fine-xs metrics in typography utilities', () => {
    const theme = readFileSync(tailwindThemeCss, 'utf8')
    const typography = readFileSync(typographyUtilitiesCss, 'utf8')
    expect(theme).toContain('--text-fine-xs--line-height: 0.875rem')

    const block = readUtilityBlock(typography, 'text-style-micro')
    expect(block).toContain('font-size: var(--text-fine-xs)')
    expect(block).toContain('line-height: var(--text-fine-xs--line-height)')
    expect(block).toContain('--icon-inline: var(--icon-glyph-xs)')
  })

  it('does not use rail-specific or micro inheritance overrides in semantic-text.css', () => {
    const css = readFileSync(semanticTextCss, 'utf8')
    expect(css).not.toContain('.text-style-micro .ui-semantic-text')
    expect(css).not.toMatch(/\.ui-semantic-text\s*\{[^}]*font-size:/)
  })

  it('composes PreviewRail section status with micro owner typography', () => {
    styleEl = installPreviewRailStyles()
    render(
      <Text as="span" variant="micro" className="shrink-0" data-testid="owner">
        <SemanticText tone="success" emphasis="medium">
          Ready
        </SemanticText>
      </Text>,
    )
    const owner = screen.getByTestId('owner')
    expect(owner).toHaveClass('text-style-micro', 'shrink-0')
    expect(px(getComputedStyle(owner).fontSize)).toBe(10)
    expect(px(getComputedStyle(owner).lineHeight)).toBe(14)
    expect(screen.getByText('Ready')).toHaveClass('ui-semantic-text--success')
  })
})
