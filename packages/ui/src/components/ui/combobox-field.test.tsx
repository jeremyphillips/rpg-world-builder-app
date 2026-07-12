import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { ComboboxField } from './combobox-field.client'

const weaponOptions = [
  { value: 'dagger', label: 'Dagger' },
  { value: 'dart', label: 'Dart' },
  { value: 'longsword', label: 'Longsword' },
  { value: 'rapier', label: 'Rapier' },
]

const spellOptions = [
  { value: 'fire-bolt', label: 'Fire Bolt', description: 'Cantrip' },
  { value: 'magic-missile', label: 'Magic Missile', description: 'Level 1' },
]

describe('ComboboxField', () => {
  it('labels the trigger and shows the placeholder', () => {
    render(
      <ComboboxField
        id="weapons"
        label="Specific weapons"
        options={weaponOptions}
        multiple
        value={[]}
        placeholder="Choose weapons…"
      />,
    )
    expect(screen.getByRole('combobox', { name: 'Specific weapons' })).toHaveTextContent(
      'Choose weapons…',
    )
  })

  it('defaults the placeholder to Select {label}…', () => {
    render(
      <ComboboxField
        id="weapons"
        label="Specific weapons"
        options={weaponOptions}
        multiple
        value={[]}
      />,
    )
    expect(screen.getByRole('combobox', { name: 'Specific weapons' })).toHaveTextContent(
      'Select Specific weapons…',
    )
  })

  it('shows the placeholder and spinner while loading', () => {
    render(
      <ComboboxField
        id="weapons"
        label="Specific weapons"
        options={weaponOptions}
        multiple
        value={['dagger', 'rapier']}
        loading
        placeholder="Choose weapons…"
      />,
    )
    const trigger = screen.getByRole('combobox', { name: 'Specific weapons' })
    expect(trigger).toHaveTextContent('Choose weapons…')
    expect(trigger).toHaveAttribute('aria-busy', 'true')
    expect(trigger).toBeDisabled()
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
  })

  it('shows selected count in multi mode', () => {
    render(
      <ComboboxField
        id="weapons"
        label="Specific weapons"
        options={weaponOptions}
        multiple
        value={['dagger', 'rapier']}
      />,
    )
    expect(screen.getByRole('combobox', { name: 'Specific weapons' })).toHaveTextContent(
      '2 selected',
    )
    expect(screen.getByRole('button', { name: 'Remove Dagger' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove Rapier' })).toBeInTheDocument()
  })

  it('shows the selected label in single mode', () => {
    render(
      <ComboboxField
        id="weapon"
        label="Primary weapon"
        options={weaponOptions}
        multiple={false}
        value="longsword"
      />,
    )
    expect(screen.getByRole('combobox', { name: 'Primary weapon' })).toHaveTextContent('Longsword')
  })

  it('renders stale selections that are missing from options', () => {
    render(
      <ComboboxField
        id="weapons"
        label="Specific weapons"
        options={weaponOptions}
        multiple
        value={['dagger', 'missing-weapon']}
      />,
    )
    expect(screen.getByRole('button', { name: 'Remove missing-weapon' })).toBeInTheDocument()
  })

  it('renders custom selected items via renderSelectedItem', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <ComboboxField
        id="weapons"
        label="Specific weapons"
        options={weaponOptions}
        multiple
        value={['dagger']}
        onChange={onChange}
        renderSelectedItem={(option, { onRemove }) => (
          <div data-testid={`selected-${option.value}`}>
            <span>{option.label}</span>
            <button type="button" onClick={onRemove}>
              Dismiss {option.label}
            </button>
          </div>
        )}
      />,
    )

    expect(screen.getByTestId('selected-dagger')).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Selected Specific weapons' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Dismiss Dagger' }))
    expect(onChange).toHaveBeenCalledWith([])
  })

  it('threads field size into dismissible badge size', () => {
    render(
      <ComboboxField
        id="weapons"
        label="Specific weapons"
        options={weaponOptions}
        multiple
        size="sm"
        value={['dagger']}
      />,
    )

    expect(screen.getByText('Dagger').closest('.text-sm-meta')).toBeInTheDocument()
  })

  it('opens with a chromeless search row that replaces the trigger', async () => {
    const user = userEvent.setup()
    render(<ComboboxField id="spells" label="Spells" options={spellOptions} multiple value={[]} />)

    await user.click(screen.getByRole('combobox', { name: 'Spells' }))
    const trigger = screen.getByRole('combobox', { name: 'Spells' })
    const search = screen.getByRole('searchbox', { name: 'Search Spells' })

    expect(trigger).toHaveClass('invisible')
    expect(search).toHaveClass('dark:bg-transparent')
    expect(search.closest('[class*="dark:bg-input/30"]')).not.toBeNull()
  })

  it('omits the search row when enableSearch is false', async () => {
    const user = userEvent.setup()
    render(
      <ComboboxField
        id="weapons"
        label="Specific weapons"
        options={weaponOptions}
        multiple
        value={[]}
        enableSearch={false}
      />,
    )

    await user.click(screen.getByRole('combobox', { name: 'Specific weapons' }))
    expect(
      screen.queryByRole('searchbox', { name: 'Search Specific weapons' }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Specific weapons' })).not.toHaveClass('invisible')
    expect(screen.getByRole('listbox', { name: 'Specific weapons' })).toHaveFocus()
  })

  it('navigates and selects via listbox keyboard when enableSearch is false', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(
      <ComboboxField
        id="weapon"
        label="Primary weapon"
        options={weaponOptions}
        multiple={false}
        value=""
        enableSearch={false}
        onChange={onChange}
      />,
    )

    await user.click(screen.getByRole('combobox', { name: 'Primary weapon' }))
    const listbox = screen.getByRole('listbox', { name: 'Primary weapon' })
    expect(listbox).toHaveFocus()

    await user.keyboard('{ArrowDown}{Enter}')
    expect(onChange).toHaveBeenCalledWith('dart')
  })

  it('filters options while searching', async () => {
    const user = userEvent.setup()
    render(<ComboboxField id="spells" label="Spells" options={spellOptions} multiple value={[]} />)

    await user.click(screen.getByRole('combobox', { name: 'Spells' }))
    const search = screen.getByRole('searchbox', { name: 'Search Spells' })
    await user.type(search, 'magic')

    expect(screen.getByRole('option', { name: /Magic Missile/i })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: /Fire Bolt/i })).not.toBeInTheDocument()
  })

  it('keeps selected options visible while searching', async () => {
    const user = userEvent.setup()
    render(
      <ComboboxField
        id="weapons"
        label="Specific weapons"
        options={weaponOptions}
        multiple
        value={['dagger']}
      />,
    )

    await user.click(screen.getByRole('combobox', { name: 'Specific weapons' }))
    await user.type(screen.getByRole('searchbox', { name: 'Search Specific weapons' }), 'long')

    expect(screen.getByRole('option', { name: 'Dagger' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Longsword' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Dart' })).not.toBeInTheDocument()
  })

  it('adds a selection in multi mode', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(
      <ComboboxField
        id="weapons"
        label="Specific weapons"
        options={weaponOptions}
        multiple
        value={['dagger']}
        onChange={onChange}
      />,
    )

    await user.click(screen.getByRole('combobox', { name: 'Specific weapons' }))
    await user.click(screen.getByRole('option', { name: /Rapier/i }))

    expect(onChange).toHaveBeenCalledWith(['dagger', 'rapier'])
  })

  it('removes a selected badge in multi mode', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(
      <ComboboxField
        id="weapons"
        label="Specific weapons"
        options={weaponOptions}
        multiple
        value={['dagger', 'rapier']}
        onChange={onChange}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Remove Dagger' }))
    expect(onChange).toHaveBeenCalledWith(['rapier'])
  })

  it('selects a value and closes in single mode', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(
      <ComboboxField
        id="weapon"
        label="Primary weapon"
        options={weaponOptions}
        multiple={false}
        value=""
        onChange={onChange}
      />,
    )

    await user.click(screen.getByRole('combobox', { name: 'Primary weapon' }))
    await user.click(screen.getByRole('option', { name: /Longsword/i }))

    expect(onChange).toHaveBeenCalledWith('longsword')
    expect(
      screen.queryByRole('searchbox', { name: 'Search Primary weapon' }),
    ).not.toBeInTheDocument()
  })

  it('does not add selections beyond max', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(
      <ComboboxField
        id="weapons"
        label="Specific weapons"
        options={weaponOptions}
        multiple
        max={2}
        value={['dagger', 'rapier']}
        onChange={onChange}
      />,
    )

    await user.click(screen.getByRole('combobox', { name: 'Specific weapons' }))
    const listbox = screen.getByRole('listbox', { name: 'Specific weapons' })
    const longsword = within(listbox).getByRole('option', { name: /Longsword/i })
    expect(longsword).toBeDisabled()
    await user.click(longsword)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('renders error message and marks the trigger invalid', () => {
    render(
      <ComboboxField
        id="spells"
        label="Spells"
        options={spellOptions}
        multiple
        value={[]}
        hint="Pick one."
        error="Required."
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Required.')
    expect(screen.queryByText('Pick one.')).not.toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Spells' })).toHaveAttribute('aria-invalid', 'true')
  })

  it('has no accessibility violations when search is disabled', async () => {
    const { container } = render(
      <ComboboxField
        id="weapons"
        label="Specific weapons"
        options={weaponOptions}
        multiple
        value={[]}
        enableSearch={false}
      />,
    )
    await expectNoAxeViolations(container)
  })

  it('has no accessibility violations (multi)', async () => {
    const { container } = render(
      <ComboboxField
        id="weapons"
        label="Specific weapons"
        options={weaponOptions}
        multiple
        value={['dagger']}
      />,
    )
    await expectNoAxeViolations(container)
  })

  it('has no accessibility violations (single)', async () => {
    const { container } = render(
      <ComboboxField
        id="weapon"
        label="Primary weapon"
        options={weaponOptions}
        multiple={false}
        value="rapier"
      />,
    )
    await expectNoAxeViolations(container)
  })

  it('has no accessibility violations when required and in error state', async () => {
    const { container } = render(
      <ComboboxField
        id="spells"
        label="Spells"
        options={spellOptions}
        multiple
        value={[]}
        required
        error="Select at least one."
      />,
    )
    await expectNoAxeViolations(container)
  })
})
