import { z } from 'zod'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Form, type FormItem } from '../field-config'
import { flattenPatchToLeafSetValues } from './form-value-sync-patch.lib'
import { Form as FormShell } from '../shells/form.client'

const schema = z.object({
  enabled: z.boolean(),
  items: z.array(z.object({ id: z.string() })).optional(),
})

describe('flattenPatchToLeafSetValues', () => {
  it('writes nested objects as leaf paths', () => {
    expect(
      flattenPatchToLeafSetValues({
        spellcasting: { slotProgressionId: 'full-caster', ability: 'int' },
      }),
    ).toEqual([
      { path: 'spellcasting.slotProgressionId', value: 'full-caster' },
      { path: 'spellcasting.ability', value: 'int' },
    ])
  })
})

describe('FormValueSyncEffects', () => {
  it('refreshes values between syncs in the same pass so dependent patches see prior updates', async () => {
    const user = userEvent.setup()
    const fields: FormItem[] = [
      {
        type: 'switch',
        name: 'enabled',
        label: 'Enabled',
      },
    ]

    render(
      <FormShell
        schema={schema}
        fields={fields}
        defaultValues={{ enabled: false, items: [] }}
        valueSyncs={[
          {
            dependsOn: ['enabled'],
            apply: (values, changedKeys) => {
              if (!changedKeys.includes('enabled')) return undefined
              if (!values.enabled) return { items: [] }
              return { items: [{ id: 'seed' }] }
            },
          },
          {
            dependsOn: ['items'],
            apply: (values, changedKeys) => {
              if (!changedKeys.includes('items')) return undefined
              if (!values.enabled) return undefined
              const items = values.items as { id: string }[] | undefined
              if ((items?.length ?? 0) > 0) return undefined
              return { enabled: false }
            },
          },
        ]}
        onSubmit={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('switch', { name: 'Enabled' }))

    await waitFor(() => {
      expect(screen.getByRole('switch', { name: 'Enabled' })).toBeChecked()
    })
  })
})
