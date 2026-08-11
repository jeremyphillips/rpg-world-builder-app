import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { TextField } from './text-field'

describe('TextField trailingAction', () => {
  it('renders a grouped control when trailingAction is configured', () => {
    render(
      <TextField
        id="npc-name"
        label="Name"
        trailingAction={{
          label: 'Generate',
          onAction: vi.fn(),
        }}
      />,
    )

    expect(screen.getByRole('group')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Generate' })).toBeInTheDocument()
  })

  it('fires the trailing action callback', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()

    render(
      <TextField
        id="npc-name"
        label="Name"
        trailingAction={{
          label: 'Generate',
          onAction,
        }}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Generate' }))
    expect(onAction).toHaveBeenCalledTimes(1)
  })

  it('disables only the action while pending', () => {
    render(
      <TextField
        id="npc-name"
        label="Name"
        trailingAction={{
          label: 'Generate',
          onAction: vi.fn(),
          pending: true,
        }}
      />,
    )

    expect(screen.getByRole('textbox', { name: 'Name' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Generate' })).toBeDisabled()
  })

  it('renders operation errors on the action accessibility tree', () => {
    render(
      <TextField
        id="npc-name"
        label="Name"
        trailingAction={{
          label: 'Generate',
          onAction: vi.fn(),
          error: 'Could not generate a name.',
        }}
      />,
    )

    const actionError = screen.getByRole('alert')
    expect(actionError).toHaveTextContent('Could not generate a name.')
    expect(screen.getByRole('button', { name: 'Generate' })).toHaveAttribute(
      'aria-describedby',
      'npc-name-action-error',
    )
    expect(screen.getByRole('textbox', { name: 'Name' })).not.toHaveAttribute(
      'aria-describedby',
      'npc-name-action-error',
    )
  })

  it('stretches trailing-action controls to the field band width', () => {
    render(
      <TextField
        id="npc-name"
        label="Name"
        width="full"
        trailingAction={{
          label: 'Generate',
          onAction: vi.fn(),
        }}
      />,
    )

    const group = screen.getByRole('group')
    const controlWrapper = group.parentElement
    expect(controlWrapper?.className).toContain('w-full')
    expect(controlWrapper?.className).toContain('min-w-0')
  })

  it('uses button variants as the sole typography source on md fields', () => {
    render(
      <TextField
        id="npc-name"
        label="Name"
        size="md"
        trailingAction={{
          label: 'Generate',
          onAction: vi.fn(),
        }}
      />,
    )

    const button = screen.getByRole('button', { name: 'Generate' })
    expect(button.className).toContain('font-body-emphasis')
    expect(button.className).toContain('text-sm')
    expect(button.className).not.toContain('text-md')
    expect(button.parentElement?.className).not.toMatch(/\b(text-|font-)/)
  })
})
