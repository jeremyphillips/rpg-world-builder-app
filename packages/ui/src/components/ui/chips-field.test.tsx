import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { describe, it, expect, vi } from 'vitest'

import { FieldRowAnatomyProvider } from './field-row-anatomy.context'
import { ChipsField } from './chips-field.client'
import { fieldLabelVariants } from './field.variants'

const playStyleOptions = [
  { value: 'dungeon_crawl', label: 'Dungeon Crawl' },
  { value: 'exploration', label: 'Exploration' },
  { value: 'mystery', label: 'Mystery' },
]

const difficultyOptions = [
  { value: 'casual', label: 'Casual' },
  { value: 'dangerous', label: 'Dangerous' },
]

describe('ChipsField', () => {
  it('renders label and all options', () => {
    render(
      <ChipsField
        id="play-style"
        label="Play Style"
        options={playStyleOptions}
        multiple
        value={[]}
      />,
    )
    expect(screen.getByText('Play Style')).toBeInTheDocument()
    expect(screen.getByText('Dungeon Crawl')).toBeInTheDocument()
    expect(screen.getByText('Exploration')).toBeInTheDocument()
    expect(screen.getByText('Mystery')).toBeInTheDocument()
  })

  describe('introText lead-in', () => {
    it('keeps the concise label in an sr-only name while introText is visible', () => {
      const { container } = render(
        <ChipsField
          id="granted-languages"
          label="Granted languages"
          labelVisibility="srOnly"
          introText="Characters receive these languages:"
          options={playStyleOptions}
          multiple
          value={[]}
        />,
      )

      const name = container.querySelector('#granted-languages-label')
      expect(name).toHaveClass('sr-only')
      expect(name).toHaveTextContent('Granted languages')
      expect(container.querySelector('legend')).toBeNull()

      const intro = screen.getByText('Characters receive these languages:')
      expect(intro).toBeVisible()
      expect(intro).toHaveAttribute('aria-hidden', 'true')
      expect(intro).toHaveClass(...fieldLabelVariants({ size: 'md' }).split(/\s+/))
    })

    it('keeps below-label hint anatomy when introText is present', () => {
      const { container } = render(
        <ChipsField
          id="granted-languages"
          label="Granted languages"
          labelVisibility="srOnly"
          introText="Characters receive these languages:"
          hint="Pick all starting languages."
          options={playStyleOptions}
          multiple
          value={[]}
        />,
      )

      expect(screen.getByText('Pick all starting languages.')).toBeInTheDocument()
      expect(screen.getByText('Characters receive these languages:')).toBeInTheDocument()
      expect(container.querySelector('#granted-languages-label')).toHaveClass('sr-only')
      expect(container.querySelector('legend')).toBeNull()
    })

    it('renders introText inside anatomy rows', () => {
      render(
        <FieldRowAnatomyProvider>
          <ChipsField
            id="granted-languages"
            label="Granted languages"
            labelVisibility="srOnly"
            introText="Characters receive these languages:"
            options={playStyleOptions}
            multiple
            value={[]}
          />
        </FieldRowAnatomyProvider>,
      )

      expect(screen.getByText('Characters receive these languages:')).toBeVisible()
      expect(screen.getByText('Characters receive these languages:')).toHaveAttribute(
        'aria-hidden',
        'true',
      )
    })
  })

  it('marks selected options as checked', () => {
    render(
      <ChipsField
        id="play-style"
        label="Play Style"
        options={playStyleOptions}
        multiple
        value={['dungeon_crawl']}
      />,
    )
    expect(screen.getByRole('checkbox', { name: 'Dungeon Crawl' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    expect(screen.getByRole('checkbox', { name: 'Exploration' })).toHaveAttribute(
      'aria-checked',
      'false',
    )
  })

  it('calls onChange with added value on click (multi)', async () => {
    const onChange = vi.fn()
    render(
      <ChipsField
        id="play-style"
        label="Play Style"
        options={playStyleOptions}
        multiple
        value={['dungeon_crawl']}
        onChange={onChange}
      />,
    )
    await userEvent.click(screen.getByRole('checkbox', { name: 'Exploration' }))
    expect(onChange).toHaveBeenCalledWith(['dungeon_crawl', 'exploration'])
  })

  it('calls onChange with removed value on click (multi)', async () => {
    const onChange = vi.fn()
    render(
      <ChipsField
        id="play-style"
        label="Play Style"
        options={playStyleOptions}
        multiple
        value={['dungeon_crawl', 'exploration']}
        onChange={onChange}
      />,
    )
    await userEvent.click(screen.getByRole('checkbox', { name: 'Dungeon Crawl' }))
    expect(onChange).toHaveBeenCalledWith(['exploration'])
  })

  it('single-select: selecting an option deselects the previous one', async () => {
    const onChange = vi.fn()
    render(
      <ChipsField
        id="difficulty"
        label="Difficulty"
        options={difficultyOptions}
        multiple={false}
        value="casual"
        onChange={onChange}
      />,
    )
    await userEvent.click(screen.getByRole('radio', { name: 'Dangerous' }))
    expect(onChange).toHaveBeenCalledWith('dangerous')
  })

  it('single-select: clicking the active option deselects it', async () => {
    const onChange = vi.fn()
    render(
      <ChipsField
        id="difficulty"
        label="Difficulty"
        options={difficultyOptions}
        multiple={false}
        value="casual"
        onChange={onChange}
      />,
    )
    await userEvent.click(screen.getByRole('radio', { name: 'Casual' }))
    expect(onChange).toHaveBeenCalledWith(undefined)
  })

  it('coerces numeric values to match string option values', () => {
    render(
      <ChipsField
        id="levels"
        label="ASI levels"
        options={[
          { value: '4', label: 'Level 4' },
          { value: '8', label: 'Level 8' },
        ]}
        multiple
        value={[4, 8]}
      />,
    )
    expect(screen.getByRole('checkbox', { name: 'Level 4' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    expect(screen.getByRole('checkbox', { name: 'Level 8' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
  })

  it('does not add selections beyond max', async () => {
    const onChange = vi.fn()
    render(
      <ChipsField
        id="abilities"
        label="Primary abilities"
        options={[
          { value: 'str', label: 'Strength' },
          { value: 'dex', label: 'Dexterity' },
          { value: 'con', label: 'Constitution' },
        ]}
        multiple
        max={2}
        value={['str', 'dex']}
        onChange={onChange}
      />,
    )
    await userEvent.click(screen.getByRole('checkbox', { name: 'Constitution' }))
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('checkbox', { name: 'Constitution' })).toBeDisabled()
  })

  it('renders error message', () => {
    render(
      <ChipsField
        id="play-style"
        label="Play Style"
        options={playStyleOptions}
        multiple
        value={[]}
        error="Choose at least one."
      />,
    )
    const error = screen.getByRole('alert')
    const group = screen.getByRole('group', { name: 'Play Style' })
    expect(error).toHaveTextContent('Choose at least one.')
    expect(document.querySelector('fieldset')).toBeNull()
    expect(error.closest('[data-field-message-region]')).toBeTruthy()
    expect(group.contains(error)).toBe(false)
  })

  it('uses compact error text for sm fields', () => {
    render(
      <ChipsField
        id="play-style"
        label="Play Style"
        options={playStyleOptions}
        multiple
        value={[]}
        error="Choose at least one."
        size="sm"
      />,
    )
    expect(screen.getByRole('alert')).toHaveClass('text-style-field-error')
  })

  it('renders hint when no error', () => {
    render(
      <ChipsField
        id="play-style"
        label="Play Style"
        options={playStyleOptions}
        multiple
        value={[]}
        hint="Pick as many as apply."
      />,
    )
    expect(screen.getByText('Pick as many as apply.')).toBeInTheDocument()
  })

  it('places below-control hints in the message region with sm top padding', () => {
    render(
      <ChipsField
        id="play-style"
        label="Play Style"
        options={playStyleOptions}
        multiple
        value={[]}
        size="sm"
        hint="Pick as many as apply."
        hintPosition="below-control"
      />,
    )

    const hint = screen.getByText('Pick as many as apply.')
    expect(hint.closest('[data-field-message-region]')).toHaveClass('has-[*]:pt-1.5')
  })

  it('applies md pill classes by default', () => {
    render(
      <ChipsField
        id="play-style"
        label="Play Style"
        options={playStyleOptions}
        multiple
        value={[]}
      />,
    )
    expect(screen.getByRole('checkbox', { name: 'Dungeon Crawl' })).toHaveClass('ui-chip--md')
  })

  it('applies sm pill classes when chipSize is sm', () => {
    render(
      <ChipsField
        id="play-style"
        label="Play Style"
        options={playStyleOptions}
        multiple
        value={[]}
        chipSize="sm"
      />,
    )
    expect(screen.getByRole('checkbox', { name: 'Dungeon Crawl' })).toHaveClass('ui-chip--sm')
  })

  it('derives chipSize from field size when chipSize is omitted', () => {
    render(
      <ChipsField
        id="play-style"
        label="Play Style"
        options={playStyleOptions}
        multiple
        value={[]}
        size="lg"
      />,
    )
    expect(screen.getByRole('checkbox', { name: 'Dungeon Crawl' })).toHaveClass('ui-chip--lg')
  })

  it('uses md label type scale on the inner label line by default', () => {
    render(
      <ChipsField
        id="play-style"
        label="Play Style"
        options={playStyleOptions}
        multiple
        value={[]}
      />,
    )
    expect(document.getElementById('play-style-label')).toHaveClass('text-style-field-label-md')
  })

  it('keeps below-label hint visible when invalid', () => {
    render(
      <ChipsField
        id="abilities"
        label="Primary abilities"
        hint="Select up to 2 abilities"
        options={playStyleOptions}
        multiple
        value={[]}
        error="Add at least one primary ability."
      />,
    )
    expect(screen.getByText('Select up to 2 abilities')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Add at least one primary ability.')
  })

  it('applies anatomy gap between the label cluster and chip wrap', () => {
    const { container } = render(
      <ChipsField
        id="abilities"
        label="Primary abilities"
        hint="Select up to 2 abilities"
        options={playStyleOptions}
        multiple
        value={[]}
      />,
    )

    const name = container.querySelector('#abilities-label')
    const group = screen.getByRole('group', { name: 'Primary abilities' })

    expect(container.querySelector('legend')).toBeNull()
    expect(name).toHaveClass('text-style-field-label-md')
    expect(name?.closest('[data-field-label-region]')).toBeTruthy()
    expect(group).toHaveAttribute('aria-labelledby', 'abilities-label')
    expect(group.querySelector('.flex.flex-wrap.gap-2')).toBeTruthy()
  })

  it('keeps the required marker inline with the label when a below-label hint is present', () => {
    render(
      <ChipsField
        id="progression"
        label="Progression"
        hint="Choose how this class gains spell slots."
        options={playStyleOptions}
        multiple={false}
        required
        value=""
      />,
    )

    const cluster = document.getElementById('progression-label')
    expect(cluster).toHaveClass('text-style-field-label-md')
    expect(cluster).toContainElement(screen.getByText('*'))
    expect(cluster).not.toContainElement(
      screen.getByText('Choose how this class gains spell slots.'),
    )
  })

  it('disables all options when disabled', () => {
    render(
      <ChipsField
        id="play-style"
        label="Play Style"
        options={playStyleOptions}
        multiple
        value={[]}
        disabled
      />,
    )
    for (const btn of screen.getAllByRole('checkbox')) {
      expect(btn).toBeDisabled()
    }
  })

  it('has no accessibility violations (multi)', async () => {
    const { container } = render(
      <ChipsField
        id="play-style"
        label="Play Style"
        options={playStyleOptions}
        multiple
        value={['dungeon_crawl']}
      />,
    )
    await expectNoAxeViolations(container)
  })

  it('has no accessibility violations (single)', async () => {
    const { container } = render(
      <ChipsField
        id="difficulty"
        label="Difficulty"
        options={difficultyOptions}
        multiple={false}
        value="casual"
      />,
    )
    await expectNoAxeViolations(container)
  })

  it('renders panel chrome around the label, hint, and chips', () => {
    render(
      <ChipsField
        id="alignment"
        label="Alignment"
        hint="Pick one"
        options={playStyleOptions}
        multiple={false}
        chrome={{ variant: 'panel' }}
      />,
    )

    const group = screen.getByRole('radiogroup', { name: 'Alignment' })
    const shell = group.closest('.rounded-md')

    expect(document.querySelector('legend')).toBeNull()
    expect(shell).toHaveClass('border', 'bg-surface-subtle')
    expect(shell).toHaveTextContent('Pick one')
    expect(group.querySelector('button')).toBeTruthy()
  })

  it('puts container chrome on a wrapper around the field label', () => {
    render(
      <ChipsField
        id="abilities"
        label="Primary abilities"
        hint="Select up to 2 abilities"
        options={playStyleOptions}
        multiple
        chrome={{ variant: 'container' }}
      />,
    )

    const group = screen.getByRole('group', { name: 'Primary abilities' })
    const shell = group.closest('.rounded-md')

    expect(document.querySelector('legend')).toBeNull()
    expect(shell).toHaveClass('border', 'bg-field-container', 'p-4')
    expect(shell).toHaveTextContent('Primary abilities')
    expect(shell).toHaveTextContent('Select up to 2 abilities')
  })

  it('keeps validation errors in the message region inside panel chrome', () => {
    render(
      <ChipsField
        id="alignment"
        label="Alignment"
        options={playStyleOptions}
        multiple={false}
        chrome={{ variant: 'panel' }}
        error="Select an alignment."
      />,
    )

    const group = screen.getByRole('radiogroup', { name: 'Alignment' })
    const error = screen.getByRole('alert')
    const shell = group.closest('.rounded-md')

    expect(shell).toHaveClass('border', 'bg-surface-subtle')
    expect(error).toHaveTextContent('Select an alignment.')
    expect(error.closest('[data-field-message-region]')).toBeTruthy()
    expect(shell?.contains(error)).toBe(true)
    expect(group.contains(error)).toBe(false)
  })

  it('participates in anatomy rows with three-region layout and no fieldset', () => {
    const { container } = render(
      <FieldRowAnatomyProvider>
        <ChipsField
          id="level"
          label="Level"
          options={difficultyOptions}
          multiple={false}
          hint="Cantrips use level 0."
        />
      </FieldRowAnatomyProvider>,
    )

    expect(container.querySelector('[data-field-row-participant]')).toBeTruthy()
    expect(container.querySelector('fieldset')).toBeNull()
    expect(container.querySelector('[data-field-label-region]')).toHaveTextContent('Level')
    expect(container.querySelector('[role="radiogroup"]')).toBeTruthy()
    expect(
      screen.getByText('Cantrips use level 0.').closest('[data-field-message-region]'),
    ).toBeTruthy()
  })

  it('has no accessibility violations when required and in error state', async () => {
    const { container } = render(
      <ChipsField
        id="play-style"
        label="Play Style"
        options={playStyleOptions}
        multiple
        value={[]}
        required
        error="Choose at least one."
      />,
    )
    await expectNoAxeViolations(container)
  })
})
