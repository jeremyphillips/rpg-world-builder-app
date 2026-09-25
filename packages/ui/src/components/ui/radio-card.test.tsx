import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChartNoAxesColumn, Grid3x3 } from 'lucide-react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { RadioCard } from './radio-card.client'

const options = [
  {
    label: 'Modern 5e',
    value: '5e',
    description: 'A familiar modern fantasy rules framework.',
    summaryItems: ['Ascending AC', 'Proficiency bonus'],
  },
  {
    label: 'Modern 3e',
    value: '3e',
    description: 'A detailed d20 framework with ascending armor class.',
    summaryItems: ['Ascending AC', 'Attack bonuses'],
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

  it('calls onValueChange when the selected option is clicked again', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <RadioCard
        aria-label="Edition preset"
        options={options}
        value="5e"
        onValueChange={onValueChange}
      />,
    )

    await user.click(screen.getByRole('radio', { name: /Modern 5e/i }))

    expect(onValueChange).toHaveBeenCalledWith('5e')
    expect(onValueChange).toHaveBeenCalledTimes(1)
  })

  it('marks the selected option as checked', () => {
    render(<RadioCard aria-label="Edition preset" options={options} value="5e" />)
    expect(screen.getByRole('radio', { name: /Modern 5e/i })).toBeChecked()
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

  it('renders embedded content inside a shell without a details action', () => {
    render(
      <RadioCard
        aria-label="Species"
        value="elf"
        options={[
          {
            label: 'Elf',
            value: 'elf',
            description: 'Humanoid',
            embeddedContent: <p>Lineage picker</p>,
          },
        ]}
      />,
    )

    const shell = screen.getByRole('radio', { name: /Elf/i }).closest('[class*="rounded-card"]')
    expect(shell).toHaveClass('bg-surface-strong')
    expect(shell).toHaveTextContent('Lineage picker')
  })

  it('renders footer content inside the shell when the option is not selected', () => {
    render(
      <RadioCard
        aria-label="Species"
        value=""
        options={[
          {
            label: 'Dwarf',
            value: 'dwarf',
            footerContent: <p>Requires strength 13</p>,
          },
        ]}
      />,
    )

    expect(screen.getByText('Requires strength 13')).toBeInTheDocument()
    const shell = screen.getByRole('radio', { name: /Dwarf/i }).closest('[class*="rounded-card"]')
    expect(shell).toHaveClass('bg-background')
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
            onDetails: vi.fn(),
            embeddedSlotTone: 'panel',
            embeddedContent: <p>Configuration panel</p>,
          },
        ]}
      />,
    )

    const panel = screen.getByText('Configuration panel').parentElement
    expect(panel).toHaveTextContent('Configuration panel')
    expect(panel?.className).toContain('-ml-3')
    expect(panel?.className).toContain('-mr-4')
    expect(panel?.className).toContain('rounded-b-card')
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(<RadioCard aria-label="Edition preset" options={options} />)
    await expectNoAxeViolations(container)
  })

  it('renders leading icons instead of radio circles when visualControl is icon', () => {
    const { container } = render(
      <RadioCard
        aria-label="Table type"
        visualControl="icon"
        density="compact"
        value="levelProgression"
        options={[
          {
            label: 'Level progression',
            value: 'levelProgression',
            description: 'Values by character level',
            icon: <ChartNoAxesColumn data-testid="level-progression-icon" aria-hidden />,
          },
          {
            label: 'General table',
            value: 'general',
            description: 'Custom rows and columns',
            icon: <Grid3x3 data-testid="general-table-icon" aria-hidden />,
          },
        ]}
      />,
    )

    expect(screen.getByTestId('level-progression-icon')).toBeInTheDocument()
    expect(screen.getByTestId('general-table-icon')).toBeInTheDocument()
    expect(container.querySelector('[class*="rounded-full"]')).toBeNull()
  })

  it('selects an icon-control option on click and via keyboard', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <RadioCard
        aria-label="Table type"
        visualControl="icon"
        density="compact"
        options={[
          {
            label: 'Level progression',
            value: 'levelProgression',
            icon: <ChartNoAxesColumn aria-hidden />,
          },
          {
            label: 'General table',
            value: 'general',
            icon: <Grid3x3 aria-hidden />,
          },
        ]}
        onValueChange={onValueChange}
      />,
    )

    await user.click(screen.getByRole('radio', { name: /General table/i }))
    expect(onValueChange).toHaveBeenCalledWith('general')

    const general = screen.getByRole('radio', { name: /General table/i })
    general.focus()
    await user.keyboard('{Space}')
    expect(onValueChange).toHaveBeenLastCalledWith('general')
  })

  it('applies selected card styling in icon mode', () => {
    render(
      <RadioCard
        aria-label="Table type"
        visualControl="icon"
        density="compact"
        value="general"
        options={[
          {
            label: 'Level progression',
            value: 'levelProgression',
            icon: <ChartNoAxesColumn aria-hidden />,
          },
          {
            label: 'General table',
            value: 'general',
            icon: <Grid3x3 aria-hidden />,
          },
        ]}
      />,
    )

    const selected = screen.getByRole('radio', { name: /General table/i })
    expect(selected).toHaveClass('data-[state=checked]:border-primary')
    expect(selected).toHaveClass('data-[state=checked]:bg-surface-strong')
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

    await user.click(screen.getByRole('button', { name: 'View Dwarf details' }))
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
            detailsAriaLabel: 'View Dwarf details',
          },
        ]}
      />,
    )
    expect(screen.getByRole('button', { name: 'View Dwarf details' })).toBeInTheDocument()
  })

  it('renders the details action inline with the title row', () => {
    render(
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

    const title = screen.getByText('Dwarf')
    const titleRow = title.closest('.flex.min-w-0.items-center.justify-between')
    const detailsButton = screen.getByRole('button', { name: 'View Dwarf details' })

    expect(titleRow).toContainElement(title)
    expect(titleRow).toContainElement(detailsButton)
  })

  it('renders an info icon on the details action', () => {
    const { container } = render(
      <RadioCard
        aria-label="Classes"
        options={[
          {
            label: 'Fighter',
            value: 'fighter',
            onDetails: vi.fn(),
          },
        ]}
      />,
    )

    expect(container.querySelector('svg.lucide-info')).toBeInTheDocument()
  })

  it('renders a media slot above the card body', () => {
    render(
      <RadioCard
        aria-label="Classes"
        options={[
          {
            label: 'Fighter',
            value: 'fighter',
            media: <img src="/fighter.jpeg" alt="" data-testid="class-art" />,
            onDetails: vi.fn(),
          },
        ]}
      />,
    )

    expect(screen.getByTestId('class-art')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Fighter/i })).toBeInTheDocument()
  })

  it('selects the card when the media slot is clicked', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(
      <RadioCard
        aria-label="Classes"
        onValueChange={onValueChange}
        options={[
          {
            label: 'Fighter',
            value: 'fighter',
            media: <img src="/fighter.jpeg" alt="" data-testid="class-art" />,
            onDetails: vi.fn(),
          },
        ]}
      />,
    )

    await user.click(screen.getByTestId('class-art'))
    expect(onValueChange).toHaveBeenCalledWith('fighter')
  })

  it('reveals a summary badge tooltip on keyboard focus', async () => {
    const user = userEvent.setup()
    render(
      <RadioCard
        aria-label="Classes"
        options={[
          {
            label: 'Wizard',
            value: 'wizard',
            summaryBadge: {
              label: 'Full caster',
              tooltip: 'Eventually reaches 9th-level spell slots.',
            },
            onDetails: vi.fn(),
          },
        ]}
      />,
    )

    await user.hover(screen.getByText('Full caster'))

    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Eventually reaches 9th-level spell slots.',
    )
  })

  it('uses a three-column container grid when columns is three', () => {
    const { container } = render(
      <RadioCard
        aria-label="Classes"
        columns="three"
        options={[
          { label: 'Fighter', value: 'fighter' },
          { label: 'Wizard', value: 'wizard' },
        ]}
      />,
    )

    expect(container.firstElementChild).toHaveClass('@min-[48rem]:grid-cols-3')
  })
})
