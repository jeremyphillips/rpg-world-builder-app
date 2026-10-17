import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { projectEntitySurfaceIdentityToSummaryModel } from '../../../entity-surface-projection.lib'
import { ContentEntityCard } from '../content-entity-card'
import { useEntityCardUtilityFieldSize } from '../entity-card-utility-field-size.context'

function UtilityFieldSizeProbe() {
  const size = useEntityCardUtilityFieldSize()
  return <span data-testid="utility-field-size">{size}</span>
}

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

  it('supplies xs field scale to compact card trailing utilities', () => {
    render(
      <ContentEntityCard
        density="compact"
        entity={projectEntitySurfaceIdentityToSummaryModel({
          heading: 'Darkvision',
          fallback: 'organization',
        })}
        trailing={{
          kind: 'utility',
          content: <UtilityFieldSizeProbe />,
        }}
      />,
    )

    expect(screen.getByTestId('utility-field-size')).toHaveTextContent('xs')
  })

  it('does not override field scale on comfortable cards', () => {
    render(
      <ContentEntityCard
        density="comfortable"
        entity={projectEntitySurfaceIdentityToSummaryModel({
          heading: 'Darkvision',
          fallback: 'organization',
        })}
        trailing={{
          kind: 'utility',
          content: <UtilityFieldSizeProbe />,
        }}
      />,
    )

    expect(screen.getByTestId('utility-field-size')).toHaveTextContent('md')
  })
})
