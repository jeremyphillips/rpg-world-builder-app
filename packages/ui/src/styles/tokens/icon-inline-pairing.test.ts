import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const globalsPath = join(fileURLToPath(import.meta.url), '../../../styles/globals.css')
const iconCssPath = join(fileURLToPath(import.meta.url), '../../../components/ui/icon/icon.css')

function ownersBlock(css: string): string {
  const start = css.indexOf('@layer utilities {\n  .text-xs {')
  const end = css.indexOf('@utility bg-status-icon-idle')
  expect(start).toBeGreaterThan(-1)
  expect(end).toBeGreaterThan(start)
  return css.slice(start, end)
}

describe('inline icon pairing', () => {
  const css = readFileSync(globalsPath, 'utf8')
  const iconCss = readFileSync(iconCssPath, 'utf8')

  it('maps inline mode to --icon-inline on the icon element', () => {
    expect(iconCss).toMatch(
      /\.ui-icon\.ui-icon--inline\s*\{[^}]*--icon-size:\s*var\(--icon-inline\)/,
    )
  })

  it('sets the body default to the md glyph', () => {
    expect(css).toMatch(/body\s*\{[^}]*--icon-inline:\s*var\(--icon-glyph-md\);/)
  })

  it('maps body and compact type owners without restating font size', () => {
    const owners = ownersBlock(css)
    expect(owners).toContain('.text-xs {\n    --icon-inline: var(--icon-glyph-sm);')
    expect(owners).toContain('.text-sm {\n    --icon-inline: var(--icon-glyph-sm);')
    expect(owners).toContain('.text-md {\n    --icon-inline: var(--icon-glyph-md);')
    expect(owners).toContain('.text-base {\n    --icon-inline: var(--icon-glyph-md);')
    expect(owners).not.toMatch(/font-size|line-height|\.text-lg/)
  })

  it('sets the same step on prose owners', () => {
    expect(css).toMatch(/@utility prose \{\s*--icon-inline:\s*var\(--icon-glyph-md\);/)
    expect(css).toMatch(/\.prose\.prose-sm \{[^}]*--icon-inline:\s*var\(--icon-glyph-sm\);/)
    expect(css).toMatch(/\.prose\.prose-md \{[^}]*--icon-inline:\s*var\(--icon-glyph-md\);/)
  })
})
