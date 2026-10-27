import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const stylesDir = join(fileURLToPath(import.meta.url), '../..')
const sharedUtilitiesPath = join(stylesDir, 'shared.utilities.css')
const proseUtilitiesPath = join(stylesDir, 'prose.utilities.css')
const baseCssPath = join(stylesDir, 'base.css')
const iconCssPath = join(stylesDir, '../components/ui/icon/icon.css')

function ownersBlock(css: string): string {
  const start = css.indexOf('@layer utilities {\n  .text-xs {')
  const end = css.indexOf('@utility border-input')
  expect(start).toBeGreaterThan(-1)
  expect(end).toBeGreaterThan(start)
  return css.slice(start, end)
}

describe('inline icon pairing', () => {
  const sharedCss = readFileSync(sharedUtilitiesPath, 'utf8')
  const proseCss = readFileSync(proseUtilitiesPath, 'utf8')
  const baseCss = readFileSync(baseCssPath, 'utf8')
  const iconCss = readFileSync(iconCssPath, 'utf8')

  it('maps inline mode to --icon-inline on the icon element', () => {
    expect(iconCss).toMatch(
      /\.ui-icon\.ui-icon--inline\s*\{[^}]*--icon-size:\s*var\(--icon-inline\)/,
    )
  })

  it('sets the body default to the md glyph', () => {
    expect(baseCss).toMatch(/body\s*\{[^}]*--icon-inline:\s*var\(--icon-glyph-md\);/)
  })

  it('maps body and compact type owners without restating font size', () => {
    const owners = ownersBlock(sharedCss)
    expect(owners).toContain('.text-xs {\n    --icon-inline: var(--icon-glyph-sm);')
    expect(owners).toContain('.text-sm {\n    --icon-inline: var(--icon-glyph-sm);')
    expect(owners).toContain('.text-md {\n    --icon-inline: var(--icon-glyph-md);')
    expect(owners).toContain('.text-base {\n    --icon-inline: var(--icon-glyph-md);')
    expect(owners).not.toMatch(/font-size|line-height|\.text-lg/)
  })

  it('sets the same step on prose owners', () => {
    expect(proseCss).toMatch(/@utility prose \{\s*--icon-inline:\s*var\(--icon-glyph-md\);/)
    expect(proseCss).toMatch(/\.prose\.prose-sm \{[^}]*--icon-inline:\s*var\(--icon-glyph-sm\);/)
    expect(proseCss).toMatch(/\.prose\.prose-md \{[^}]*--icon-inline:\s*var\(--icon-glyph-md\);/)
  })
})
