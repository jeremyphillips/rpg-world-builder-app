import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { z } from 'zod'

import { Form } from '../shells/form.client'
import type { FormItem } from '../field-config'
import { prepareFormIssues } from '../errors/resolve-invalid-submit-navigation'
import { resolveNestedFieldErrorMessage } from '../errors/resolve-field-error-message'
import { makeResolver } from '../config/form-resolver'

const grantRowSchema = z
  .object({
    grantType: z.string(),
    language: z.string().optional(),
    resistances: z.array(z.string()).optional(),
    weaponProficiencySlugs: z.array(z.string()).optional(),
  })
  .superRefine((row, ctx) => {
    if (row.grantType === 'languages' && !row.language) {
      ctx.addIssue({
        code: 'custom',
        message: 'Language is required.',
        path: ['language'],
      })
    }
    if (row.grantType === 'resistances' && !row.resistances?.length) {
      ctx.addIssue({
        code: 'custom',
        message: 'Damage types are required.',
        path: ['resistances'],
      })
    }
    if (row.grantType === 'weaponProficiency' && !row.weaponProficiencySlugs?.length) {
      ctx.addIssue({
        code: 'custom',
        message: 'Weapons are required.',
        path: ['weaponProficiencySlugs'],
      })
    }
  })

const schema = z.object({
  grants: z.array(grantRowSchema),
})

const fields: FormItem[] = [
  {
    kind: 'array',
    name: 'grants',
    fields: [
      {
        type: 'select',
        name: 'grantType',
        label: 'Grant type',
        options: [
          { value: 'languages', label: 'Language' },
          { value: 'resistances', label: 'Resistances' },
          { value: 'weaponProficiency', label: 'Weapon proficiency' },
        ],
      },
      {
        type: 'select',
        name: 'language',
        label: 'Language',
        options: [{ value: 'common', label: 'Common' }],
        visibility: {
          dependsOn: ['grantType'],
          visibleWhen: (watched) => watched.grantType === 'languages',
        },
      },
      {
        type: 'chips',
        name: 'resistances',
        label: 'Damage types',
        options: [{ value: 'fire', label: 'Fire' }],
        visibility: {
          dependsOn: ['grantType'],
          visibleWhen: (watched) => watched.grantType === 'resistances',
        },
      },
      {
        type: 'combobox',
        name: 'weaponProficiencySlugs',
        label: 'Weapons',
        multiple: true,
        options: [{ value: 'longsword', label: 'Longsword' }],
        visibility: {
          dependsOn: ['grantType'],
          visibleWhen: (watched) => watched.grantType === 'weaponProficiency',
        },
      },
    ],
  },
]

describe('nested grant field validation presentation', () => {
  it('maps resolver errors for select, chips, and combobox grant fields', async () => {
    const resolver = makeResolver(schema, fields)
    const result = await resolver(
      {
        grants: [
          { grantType: 'languages' },
          { grantType: 'resistances', resistances: [] },
          { grantType: 'weaponProficiency', weaponProficiencySlugs: [] },
        ],
      },
      undefined,
      { fields: {}, shouldUseNativeValidation: false },
    )

    expect(resolveNestedFieldErrorMessage(result.errors, 'grants.0.language')).toBe(
      'Language is required.',
    )
    expect(resolveNestedFieldErrorMessage(result.errors, 'grants.1.resistances')).toBe(
      'Damage types are required.',
    )
    expect(resolveNestedFieldErrorMessage(result.errors, 'grants.2.weaponProficiencySlugs')).toBe(
      'Weapons are required.',
    )

    const issues = prepareFormIssues(result.errors, fields)
    expect(issues.map((issue) => issue.presentationPath ?? issue.path)).toEqual([
      'grants.0.language',
      'grants.1.resistances',
      'grants.2.weaponProficiencySlugs',
    ])
  })

  it('renders validation messages for select, chips, and combobox grant fields', async () => {
    const user = userEvent.setup()

    render(
      <Form
        schema={schema}
        fields={fields}
        defaultValues={{
          grants: [
            { grantType: 'languages' },
            { grantType: 'resistances', resistances: [] },
            { grantType: 'weaponProficiency', weaponProficiencySlugs: [] },
          ],
        }}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.getByText('Language is required.')).toBeInTheDocument()
      expect(screen.getByText('Damage types are required.')).toBeInTheDocument()
      expect(screen.getByText('Weapons are required.')).toBeInTheDocument()
    })
  })
})
