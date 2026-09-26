import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { projectEntitySurfaceIdentityToSummaryModel } from '../../../entity-surface-projection.lib'
import { ContentEntityCard } from '../content-entity-card'

describe('ContentEntityCard', () => {
  it('renders compact identity with semantic fallback media', () => {
    render(
      <ContentEntityCard
        entity={projectEntitySurfaceIdentityToSummaryModel({
          heading: 'Silver Circle',
          classification: 'Guild',
          fallback: 'organization',
        })}
      />,
    )

    expect(screen.getByText('Silver Circle')).toBeInTheDocument()
    expect(screen.getByText('Guild')).toBeInTheDocument()
  })
})
