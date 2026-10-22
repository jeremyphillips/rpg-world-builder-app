import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import {
  dataTableRowUnavailableRailVariants,
  dataTableRowUnavailableVariants,
} from './data-table-band.lib'

const uiDir = dirname(fileURLToPath(import.meta.url))
const dataTableCss = readFileSync(join(uiDir, 'data-table.css'), 'utf8')

describe('dataTableRowUnavailableVariants', () => {
  it('returns the semantic unavailable row modifier', () => {
    expect(dataTableRowUnavailableVariants()).toBe('ui-data-table__row--unavailable')
  })
})

describe('dataTableRowUnavailableRailVariants', () => {
  it('returns the semantic name-cell rail modifier', () => {
    expect(dataTableRowUnavailableRailVariants()).toBe('ui-data-table__cell--unavailable-rail')
  })
})

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
