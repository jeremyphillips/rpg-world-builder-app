import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { BuilderOptionDetailsSheet } from './builder-option-details-sheet.client'
import { Button } from './button.client'

const baseProps = {
  open: true,
  onOpenChange: vi.fn(),
  title: 'Dwarf',
  eyebrow: 'Species',
  descriptionHtml: '<p>Stout and hardy folk.</p>',
  metadata: [
    { label: 'Creature Type', value: 'Humanoid' },
    { label: 'Size', value: 'Medium' },
  ],
  sections: [
    {
      title: 'Traits',
      items: [
        {
          title: 'Darkvision',
          body: '<p>You have Darkvision with a range of 60 feet.</p>',
        },
      ],
    },
  ],
}

describe('BuilderOptionDetailsSheet', () => {
  it('renders metadata, description, and trait sections when open', () => {
    render(<BuilderOptionDetailsSheet {...baseProps} />)
    const dialog = screen.getByRole('dialog')

    expect(screen.getByRole('heading', { name: 'Dwarf' })).toHaveClass('heading-style-sheet-title')
    expect(screen.getByText('Species')).toHaveClass('eyebrow-style-xs')
    expect(screen.queryByRole('heading', { name: 'Metadata' })).not.toBeInTheDocument()
    expect(screen.getByText('Creature Type')).toBeInTheDocument()
    expect(screen.getByText('Humanoid')).toBeInTheDocument()
    expect(screen.getByText('Stout and hardy folk.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Traits' })).toHaveClass(
      'heading-style-sheet-section',
    )

    const bodyText = dialog.textContent ?? ''
    expect(bodyText.indexOf('Creature Type')).toBeLessThan(
      bodyText.indexOf('Stout and hardy folk.'),
    )
  })

  it('renders a primary action in the header by default', () => {
    render(
      <BuilderOptionDetailsSheet {...baseProps} primaryAction={<Button>Select species</Button>} />,
    )

    const action = screen.getByRole('button', { name: 'Select species' })
    expect(action.closest('.shrink-0')).toBeInTheDocument()
  })

  it('can render a primary action in the footer', () => {
    render(
      <BuilderOptionDetailsSheet
        {...baseProps}
        primaryAction={<Button>Select species</Button>}
        primaryActionPlacement="footer"
      />,
    )

    const action = screen.getByRole('button', { name: 'Select species' })
    expect(action.closest('[class*="border-t"]')).toBeInTheDocument()
  })

  it('closes when the close button is clicked', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<BuilderOptionDetailsSheet {...baseProps} onOpenChange={onOpenChange} />)

    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('has no axe accessibility violations when open', async () => {
    const { container } = render(<BuilderOptionDetailsSheet {...baseProps} />)
    await expectNoAxeViolations(container)
  })

  it('renders grant summary lines for heritage options', () => {
    render(
      <BuilderOptionDetailsSheet
        {...baseProps}
        sections={[
          {
            title: 'Elven Lineage',
            items: [
              {
                title: 'Drow',
                summaryLines: [
                  'L1: Darkvision 120 ft · Dancing Lights cantrip',
                  'L3: Faerie Fire spell',
                  'L5: Darkness spell',
                ],
              },
            ],
          },
        ]}
      />,
    )

    expect(screen.getByText('L1: Darkvision 120 ft · Dancing Lights cantrip')).toBeInTheDocument()
    expect(screen.getByText('L3: Faerie Fire spell')).toBeInTheDocument()
    expect(screen.getByText('L5: Darkness spell')).toBeInTheDocument()
  })

  it('renders choice pool summary with a disclosure tooltip', async () => {
    const user = userEvent.setup()
    render(
      <BuilderOptionDetailsSheet
        {...baseProps}
        sections={[
          {
            title: 'Proficiencies',
            items: [
              {
                title: 'Skills',
                optionPool: {
                  summary: 'Choose 2 from 5 options',
                  optionLabels: ['Acrobatics', 'Athletics', 'History'],
                },
              },
            ],
          },
        ]}
      />,
    )

    expect(screen.getByText('Choose 2 from 5 options')).toBeInTheDocument()
    await user.hover(screen.getByRole('button', { name: 'Skills options' }))
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Acrobatics, Athletics, History')
  })
})
