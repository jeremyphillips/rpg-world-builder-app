import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { StatusIcon } from './status-icon.client'
import {
  STATUS_ICON_OFF_SLASH_SIZE_MD_CLASSES,
  STATUS_ICON_OFF_SLASH_SIZE_SM_CLASSES,
  STATUS_ICON_OFF_SLASH_STROKE_WIDTH,
  STATUS_ICON_STROKE_WIDTH,
  STATUS_ICON_TOOLTIP_LABELS,
  STATUS_ICON_VARIANTS,
} from './status-icon.variants'

function getStatusIconDisc(container: HTMLElement) {
  return container.querySelector('span.rounded-full')
}

describe('StatusIcon', () => {
  it('renders a decorative icon when tooltips are disabled', () => {
    const { container } = render(<StatusIcon variant="ready" tooltip={false} />)
    expect(getStatusIconDisc(container)).toHaveClass('rounded-full')
    expect(getStatusIconDisc(container)).toHaveAttribute('aria-hidden', 'true')
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('renders an optional visible label', () => {
    render(<StatusIcon variant="ready" label="Ready" tooltip={false} />)
    expect(screen.getByText('Ready')).toBeInTheDocument()
  })

  it.each(STATUS_ICON_VARIANTS)('applies variant classes for %s', (variant) => {
    const { container } = render(<StatusIcon variant={variant} tooltip={false} />)
    expect(getStatusIconDisc(container)).toHaveClass('rounded-full')
  })

  it('shows the default variant tooltip on hover', async () => {
    const user = userEvent.setup()
    const { container } = render(<StatusIcon variant="incomplete" />)

    await user.hover(getStatusIconDisc(container)!)

    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      STATUS_ICON_TOOLTIP_LABELS.incomplete,
    )
  })

  it('supports custom tooltip copy', async () => {
    const user = userEvent.setup()
    const { container } = render(<StatusIcon variant="ready" tooltip="Published" />)

    await user.hover(getStatusIconDisc(container)!)

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Published')
  })

  it('applies ready semantic strong fill', () => {
    const { container } = render(<StatusIcon variant="ready" tooltip={false} />)
    expect(getStatusIconDisc(container)).toHaveClass(
      'bg-semantic-success-strong',
      'text-semantic-success-strong-foreground',
    )
  })

  it('uses distinct neutral surfaces for off and incomplete in light mode', () => {
    const { container: offContainer } = render(<StatusIcon variant="off" tooltip={false} />)
    const { container: incompleteContainer } = render(
      <StatusIcon variant="incomplete" tooltip={false} />,
    )

    expect(getStatusIconDisc(offContainer)).toHaveClass(
      'overflow-hidden',
      'rounded-full',
      'bg-[var(--foreground-subtle)]',
      'dark:bg-semantic-neutral-strong',
    )
    expect(getStatusIconDisc(incompleteContainer)).toHaveClass(
      'bg-[var(--foreground-disabled)]',
      'dark:bg-semantic-neutral-strong',
    )
  })

  it('matches the ready checkmark glyph color on neutral and validation glyphs', () => {
    const { container: offContainer } = render(<StatusIcon variant="off" tooltip={false} />)
    const { container: noneContainer } = render(<StatusIcon variant="none" tooltip={false} />)
    const { container: incompleteContainer } = render(
      <StatusIcon variant="incomplete" tooltip={false} />,
    )

    expect(offContainer.querySelector('svg')).toHaveClass('text-semantic-success-strong-foreground')
    expect(noneContainer.querySelector('svg')).toHaveClass(
      'text-semantic-success-strong-foreground',
    )
    expect(incompleteContainer.querySelector('svg')).toHaveClass(
      'text-semantic-success-strong-foreground',
    )
  })

  it('uses the default stroke width on every glyph except off', () => {
    for (const variant of STATUS_ICON_VARIANTS) {
      if (variant === 'off') {
        continue
      }

      const { container } = render(<StatusIcon variant={variant} tooltip={false} />)
      expect(container.querySelector('svg')?.getAttribute('stroke-width')).toBe(
        String(STATUS_ICON_STROKE_WIDTH),
      )
    }
  })

  it('sizes and strokes the off slash lighter than other glyphs', () => {
    const { container: smContainer } = render(
      <StatusIcon variant="off" size="sm" tooltip={false} />,
    )
    const { container: mdContainer } = render(
      <StatusIcon variant="off" size="md" tooltip={false} />,
    )

    expect(smContainer.querySelector('svg')).toHaveClass(STATUS_ICON_OFF_SLASH_SIZE_SM_CLASSES)
    expect(smContainer.querySelector('svg')?.getAttribute('stroke-width')).toBe(
      String(STATUS_ICON_OFF_SLASH_STROKE_WIDTH),
    )
    expect(mdContainer.querySelector('svg')).toHaveClass(STATUS_ICON_OFF_SLASH_SIZE_MD_CLASSES)
    expect(mdContainer.querySelector('svg')?.getAttribute('stroke-width')).toBe(
      String(STATUS_ICON_OFF_SLASH_STROKE_WIDTH),
    )
  })

  it('applies size variants', () => {
    const { container: smContainer } = render(
      <StatusIcon variant="ready" size="sm" tooltip={false} />,
    )
    const { container: mdContainer } = render(
      <StatusIcon variant="ready" size="md" tooltip={false} />,
    )

    expect(getStatusIconDisc(smContainer)).toHaveClass('size-4')
    expect(getStatusIconDisc(mdContainer)).toHaveClass('size-5')
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <StatusIcon variant="needsAttention" label="Needs attention" tooltip={false} />,
    )
    await expectNoAxeViolations(container)
  })
})
