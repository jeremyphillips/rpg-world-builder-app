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
  it('clears a natural bonus when unchecked and restores the default when checked again', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderArmorClassForm(onSubmit)

    expect(screen.queryByLabelText('Natural armor bonus')).not.toBeInTheDocument()

    await user.click(screen.getByRole('checkbox', { name: 'Natural armor' }))
    expect(screen.getByLabelText('Natural armor bonus')).toHaveValue(1)

    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSubmit).toHaveBeenLastCalledWith(
      expect.objectContaining({
        armorClass: expect.objectContaining({ naturalArmor: true, naturalArmorBonus: 1 }),
      }),
      expect.anything(),
    )

    await user.click(screen.getByRole('checkbox', { name: 'Natural armor' }))
    expect(screen.queryByLabelText('Natural armor bonus')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Save' }))
    const cleared = onSubmit.mock.calls.at(-1)?.[0] as MonsterFormValues
    expect(cleared.armorClass.naturalArmor).toBe(false)
    expect(cleared.armorClass.naturalArmorBonus).toBeUndefined()
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
