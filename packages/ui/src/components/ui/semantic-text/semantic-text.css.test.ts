import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const semanticTextCss = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'semantic-text.css'),
  'utf8',
)

function baseBlock(css: string): string {
  const start = css.indexOf('.ui-semantic-text {')
  expect(start).toBeGreaterThan(-1)
  const end = css.indexOf('}', start)
  return css.slice(start, end + 1)
}

describe('semantic-text.css typography ownership', () => {
  it('does not assert font-size, line-height, or --icon-inline on the base block', () => {
    const block = baseBlock(semanticTextCss)
    expect(block).not.toMatch(/\bfont-size\s*:/)
    expect(block).not.toMatch(/\bline-height\s*:/)
    expect(block).not.toContain('--icon-inline')
  })

  it('does not ship text-style inheritance overrides', () => {
    expect(semanticTextCss).not.toContain('.text-style-micro .ui-semantic-text')
    expect(semanticTextCss).not.toMatch(/\.text-style-\w+\s+\.ui-semantic-text/)
  })
})
