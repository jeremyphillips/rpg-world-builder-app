import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { projectEntitySurfaceIdentityToSummaryModel } from '../../../entity-surface-projection.lib'
import { EntityCardStaticRenderer } from '../entity-card-static-renderer'
import { useEntityCardUtilityFieldSize } from '../entity-card-utility-field-size.context'

function UtilityFieldSizeProbe() {
  const size = useEntityCardUtilityFieldSize()
  return <span data-testid="utility-field-size">{size}</span>
}

describe('EntityCardStaticRenderer', () => {
  it('renders compact identity with semantic fallback media', () => {
    render(
      <EntityCardStaticRenderer
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
      <EntityCardStaticRenderer
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
      <EntityCardStaticRenderer
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
