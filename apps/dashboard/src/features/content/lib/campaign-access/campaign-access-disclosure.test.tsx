import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { CampaignAccessDisclosure } from './campaign-access-disclosure.client'

describe('CampaignAccessDisclosure', () => {
  it('renders collapsed summary and opens from Change', async () => {
    const onOpenChange = vi.fn()
    const user = userEvent.setup()

    render(
      <CampaignAccessDisclosure
        summary={{ primary: 'Available · All players' }}
        isDirty={false}
        open={false}
        onOpenChange={onOpenChange}
        idPrefix="test"
      >
        <div>Expanded fields</div>
      </CampaignAccessDisclosure>,
    )

    expect(screen.getByText('Campaign availability')).toBeInTheDocument()
    expect(screen.getByText('Available · All players')).toBeInTheDocument()
    expect(screen.queryByText('Expanded fields')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Change' }))
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('opens from the summary row and shows secondary copy when unavailable', async () => {
    const onOpenChange = vi.fn()
    const user = userEvent.setup()

    render(
      <CampaignAccessDisclosure
        summary={{
          primary: 'Unavailable',
          secondary: 'This content cannot be discovered or selected in this campaign.',
        }}
        isDirty={false}
        open={false}
        onOpenChange={onOpenChange}
        idPrefix="test"
      >
        <div>Expanded fields</div>
      </CampaignAccessDisclosure>,
    )

    await user.click(screen.getByRole('button', { name: /Unavailable/ }))
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(
      screen.getByText('This content cannot be discovered or selected in this campaign.'),
    ).toBeInTheDocument()
  })

  it('appends the unsaved suffix when dirty', () => {
    render(
      <CampaignAccessDisclosure
        summary={{ primary: 'Available · DM only' }}
        isDirty
        open={false}
        onOpenChange={vi.fn()}
        idPrefix="test"
      >
        <div>Expanded fields</div>
      </CampaignAccessDisclosure>,
    )

    expect(screen.getByText(/Available · DM only/)).toBeInTheDocument()
    expect(screen.getByText(/· Unsaved/)).toBeInTheDocument()
  })

  it('renders expanded content with Done control', async () => {
    const onOpenChange = vi.fn()
    const user = userEvent.setup()

    render(
      <CampaignAccessDisclosure
        summary={{ primary: 'Available · All players' }}
        isDirty={false}
        open
        onOpenChange={onOpenChange}
        idPrefix="test"
      >
        <div>Expanded fields</div>
      </CampaignAccessDisclosure>,
    )

    expect(screen.getByText('Expanded fields')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Done' })).toHaveAttribute('aria-expanded', 'true')

    await user.click(screen.getByRole('button', { name: 'Done' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('has no accessibility violations when collapsed', async () => {
    const { container } = render(
      <CampaignAccessDisclosure
        summary={{ primary: 'Available · All players' }}
        isDirty={false}
        open={false}
        onOpenChange={vi.fn()}
        idPrefix="test"
      >
        <div>Expanded fields</div>
      </CampaignAccessDisclosure>,
    )

    await expectNoAxeViolations(container)
  })

  it('has no accessibility violations when expanded', async () => {
    const { container } = render(
      <CampaignAccessDisclosure
        summary={{ primary: 'Available · All players' }}
        isDirty={false}
        open
        onOpenChange={vi.fn()}
        idPrefix="test"
      >
        <div>Expanded fields</div>
      </CampaignAccessDisclosure>,
    )

    await expectNoAxeViolations(container)
  })
})
