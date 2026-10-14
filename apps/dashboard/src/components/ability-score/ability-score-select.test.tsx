import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { AbilityScoreSelect } from './ability-score-select'

const POOL = [15, 14, 13, 12, 10, 8] as const

describe('AbilityScoreSelect', () => {
  it('opens the popover from Choose on an empty card', async () => {
    const user = userEvent.setup()
    render(
      <AbilityScoreSelect ability="str" value={null} scores={POOL} onSelect={() => undefined} />,
    )

    await user.click(screen.getByRole('button', { name: 'Choose Strength score' }))
    expect(screen.getByText('Choose a score')).toBeInTheDocument()
  })

  it('commits an available score and closes the popover', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    function Harness() {
      const [open, setOpen] = useState(true)
      return (
        <AbilityScoreSelect
          ability="str"
          value={null}
          scores={POOL}
          onSelect={onSelect}
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

  it('does not commit a score used by another ability', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <AbilityScoreSelect
        ability="dex"
        value={null}
        scores={POOL}
        usedBy={{ 14: { abilityLabel: 'Strength', compactLabel: 'STR' } }}
        onSelect={onSelect}
        open
      />,
    )

    await user.click(screen.getByRole('radio', { name: 'Used by STR' }))
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('marks this card score as the selected radio', () => {
    render(
      <AbilityScoreSelect ability="str" value={14} scores={POOL} onSelect={() => undefined} open />,
    )
    expect(screen.getByRole('radio', { name: '14' })).toBeChecked()
  })

  it('closes on Escape and returns focus to the edit trigger', async () => {
    const user = userEvent.setup()

    function Harness() {
      const [open, setOpen] = useState(true)
      return (
        <AbilityScoreSelect
          ability="str"
          value={14}
          scores={POOL}
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
