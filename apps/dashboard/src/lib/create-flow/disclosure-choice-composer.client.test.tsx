/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { DisclosureChoiceComposer } from './disclosure-choice-composer.client'

const choices = [
  { value: 'owns', label: 'Owner' },
  { value: 'tenant', label: 'Tenant' },
  { value: 'operator', label: 'Operator' },
]

describe('DisclosureChoiceComposer', () => {
  it('requires confirm and does not emit a value from radios alone', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onValueChange = vi.fn()
    render(
      <DisclosureChoiceComposer
        id="relationship"
        choices={choices}
        value={null}
        onValueChange={onValueChange}
        confirmLabel="Add relationship"
        onConfirm={onConfirm}
      />,
    )

    expect(screen.getByRole('button', { name: 'Add relationship' })).toBeDisabled()
    await user.click(screen.getByRole('radio', { name: 'Owner' }))
    expect(onValueChange).toHaveBeenCalledWith('owns')
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('omits radios for a single eligible choice and still requires confirm', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(
      <DisclosureChoiceComposer
        id="relationship"
        choices={[
          { value: 'owns', label: 'Owner', disabled: true, disabledReason: 'Already used' },
          { value: 'operator', label: 'Operator' },
        ]}
        value={null}
        onValueChange={vi.fn()}
        confirmLabel="Add relationship"
        onConfirm={onConfirm}
      />,
    )

    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Add relationship' }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  itAxe('has no accessibility violations', async () => {
    const { container } = render(
      <DisclosureChoiceComposer
        id="relationship"
        choices={choices}
        value="owns"
        onValueChange={vi.fn()}
        confirmLabel="Add relationship"
        onConfirm={vi.fn()}
      />,
    )
    await expectNoAxeViolations(container)
  })
})
