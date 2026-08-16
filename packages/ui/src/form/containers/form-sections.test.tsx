import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'

import { FormItems } from './form-items.client'
import { FormSectionProvider } from '../context/form-section.context'
import { FormUiProvider } from '../context/form-ui.context'
import { Form } from '../shells/form.client'
import type { FormItem } from '../field-config'

const schema = z.object({
  title: z.string(),
  tags: z.array(z.object({ label: z.string() })),
})

const fields: FormItem[] = [
  {
    kind: 'group',
    legend: 'Identity',
    fields: [{ type: 'text', name: 'title', label: 'Title' }],
  },
  {
    kind: 'array',
    name: 'tags',
    legend: 'Tags',
    fields: [{ type: 'text', name: 'label', label: 'Label' }],
    addAction: { label: 'Add tag' },
  },
]

describe('Form section rendering', () => {
  it('renders top-level groups and arrays as fieldsets', () => {
    render(<Form schema={schema} fields={fields} onSubmit={vi.fn()} />)

    expect(screen.getByRole('group', { name: /Identity/ })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: /Tags/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Identity' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tags' })).not.toBeInTheDocument()
  })

  it('renders group and array legends with expected typography', () => {
    render(<Form schema={schema} fields={fields} onSubmit={vi.fn()} />)

    expect(screen.getByText('Identity').closest('legend')).toHaveClass('text-field-group-legend')
    expect(screen.getByText('Tags')).toHaveClass('text-sm')
    expect(screen.getByText('Tags')).not.toHaveClass('text-field-array-legend')
  })

  it('omits section bottom margin on nested groups and rhythm-stack siblings', () => {
    const nestedGroupFields: FormItem[] = [
      {
        kind: 'group',
        legend: 'Weapon',
        fields: [
          { type: 'text', name: 'title', label: 'Title' },
          {
            kind: 'group',
            legend: 'Damage',
            fields: [{ type: 'text', name: 'damageDice', label: 'Dice' }],
          },
        ],
      },
    ]

    render(<Form schema={schema} fields={nestedGroupFields} onSubmit={vi.fn()} />)

    const weaponGroup = screen.getByRole('group', { name: /Weapon/ })
    const damageGroup = screen.getByRole('group', { name: /Damage/ })

    expect(weaponGroup).not.toHaveClass('mb-8')
    expect(weaponGroup).toHaveClass('mb-0')
    expect(damageGroup).not.toHaveClass('mb-8')
    expect(damageGroup).toHaveClass('mb-0')
  })

  it('keeps anonymous layout groups transparent to heading tier', () => {
    const anonymousWrapperFields: FormItem[] = [
      {
        kind: 'group',
        legend: 'Weapon',
        fields: [
          {
            kind: 'group',
            fields: [{ type: 'text', name: 'title', label: 'Title' }],
          },
          {
            kind: 'group',
            legend: 'Damage',
            fields: [{ type: 'text', name: 'damageDice', label: 'Dice' }],
          },
        ],
      },
    ]

    render(<Form schema={schema} fields={anonymousWrapperFields} onSubmit={vi.fn()} />)

    expect(screen.getByText('Weapon').closest('legend')).toHaveClass('text-field-group-legend')
    expect(screen.getByText('Damage').closest('legend')).toHaveClass('text-field-subgroup-legend')
  })

  it('omits section bottom margin on top-level arrays spaced by form rhythm', () => {
    render(<Form schema={schema} fields={fields} onSubmit={vi.fn()} />)

    expect(screen.getByRole('group', { name: /Tags/ })).not.toHaveClass('mb-8')
  })

  it('omits section bottom margin on summary disclosure groups in a rhythm stack', () => {
    const summaryFields: FormItem[] = [
      {
        kind: 'group',
        id: 'summary-group',
        legend: 'Campaign availability',
        disclosure: {
          variant: 'summary',
          defaultOpen: false,
          openLabel: 'Change',
          closeLabel: 'Done',
          resolveSummary: () => ({ primary: 'Available' }),
        },
        fields: [{ type: 'text', name: 'title', label: 'Title' }],
      },
    ]

    function Harness() {
      const form = useForm({ defaultValues: { title: '' } })
      return (
        <FormProvider {...form}>
          <FormUiProvider fields={summaryFields}>
            <FormSectionProvider inRhythmStack>
              <FormItems items={summaryFields} idPrefix="test" />
            </FormSectionProvider>
          </FormUiProvider>
        </FormProvider>
      )
    }

    render(<Harness />)

    const group = screen.getByRole('group', { name: /Campaign availability/ })
    expect(group).not.toHaveClass('mb-8')
    expect(group).toHaveClass('mb-0')
  })

  it('renders row spacing compact as gap-4 on FieldRow', () => {
    const compactRowFields: FormItem[] = [
      {
        kind: 'row',
        spacing: 'compact',
        fields: [
          { type: 'text', name: 'first', label: 'First name' },
          { type: 'text', name: 'second', label: 'Last name' },
        ],
      },
    ]

    const { container } = render(
      <Form schema={schema} fields={compactRowFields} onSubmit={vi.fn()} />,
    )

    const row = container.querySelector('[data-field-row]')
    expect(row).toHaveClass('gap-4')
    expect(row).not.toHaveClass('gap-6')
  })

  it('renders default row spacing as gap-6 on FieldRow', () => {
    const defaultRowFields: FormItem[] = [
      {
        kind: 'row',
        fields: [
          { type: 'text', name: 'first', label: 'First name' },
          { type: 'text', name: 'second', label: 'Last name' },
        ],
      },
    ]

    const { container } = render(
      <Form schema={schema} fields={defaultRowFields} onSubmit={vi.fn()} />,
    )

    const row = container.querySelector('[data-field-row]')
    expect(row).toHaveClass('gap-6')
    expect(row).not.toHaveClass('gap-4')
  })
})
