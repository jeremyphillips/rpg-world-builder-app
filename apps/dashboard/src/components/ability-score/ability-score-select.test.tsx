import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { buildFixedScoreSelectOptions } from '@/features/character/lib/steps/fixed-scores-assignment.lib'

import { AbilityScoreSelect } from './ability-score-select'

const POOL = [15, 14, 13, 12, 10, 8] as const

describe('AbilityScoreSelect', () => {
  it('opens the popover from Choose on an empty card', async () => {
    const user = userEvent.setup()
    const scoreOptions = buildFixedScoreSelectOptions('str', {}, POOL)
    render(
      <AbilityScoreSelect
        ability="str"
        value={null}
        scoreOptions={scoreOptions}
        onSelect={() => undefined}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Choose Strength score' }))
    expect(screen.getByText('Choose a score')).toBeInTheDocument()
  })

  it('commits an available score and closes the popover', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    function Harness() {
      const [open, setOpen] = useState(true)
      const scoreOptions = buildFixedScoreSelectOptions('str', {}, POOL)
      return (
        <AbilityScoreSelect
          ability="str"
          value={null}
          scoreOptions={scoreOptions}
          onSelect={(score) => {
            onSelect(score)
            setOpen(false)
          }}
          open={open}
          onOpenChange={setOpen}
        />
      )
    }

    render(<Harness />)

    await user.click(screen.getByRole('radio', { name: '14' }))
    expect(onSelect).toHaveBeenCalledWith(14)
    await waitFor(() => {
      expect(screen.queryByText('Choose a score')).not.toBeInTheDocument()
    })
  })

  it('commits a move option and closes the popover', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const scoreOptions = buildFixedScoreSelectOptions('dex', { str: 15 }, POOL)

    function Harness() {
      const [open, setOpen] = useState(true)
      return (
        <AbilityScoreSelect
          ability="dex"
          value={null}
          scoreOptions={scoreOptions}
          onSelect={(score) => {
            onSelect(score)
            setOpen(false)
          }}
          open={open}
          onOpenChange={setOpen}
        />
      )
    }

    render(<Harness />)

    await user.click(screen.getByRole('radio', { name: 'Move from Strength, 15' }))
    expect(onSelect).toHaveBeenCalledWith(15)
  })

  it('does not call onSelect for the current score', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const scoreOptions = buildFixedScoreSelectOptions('str', { str: 14 }, POOL)

    render(
      <AbilityScoreSelect
        ability="str"
        value={14}
        scoreOptions={scoreOptions}
        onSelect={onSelect}
        open
      />,
    )

    await user.click(screen.getByRole('radio', { name: '14' }))
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('marks this card score as the selected radio', () => {
    const scoreOptions = buildFixedScoreSelectOptions('str', { str: 14 }, POOL)
    render(
      <AbilityScoreSelect
        ability="str"
        value={14}
        scoreOptions={scoreOptions}
        onSelect={() => undefined}
        open
      />,
    )
    expect(screen.getByRole('radio', { name: '14' })).toBeChecked()
  })

  it('closes on Escape and returns focus to the edit trigger', async () => {
    const user = userEvent.setup()
    const scoreOptions = buildFixedScoreSelectOptions('str', { str: 14 }, POOL)

    function Harness() {
      const [open, setOpen] = useState(true)
      return (
        <AbilityScoreSelect
          ability="str"
          value={14}
          scoreOptions={scoreOptions}
          onSelect={() => undefined}
          open={open}
          onOpenChange={setOpen}
        />
      )
    }

    render(<Harness />)

    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByText('Choose a score')).not.toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: 'Change Strength score' })).toHaveFocus()
  })
})
