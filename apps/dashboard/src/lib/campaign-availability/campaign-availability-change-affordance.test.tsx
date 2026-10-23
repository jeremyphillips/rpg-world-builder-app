import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CampaignAvailabilityChangeAffordance } from './campaign-availability-change-affordance'

describe('CampaignAvailabilityChangeAffordance', () => {
  it('sizes the edit glyph from the action step', () => {
    const { container } = render(<CampaignAvailabilityChangeAffordance />)
    const icon = container.querySelector('svg')
    expect(icon).toHaveClass('ui-icon--md')
    expect(icon).not.toHaveClass('size-3.5')
  })
})
