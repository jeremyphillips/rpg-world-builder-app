import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { CreateSetupSummary } from './create-setup-summary.client'

describe('CreateSetupSummary', () => {
  it('renders consumer-owned copy and invokes the change action', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <CreateSetupSummary
        eyebrow="Setup"
        summary="Dragonborn · Level 1 Barbarian"
        onChange={onChange}
      />,
    )

    expect(screen.getByText('Setup')).toBeInTheDocument()
    expect(screen.getByText('Dragonborn · Level 1 Barbarian')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Change' }))
    expect(onChange).toHaveBeenCalledOnce()
  })

  it('supports consumer-owned action copy', () => {
    render(
      <CreateSetupSummary
        eyebrow="Settlement type"
        summary="City"
        changeLabel="Edit setup"
        onChange={() => undefined}
      />,
    )

    expect(screen.getByRole('button', { name: 'Edit setup' })).toBeInTheDocument()
  })

  it('renders nothing for a blank summary', () => {
    const { container } = render(
      <CreateSetupSummary eyebrow="Setup" summary="  " onChange={() => undefined} />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <CreateSetupSummary eyebrow="Setup" summary="House · Residence" onChange={() => undefined} />,
    )
    await expectNoAxeViolations(container)
  })
})
