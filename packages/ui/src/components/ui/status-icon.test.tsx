import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { StatusIcon } from './status-icon.client'
import {
  STATUS_ICON_OFF_SLASH_STROKE_WIDTH,
  STATUS_ICON_STROKE_WIDTH,
  STATUS_ICON_TOOLTIP_LABELS,
  STATUS_ICON_VARIANTS,
} from './status-icon.variants'

function getStatusIconDisc(container: HTMLElement) {
  return container.querySelector('span.ui-status-icon')
}

describe('StatusIcon', () => {
  it('renders a decorative icon when tooltips are disabled', () => {
    const { container } = render(<StatusIcon variant="ready" tooltip={false} />)
    expect(getStatusIconDisc(container)).toHaveClass('ui-status-icon')
    expect(getStatusIconDisc(container)).toHaveAttribute('aria-hidden', 'true')
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('does not show a tooltip by default', () => {
    const { container } = render(<StatusIcon variant="ready" />)
    expect(getStatusIconDisc(container)).toBeInTheDocument()
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('renders an optional visible label', () => {
    render(<StatusIcon variant="ready" label="Ready" tooltip={false} />)
    expect(screen.getByText('Ready')).toBeInTheDocument()
  })

  it.each(STATUS_ICON_VARIANTS)('applies variant classes for %s', (variant) => {
    const { container } = render(<StatusIcon variant={variant} tooltip={false} />)
    expect(getStatusIconDisc(container)).toHaveClass('ui-status-icon')
  })

  it('shows the variant tooltip when enabled', async () => {
    const user = userEvent.setup()
    const { container } = render(<StatusIcon variant="incomplete" tooltip />)

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
    expect(getStatusIconDisc(container)).toHaveClass('ui-status-icon--ready')
  })

  it('uses distinct neutral disc recipes for off and incomplete', () => {
    const { container: offContainer } = render(<StatusIcon variant="off" tooltip={false} />)
    const { container: incompleteContainer } = render(
      <StatusIcon variant="incomplete" tooltip={false} />,
    )

    expect(getStatusIconDisc(offContainer)).toHaveClass('ui-status-icon--off')
    expect(getStatusIconDisc(incompleteContainer)).toHaveClass('ui-status-icon--incomplete')
  })

  it('matches the neutral glyph foreground on grey discs', () => {
    const { container: offContainer } = render(<StatusIcon variant="off" tooltip={false} />)
    const { container: noneContainer } = render(<StatusIcon variant="none" tooltip={false} />)
    const { container: incompleteContainer } = render(
      <StatusIcon variant="incomplete" tooltip={false} />,
    )

    expect(offContainer.querySelector('svg')).toHaveClass('ui-status-icon__glyph--neutral')
    expect(noneContainer.querySelector('svg')).toHaveClass('ui-status-icon__glyph--neutral')
    expect(incompleteContainer.querySelector('svg')).toHaveClass('ui-status-icon__glyph--neutral')
  })

  it('hides the CircleAlert outer ring on needsAttention', () => {
    const { container } = render(<StatusIcon variant="needsAttention" tooltip={false} />)
    expect(container.querySelector('svg')).toHaveClass('ui-status-icon__glyph--needs-attention')
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
    const { container: lgContainer } = render(
      <StatusIcon variant="off" size="lg" tooltip={false} />,
    )

    expect(smContainer.querySelector('svg')).toHaveClass('size-status-icon-slash-sm')
    expect(smContainer.querySelector('svg')?.getAttribute('stroke-width')).toBe(
      String(STATUS_ICON_OFF_SLASH_STROKE_WIDTH),
    )
    expect(mdContainer.querySelector('svg')).toHaveClass('size-status-icon-slash-sm')
    expect(mdContainer.querySelector('svg')?.getAttribute('stroke-width')).toBe(
      String(STATUS_ICON_OFF_SLASH_STROKE_WIDTH),
    )
    expect(lgContainer.querySelector('svg')).toHaveClass('size-status-icon-slash-md')
    expect(lgContainer.querySelector('svg')?.getAttribute('stroke-width')).toBe(
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
    const { container: lgContainer } = render(
      <StatusIcon variant="ready" size="lg" tooltip={false} />,
    )

    expect(getStatusIconDisc(smContainer)).toHaveClass('ui-status-icon--sm')
    expect(getStatusIconDisc(mdContainer)).toHaveClass('ui-status-icon--md')
    expect(getStatusIconDisc(lgContainer)).toHaveClass('ui-status-icon--lg')
  })

  it('defaults to md disc size when size is omitted', () => {
    const { container } = render(<StatusIcon variant="ready" tooltip={false} />)
    expect(getStatusIconDisc(container)).toHaveClass('ui-status-icon--md')
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <StatusIcon variant="needsAttention" label="Needs attention" tooltip={false} />,
    )
    await expectNoAxeViolations(container)
  })
})
