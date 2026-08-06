import { describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { TextSuggestionsField } from './text-suggestions-field.client'

const INN_SUGGESTIONS = ['coaching inn', 'roadside inn', 'ferry house'] as const
const SHOP_SUGGESTIONS = [
  'bakery',
  'butcher',
  'chandler',
  'cobbler',
  'general store',
  'jeweler',
  'magic shop',
  'pawnshop',
  'tailor',
] as const

function ControlledSpecialization(props: {
  initialValue?: string
  suggestions: readonly string[]
  hint?: string
}) {
  const [value, setValue] = React.useState(props.initialValue)
  return (
    <TextSuggestionsField
      id="specialization"
      label="Specialization"
      value={value}
      suggestions={props.suggestions}
      hint={props.hint}
      placeholder="Enter specialization…"
      onValueChange={setValue}
    />
  )
}

describe('TextSuggestionsField', () => {
  it('renders as a plain text input with or without suggestions', () => {
    render(
      <TextSuggestionsField
        id="specialization"
        label="Specialization"
        value=""
        suggestions={['coaching inn']}
        onValueChange={() => {}}
      />,
    )
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Specialization' })).toBeInTheDocument()
  })

  it('does not render chevron or listbox affordances', () => {
    const { container } = render(
      <TextSuggestionsField
        id="specialization"
        label="Specialization"
        value=""
        suggestions={['coaching inn']}
        onValueChange={() => {}}
      />,
    )
    expect(container.querySelector('.lucide-chevron-down')).not.toBeInTheDocument()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('allows free text entry without forcing a suggestion', async () => {
    const user = userEvent.setup()
    render(<ControlledSpecialization suggestions={['coaching inn']} />)

    const input = screen.getByRole('textbox', { name: 'Specialization' })
    await user.type(input, 'Custom refinement')
    expect(input).toHaveValue('Custom refinement')
  })

  it('persists the exact registry term when a suggestion is clicked', async () => {
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

    await user.click(screen.getByRole('checkbox', { name: 'Coaching inn' }))
    expect(onValueChange).toHaveBeenCalledWith('coaching inn')
  })

  it('shows one inline suggestion action without dropdown UI', () => {
    render(
      <TextSuggestionsField
        id="specialization"
        label="Specialization"
        value=""
        suggestions={['planar embassy']}
        onValueChange={() => {}}
      />,
    )

    expect(screen.getByText('Recommended')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Planar embassy' })).toBeInTheDocument()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('shows all suggestions inline for small and large sets', () => {
    render(
      <TextSuggestionsField
        id="specialization"
        label="Specialization"
        value=""
        suggestions={INN_SUGGESTIONS}
        onValueChange={() => {}}
      />,
    )

    expect(screen.getByRole('checkbox', { name: 'Coaching inn' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Roadside inn' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Ferry house' })).toBeInTheDocument()
  })

  it('wraps six or more suggestions inline without search UI', () => {
    render(
      <TextSuggestionsField
        id="specialization"
        label="Specialization"
        value=""
        suggestions={SHOP_SUGGESTIONS}
        onValueChange={() => {}}
      />,
    )

    expect(screen.getAllByRole('checkbox')).toHaveLength(SHOP_SUGGESTIONS.length)
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })

  it('does not render an empty Recommended region when there are no terms', () => {
    render(
      <TextSuggestionsField
        id="specialization"
        label="Specialization"
        value=""
        suggestions={[]}
        onValueChange={() => {}}
      />,
    )

    expect(screen.queryByText('Recommended')).not.toBeInTheDocument()
  })

  it('hides suggestions when the value is non-empty and restores them when cleared', async () => {
    const user = userEvent.setup()
    render(<ControlledSpecialization suggestions={INN_SUGGESTIONS} />)

    const input = screen.getByRole('textbox', { name: 'Specialization' })
    expect(screen.getByText('Recommended')).toBeInTheDocument()

    await user.type(input, 'Custom')
    expect(screen.queryByText('Recommended')).not.toBeInTheDocument()

    await user.clear(input)
    expect(screen.getByText('Recommended')).toBeInTheDocument()
  })

  it('hydrates persisted custom values unchanged and hides suggestions', () => {
    render(
      <TextSuggestionsField
        id="specialization"
        label="Specialization"
        value="Harbor inn"
        suggestions={INN_SUGGESTIONS}
        onValueChange={() => {}}
      />,
    )

    expect(screen.getByRole('textbox', { name: 'Specialization' })).toHaveValue('Harbor inn')
    expect(screen.queryByText('Recommended')).not.toBeInTheDocument()
  })

  it('renders hint above the Recommended row', () => {
    render(
      <TextSuggestionsField
        id="specialization"
        label="Specialization"
        value=""
        hint="Add a specialization when you want to describe a more specific kind of building."
        suggestions={INN_SUGGESTIONS}
        onValueChange={() => {}}
      />,
    )

    const hint = screen.getByText(
      'Add a specialization when you want to describe a more specific kind of building.',
    )
    const recommended = screen.getByText('Recommended')
    expect(hint.compareDocumentPosition(recommended)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
  })

  itAxe('passes axe checks', async () => {
    const { container } = render(
      <TextSuggestionsField
        id="specialization"
        label="Specialization"
        value=""
        hint="Add a specialization when you want to describe a more specific kind of building."
        suggestions={INN_SUGGESTIONS}
        onValueChange={() => {}}
      />,
    )
    await expectNoAxeViolations(container)
  })
})
