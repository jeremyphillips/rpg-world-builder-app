import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { Wizard, type WizardStepDef } from '@rpg/ui'

import { InviteMembersStep } from '../invite-members-step'

const STEPS: WizardStepDef[] = [{ id: 'invites', label: 'Invite members' }]

function renderStep() {
  return render(
    <Wizard steps={STEPS} onComplete={vi.fn()}>
      <InviteMembersStep onFinish={vi.fn()} />
    </Wizard>,
  )
}

describe('InviteMembersStep', () => {
  it('renders the invite members copy and email field', () => {
    renderStep()

    expect(screen.getByRole('heading', { name: 'Invite members' })).toBeInTheDocument()
    expect(
      screen.getByText('Add players now, or invite them later from the campaign overview.'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Email address')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create campaign' })).toBeInTheDocument()
  })

  itAxe('has no axe violations', async () => {
    const { container } = renderStep()
    await expectNoAxeViolations(container)
  })
})
