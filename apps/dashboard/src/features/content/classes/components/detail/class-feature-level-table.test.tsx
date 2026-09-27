import { render, screen, waitFor } from '@testing-library/react'
import { beforeAll, describe, expect, it, vi } from 'vitest'

beforeAll(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
})

import { ContentDetailBody } from '../../../lib/detail/page/content-detail-body'
import { ContentDetailSection } from '../../../lib/detail/page/content-detail-section'
import { contentDetailNavItemId } from '../../../lib/detail/page/content-detail-nav-anchor-id'
import type { ClassFeatureDetailItem } from '../../lib/class-display'

import { ClassFeatureLevelTable } from './class-feature-level-table'

const FEATURES_HEADING_ID = 'features-heading'

const items: ClassFeatureDetailItem[] = [
  {
    id: 'fighting-style',
    level: 1,
    title: 'Fighting Style',
    bodyHtml: '<p>Choose a style.</p>',
  },
  {
    id: 'second-wind',
    level: 1,
    title: 'Second Wind',
    bodyHtml: '<p>Regain hit points.</p>',
  },
  {
    id: 'action-surge',
    level: 2,
    title: 'Action Surge',
    bodyHtml: '<p>Take an extra action.</p>',
  },
]

describe('ClassFeatureLevelTable', () => {
  it('groups features by level and exposes level group anchors for nav', async () => {
    render(
      <ContentDetailBody>
        <ContentDetailSection
          heading="Fighter Class Features"
          headingId={FEATURES_HEADING_ID}
          bodyLayout="flush"
        >
          <ClassFeatureLevelTable items={items} />
        </ContentDetailSection>
        <ContentDetailSection heading="Proficiencies" headingId="proficiencies-heading">
          <p>Granted proficiencies</p>
        </ContentDetailSection>
      </ContentDetailBody>,
    )

    expect(screen.getByRole('heading', { name: 'Fighting Style', level: 4 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Action Surge', level: 4 })).toBeInTheDocument()

    const levelOneAnchor = contentDetailNavItemId('feature-level', '1')
    expect(document.getElementById(levelOneAnchor)).toBeInTheDocument()

    screen.getByRole('link', { name: 'Fighter Class Features' }).click()

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Level 1' })).toBeInTheDocument()
    })
    expect(screen.getByRole('link', { name: 'Level 2' })).toBeInTheDocument()
  })
})
