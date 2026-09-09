import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { z } from 'zod'

import { Form } from '../shells/form.client'
import type { FormItem } from '../field-config'

const schema = z.object({
  savingThrows: z.array(z.string()),
  armor: z.array(z.string()),
  toolCategories: z.array(z.string()),
  tools: z.array(z.string()).optional(),
  weaponMode: z.string().optional(),
  weaponCats: z.array(z.string()).optional(),
  note: z.string().optional(),
})

describe('group field container', () => {
  it('wraps a top-level group fieldset in one shared field container', () => {
    const fields: FormItem[] = [
      {
        kind: 'group',
        legend: 'Defenses',
        description: 'Saving throws and armor training.',
        fields: [
          {
            type: 'chips',
            name: 'savingThrows',
            label: 'Saving throws',
            options: [
              { label: 'Strength', value: 'str' },
              { label: 'Dexterity', value: 'dex' },
            ],
          },
          {
            type: 'chips',
            name: 'armor',
            label: 'Armor training',
            options: [
              { label: 'Light', value: 'light' },
              { label: 'Medium', value: 'medium' },
            ],
          },
        ],
      },
    ]

    const { container } = render(
      <Form
        schema={schema}
        fields={fields}
        defaultValues={{ savingThrows: [], armor: [] }}
        onSubmit={vi.fn()}
      />,
    )

    expect(container.querySelectorAll('.bg-field-container')).toHaveLength(1)
    const shell = container.querySelector('.bg-field-container')
    expect(shell).toBeInstanceOf(HTMLElement)
    const fieldset = screen.getByRole('group', { name: /Defenses/ })
    expect(shell).toContainElement(fieldset)
    expect(fieldset).toHaveClass('border-0', 'flex', 'flex-col')
    expect(shell).toContainElement(screen.getByText('Defenses'))
    expect(shell).toContainElement(screen.getByText('Saving throws and armor training.'))
    expect(shell).toContainElement(screen.getByText('Saving throws'))
    expect(shell).toContainElement(screen.getByText('Armor training'))
  })

  it('keeps nested groups inside the parent field container', () => {
    const fields: FormItem[] = [
      {
        kind: 'group',
        legend: 'Granted skills & tools',
        fields: [
          {
            type: 'chips',
            name: 'savingThrows',
            label: 'Granted skills',
            options: [{ label: 'Athletics', value: 'athletics' }],
          },
          {
            kind: 'group',
            legend: 'Tools',
            fields: [
              {
                type: 'chips',
                name: 'toolCategories',
                label: 'Tool categories',
                options: [{ label: 'Artisan', value: 'artisan' }],
              },
              {
                type: 'text',
                name: 'note',
                label: 'Specific tools',
              },
            ],
          },
        ],
      },
    ]

    const { container } = render(
      <Form
        schema={schema}
        fields={fields}
        defaultValues={{ savingThrows: [], armor: [], toolCategories: [] }}
        onSubmit={vi.fn()}
      />,
    )

    expect(container.querySelectorAll('.bg-field-container')).toHaveLength(1)
    const shell = container.querySelector('.bg-field-container')
    expect(shell).toContainElement(screen.getByText('Granted skills & tools'))
    expect(shell).toContainElement(screen.getByText('Granted skills'))
    expect(shell).toContainElement(screen.getByRole('group', { name: 'Tools' }))
    expect(shell).toContainElement(screen.getByLabelText('Specific tools'))
  })

  it('wraps a dependent inside a top-level group without a second field container', () => {
    const fields: FormItem[] = [
      {
        kind: 'group',
        legend: 'Weapons',
        fields: [
          {
            kind: 'dependent',
            controller: {
              type: 'radio',
              name: 'weaponMode',
              label: 'Weapon proficiency mode',
              options: [
                { label: 'Categories', value: 'categories' },
                { label: 'Individual', value: 'individual' },
              ],
              defaultValue: 'categories',
            },
            dependents: {
              fields: [
                {
                  type: 'chips',
                  name: 'weaponCats',
                  label: 'Weapon categories',
                  options: [{ label: 'Simple', value: 'simple' }],
                },
              ],
            },
          },
        ],
      },
    ]

    const { container } = render(
      <Form
        schema={schema}
        fields={fields}
        defaultValues={{ savingThrows: [], armor: [], weaponMode: 'categories', weaponCats: [] }}
        onSubmit={vi.fn()}
      />,
    )

    expect(container.querySelectorAll('.bg-field-container')).toHaveLength(1)
    const shell = container.querySelector('.bg-field-container')
    expect(shell).toContainElement(screen.getByText('Weapons'))
    expect(shell).toContainElement(screen.getByText('Weapon proficiency mode'))
    expect(shell).toContainElement(screen.getByText('Weapon categories'))
  })

  it('opts out of the shared group container with fieldChrome none', () => {
    const fields: FormItem[] = [
      {
        kind: 'group',
        legend: 'Notes',
        fieldChrome: { variant: 'none' },
        fields: [
          {
            type: 'text',
            name: 'note',
            label: 'Note',
            chrome: { variant: 'none' },
          },
        ],
      },
    ]

    const { container } = render(
      <Form
        schema={schema}
        fields={fields}
        defaultValues={{ savingThrows: [], armor: [] }}
        onSubmit={vi.fn()}
      />,
    )

    expect(container.querySelector('.bg-field-container')).toBeNull()
    expect(screen.getByLabelText('Note')).toBeInTheDocument()
  })

  it('keeps summary-disclosure headers outside the field container', () => {
    const fields: FormItem[] = [
      {
        kind: 'group',
        id: 'availability',
        legend: 'Campaign availability',
        disclosure: {
          variant: 'summary',
          defaultOpen: true,
          openLabel: 'Change',
          closeLabel: 'Done',
          resolveSummary: () => ({ primary: 'Available' }),
        },
        fields: [
          {
            type: 'text',
            name: 'note',
            label: 'Note',
          },
        ],
      },
    ]

    const { container } = render(
      <Form
        schema={schema}
        fields={fields}
        defaultValues={{ savingThrows: [], armor: [] }}
        onSubmit={vi.fn()}
      />,
    )

    const shell = container.querySelector('.bg-field-container')
    expect(shell).toBeInstanceOf(HTMLElement)
    expect(shell).toContainElement(screen.getByLabelText('Note'))
    expect(shell).not.toContainElement(screen.getByText('Campaign availability'))
    expect(screen.getByRole('group', { name: /Campaign availability/ })).toContainElement(
      shell as HTMLElement,
    )
  })
})
