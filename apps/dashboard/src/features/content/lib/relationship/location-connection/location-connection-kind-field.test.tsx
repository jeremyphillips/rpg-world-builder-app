import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { LocationConnectionKindField } from './location-connection-kind-field'

const multiKindOptions = [
  {
    value: 'governs',
    label: 'Governs',
    description: 'Exercises political authority over this region.',
  },
  {
    value: 'controls',
    label: 'Controls',
    description: 'Exercises military or coercive control over this region.',
  },
]

describe('LocationConnectionKindField', () => {
  it('renders a read-only resolved kind for single-kind families', () => {
    render(
      <LocationConnectionKindField
        id="connection-kind"
        label="Connection type"
        options={[
          {
            value: 'operates_in',
            label: 'Operates in',
            description: 'Has geographic activity here without site ownership.',
          },
        ]}
        value={null}
        onValueChange={vi.fn()}
      />,
    )

    expect(screen.getByText('Connection type')).toBeInTheDocument()
    expect(screen.getByText('Operates in')).toBeInTheDocument()
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument()
  })

  it('renders nothing when no options are available', () => {
    const { container } = render(
      <LocationConnectionKindField
        id="connection-kind"
        label="Connection type"
        options={[]}
        value={null}
        onValueChange={vi.fn()}
      />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('renders radio cards for multi-option families', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(
      <LocationConnectionKindField
        id="connection-kind"
        label="Authority type"
        options={multiKindOptions}
        value={null}
        onValueChange={onValueChange}
      />,
    )

    await user.click(screen.getByRole('radio', { name: /Governs/i }))
    expect(onValueChange).toHaveBeenCalledWith('governs')
  })

  it('shows disabled options with unavailable reasons instead of normal descriptions', () => {
    render(
      <LocationConnectionKindField
        id="connection-kind"
        label="Relationship type"
        options={[
          {
            value: 'headquarters',
            label: 'Headquarters',
            description: 'A designated primary base or headquarters location for the organization.',
            disabled: true,
            disabledReason: 'Already set at Thieves Guildhouse.',
          },
          {
            value: 'owns',
            label: 'Owner',
            description: 'Owns or holds title to a property or site.',
          },
        ]}
        value={null}
        onValueChange={vi.fn()}
      />,
    )

    expect(screen.getByRole('radio', { name: /Headquarters/i })).toBeDisabled()
    expect(screen.getByText('Already set at Thieves Guildhouse.')).toBeInTheDocument()
    expect(
      screen.queryByText(
        'A designated primary base or headquarters location for the organization.',
      ),
    ).not.toBeInTheDocument()
  })

  it('disables the entire field when disabled is true', () => {
    render(
      <LocationConnectionKindField
        id="connection-kind"
        label="Authority type"
        options={multiKindOptions}
        value="governs"
        onValueChange={vi.fn()}
        disabled
      />,
    )

    expect(screen.getByRole('radio', { name: /Governs/i })).toBeDisabled()
    expect(screen.getByRole('radio', { name: /Controls/i })).toBeDisabled()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <LocationConnectionKindField
        id="connection-kind"
        label="Authority type"
        options={multiKindOptions}
        value="governs"
        onValueChange={vi.fn()}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
