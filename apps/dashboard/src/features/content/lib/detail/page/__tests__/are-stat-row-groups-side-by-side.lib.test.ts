import { describe, expect, it } from 'vitest'

import { areStatRowGroupsSideBySide } from '../are-stat-row-groups-side-by-side.lib'

describe('areStatRowGroupsSideBySide', () => {
  it('returns an empty list for a single group', () => {
    expect(areStatRowGroupsSideBySide([{ offsetTop: 0, offsetLeft: 0, offsetWidth: 100 }])).toEqual(
      [],
    )
  })

  it('detects side-by-side and wrapped pairs', () => {
    expect(
      areStatRowGroupsSideBySide([
        { offsetTop: 0, offsetLeft: 0, offsetWidth: 120 },
        { offsetTop: 0, offsetLeft: 160, offsetWidth: 120 },
        { offsetTop: 200, offsetLeft: 0, offsetWidth: 120 },
      ]),
    ).toEqual([true, false])

    expect(
      areStatRowGroupsSideBySide([
        { offsetTop: 0, offsetLeft: 0, offsetWidth: 120 },
        { offsetTop: 80, offsetLeft: 0, offsetWidth: 120 },
        { offsetTop: 80, offsetLeft: 160, offsetWidth: 120 },
      ]),
    ).toEqual([false, true])
  })
})
