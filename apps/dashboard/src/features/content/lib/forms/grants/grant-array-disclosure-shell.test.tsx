'use client'

import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { Form, type FormItem } from '@rpg/ui/form'

import { renderGrantArrayItemShell } from './grant-array-item-shell.lib'

const grantRowSchema = z.object({
  grantType: z.literal('spells'),
  spellTitle: z.string().min(1),
  spellAbility: z.string().optional(),
  spellAvailability: z.boolean().optional(),
})

const formSchema = z.object({
  grants: z.array(grantRowSchema),
})

const grantFields: FormItem[] = [
  {
    kind: 'array',
    name: 'grants',
    legend: 'Grants',
    item: {
      collapsible: true,
      header: {
        fallback: (index) => `Grant ${index + 1}`,
        primaryField: 'spellTitle',
        summary: () => 'Character has Speak with Animals always prepared.',
      },
      renderShell: renderGrantArrayItemShell,
    },
    fields: [
      {
        type: 'text',
        name: 'spellTitle',
        label: 'Spell',
        required: true,
      },
      {
        type: 'text',
        name: 'spellAbility',
        label: 'Spellcasting ability',
      },
      {
        type: 'checkbox',
        name: 'spellAvailability',
        label: 'Always prepared',
      },
    ],
    addAction: { label: 'Add grant' },
  },
]

const twoGrantDefaults = {
  grants: [
    {
      grantType: 'spells' as const,
      spellTitle: 'Speak with Animals',
      spellAbility: 'wis',
      spellAvailability: true,
    },
    {
      grantType: 'spells' as const,
      spellTitle: 'Light',
      spellAbility: 'cha',
      spellAvailability: true,
    },
  ],
}

describe('grant array DisclosureEntityCard shell', () => {
  it('renders entity summary, grip + caret, delete, and shell-owned body alignment', async () => {
    const user = userEvent.setup()

    render(
      <Form
        schema={formSchema}
        fields={grantFields}
        defaultValues={twoGrantDefaults}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    expect(
      screen.getByText('Speak with Animals', { selector: '.font-body-emphasis' }),
    ).toBeInTheDocument()
    expect(screen.getAllByText('Spells').length).toBeGreaterThan(0)
    expect(
      screen.getAllByText('Character has Speak with Animals always prepared.').length,
    ).toBeGreaterThan(0)

    const expand = screen.getByRole('button', { name: /Expand Grants · Speak with Animals/i })
    expect(expand.parentElement).toHaveClass('w-[var(--leading-chrome-size)]')
    expect(
      screen.getByRole('button', { name: /Drag to reorder Grants · Speak with Animals/i })
        .parentElement,
    ).toHaveClass('w-[var(--leading-chrome-size)]')
    expect(
      screen.getByRole('button', { name: /Remove Grants · Speak with Animals/i }),
    ).toBeInTheDocument()

    const firstRow = screen
      .getByText('Speak with Animals', { selector: '.font-body-emphasis' })
      .closest('[data-array-item-prefix]') as HTMLElement
    const ability = within(firstRow).getByLabelText('Spellcasting ability')
    expect(ability.closest('[hidden]')).toBeTruthy()

    await user.click(expand)

    expect(ability.closest('[hidden]')).toBeNull()
    const body = ability.closest('[class*="border-t"]')
    expect(body?.className).toContain(
      'pl-[calc(var(--entity-density-inline)+var(--entity-content-indent))]',
    )
    expect(body?.className).toContain('pr-[var(--entity-density-inline)]')
    expect(body).toHaveClass('border-t')

    await user.clear(ability)
    await user.type(ability, 'int')
    expect(ability).toHaveValue('int')
  })

  it('removes the row without leaving a disclosure toggle conflict', async () => {
    const user = userEvent.setup()

    render(
      <Form
        schema={formSchema}
        fields={grantFields}
        defaultValues={twoGrantDefaults}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(
      screen.getByRole('button', {
        name: /Remove Grants · Speak with Animals/i,
      }),
    )

    expect(
      screen.queryByText('Speak with Animals', { selector: '.font-body-emphasis' }),
    ).not.toBeInTheDocument()
    expect(screen.getByText('Light', { selector: '.font-body-emphasis' })).toBeInTheDocument()
    // Sole remaining item auto-expands (array collapse contract).
    expect(screen.getByRole('button', { name: /Collapse Grants · Light/i })).toBeInTheDocument()
  })

  it('keeps peer disclosure state independent per item', async () => {
    const user = userEvent.setup()

    render(
      <Form
        schema={formSchema}
        fields={grantFields}
        defaultValues={twoGrantDefaults}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: /Expand Grants · Speak with Animals/i }))

    const firstRow = screen
      .getByText('Speak with Animals', { selector: '.font-body-emphasis' })
      .closest('[data-array-item-prefix]') as HTMLElement
    const lightRow = screen
      .getByText('Light', { selector: '.font-body-emphasis' })
      .closest('[data-array-item-prefix]') as HTMLElement

    expect(within(firstRow).getByLabelText('Spellcasting ability').closest('[hidden]')).toBeNull()
    expect(within(lightRow).getByLabelText('Spellcasting ability').closest('[hidden]')).toBeTruthy()
  })
})
