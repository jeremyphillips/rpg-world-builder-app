import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { projectEntitySurfaceIdentityToSummaryModel } from '../../../entity-surface-projection.lib'
import { EntityCardStaticRenderer } from '../entity-card-static-renderer'
import { useEntityCardUtilityFieldSize } from '../entity-card-utility-field-size.lib'

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

  it('renders unlinked static cards as article shells', () => {
    const { container } = render(
      <EntityCardStaticRenderer
        entity={projectEntitySurfaceIdentityToSummaryModel({
          heading: 'Harbor District',
          fallback: 'location',
        })}
      />,
    )
    expect(container.querySelector('article')).toBeTruthy()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('renders navigable static cards as one link with default chevron and standalone focus', () => {
    const { container } = render(
      <EntityCardStaticRenderer
        entity={projectEntitySurfaceIdentityToSummaryModel({
          heading: 'Harbor District',
          classification: 'District',
          fallback: 'location',
        })}
        link={<a href="/locations/harbor">nav</a>}
      />,
    )
    expect(container.querySelector('article')).toBeNull()
    const link = screen.getByRole('link', { name: 'Harbor District District' })
    expect(link).toHaveAttribute('href', '/locations/harbor')
    expect(link).toHaveClass('ui-focus-ring')
    expect(link).not.toHaveClass('ui-focus-ring--embedded')
    expect(container.getElementsByClassName('ui-card__nav-chevron')).toHaveLength(1)
  })

  it('hides navigation chevron when showNavigationChevron is false', () => {
    const { container } = render(
      <EntityCardStaticRenderer
        entity={projectEntitySurfaceIdentityToSummaryModel({
          heading: 'Harbor District',
          fallback: 'location',
        })}
        link={<a href="/locations/harbor">nav</a>}
        showNavigationChevron={false}
      />,
    )
    expect(container.getElementsByClassName('ui-card__nav-chevron')).toHaveLength(0)
  })

  it('activates navigable link on Enter when focused', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn((event: { preventDefault: () => void }) => {
      event.preventDefault()
    })
    render(
      <EntityCardStaticRenderer
        entity={projectEntitySurfaceIdentityToSummaryModel({
          heading: 'Harbor District',
          fallback: 'location',
        })}
        link={
          <a href="/locations/harbor" onClick={onClick}>
            nav
          </a>
        }
      />,
    )
    const link = screen.getByRole('link', { name: 'Harbor District' })
    link.focus()
    await user.keyboard('{Enter}')
    expect(onClick).toHaveBeenCalled()
  })
})
