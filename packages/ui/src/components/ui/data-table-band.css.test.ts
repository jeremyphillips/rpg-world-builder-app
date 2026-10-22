import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const uiDir = dirname(fileURLToPath(import.meta.url))
const dataTableCss = readFileSync(join(uiDir, 'data-table.css'), 'utf8')

describe('data-table band CSS', () => {
  it('drives row and sticky actions from --ui-data-table-row-bg', () => {
    expect(dataTableCss).toContain('--ui-data-table-row-bg')
    expect(dataTableCss).toContain('.ui-data-table__actions:is(td)')
    expect(dataTableCss).not.toContain('--row-hover-bg')
  })

  it('keeps unavailable wash above hover and selected', () => {
    expect(dataTableCss).toMatch(
      /\.ui-data-table__row--unavailable\[data-state='selected'\][\s\S]*--warning-faint/,
    )
  })
})
