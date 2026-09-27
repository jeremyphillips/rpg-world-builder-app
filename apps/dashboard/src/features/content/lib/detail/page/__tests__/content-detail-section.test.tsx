import { render, screen, waitFor } from '@testing-library/react'
import { beforeAll, describe, expect, it, vi } from 'vitest'

beforeAll(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
})

import { ContentDetailBody } from '../content-detail-body'
import { ContentDetailSection, ContentDetailSectionItem } from '../content-detail-section'

describe('ContentDetailSection', () => {
  it('registers section and leaf anchors for in-page nav', async () => {
    render(
      <ContentDetailBody>
        <ContentDetailSection heading="Traits" headingId="traits-heading">
          <ContentDetailSectionItem id="trait-darkvision" label="Darkvision">
            <p>See in the dark</p>
          </ContentDetailSectionItem>
        </ContentDetailSection>
        <ContentDetailSection heading="Features" headingId="features-heading">
          <p>Flat body</p>
        </ContentDetailSection>
      </ContentDetailBody>,
    )

    expect(screen.getByRole('navigation', { name: 'On this page sections' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Traits' })).toBeInTheDocument()
    screen.getByRole('link', { name: 'Traits' }).click()
    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Darkvision' })).toBeInTheDocument()
    })
    expect(screen.getByRole('link', { name: 'Features' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Darkvision', level: 3 })).toHaveAttribute(
      'id',
      'trait-darkvision',
    )
  })
})
