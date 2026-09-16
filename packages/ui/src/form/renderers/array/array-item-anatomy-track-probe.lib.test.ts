import { describe, expect, it } from 'vitest'

import {
  chromeContainerVerticalDelta,
  chromeVerticalDelta,
  isChromeAlignedToContainerCenter,
  isChromeAlignedToControlTrack,
  type AnatomyTrackProbe,
} from './array-item-anatomy-track-probe.lib'

describe('array-item-anatomy-track-probe.lib', () => {
  it('treats chrome as control-track aligned when centered on the md control band', () => {
    const probe: AnatomyTrackProbe = {
      controlTop: 100,
      gripCenterY: 118,
      actionsCenterY: 118,
    }

    expect(isChromeAlignedToControlTrack(probe)).toBe(true)
  })

  it('treats chrome as container-centered when aligned to the anatomy grid midpoint', () => {
    const probe: AnatomyTrackProbe = {
      controlTop: 100,
      gripCenterY: 132,
      actionsCenterY: 132,
    }

    expect(isChromeAlignedToContainerCenter(132, probe)).toBe(true)
    expect(chromeContainerVerticalDelta(132, probe)).toEqual({ gripDelta: 0, actionsDelta: 0 })
  })

  it('computes stable chrome delta when only the message track grows', () => {
    const clean: AnatomyTrackProbe = {
      controlTop: 100,
      gripCenterY: 118,
      actionsCenterY: 118,
    }
    const withMessageTrackGrowth: AnatomyTrackProbe = {
      controlTop: 100,
      gripCenterY: 118,
      actionsCenterY: 118,
    }

    expect(chromeVerticalDelta(clean)).toEqual({ gripDelta: 18, actionsDelta: 18 })
    expect(chromeVerticalDelta(withMessageTrackGrowth)).toEqual(chromeVerticalDelta(clean))
  })
})
