import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { Badge } from './badge'
import { ContentCardHeadingAction, ContentCardIconAction } from './content-card-actions.client'
import { ContentCard } from './content-card.client'
import { ContentCardRemoveButton, formatContentCardRemoveLabel } from './content-card-parts.client'
import {
  contentCardHeadingRowVariants,
  contentCardHeadingVariants,
  contentCardMetadataVariants,
  contentCardRootVariants,
  contentCardSubheadingVariants,
  resolveContentCardDensityInsetClasses,
} from './content-card.variants'

describe('ContentCard', () => {
  it('renders heading-only rows without artificial heading-row margin', () => {
    const { container } = render(<ContentCard heading="Harbor District" />)

    const headingRow = container.querySelector('[class*="items-center"] > div > div')
    expect(headingRow).toHaveClass(contentCardHeadingRowVariants({ rhythm: 'none' }))
    expect(headingRow).not.toHaveClass('mb-1')
    expect(headingRow).not.toHaveClass('mb-0')
  })

  it('applies mb-1 before secondary text when no heading-end slot is present', () => {
    const { container } = render(
      <ContentCard heading="Harbor District" subheading="Settlement overview" />,
    )

    const headingRow = container.querySelector('[class*="items-start"] > div > div')
    expect(headingRow).toHaveClass(contentCardHeadingRowVariants({ rhythm: 'secondary' }))
  })

  it('applies mb-0 before secondary text when a heading-end slot is present', () => {
    const { container } = render(
      <ContentCard
        heading="Harbor District"
        subheading="Settlement overview"
        headingEndSlot={<ContentCardHeadingAction>View</ContentCardHeadingAction>}
      />,
    )

    const headingRow = container.querySelector('[class*="items-start"] > div > div')
    expect(headingRow).toHaveClass(contentCardHeadingRowVariants({ rhythm: 'withHeadingEndSlot' }))
  })

  it('keeps variant typography on card-owned wrappers for string slots', () => {
    const { container } = render(
      <ContentCard
        heading="Harbor District"
        subheading="Settlement overview"
        metadata="Unavailable in this campaign"
      />,
    )

    const heading = screen.getByText('Harbor District')
    const subheading = screen.getByText('Settlement overview')
    const metadata = screen.getByText('Unavailable in this campaign')

    expect(heading).toHaveClass(contentCardHeadingVariants({ density: 'comfortable' }))
    expect(subheading).toHaveClass(contentCardSubheadingVariants({ density: 'comfortable' }))
    expect(metadata).toHaveClass(contentCardMetadataVariants({ density: 'comfortable' }))
    expect(container.querySelector('article')).toHaveClass(
      resolveContentCardDensityInsetClasses('comfortable'),
    )
  })

  it('applies full-width root sizing so embedded cards fill flex hosts', () => {
    const { container } = render(<ContentCard chrome="embedded" heading="Harbor District" />)

    expect(container.querySelector('article')).toHaveClass('w-full', 'min-w-0')
  })

  it('applies the same density inset for standalone and embedded chrome', () => {
    const density = 'compact' as const
    const inset = resolveContentCardDensityInsetClasses(density)
    const standalone = contentCardRootVariants({ density, chrome: 'standalone' })
    const embedded = contentCardRootVariants({ density, chrome: 'embedded' })

    expect(standalone).toContain(inset)
    expect(embedded).toContain(inset)
    expect(standalone).toContain('border')
    expect(embedded).not.toContain('border')
  })

  it('applies compact density classes when requested', () => {
    render(
      <ContentCard density="compact" heading="Harbor District" subheading="Settlement overview" />,
    )

    expect(screen.getByText('Harbor District')).toHaveClass(
      contentCardHeadingVariants({ density: 'compact' }),
    )
    expect(screen.getByText('Settlement overview')).toHaveClass(
      contentCardSubheadingVariants({ density: 'compact' }),
    )
  })

  it('truncates long heading, subheading, and metadata lines', () => {
    render(
      <ContentCard
        heading="An extraordinarily long location name that should ellipsize in narrow layouts"
        subheading="An extraordinarily long summary line that should ellipsize in narrow layouts"
        metadata="An extraordinarily long metadata line that should ellipsize in narrow layouts"
      />,
    )

    expect(screen.getByText(/extraordinarily long location name/)).toHaveClass('truncate')
    expect(screen.getByText(/extraordinarily long summary line/)).toHaveClass('truncate')
    expect(screen.getByText(/extraordinarily long metadata line/)).toHaveClass('truncate')
  })

  it('renders heading-end and end slots together for layout regression coverage', () => {
    render(
      <ContentCard
        heading="Harbor District"
        subheading="Settlement overview"
        headingEndSlot={<ContentCardHeadingAction>View</ContentCardHeadingAction>}
        endSlot={<Badge tone="warning">Unavailable</Badge>}
      />,
    )

    expect(screen.getByText('View')).toBeInTheDocument()
    expect(screen.getByText('Unavailable')).toBeInTheDocument()
  })

  it('supports remove actions via ContentCardRemoveButton', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()

    render(
      <ContentCard
        heading="Harbor District"
        endSlot={<ContentCardRemoveButton label="Harbor District" onRemove={onRemove} />}
      />,
    )

    await user.click(
      screen.getByRole('button', {
        name: formatContentCardRemoveLabel('Harbor District'),
      }),
    )
    expect(onRemove).toHaveBeenCalledTimes(1)
  })

  it('keeps heading-end actions compact with zero right padding for links', () => {
    render(
      <ContentCard
        heading="Harbor District"
        headingEndSlot={
          <ContentCardHeadingAction asChild>
            <a href="/locations/harbor">View</a>
          </ContentCardHeadingAction>
        }
      />,
    )

    const viewLink = screen.getByRole('link', { name: 'View' })
    expect(viewLink).toHaveClass('text-sm')
    expect(viewLink).toHaveClass('pr-0')
    expect(viewLink).toHaveClass('h-control-action-compact')
    expect(viewLink).not.toHaveClass('hover:underline')
  })

  it('supports icon actions with asChild', () => {
    render(
      <ContentCard
        heading="Harbor District"
        endSlot={
          <ContentCardIconAction asChild>
            <a href="/locations/harbor" aria-label="Open Harbor District">
              Open
            </a>
          </ContentCardIconAction>
        }
      />,
    )

    expect(screen.getByRole('link', { name: 'Open Harbor District' })).toHaveClass(
      'size-control-action-compact',
      '[&_svg]:size-icon-glyph-md',
    )
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <ContentCard
        heading="Harbor District"
        subheading="Settlement overview"
        headingEndSlot={<ContentCardHeadingAction>View</ContentCardHeadingAction>}
        endSlot={<Badge tone="warning">Unavailable</Badge>}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
