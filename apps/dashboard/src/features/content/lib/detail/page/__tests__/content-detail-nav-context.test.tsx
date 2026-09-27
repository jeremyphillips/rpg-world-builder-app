/**
 * @vitest-environment jsdom
 */
import { render, waitFor } from '@testing-library/react'
import { beforeAll, describe, expect, it, vi } from 'vitest'

beforeAll(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
})

import { ContentDetailBody } from '../content-detail-body'
import { ContentDetailSection, ContentDetailSectionItem } from '../content-detail-section'
import { useContentDetailNavSections } from '../content-detail-nav-context'

function NavSectionsProbe() {
  const sections = useContentDetailNavSections()
  const traits = sections.find((section) => section.id === 'traits-heading')
  return (
    <div data-testid="leaf-order">{traits?.leaves?.map((leaf) => leaf.id).join(',') ?? ''}</div>
  )
}

describe('ContentDetailNavProvider', () => {
  it('preserves leaf order when only the label changes', async () => {
    const { rerender } = render(
      <ContentDetailBody>
        <NavSectionsProbe />
        <ContentDetailSection heading="Traits" headingId="traits-heading">
          <ContentDetailSectionItem id="trait-a" label="Alpha">
            <p>One</p>
          </ContentDetailSectionItem>
          <ContentDetailSectionItem id="trait-b" label="Beta">
            <p>Two</p>
          </ContentDetailSectionItem>
        </ContentDetailSection>
      </ContentDetailBody>,
    )

    await waitFor(() => {
      expect(document.querySelector('[data-testid="leaf-order"]')).toHaveTextContent(
        'trait-a,trait-b',
      )
    })

    rerender(
      <ContentDetailBody>
        <NavSectionsProbe />
        <ContentDetailSection heading="Traits" headingId="traits-heading">
          <ContentDetailSectionItem id="trait-a" label="Alpha renamed">
            <p>One</p>
          </ContentDetailSectionItem>
          <ContentDetailSectionItem id="trait-b" label="Beta">
            <p>Two</p>
          </ContentDetailSectionItem>
        </ContentDetailSection>
      </ContentDetailBody>,
    )

    await waitFor(() => {
      expect(document.querySelector('[data-testid="leaf-order"]')).toHaveTextContent(
        'trait-a,trait-b',
      )
    })
  })
})
