import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useFormContext } from 'react-hook-form'
import { z } from 'zod'

import { Form } from '../../shells/form.client'
import type { FormItem } from '../../field-config'

beforeAll(() => {
  if (!HTMLElement.prototype.scrollIntoView) {
    HTMLElement.prototype.scrollIntoView = () => {}
  }
})

const schema = z.object({
  damage: z.string(),
  damageType: z.string(),
})

type Values = z.infer<typeof schema>

const damageTypeOptions = [
  { value: 'piercing', label: 'Piercing' },
  { value: 'fire', label: 'Fire' },
] as const

const fields: FormItem[] = [
  {
    kind: 'row',
    fields: [
      { type: 'text', name: 'damage', label: 'Damage' },
      {
        type: 'select',
        name: 'damageType',
        label: 'Damage type',
        options: [...damageTypeOptions],
        presentation: { change: { label: 'Change' } },
      },
    ],
  },
]

function controlRegionForLabel(label: string): HTMLElement | null {
  const labelNode = screen.getByText(label)
  return (
    labelNode
      .closest('[data-field-row-participant]')
      ?.querySelector('[data-field-control-region]') ?? null
  )
}

function controlMetrics(region: HTMLElement | null) {
  if (!region) return null
  const band = region.firstElementChild as HTMLElement | null
  if (!band) return null
  const rect = band.getBoundingClientRect()
  return { top: Math.round(rect.top), height: Math.round(rect.height) }
}

describe('SelectField change presentation', () => {
  it('aligns read-only and editing control regions with a row neighbor', async () => {
    const user = userEvent.setup()
    render(
      <Form<Values>
        schema={schema}
        fields={fields}
        defaultValues={{ damage: '2d6', damageType: 'piercing' }}
        onSubmit={vi.fn()}
      />,
    )

    const damageRegion = controlRegionForLabel('Damage')
    const typeRegion = controlRegionForLabel('Damage type')
    expect(damageRegion).not.toBeNull()
    expect(typeRegion).not.toBeNull()
    expect(typeRegion?.closest('[data-field-row-participant]')).toHaveAttribute(
      'data-field-row-participant',
    )
    expect(screen.getByRole('button', { name: 'Change Damage type' })).toBeInTheDocument()
    expect(typeRegion).toContainElement(screen.getByRole('button', { name: 'Change Damage type' }))

    const readOnlyMetrics = {
      damage: controlMetrics(damageRegion),
      type: controlMetrics(typeRegion),
    }
    expect(readOnlyMetrics.damage?.top).toBe(readOnlyMetrics.type?.top)
    expect(readOnlyMetrics.damage?.height).toBe(readOnlyMetrics.type?.height)

    await user.click(screen.getByRole('button', { name: 'Change Damage type' }))

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: 'Damage type' })).toHaveFocus()
    })

    const editingTypeRegion = controlRegionForLabel('Damage type')
    const editingMetrics = {
      damage: controlMetrics(damageRegion),
      type: controlMetrics(editingTypeRegion),
    }
    expect(editingMetrics.damage?.top).toBe(editingMetrics.type?.top)
    expect(editingMetrics.damage?.height).toBe(editingMetrics.type?.height)
  })

  it('commits a choice, returns to the label, and focuses Change', async () => {
    const user = userEvent.setup()
    render(
      <Form<Values>
        schema={schema}
        fields={fields}
        defaultValues={{ damage: '2d6', damageType: 'piercing' }}
        onSubmit={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Change Damage type' }))
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: 'Damage type' })).toHaveFocus()
    })
    const nativeSelect = document.querySelector('select[name="damageType"]') as HTMLSelectElement
    await user.selectOptions(nativeSelect, 'fire')

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Change Damage type' })).toHaveFocus()
    })
    expect(screen.getByLabelText('Damage type')).toHaveTextContent('Fire')
    expect(screen.queryByRole('combobox', { name: 'Damage type' })).not.toBeInTheDocument()
  })

  it('returns to the label when the popup closes without a new value', async () => {
    const user = userEvent.setup()
    render(
      <Form<Values>
        schema={schema}
        fields={fields}
        defaultValues={{ damage: '2d6', damageType: 'piercing' }}
        onSubmit={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Change Damage type' }))
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: 'Damage type' })).toHaveFocus()
    })
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{Escape}')

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Change Damage type' })).toBeInTheDocument()
    })
    expect(screen.getByLabelText('Damage type')).toHaveTextContent('Piercing')
  })

  it('keeps the select open for an unlabeled stored value', () => {
    render(
      <Form<Values>
        schema={schema}
        fields={fields}
        defaultValues={{ damage: '2d6', damageType: 'custom-id' }}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByRole('combobox', { name: 'Damage type' })).toBeInTheDocument()
    expect(screen.queryByText('custom-id')).not.toBeInTheDocument()
  })

  it('disables Change when the field is disabled', () => {
    const disabledFields: FormItem[] = [
      {
        kind: 'row',
        fields: [
          { type: 'text', name: 'damage', label: 'Damage' },
          {
            type: 'select',
            name: 'damageType',
            label: 'Damage type',
            options: [...damageTypeOptions],
            disabled: true,
            presentation: { change: { label: 'Change' } },
          },
        ],
      },
    ]

    render(
      <Form<Values>
        schema={schema}
        fields={disabledFields}
        defaultValues={{ damage: '2d6', damageType: 'piercing' }}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByLabelText('Damage type')).toHaveTextContent('Piercing')
    expect(screen.getByRole('button', { name: 'Change Damage type' })).toBeDisabled()
  })

  it('omits Change when readOnlyWhen applies', () => {
    const readOnlyFields: FormItem[] = [
      {
        type: 'select',
        name: 'damageType',
        label: 'Damage type',
        options: [{ value: 'piercing', label: 'Piercing' }],
        presentation: {
          change: { label: 'Change' },
          readOnlyWhen: () => true,
        },
      },
    ]

    render(
      <Form<Values>
        schema={schema}
        fields={readOnlyFields}
        defaultValues={{ damage: '2d6', damageType: 'piercing' }}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByLabelText('Damage type')).toHaveTextContent('Piercing')
    expect(screen.queryByRole('button', { name: 'Change Damage type' })).not.toBeInTheDocument()
  })

  it('clears editing state after form reset', async () => {
    const user = userEvent.setup()

    function ResetButton() {
      const form = useFormContext<Values>()
      return (
        <button type="button" onClick={() => form.reset({ damage: '2d6', damageType: 'fire' })}>
          Reset values
        </button>
      )
    }

    render(
      <Form<Values>
        schema={schema}
        fields={fields}
        defaultValues={{ damage: '2d6', damageType: 'piercing' }}
        onSubmit={vi.fn()}
        footer={<ResetButton />}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Change Damage type' }))
    expect(screen.getByRole('combobox', { name: 'Damage type' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Reset values' }))

    await waitFor(() => {
      expect(screen.getByLabelText('Damage type')).toHaveTextContent('Fire')
      expect(screen.queryByRole('combobox', { name: 'Damage type' })).not.toBeInTheDocument()
    })
  })
})
