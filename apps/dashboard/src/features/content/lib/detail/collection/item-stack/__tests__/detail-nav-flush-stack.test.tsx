import { render, screen, waitFor } from '@testing-library/react'
import { beforeAll, describe, expect, it, vi } from 'vitest'

beforeAll(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
})

import { ContentDetailBody } from '../../../page/content-detail-body'
import { ContentDetailSection } from '../../../page/content-detail-section'
import { DetailNavFlushStack } from '../detail-nav-flush-stack'

describe('DetailNavFlushStack', () => {
  it('registers leaf nav links and stable heading ids', async () => {
    const items = [{ id: 'darkvision', name: 'Darkvision', body: 'See in the dark' }]

    render(
      <ContentDetailBody>
        <ContentDetailSection heading="Traits" headingId="traits-heading" bodyLayout="flush">
          <DetailNavFlushStack
            navPrefix="trait"
            items={items}
            getLabel={(item) => item.name}
            renderItem={(item) => <p>{item.body}</p>}
          />
        </ContentDetailSection>
        <ContentDetailSection heading="Features" headingId="features-heading">
          <p>Flat body</p>
        </ContentDetailSection>
      </ContentDetailBody>,
    )

    expect(screen.getByRole('navigation', { name: 'On this page sections' })).toBeInTheDocument()
    screen.getByRole('link', { name: 'Traits' }).click()
    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Darkvision' })).toBeInTheDocument()
    })
    expect(screen.getByRole('heading', { name: 'Darkvision', level: 3 })).toHaveAttribute(
      'id',
      'trait-darkvision',
    )
  })
})
