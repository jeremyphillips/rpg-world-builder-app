'use client'

import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { Form, type FormItem } from '@rpg/ui/form'

import { renderGrantArrayItemShell } from './grant-array-item-shell.lib'
import { disclosureEntityCardBodyInlineStartClasses } from '../../entity/surfaces/cards/disclosure/disclosure-entity-card.variants'
import { ENTITY_CONTENT_OFFSET_VAR } from '../../entity/anatomy/entity-geometry.tokens'

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
    expect(
      screen.queryAllByRole('button', { name: /Remove Grants · Speak with Animals/i }),
    ).toHaveLength(1)

    const firstRow = screen
      .getByText('Speak with Animals', { selector: '.font-body-emphasis' })
      .closest('[data-array-item-prefix]') as HTMLElement
    const trailingSlot = firstRow.querySelector('[data-entity-item-slot="trailing"]')
    expect(trailingSlot).toBeTruthy()
    expect(
      within(trailingSlot as HTMLElement).getByRole('button', {
        name: /Remove Grants · Speak with Animals/i,
      }),
    ).toBeInTheDocument()
    const ability = within(firstRow).getByLabelText('Spellcasting ability')
    expect(ability.closest('[hidden]')).toBeTruthy()

    await user.click(expand)

    expect(ability.closest('[hidden]')).toBeNull()
    const body = ability.closest('[class*="border-t"]')
    expect(body?.className).toContain(disclosureEntityCardBodyInlineStartClasses)
    expect(body?.className).toContain('pr-[var(--entity-surface-inline-end)]')
    expect(body).toHaveClass('border-t')
    expect(body?.className).not.toContain('content-column-indent')
    expect(body?.className).not.toContain('content-inline-start')

    const article = firstRow.querySelector('article') as HTMLElement
    expect(article.style.getPropertyValue(ENTITY_CONTENT_OFFSET_VAR)).toContain(
      'calc(2 * calc(var(--spacing)*6)',
    )
    expect(article).toHaveClass('[--entity-surface-inline-start:calc(var(--spacing)*1)]')
    expect(article).toHaveClass('[--entity-surface-inline-end:calc(var(--spacing)*3)]')
    const shell = firstRow.querySelector('[role="group"]') as HTMLElement
    expect(shell.style.getPropertyValue('--content-column-indent')).toBe('')
    expect(shell.className).not.toContain('--entity-surface-inline-start')

    const headerWrap = screen
      .getByText('Speak with Animals', { selector: '.font-body-emphasis' })
      .closest('[class*="pl-[var(--entity-surface-inline-start)]"]') as HTMLElement
    expect(headerWrap?.className).toMatch(/pl-\[var\(--entity-surface-inline-start\)\]/)
    expect(headerWrap?.className).toMatch(/pr-\[var\(--entity-surface-inline-end\)\]/)

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
