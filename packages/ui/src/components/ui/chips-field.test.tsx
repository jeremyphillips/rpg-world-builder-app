import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, it, expect, vi } from 'vitest'

import { ChipsField } from './chips-field.client'

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
        error="Select at least one."
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Select at least one.')
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
    expect(screen.getByRole('checkbox', { name: 'Dungeon Crawl' })).toHaveClass('text-sm-meta')
    expect(screen.getByRole('checkbox', { name: 'Dungeon Crawl' })).toHaveClass('px-2.5')
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
    expect(screen.getByRole('checkbox', { name: 'Dungeon Crawl' })).toHaveClass('text-xs')
    expect(screen.getByRole('checkbox', { name: 'Dungeon Crawl' })).toHaveClass('px-2.5')
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
    expect(screen.getByRole('checkbox', { name: 'Dungeon Crawl' })).toHaveClass('text-base')
  })

  it('uses md label type scale by default', () => {
    render(
      <ChipsField
        id="play-style"
        label="Play Style"
        options={playStyleOptions}
        multiple
        value={[]}
      />,
    )
    expect(screen.getByText('Play Style')).toHaveClass('text-md')
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
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
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
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
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
        error="Select at least one."
      />,
    )
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })
})
