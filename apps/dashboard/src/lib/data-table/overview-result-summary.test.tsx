/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ResultSummary } from './overview-result-summary'

describe('ResultSummary', () => {
  it('renders a polite visible count', () => {
    const { container } = render(<ResultSummary visibleCount={10} />)
    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('10 results')
    expect(status).toHaveAttribute('aria-live', 'polite')
    expect(container.firstChild).toHaveClass('text-xs')
  })

  it('uses a caller noun without a visibility supplement', () => {
    render(<ResultSummary visibleCount={2} primaryLabel="2 users" />)
    expect(screen.getByRole('status')).toHaveTextContent('2 users')
    expect(screen.queryByText('2 results')).not.toBeInTheDocument()
  })

  it('joins a visibility supplement and its action', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    const { container } = render(
      <ResultSummary
        visibleCount={14}
        supplements={[
          {
            label: '1 unavailable',
            action: {
              label: 'Show',
              accessibleName: 'Show all campaign availability states',
              onClick,
            },
          },
        ]}
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent('14 results · 1 unavailable · Show')
    expect(container).not.toHaveTextContent(/\d+ available\b/)
    await user.click(screen.getByRole('button', { name: 'Show all campaign availability states' }))
    expect(onClick).toHaveBeenCalledOnce()
  })
})
