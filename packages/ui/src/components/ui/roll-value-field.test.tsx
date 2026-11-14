import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { RollValueField } from './roll-value-field.client'

describe('RollValueField', () => {
  it('renders dice-only defaults without flat modifier controls', () => {
    render(
      <RollValueField
        id="damage"
        label="Damage roll"
        parts={{ diceCount: 1, diceFaces: 12 }}
        onPartsChange={() => undefined}
      />,
    )

    expect(screen.getByLabelText('Number of dice')).toHaveValue(1)
    expect(screen.getByLabelText('Die size')).toBeInTheDocument()
    expect(screen.queryByLabelText('Modifier sign')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add modifier' })).toBeInTheDocument()
  })

  it('adds and removes an optional flat modifier with zero default', async () => {
    const onPartsChange = vi.fn()
    render(
      <RollValueField
        id="damage"
        label="Damage roll"
        parts={{ diceCount: 1, diceFaces: 6 }}
        onPartsChange={onPartsChange}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Add modifier' }))
    expect(onPartsChange).toHaveBeenLastCalledWith({ flatOperator: '+', flatAmount: 0 })
  })

  it('shows empty dice controls when required and no dice atoms are stored', () => {
    render(
      <RollValueField
        id="damage"
        label="Damage roll"
        parts={{}}
        required
        onPartsChange={() => undefined}
      />,
    )

    expect(screen.getByLabelText('Number of dice')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Die size' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add dice' })).not.toBeInTheDocument()
  })

  it('offers add dice when no dice atoms are stored', () => {
    const onPartsChange = vi.fn()
    render(
      <RollValueField id="damage" label="Damage roll" parts={{}} onPartsChange={onPartsChange} />,
    )

    expect(screen.queryByLabelText('Number of dice')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add dice' })).toBeInTheDocument()
    expect(onPartsChange).not.toHaveBeenCalled()
  })

  it('shows a stored count and leaves the missing die empty', async () => {
    const onPartsChange = vi.fn()
    render(
      <RollValueField
        id="damage"
        label="Damage roll"
        parts={{ diceCount: 2 }}
        onPartsChange={onPartsChange}
      />,
    )

    expect(screen.getByLabelText('Number of dice')).toHaveValue(2)
    expect(screen.getByRole('combobox', { name: 'Die size' })).toHaveTextContent('d6')
    expect(onPartsChange).not.toHaveBeenCalled()
  })

  it('commits both default dice only from add dice', async () => {
    const onPartsChange = vi.fn()
    render(
      <RollValueField id="damage" label="Damage roll" parts={{}} onPartsChange={onPartsChange} />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Add dice' }))
    expect(onPartsChange).toHaveBeenCalledWith({ diceCount: 1, diceFaces: 6 })
  })

  it('shows flat-only rolls with add dice affordance', () => {
    render(
      <RollValueField
        id="damage"
        label="Damage roll"
        parts={{ flatOperator: '+', flatAmount: 1 }}
        onPartsChange={() => undefined}
      />,
    )

    expect(screen.queryByLabelText('Number of dice')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Flat modifier value')).toHaveValue(1)
    expect(screen.getByRole('button', { name: 'Add dice' })).toBeInTheDocument()
  })

  itAxe('has no axe for dice plus flat state', async () => {
    const { container } = render(
      <RollValueField
        id="damage"
        label="Damage roll"
        parts={{ diceCount: 1, diceFaces: 8, flatOperator: '+', flatAmount: 2 }}
        onPartsChange={() => undefined}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
