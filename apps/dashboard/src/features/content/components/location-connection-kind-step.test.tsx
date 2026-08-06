import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { LOCATION_CONNECTION_KIND_CHANGE_LABEL } from '../lib/location-connection-drawer-intent'
import { LocationConnectionKindStep } from './location-connection-kind-step.client'

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
  {
    value: 'claims',
    label: 'Claims',
    description: 'Publicly asserts authority without fully exercising it.',
  },
]

describe('LocationConnectionKindStep', () => {
  it('renders a read-only resolved kind for single-kind families', () => {
    render(
      <LocationConnectionKindStep
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

  it('collapses to a summary after selecting a kind', async () => {
    const user = userEvent.setup()

    function ControlledStep() {
      const [value, setValue] = useState<string | null>(null)

      return (
        <LocationConnectionKindStep
          id="connection-kind"
          label="Authority type"
          options={multiKindOptions}
          value={value}
          onValueChange={setValue}
        />
      )
    }

    render(<ControlledStep />)

    await user.click(screen.getByRole('radio', { name: /Governs/i }))

    expect(screen.getByRole('heading', { name: 'Governs' })).toBeInTheDocument()
    expect(screen.queryByRole('radiogroup', { name: 'Authority type' })).not.toBeInTheDocument()
  })

  it('re-expands the chooser when Change is clicked', async () => {
    const user = userEvent.setup()

    render(
      <LocationConnectionKindStep
        id="connection-kind"
        label="Authority type"
        options={multiKindOptions}
        value="controls"
        onValueChange={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: LOCATION_CONNECTION_KIND_CHANGE_LABEL }))

    expect(screen.getByRole('radiogroup', { name: 'Authority type' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Controls/i })).toBeChecked()
  })

  itAxe('has no axe accessibility violations in summary mode', async () => {
    const { container } = render(
      <LocationConnectionKindStep
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
