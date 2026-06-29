import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'

import { TicketLinkSelectedPreview } from './ticket-link-selected-preview'
import { sampleTicket } from '../test-fixtures'

describe('TicketLinkSelectedPreview', () => {
  it('renders ticket key and title', () => {
    render(
      <TicketLinkSelectedPreview
        option={{
          value: sampleTicket.id,
          label: `${sampleTicket.key} — ${sampleTicket.title}`,
        }}
        ticket={sampleTicket}
        onRemove={vi.fn()}
      />,
    )

    expect(screen.getByText(sampleTicket.key)).toBeInTheDocument()
    expect(screen.getByText(sampleTicket.title)).toBeInTheDocument()
  })

  it('links to ticket detail in a new tab', () => {
    render(
      <TicketLinkSelectedPreview
        option={{
          value: sampleTicket.id,
          label: `${sampleTicket.key} — ${sampleTicket.title}`,
        }}
        ticket={sampleTicket}
        onRemove={vi.fn()}
      />,
    )

    const link = screen.getByRole('link', { name: `Open ${sampleTicket.key} in new tab` })
    expect(link).toHaveAttribute('href', `/tickets/${sampleTicket.id}`)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('calls onRemove when dismiss is clicked', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()

    render(
      <TicketLinkSelectedPreview
        option={{
          value: sampleTicket.id,
          label: `${sampleTicket.key} — ${sampleTicket.title}`,
        }}
        ticket={sampleTicket}
        onRemove={onRemove}
      />,
    )

    await user.click(screen.getByRole('button', { name: `Remove ${sampleTicket.key}` }))
    expect(onRemove).toHaveBeenCalledTimes(1)
  })

  it('falls back gracefully for stale selections', () => {
    render(
      <TicketLinkSelectedPreview
        option={{ value: 'missing-ticket', label: '507f1f77bcf86cd799439011' }}
        ticket={null}
        onRemove={vi.fn()}
      />,
    )

    expect(screen.getByText('Unknown ticket')).toBeInTheDocument()
    expect(screen.getByText('507f1f77bcf86cd799439011')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Open Unknown ticket in new tab' })).toHaveAttribute(
      'href',
      '/tickets/missing-ticket',
    )
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <TicketLinkSelectedPreview
        option={{
          value: sampleTicket.id,
          label: `${sampleTicket.key} — ${sampleTicket.title}`,
        }}
        ticket={sampleTicket}
        onRemove={vi.fn()}
      />,
    )

    const results = await axe.run(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(results.violations).toEqual([])
  })
})
