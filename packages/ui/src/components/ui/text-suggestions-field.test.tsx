import { describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { TextSuggestionsField } from './text-suggestions-field.client'

function ControlledSpecialization(props: {
  initialValue?: string
  suggestions: readonly string[]
}) {
  const [value, setValue] = React.useState(props.initialValue)
  return (
    <TextSuggestionsField
      id="specialization"
      label="Specialization"
      value={value}
      suggestions={props.suggestions}
      onValueChange={setValue}
    />
  )
}

describe('TextSuggestionsField', () => {
  it('associates the label with the combobox input', () => {
    render(
      <TextSuggestionsField
        id="specialization"
        label="Specialization"
        value=""
        suggestions={['coaching inn']}
        onValueChange={() => {}}
      />,
    )
    expect(screen.getByRole('combobox', { name: 'Specialization' })).toHaveAttribute(
      'id',
      'specialization',
    )
  })

  it('allows free text entry without forcing a suggestion', async () => {
    const user = userEvent.setup()
    render(<ControlledSpecialization suggestions={['coaching inn']} />)

    const input = screen.getByRole('combobox', { name: 'Specialization' })
    await user.type(input, 'Custom refinement')
    expect(input).toHaveValue('Custom refinement')
  })

  it('fills the value when a suggestion is selected', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <TextSuggestionsField
        id="specialization"
        label="Specialization"
        value=""
        suggestions={['coaching inn', 'roadside inn']}
        onValueChange={onValueChange}
      />,
    )

    await user.click(screen.getByRole('combobox', { name: 'Specialization' }))
    await user.click(screen.getByRole('option', { name: 'Coaching inn' }))
    expect(onValueChange).toHaveBeenCalledWith('Coaching inn')
  })

  it('passes axe checks', async () => {
    const { container } = render(
      <TextSuggestionsField
        id="specialization"
        label="Specialization"
        value="Sea temple"
        suggestions={['sea temple', 'funerary temple']}
        onValueChange={() => {}}
      />,
    )
    await expectNoAxeViolations(container)
  })
})
