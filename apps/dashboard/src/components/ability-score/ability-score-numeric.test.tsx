import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { AbilityScoreNumeric } from './ability-score-numeric'

describe('AbilityScoreNumeric', () => {
  it('does not call onCommit on mount', () => {
    const onCommit = vi.fn()
    render(<AbilityScoreNumeric ability="str" value={10} min={1} max={30} onCommit={onCommit} />)
    expect(onCommit).not.toHaveBeenCalled()
  })

  it('keeps the editing input digit-sized inside a relative score row', async () => {
    const user = userEvent.setup()
    render(<AbilityScoreNumeric ability="str" value={10} min={1} max={30} onCommit={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Strength score' }))
    const input = screen.getByRole('textbox', { name: 'Strength score' })

    expect(input).toHaveStyle({ width: '2ch' })
    expect(input.className).toContain('relative')
    expect(input.className).not.toContain('shrink-0')
    expect(input.parentElement).toHaveClass('relative')
  })

  it('commits an in-range integer on Enter', async () => {
    const user = userEvent.setup()
    const onCommit = vi.fn()
    render(<AbilityScoreNumeric ability="str" value={10} min={1} max={30} onCommit={onCommit} />)

    await user.click(screen.getByRole('button', { name: 'Strength score' }))
    const input = screen.getByRole('textbox', { name: 'Strength score' })
    await user.clear(input)
    await user.type(input, '12')
    await user.keyboard('{Enter}')

    expect(onCommit).toHaveBeenCalledWith(12)
  })

  it('reverts on Escape without onCommit', async () => {
    const user = userEvent.setup()
    const onCommit = vi.fn()
    render(<AbilityScoreNumeric ability="str" value={10} min={1} max={30} onCommit={onCommit} />)

    await user.click(screen.getByRole('button', { name: 'Strength score' }))
    const input = screen.getByRole('textbox', { name: 'Strength score' })
    await user.clear(input)
    await user.type(input, '12')
    await user.keyboard('{Escape}')

    expect(onCommit).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Strength score' })).toHaveTextContent('10')
  })

  it('commits null when clearable and the field is emptied on blur', async () => {
    const user = userEvent.setup()
    const onCommit = vi.fn()
    render(
      <AbilityScoreNumeric
        ability="str"
        value={10}
        min={1}
        max={20}
        clearable
        onCommit={onCommit}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Strength score' }))
    const input = screen.getByRole('textbox', { name: 'Strength score' })
    await user.clear(input)
    await user.tab()

    expect(onCommit).toHaveBeenCalledWith(null)
  })

  it('reverts a non-integer draft on blur', async () => {
    const user = userEvent.setup()
    const onCommit = vi.fn()
    render(<AbilityScoreNumeric ability="str" value={10} min={1} max={30} onCommit={onCommit} />)

    await user.click(screen.getByRole('button', { name: 'Strength score' }))
    const input = screen.getByRole('textbox', { name: 'Strength score' })
    await user.clear(input)
    await user.type(input, '1a2')
    await user.tab()

    expect(onCommit).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Strength score' })).toHaveTextContent('10')
  })

  it('steps an out-of-range value toward the max without disabling decrease', async () => {
    const user = userEvent.setup()
    const onCommit = vi.fn()
    render(<AbilityScoreNumeric ability="str" value={35} min={1} max={30} onCommit={onCommit} />)

    await user.click(screen.getByRole('button', { name: 'Decrease Strength score' }))
    expect(onCommit).toHaveBeenCalledWith(34)
  })

  it('updates the displayed value when the prop changes while blurred', async () => {
    const { rerender } = render(
      <AbilityScoreNumeric ability="str" value={10} min={1} max={30} onCommit={vi.fn()} />,
    )

    rerender(<AbilityScoreNumeric ability="str" value={12} min={1} max={30} onCommit={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Strength score' })).toHaveTextContent('12')
  })

  it('keeps the editing draft when the prop changes while focused', async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <AbilityScoreNumeric ability="str" value={10} min={1} max={30} onCommit={vi.fn()} />,
    )

    await user.click(screen.getByRole('button', { name: 'Strength score' }))
    const input = screen.getByRole('textbox', { name: 'Strength score' })
    fireEvent.change(input, { target: { value: '15' } })

    rerender(<AbilityScoreNumeric ability="str" value={12} min={1} max={30} onCommit={vi.fn()} />)
    expect(input).toHaveValue('15')
  })
})
