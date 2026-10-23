import { describe, expect, it } from 'vitest'

import { dataTableUnavailableAppearance } from './data-table-band.lib'

describe('dataTableUnavailableAppearance', () => {
  it('returns no classes when the row is available', () => {
    expect(dataTableUnavailableAppearance(false)).toEqual({})
  })

  it('returns row and name-cell rail classes together when unavailable', () => {
    expect(dataTableUnavailableAppearance(true)).toEqual({
      rowClassName: 'ui-data-table__row--unavailable',
      nameCellRailClassName: 'ui-data-table__cell--unavailable-rail',
    })
  })
})
