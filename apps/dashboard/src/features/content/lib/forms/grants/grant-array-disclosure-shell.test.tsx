import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { Form, type FormItem } from '@rpg/ui/form'

import { createGrantArrayItemShell } from './grant-array-item-shell.lib'
import { GRANT_ROW_TYPE_LABELS } from './grant-form-schema'
import { resolveGrantRowPresentation } from './grant-row-presentation.lib'
import { disclosureEntityCardBodyInlineStartClasses } from '../../entity/surfaces/cards/disclosure/disclosure-entity-card.variants'
import { ENTITY_CONTENT_OFFSET_VAR } from '../../entity/anatomy/entity-geometry.tokens'

const grantRowSchema = z.object({
  grantType: z.literal('spells'),
  spellIds: z.array(z.string().min(1)).min(1),
  spellAbility: z.string().min(1),
  spellAvailability: z.boolean().optional(),
  spellCastingEnabled: z.boolean().optional(),
  spellCastingFrequency: z.string().optional(),
})

const formSchema = z.object({
  grants: z.array(grantRowSchema),
})

const grantHeaderContext = {
  rowLabels: GRANT_ROW_TYPE_LABELS,
  equipmentOptions: [],
  weaponOptions: [],
  toolOptions: [],
  armorOptions: [],
  skillOptions: [],
  spellOptions: [
    { value: 'speak-with-animals', label: 'Speak with Animals' },
    { value: 'light', label: 'Light' },
  ],
}

const grantFields: FormItem[] = [
  {
    kind: 'array',
    name: 'grants',
    legend: 'Grants',
    item: {
      collapsible: true,
      header: {
        fallback: (index) => `Grant ${index + 1}`,
        primary: (values) => resolveGrantRowPresentation(values, grantHeaderContext)?.heading,
        summary: (values) =>
          resolveGrantRowPresentation(values, grantHeaderContext)?.description ?? '',
      },
      renderShell: createGrantArrayItemShell(grantHeaderContext),
    },
    fields: [
      {
        type: 'text',
        name: 'grantType',
        label: 'Grant type',
        required: true,
      },
      {
        kind: 'slot',
        name: 'spellIds',
        render: () => null,
      },
      {
        type: 'text',
        name: 'spellAbility',
        label: 'Spellcasting ability',
        required: true,
      },
      {
        type: 'checkbox',
        name: 'spellAvailability',
        label: 'Always prepared',
      },
      {
        type: 'checkbox',
        name: 'spellCastingEnabled',
        label: 'Free cast',
      },
      {
        type: 'text',
        name: 'spellCastingFrequency',
        label: 'Cast frequency',
      },
    ],
    addAction: { label: 'Add grant' },
  },
]

const twoGrantDefaults = {
  grants: [
    {
      grantType: 'spells' as const,
      spellIds: ['speak-with-animals'],
      spellAbility: 'wis',
      spellAvailability: true,
      spellCastingEnabled: false,
    },
    {
      grantType: 'spells' as const,
      spellIds: ['light'],
      spellAbility: 'cha',
      spellAvailability: true,
      spellCastingEnabled: false,
    },
  ],
}

