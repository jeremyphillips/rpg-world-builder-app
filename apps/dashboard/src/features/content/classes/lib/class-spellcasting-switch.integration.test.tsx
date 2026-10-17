import { z } from 'zod'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Form, type FormItem } from '@rpg/ui/form'
import { describe, expect, it, vi } from 'vitest'

import { buildClassSpellcastingValueSyncs } from './class-spellcasting-value-syncs'
import { spellcastingFields } from './class-spellcasting-form-fields'
import { classCreateDefaultValues as classCreateDefaults } from './class-form-values'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'

const schema = z.object({
  hasSpellcasting: z.boolean(),
  features: z.array(z.record(z.string(), z.unknown())),
  spellcasting: z
    .object({
      slotProgressionId: z.string().min(1, 'Choose a slot progression'),
      ability: z.string().min(1),
    })
    .optional(),
  grantsCantrips: z.boolean().optional(),
  spellSelectionModel: z.string().optional(),
  spellSelectionChangePackage: z.string().optional(),
})

const ctx = {
  options: { spellcastingSlotProgressions: [{ value: 'full-caster', label: 'Full caster' }] },
} as ContentFormCtx

describe('class spellcasting switch integration', () => {
  it('turns on and reveals dependents when enabling spellcasting', async () => {
    const user = userEvent.setup()
    const fields = spellcastingFields(ctx) as FormItem[]
    const defaultValues = {
      ...classCreateDefaults,
      name: 'Test',
      hitDie: 10,
      features: [],
    }

    render(
      <Form
        schema={schema}
        fields={fields}
        defaultValues={defaultValues}
        valueSyncs={buildClassSpellcastingValueSyncs()}
        onSubmit={() => undefined}
      />,
    )

    const toggle = screen.getByRole('switch', { name: 'Has spellcasting' })
    expect(toggle).not.toBeChecked()

    await user.click(toggle)

    await waitFor(() => {
      expect(screen.getByRole('switch', { name: 'Has spellcasting' })).toBeChecked()
    })
    expect(screen.getByRole('combobox', { name: 'Slot progression' })).toBeInTheDocument()
  })

  it('suppresses spellcasting errors after disable following failed save', async () => {
    const user = userEvent.setup()
    const fields = spellcastingFields(ctx) as FormItem[]
    const defaultValues = {
      ...classCreateDefaults,
      name: 'Test',
      hitDie: 10,
      features: [],
      spellcasting: { slotProgressionId: '', ability: 'int' },
    }

    render(
      <Form
        schema={schema}
        fields={fields}
        defaultValues={defaultValues}
        valueSyncs={buildClassSpellcastingValueSyncs()}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('switch', { name: 'Has spellcasting' }))
    const slotProgression = await screen.findByRole('combobox', { name: 'Slot progression' })
    expect(screen.queryByText('Choose a slot progression')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => {
      expect(screen.getByText('Choose a slot progression')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('switch', { name: 'Has spellcasting' }))
    const removeSpellcasting = await screen.findByRole('button', { name: 'Remove spellcasting' })
    await user.click(removeSpellcasting)
    await waitFor(() => {
      expect(screen.queryByText('Choose a slot progression')).not.toBeInTheDocument()
    })
    expect(slotProgression).not.toBeInTheDocument()
  })
})
