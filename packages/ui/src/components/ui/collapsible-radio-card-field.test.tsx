import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { CollapsibleRadioCardField } from './collapsible-radio-card-field'

const options = [
  {
    label: 'Governs',
    value: 'governs',
    description: 'Exercises political authority over this region.',
  },
  {
    label: 'Controls',
    value: 'controls',
    description: 'Exercises military or coercive control over this region.',
  },
  {
    label: 'Claims',
    value: 'claims',
    description: 'Publicly asserts authority without fully exercising it.',
  },
]

describe('CollapsibleRadioCardField', () => {
  it('shows the chooser when no value is selected', () => {
    render(
      <CollapsibleRadioCardField
        id="connection-kind"
        label="Authority type"
        summaryEyebrow="Authority type"
        changeLabel="Change connection type"
        options={options}
        value=""
        onValueChange={vi.fn()}
      />,
    )

    expect(screen.getByRole('radiogroup', { name: 'Authority type' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Change connection type' })).not.toBeInTheDocument()
  })

  it('collapses to a summary after selection', async () => {
    const user = userEvent.setup()

    function ControlledField() {
      const [value, setValue] = useState('')

      return (
        <CollapsibleRadioCardField
          id="connection-kind"
          label="Authority type"
          summaryEyebrow="Authority type"
          changeLabel="Change connection type"
          options={options}
          value={value}
          onValueChange={setValue}
        />
      )
    }

    render(<ControlledField />)

    await user.click(screen.getByRole('radio', { name: /Governs/i }))

    expect(
      screen.getByRole('button', { name: 'Governs, Change connection type' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('radiogroup', { name: 'Authority type' })).not.toBeInTheDocument()
  })

  it('re-expands the chooser when Change is clicked', async () => {
    const user = userEvent.setup()

    render(
      <CollapsibleRadioCardField
        id="connection-kind"
        label="Authority type"
        summaryEyebrow="Authority type"
        changeLabel="Change connection type"
        options={options}
        value="governs"
        defaultExpanded={false}
        onValueChange={vi.fn()}
      />,
    )

    expect(
      screen.getByRole('button', { name: 'Governs, Change connection type' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Change connection type' }))

    expect(screen.getByRole('radiogroup', { name: 'Authority type' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Governs/i })).toBeChecked()
  })

  it('re-expands the chooser when the selected title is clicked', async () => {
    const user = userEvent.setup()

    render(
      <CollapsibleRadioCardField
        id="connection-kind"
        label="Authority type"
        summaryEyebrow="Authority type"
        changeLabel="Change connection type"
        options={options}
        value="governs"
        defaultExpanded={false}
        onValueChange={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Governs, Change connection type' }))

    expect(screen.getByRole('radiogroup', { name: 'Authority type' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Governs/i })).toBeChecked()
  })

  it('collapses without emitting when the selected option is clicked again while expanded', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(
      <CollapsibleRadioCardField
        id="connection-kind"
        label="Authority type"
        summaryEyebrow="Authority type"
        changeLabel="Change connection type"
        options={options}
        value="governs"
        expanded
        collapseAfterSelect={false}
        onValueChange={onValueChange}
      />,
    )

    await user.click(screen.getByRole('radio', { name: /Governs/i }))

    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('collapses when the selected option is clicked again while expanded', async () => {
    const user = userEvent.setup()

    function ControlledField() {
      const [expanded, setExpanded] = useState(true)

      return (
        <CollapsibleRadioCardField
          id="connection-kind"
          label="Authority type"
          summaryEyebrow="Authority type"
          changeLabel="Change connection type"
          options={options}
          value="governs"
          expanded={expanded}
          onExpandedChange={setExpanded}
          onValueChange={vi.fn()}
        />
      )
    }

    render(<ControlledField />)

    await user.click(screen.getByRole('radio', { name: /Governs/i }))

    expect(
      screen.getByRole('button', { name: 'Governs, Change connection type' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('radiogroup', { name: 'Authority type' })).not.toBeInTheDocument()
  })

  it('opens collapsed when a value is pre-selected', () => {
    render(
      <CollapsibleRadioCardField
        id="connection-kind"
        label="Authority type"
        summaryEyebrow="Authority type"
        changeLabel="Change connection type"
        options={options}
        value="controls"
        onValueChange={vi.fn()}
      />,
    )

    expect(
      screen.getByRole('button', { name: 'Controls, Change connection type' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('radiogroup', { name: 'Authority type' })).not.toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations in summary mode', async () => {
    const { container } = render(
      <CollapsibleRadioCardField
        id="connection-kind"
        label="Authority type"
        summaryEyebrow="Authority type"
        changeLabel="Change connection type"
        options={options}
        value="governs"
        defaultExpanded={false}
        onValueChange={vi.fn()}
      />,
    )

    await expectNoAxeViolations(container)
  })

  it('omits the summary description when summaryDescription is false', () => {
    render(
      <CollapsibleRadioCardField
        id="connection-kind"
        label="Authority type"
        summaryEyebrow="Authority type"
        changeLabel="Change connection type"
        summaryDescription={false}
        options={options}
        value="governs"
        defaultExpanded={false}
        onValueChange={vi.fn()}
      />,
    )

    expect(
      screen.getByRole('button', { name: 'Governs, Change connection type' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByText('Exercises political authority over this region.'),
    ).not.toBeInTheDocument()
  })

  it('keeps the chooser expanded after select when collapseAfterSelect is false', async () => {
    const user = userEvent.setup()

    function ControlledField() {
      const [value, setValue] = useState('')

      return (
        <CollapsibleRadioCardField
          id="connection-kind"
          label="Authority type"
          summaryEyebrow="Authority type"
          changeLabel="Change connection type"
          collapseAfterSelect={false}
          options={options}
          value={value}
          onValueChange={setValue}
        />
      )
    }

    render(<ControlledField />)

    await user.click(screen.getByRole('radio', { name: /Governs/i }))

    expect(screen.getByRole('radiogroup', { name: 'Authority type' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Governs/i })).toBeChecked()
    expect(screen.queryByRole('button', { name: 'Change connection type' })).not.toBeInTheDocument()
  })

  it('preserves compact density through expand, select, collapse, and change', async () => {
    const user = userEvent.setup()

    function ControlledCompactField() {
      const [value, setValue] = useState('')

      return (
        <CollapsibleRadioCardField
          id="connection-kind"
          label="Authority type"
          summaryEyebrow="Authority type"
          changeLabel="Change connection type"
          density="compact"
          options={options}
          value={value}
          onValueChange={setValue}
        />
      )
    }

    const { container } = render(<ControlledCompactField />)

    const expandedOption = screen.getByRole('radio', { name: /Governs/i })
    expect(expandedOption).toHaveClass('pl-3', 'pr-4', 'py-2')

    await user.click(screen.getByRole('radio', { name: /Governs/i }))

    const summaryBody = container.querySelector('article > div')
    expect(summaryBody).toHaveClass('px-4', 'py-2', 'gap-0')

    await user.click(screen.getByRole('button', { name: 'Change connection type' }))

    const reExpandedOption = screen.getByRole('radio', { name: /Governs/i })
    expect(reExpandedOption).toHaveClass('pl-3', 'pr-4', 'py-2')
    expect(screen.getByRole('radio', { name: /Governs/i })).toBeChecked()
  })
})
