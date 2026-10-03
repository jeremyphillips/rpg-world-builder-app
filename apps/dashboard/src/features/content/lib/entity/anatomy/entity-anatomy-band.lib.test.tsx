import { describe, expect, it } from 'vitest'

import { DetailRowLeadingMedia } from '../../detail/row/detail-row-leading-media'
import { resolveEntityAnatomyBand } from './entity-anatomy-band.lib'

describe('resolveEntityAnatomyBand', () => {
  it('uses control when media is absent', () => {
    expect(resolveEntityAnatomyBand(undefined)).toBe('control')
  })

  it('maps xs media to media-xs band', () => {
    expect(
      resolveEntityAnatomyBand(
        <DetailRowLeadingMedia size="xs">
          <span aria-hidden>HD</span>
        </DetailRowLeadingMedia>,
      ),
    ).toBe('media-xs')
  })

  it('maps sm media to media-sm band', () => {
    expect(
      resolveEntityAnatomyBand(
        <DetailRowLeadingMedia size="sm">
          <span aria-hidden>HD</span>
        </DetailRowLeadingMedia>,
      ),
    ).toBe('media-sm')
  })
})
