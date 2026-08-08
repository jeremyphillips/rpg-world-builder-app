import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { RadioCard } from './radio-card.client'

const options = [
  {
    label: 'Modern 5e',
    value: '5e',
    description: 'A familiar modern fantasy rules framework.',
    meta: ['Ascending AC', 'Proficiency bonus'],
  },
  {
    label: 'Modern 3e',
    value: '3e',
    description: 'A detailed d20 framework with ascending armor class.',
    meta: ['Ascending AC', 'Attack bonuses'],
  },
]

describe('RadioCard', () => {
  it('selects an option on click', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <RadioCard aria-label="Edition preset" options={options} onValueChange={onValueChange} />,
    )
    await user.click(screen.getByRole('radio', { name: /Modern 3e/i }))
    expect(onValueChange).toHaveBeenCalledWith('3e')
  })

  it('marks the selected option as checked', () => {
    render(<RadioCard aria-label="Edition preset" options={options} value="5e" />)
    expect(screen.getByRole('radio', { name: /Modern 5e/i })).toBeChecked()
  })

  it('renders meta chips for each option', () => {
    render(<RadioCard aria-label="Edition preset" options={options} />)
    expect(screen.getByText('Proficiency bonus')).toBeInTheDocument()
    expect(screen.getByText('Attack bonuses')).toBeInTheDocument()
  })

  it('renders compact summary items as an inline line', () => {
    render(
      <RadioCard
        aria-label="Species"
        density="compact"
        options={[
          {
            label: 'Dwarf',
            value: 'dwarf',
            description: 'Humanoid',
            summaryItems: ['Darkvision', 'Dwarven Resilience'],
          },
        ]}
      />,
    )
    expect(screen.getByText('Darkvision · Dwarven Resilience')).toBeInTheDocument()
  })

  it('renders titleMeta inline after the title', () => {
    render(
      <RadioCard
        aria-label="Species"
        density="compact"
        options={[
          {
            label: 'Elf',
            value: 'elf',
            description: 'Humanoid',
            titleMeta: 'Heritage required',
          },
        ]}
      />,
    )

    const radio = screen.getByRole('radio', { name: /Elf/i })
    expect(radio).toHaveTextContent('Elf')
    expect(radio).toHaveTextContent('Heritage required')
  })

  it('renders stacked summary lines for dependent-choice cards', () => {
    render(
      <RadioCard
        aria-label="Elven Lineage"
        density="compact"
        options={[
          {
            label: 'Drow',
            value: 'drow',
            summaryLines: [
              'L1: Darkvision 120 ft · Dancing Lights cantrip',
              'L3: Faerie Fire spell',
            ],
          },
        ]}
      />,
    )

    expect(screen.getByText('L1: Darkvision 120 ft · Dancing Lights cantrip')).toBeInTheDocument()
    expect(screen.getByText('L3: Faerie Fire spell')).toBeInTheDocument()
  })

  it('renders an inline title badge when provided', () => {
    render(
      <RadioCard
        aria-label="Edition preset"
        options={[{ label: 'Modern 5e', value: '5e', badge: 'Recommended' }]}
      />,
    )
    expect(screen.getByText('Recommended')).toBeInTheDocument()
  })

  it('renders embedded content inside the selected card shell', () => {
    render(
      <RadioCard
        aria-label="Species"
        density="compact"
        value="elf"
        options={[
          {
            label: 'Elf',
            value: 'elf',
            description: 'Humanoid',
            titleMeta: 'Heritage required',
            onDetails: vi.fn(),
            embeddedContent: <p>Gnomish Lineage picker</p>,
          },
        ]}
      />,
    )

    const elfCard = screen.getByRole('radio', { name: /Elf/i }).closest('[class*="rounded-card"]')
    expect(elfCard).toHaveTextContent('Gnomish Lineage picker')
  })

  it('hides embedded content when the option is not selected', () => {
    render(
      <RadioCard
        aria-label="Species"
        density="compact"
        value=""
        options={[
          {
            label: 'Elf',
            value: 'elf',
            description: 'Humanoid',
            onDetails: vi.fn(),
            embeddedContent: <p>Gnomish Lineage picker</p>,
          },
        ]}
      />,
    )

    expect(screen.queryByText('Gnomish Lineage picker')).not.toBeInTheDocument()
  })

  it('renders row variant without card shadow and with subtle selected fill', () => {
    render(
      <RadioCard
        aria-label="Elven Lineage"
        variant="row"
        density="compact"
        value="drow"
        options={[
          {
            label: 'Drow',
            value: 'drow',
            summaryLines: ['L1: Darkvision 120 ft · Dancing Lights cantrip'],
          },
          {
            label: 'High Elf',
            value: 'high-elf',
            summaryLines: ['L1: Prestidigitation cantrip'],
          },
        ]}
      />,
    )

    const drow = screen.getByRole('radio', { name: /Drow/i })
    expect(drow).toHaveClass('rounded-md')
    expect(drow).not.toHaveClass('shadow-sm')
    expect(drow).toHaveClass('border-0')
    expect(drow).toHaveClass('data-[state=checked]:bg-row-selected')
    expect(drow).not.toHaveClass('data-[state=checked]:ring-1')
  })

  it('renders embedded panel slot edge-to-edge inside the card shell', () => {
    const { container } = render(
      <RadioCard
        aria-label="Species"
        density="compact"
        value="elf"
        options={[
          {
            label: 'Elf',
            value: 'elf',
            description: 'Humanoid',
            onDetails: vi.fn(),
            embeddedSlotTone: 'panel',
            embeddedContent: <p>Configuration panel</p>,
          },
        ]}
      />,
    )

    const panel = container.querySelector('[class*="bg-surface-muted"]')
    expect(panel).toHaveTextContent('Configuration panel')
    expect(panel?.className).toContain('-mx-4')
    expect(panel?.className).toContain('rounded-b-card')
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(<RadioCard aria-label="Edition preset" options={options} />)
    await expectNoAxeViolations(container)
  })

  it('selects an option when controlPosition is right', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <RadioCard
        aria-label="Edition preset"
        options={options}
        controlPosition="right"
        onValueChange={onValueChange}
      />,
    )
    await user.click(screen.getByRole('radio', { name: /Modern 3e/i }))
    expect(onValueChange).toHaveBeenCalledWith('3e')
  })

  it('opens details without selecting the card', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const onDetails = vi.fn()
    render(
      <RadioCard
        aria-label="Species"
        density="compact"
        value=""
        options={[
          {
            label: 'Dwarf',
            value: 'dwarf',
            description: 'Humanoid',
            onDetails,
          },
        ]}
        onValueChange={onValueChange}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Details' }))
    expect(onDetails).toHaveBeenCalledTimes(1)
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('exposes a focusable details control in compact mode', () => {
    render(
      <RadioCard
        aria-label="Species"
        density="compact"
        options={[
          {
            label: 'Dwarf',
            value: 'dwarf',
            onDetails: vi.fn(),
            detailsLabel: 'View details',
          },
        ]}
      />,
    )
    expect(screen.getByRole('button', { name: 'View details' })).toBeInTheDocument()
  })

  it('renders the details link inline with the title row', () => {
    const { container } = render(
      <RadioCard
        aria-label="Species"
        density="compact"
        options={[
          {
            label: 'Dwarf',
            value: 'dwarf',
            description: 'Humanoid',
            onDetails: vi.fn(),
          },
        ]}
      />,
    )

    const detailsSlot = container.querySelector('[class*="col-start-3"]')
    const title = screen.getByText('Dwarf')

    expect(detailsSlot).toContainElement(screen.getByRole('button', { name: 'Details' }))
    expect(detailsSlot).toHaveClass('row-start-1')
    expect(title.closest('[class*="col-start-2"]')).toBeInTheDocument()
  })
})
