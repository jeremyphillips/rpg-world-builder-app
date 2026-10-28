import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
    expect(
      screen.getByText(
        'Increases natural protection. The higher of natural and equipped armor AC is used.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('Armor Class')).toHaveClass('text-style-field-legend')
    expect(screen.getByRole('button', { name: 'Advanced options' })).toHaveTextContent(
      'Advanced options',
    )
    expect(screen.getByText('Advanced options')).toHaveClass('text-style-field-label-md')
    expect(screen.getByText('Advanced options').className).not.toMatch(/text-style-field-legend/)
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

    await user.click(screen.getByRole('button', { name: 'Advanced options' }))
    const fixed = screen.getByRole('checkbox', { name: 'Use fixed Armor Class' })
    await user.click(fixed)
    expect(fixed).toBeChecked()
    expect(screen.getByLabelText('Fixed Armor Class')).toHaveValue(10)
    await user.click(screen.getByRole('button', { name: 'Advanced options' }))
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