function getGrantRow(prefix: string): HTMLElement {
  return document.querySelector(`[data-array-item-prefix="${prefix}"]`) as HTMLElement
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

    const firstRow = getGrantRow('grants.0')
    expect(
      within(firstRow).getByText('Spells', { selector: '.font-body-emphasis' }),
    ).toBeInTheDocument()
    expect(
      within(firstRow).getByText('Speak with Animals', { selector: '.text-muted-foreground' }),
    ).toBeInTheDocument()
    expect(
      within(firstRow).getByText('Character has Speak with Animals always prepared.'),
    ).toBeInTheDocument()

    const expand = within(firstRow).getByRole('button', {
      name: 'Expand Spells, Speak with Animals',
    })
    expect(expand).toHaveAttribute('aria-expanded', 'false')
    expect(expand.parentElement).toHaveClass('w-[var(--leading-chrome-size)]')
    expect(
      within(firstRow).getByRole('button', { name: 'Drag to reorder Spells, Speak with Animals' })
        .parentElement,
    ).toHaveClass('w-[var(--leading-chrome-size)]')
    expect(
      within(firstRow).getByRole('button', { name: 'Remove Grants · Spells' }),
    ).toBeInTheDocument()

    const trailingSlot = firstRow.querySelector('[data-entity-item-slot="trailing"]')
    expect(trailingSlot).toBeTruthy()
    expect(
      within(trailingSlot as HTMLElement).getByRole('button', {
        name: 'Remove Grants · Spells',
      }),
    ).toBeInTheDocument()

    await user.click(expand)

    expect(expand).toHaveAttribute('aria-expanded', 'true')
    const ability = within(firstRow).getByRole('textbox', { name: 'Spellcasting ability' })
    expect(ability.closest('[hidden]')).toBeNull()
    const body = ability.closest('[class*="border-t"]')
    expect(body?.className).toContain(disclosureEntityCardBodyInlineStartClasses)
    expect(body?.className).toContain('pr-[var(--entity-surface-inline-end)]')
    expect(body).toHaveClass('border-t')
    expect(body).toHaveClass('bg-background')
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

    const headerWrap = within(firstRow)
      .getByText('Spells', { selector: '.font-body-emphasis' })
      .closest('[class*="pl-[var(--entity-surface-inline-start)]"]') as HTMLElement
    expect(headerWrap?.className).toMatch(/pl-\[var\(--entity-surface-inline-start\)\]/)
    expect(headerWrap?.className).toMatch(/pr-\[var\(--entity-surface-inline-end\)\]/)

    await user.clear(ability)
    await user.type(ability, 'int')
    expect(ability).toHaveValue('int')
  })

  it('toggles collapse when the grants array is nested inside a detail group', async () => {
    const user = userEvent.setup()

    render(
      <Form
        schema={formSchema}
        fields={[
          {
            kind: 'group',
            fieldChrome: { variant: 'none' },
            fields: grantFields,
          },
        ]}
        defaultValues={twoGrantDefaults}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    const firstRow = getGrantRow('grants.0')
    const expand = within(firstRow).getByRole('button', {
      name: 'Expand Spells, Speak with Animals',
    })
    expect(expand).toHaveClass('cursor-pointer')
    expect(expand).toHaveAttribute('aria-expanded', 'false')

    await user.click(expand)

    expect(expand).toHaveAttribute('aria-expanded', 'true')
    expect(
      within(firstRow).getByRole('textbox', { name: 'Spellcasting ability' }).closest('[hidden]'),
    ).toBeNull()
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
      within(getGrantRow('grants.0')).getByRole('button', {
        name: 'Remove Grants · Spells',
      }),
    )

    expect(document.querySelectorAll('[data-array-item-prefix]')).toHaveLength(1)
    expect(
      screen.queryByText('Speak with Animals', { selector: '.text-muted-foreground' }),
    ).not.toBeInTheDocument()
    // Sole remaining item auto-expands (array collapse contract).
    expect(
      within(getGrantRow('grants.0')).getByRole('button', { name: /^Collapse Spells/ }),
    ).toBeInTheDocument()
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

    const firstRow = getGrantRow('grants.0')
    const lightRow = getGrantRow('grants.1')

    await user.click(
      within(firstRow).getByRole('button', { name: 'Expand Spells, Speak with Animals' }),
    )

    expect(
      within(firstRow).getByRole('button', { name: 'Collapse Spells, Speak with Animals' }),
    ).toBeInTheDocument()
    expect(
      within(lightRow).getByRole('button', { name: 'Expand Spells, Light' }),
    ).toBeInTheDocument()
  })
})
