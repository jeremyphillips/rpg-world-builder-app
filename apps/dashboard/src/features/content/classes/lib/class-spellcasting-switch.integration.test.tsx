import { z } from 'zod'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Form, type FormItem } from '@rpg/ui/form'
import { describe, expect, it } from 'vitest'

import { buildClassSpellcastingValueSyncs } from './class-spellcasting-value-syncs'
import { spellcastingFields } from './class-spellcasting-form-fields'
import { classCreateDefaultValues as classCreateDefaults } from './class-form-values'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'

const schema = z.object({
  hasSpellcasting: z.boolean(),
  features: z.array(z.record(z.unknown())),
  spellcasting: z.record(z.unknown()).optional(),
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
})
