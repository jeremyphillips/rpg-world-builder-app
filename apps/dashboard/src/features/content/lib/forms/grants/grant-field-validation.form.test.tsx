import { flattenFormIssues, Form, makeResolver, prepareFormIssues } from '@rpg/ui/form'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import type { FormItem } from '@rpg/ui/form'

import { renderGrantArrayItemShell } from './grant-array-item-shell.lib'
import { grantItemFields } from './grant-form-fields'
import { GRANT_TYPE_LABELS, GRANT_TYPES, grantRowFormSchema } from './grant-form-schema'

const grantFields = grantItemFields(GRANT_TYPES, GRANT_TYPE_LABELS, { options: {} })

const grantsOnlySchema = z.object({
  grants: z.array(grantRowFormSchema),
})

const nestedTraitsSchema = z.object({
  traits: z.array(
    z.object({
      grants: z.array(grantRowFormSchema),
    }),
  ),
})

function buildGrantArrayFields(options?: {
  renderShell?: boolean
  nestedInTraits?: boolean
}): FormItem[] {
  const grantArray: FormItem = {
    kind: 'array',
    name: 'grants',
    item: {
      collapsible: true,
      ...(options?.renderShell ? { renderShell: renderGrantArrayItemShell } : {}),
    },
    fields: grantFields,
  }

  if (options?.nestedInTraits) {
    return [{ kind: 'array', name: 'traits', fields: [grantArray] }]
  }

  return [grantArray]
}

const defaultGrantValues = {
  grants: [
    {
      grantType: 'weaponProficiency',
      proficiencySource: 'specific',
      weaponProficiencySlugs: [],
    },
  ],
}

const nestedGrantValues = {
  traits: [defaultGrantValues],
}

describe('grant field validation presentation', () => {
  it('maps resolver errors onto grant field paths', async () => {
    const resolver = makeResolver(grantsOnlySchema, buildGrantArrayFields())
    const result = await resolver(defaultGrantValues, undefined, {
      fields: {},
      shouldUseNativeValidation: false,
    })

    const issues = flattenFormIssues(result.errors)
    expect(issues.map((issue) => issue.path)).toContain('grants.0.weaponProficiencySlugs')
  })

  it('renders validation messages for grant chips and combobox fields', async () => {
    const user = userEvent.setup()

    render(
      <Form
        schema={grantsOnlySchema}
        fields={buildGrantArrayFields()}
        defaultValues={defaultGrantValues}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))

    const weaponsTrigger = screen.getByRole('combobox', { name: 'Weapons' })
    await waitFor(() => {
      expect(weaponsTrigger).toHaveAttribute('aria-invalid', 'true')
    })
    expect(screen.getByRole('alert')).toHaveTextContent(/weapon/i)
  })

  it('renders validation messages when grant arrays use the disclosure shell', async () => {
    const user = userEvent.setup()

    render(
      <Form
        schema={grantsOnlySchema}
        fields={buildGrantArrayFields({ renderShell: true })}
        defaultValues={defaultGrantValues}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: 'Weapons' })).toHaveAttribute(
        'aria-invalid',
        'true',
      )
    })
  })

  it('renders spellcasting row toggles on the anatomy grid with single-line control bands', () => {
    render(
      <Form
        schema={grantsOnlySchema}
        fields={buildGrantArrayFields()}
        defaultValues={{
          grants: [
            {
              grantType: 'spells',
              spellAbility: 'int',
              spellAvailability: false,
              spellCastingEnabled: true,
            },
          ],
        }}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    expect(document.querySelector('[data-field-row-anatomy]')).toBeInTheDocument()

    const abilityTrigger = screen.getByRole('combobox', { name: 'Spellcasting ability' })
    const alwaysPrepared = screen.getByRole('checkbox', { name: 'Always prepared' })

    expect(abilityTrigger.closest('[data-field-row-participant]')).toBeTruthy()
    expect(alwaysPrepared.closest('[data-field-row-participant]')).toBeTruthy()

    const checkboxControlBand = alwaysPrepared
      .closest('[data-field-control-region]')
      ?.querySelector('.items-center')
    expect(checkboxControlBand).toBeTruthy()
    expect(checkboxControlBand).not.toHaveClass('min-h-0', 'h-auto', 'items-start')
  })

  it('renders nested trait grant validation on canonical presentation paths', async () => {
    const user = userEvent.setup()
    const fields = buildGrantArrayFields({ renderShell: true, nestedInTraits: true })

    render(
      <Form
        schema={nestedTraitsSchema}
        fields={fields}
        defaultValues={nestedGrantValues}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))

    const weaponsTrigger = screen.getByRole('combobox', { name: 'Weapons' })
    await waitFor(() => {
      expect(weaponsTrigger).toHaveAttribute('aria-invalid', 'true')
    })

    const result = await makeResolver(nestedTraitsSchema, fields)(nestedGrantValues, undefined, {
      fields: {},
      shouldUseNativeValidation: false,
    })
    const issues = prepareFormIssues(result.errors, fields)
    expect(issues.map((issue) => issue.presentationPath ?? issue.path)).toContain(
      'traits.0.grants.0.weaponProficiencySlugs',
    )
  })
})
