import { describe, expect, it } from 'vitest'

import { parseRowAnatomyTracks } from './row-anatomy-geometry'

describe('parseRowAnatomyTracks', () => {
  it('reads resolved track sizes and ignores line names', () => {
    expect(
      parseRowAnatomyTracks(
        '[slack-start] 6px [band] 24px [meta] 0px [status] 0px [slack-end] 6px [row-end]',
      ),
    ).toEqual({ slackStart: 6, band: 24, meta: 0, status: 0, slackEnd: 6 })
  })

  it('accepts fractional px values without line names', () => {
    expect(parseRowAnatomyTracks('0px 24px 17.5px 22px 0px')).toEqual({
      slackStart: 0,
      band: 24,
      meta: 17.5,
      status: 22,
      slackEnd: 0,
    })
  })

  it('throws when the grid is not a row-anatomy track list', () => {
    expect(() => parseRowAnatomyTracks('none')).toThrow(/Expected 5 resolved/)
  })
})
