import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { SubmitButton } from './submit-button'

describe('SubmitButton', () => {
  it('renders a submit-type button with its children', () => {
    render(<SubmitButton>Create</SubmitButton>)
    expect(screen.getByRole('button', { name: 'Create' })).toHaveAttribute('type', 'submit')
  })

  it('shows the pending label and is disabled while pending', () => {
    render(
      <SubmitButton pending pendingLabel="Creating…">
        Create
      </SubmitButton>,
    )
    expect(screen.getByRole('button', { name: 'Creating…' })).toBeDisabled()
  })

  it('keeps the children as the label when pending without a pendingLabel', () => {
    render(<SubmitButton pending>Create</SubmitButton>)
    expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled()
  })

  it('is disabled when disabled is set even if not pending', () => {
    render(<SubmitButton disabled>Create</SubmitButton>)
    expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled()
  })

  it('submits the surrounding form when clicked', async () => {
    const onSubmit = vi.fn((event) => event.preventDefault())
    render(
      <form onSubmit={onSubmit}>
        <SubmitButton>Create</SubmitButton>
      </form>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))
    expect(onSubmit).toHaveBeenCalledOnce()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(<SubmitButton>Create</SubmitButton>)
    await expectNoAxeViolations(container)
  })
})
