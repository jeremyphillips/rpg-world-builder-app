import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { systemDefaultArmorClassRules } from '@rpg/contracts'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { Form } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { resolveMonsterCreateDefaultValues, type MonsterFormValues } from '../monster-form-values'
import { monsterArmorClassFields } from './monster-armor-class-fields'

const ctx = {
  equipmentCatalogStatus: 'ready',
  equipmentCatalogById: new Map(),
  skillCatalogStatus: 'ready',
  armorClassRules: systemDefaultArmorClassRules(),
} satisfies ContentFormCtx

function renderArmorClassForm(onSubmit: (values: MonsterFormValues) => void) {
  return render(
    <Form<MonsterFormValues>
      schema={z.custom<MonsterFormValues>(() => true)}
      fields={monsterArmorClassFields(ctx)}
      defaultValues={resolveMonsterCreateDefaultValues()}
      onSubmit={onSubmit}
      footer={<button type="submit">Save</button>}
    />,
  )
}

describe('monster armor class fields', () => {
  it('shows natural armor as a bonus stepper that defaults to 0', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderArmorClassForm(onSubmit)

    expect(screen.queryByRole('group', { name: 'Natural armor' })).not.toBeInTheDocument()
    expect(screen.queryByRole('checkbox', { name: 'Natural armor' })).not.toBeInTheDocument()
    expect(screen.getByText('Raises unarmored Armor Class by this amount.')).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Armor & shield' })).toBeInTheDocument()
    expect(
      screen.getByRole('group', { name: 'Armor & shield' }).querySelector('legend'),
    ).toHaveClass('sr-only')
    expect(document.querySelector('[data-form-columns]')).toHaveClass('md:grid-cols-2')
    expect(
      screen.queryByText(
        'One suit of body armor. It replaces unarmored or natural Armor Class when it is higher.',
      ),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText('Adds to Armor Class whether or not the creature wears armor.'),
    ).not.toBeInTheDocument()
    expect(screen.getByText('Armor Class')).toHaveClass('text-style-field-legend')
    expect(
      screen.getByText("Configure the creature's defenses and Armor Class."),
    ).toBeInTheDocument()
    expect(screen.getAllByText('None selected')).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Manual AC override' })).toHaveTextContent(
      'Manual AC override',
    )
    expect(screen.getByText('Manual AC override')).toHaveClass('text-style-field-label-md')
    expect(screen.getByText('Manual AC override').className).not.toMatch(/text-style-field-legend/)
    expect(
      screen.getByText(
        "Use when the normal calculation doesn't apply. Replaces the calculated result.",
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Add armor' }).querySelector('[data-icon="plus"]'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Add shield' }).querySelector('[data-icon="plus"]'),
    ).toBeInTheDocument()
    const bonus = screen.getByLabelText('Natural armor bonus')
    expect(bonus).toHaveValue(0)

    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSubmit).toHaveBeenLastCalledWith(
      expect.objectContaining({
        armorClass: expect.objectContaining({ naturalArmorBonus: 0 }),
      }),
      expect.anything(),
    )

    await user.click(screen.getByRole('button', { name: 'Increase Natural armor bonus' }))
    expect(bonus).toHaveValue(1)
  })

  it('keeps a fixed override when the advanced disclosure is collapsed', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderArmorClassForm(onSubmit)

    await user.click(screen.getByRole('button', { name: /Manual AC override/ }))
    const fixed = screen.getByRole('checkbox', { name: 'Use fixed Armor Class' })
    await user.click(fixed)
    expect(fixed).toBeChecked()
    expect(screen.getByLabelText('Fixed Armor Class')).toHaveValue(10)
    await user.click(screen.getByRole('button', { name: /Manual AC override/ }))
    expect(screen.getByRole('checkbox', { name: 'Use fixed Armor Class' })).toBeChecked()
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        armorClass: expect.objectContaining({ useFixedAc: true, fixedValue: 10 }),
      }),
      expect.anything(),
    )
  })
})
