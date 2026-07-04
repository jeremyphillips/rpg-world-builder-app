import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { describe, it, expect, vi } from 'vitest'

import { ChooseFromChipsField } from './choose-from-chips-field.client'

const skillOptions = [
  { value: 'athletics', label: 'Athletics' },
  { value: 'stealth', label: 'Stealth' },
  { value: 'perception', label: 'Perception' },
]

describe('ChooseFromChipsField', () => {
  it('renders the label, sentence, and chip options', () => {
    render(
      <ChooseFromChipsField
        id="skill-profs"
        label="Skill proficiencies"
        options={skillOptions}
        chooseValue={2}
        chipsValue={['athletics']}
      />,
    )

    expect(screen.getByText('Skill proficiencies')).toBeInTheDocument()
    expect(screen.getByText('Choose')).toBeInTheDocument()
    expect(screen.getByText('skills from:')).toBeInTheDocument()
    expect(screen.getByRole('spinbutton')).toHaveValue(2)
    expect(screen.getByRole('spinbutton').parentElement).toHaveClass('w-[calc(1*1ch+2.75rem)]')
    expect(screen.getByRole('checkbox', { name: 'Athletics' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
  })

  it('calls onChooseChange when the count changes', async () => {
    const onChooseChange = vi.fn()
    render(
      <ChooseFromChipsField
        id="skill-profs"
        label="Skill proficiencies"
        options={skillOptions}
        chooseValue={2}
        onChooseChange={onChooseChange}
        chipsValue={[]}
      />,
    )

    await userEvent.clear(screen.getByRole('spinbutton'))
    await userEvent.type(screen.getByRole('spinbutton'), '3')
    expect(onChooseChange).toHaveBeenCalled()
  })

  it('calls onChipsChange when a chip is toggled', async () => {
    const onChipsChange = vi.fn()
    render(
      <ChooseFromChipsField
        id="skill-profs"
        label="Skill proficiencies"
        options={skillOptions}
        chooseValue={2}
        chipsValue={[]}
        onChipsChange={onChipsChange}
      />,
    )

    await userEvent.click(screen.getByRole('checkbox', { name: 'Stealth' }))
    expect(onChipsChange).toHaveBeenCalledWith(['stealth'])
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <ChooseFromChipsField
        id="skill-profs"
        label="Skill proficiencies"
        options={skillOptions}
        chooseValue={2}
        chipsValue={['athletics']}
        info="Shared with skill records."
      />,
    )
    await expectNoAxeViolations(container)
  })
})
