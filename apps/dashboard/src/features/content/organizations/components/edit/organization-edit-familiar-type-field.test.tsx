import { createElement } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useFormContext, useWatch } from 'react-hook-form'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { Form } from '@rpg/ui/form'

import { OrganizationAuthoringProvider } from '../authoring/organization-authoring-context'
import { ORGANIZATION_FAMILIAR_TYPE_HINT } from '../../lib/presets/organization-form-copy.lib'
import { OrganizationEditFamiliarTypeField } from './organization-edit-familiar-type-field'
import { OrganizationUseFamiliarTypeAction } from './organization-use-familiar-type-action'

const schema = z.object({
  organizationDomain: z.string(),
  organizationForm: z.string().nullable(),
  functions: z.array(z.string()),
  practices: z.array(z.string()),
  members: z.object({
    classAffinityIds: z.array(z.string()),
    titles: z.array(
      z.object({
        id: z.string(),
        label: z.string(),
        priority: z.number(),
      }),
    ),
  }),
})

const preservedTitles = [{ id: 'omt_fixture_gm', label: 'Guildmaster', priority: 50 }]

type HarnessValues = z.infer<typeof schema>

function Harness() {
  const form = useFormContext<HarnessValues>()
  const values = useWatch<HarnessValues>()
  return (
    <>
      <input type="hidden" {...form.register('members.titles')} />
      <output data-testid="form-values">{JSON.stringify(values)}</output>
    </>
  )
}

function renderEditFamiliarTypeForm() {
  render(
    <OrganizationAuthoringProvider>
      <Form
        schema={schema}
        fields={[
          {
            kind: 'group',
            heading: {
              label: 'Organization profile',
              action: createElement(OrganizationUseFamiliarTypeAction),
            },
            fields: [
              {
                kind: 'slot',
                name: '_organizationEditFamiliarType',
                render: () => <OrganizationEditFamiliarTypeField discoverableClasses={[]} />,
              },
            ],
          },
        ]}
        defaultValues={{
          organizationDomain: 'government',
          organizationForm: 'hierarchy',
          functions: ['governance'],
          practices: ['law_enforcement'],
          members: {
            classAffinityIds: ['rogue'],
            titles: preservedTitles,
          },
        }}
        onSubmit={() => undefined}
        header={() => <Harness />}
      />
    </OrganizationAuthoringProvider>,
  )
}

describe('OrganizationEditFamiliarTypeField', () => {
  it('opens from the profile action and closes on confirmation cancel', async () => {
    const user = userEvent.setup()
    renderEditFamiliarTypeForm()

    const action = screen.getByRole('button', { name: 'Use familiar type…' })
    await user.click(action)

    expect(screen.queryByRole('button', { name: 'Use familiar type…' })).not.toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Familiar type' })).toBeInTheDocument()
    expect(screen.getByText(ORGANIZATION_FAMILIAR_TYPE_HINT)).toBeInTheDocument()

    await user.click(screen.getByRole('combobox', { name: 'Familiar type' }))
    await user.click(screen.getByRole('option', { name: /^Gang / }))

    const dialog = screen.getByRole('alertdialog')
    expect(dialog).toHaveTextContent(/Domain, Form, Functions, Practices, and Classes/)
    expect(dialog).toHaveTextContent(/Membership titles.+will not change/)

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => {
      expect(screen.queryByRole('combobox', { name: 'Familiar type' })).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Use familiar type…' })).toHaveFocus()
    })
  })

  it('applies profile and class values, preserves titles, then closes', async () => {
    const user = userEvent.setup()
    renderEditFamiliarTypeForm()

    await user.click(screen.getByRole('button', { name: 'Use familiar type…' }))
    await user.click(screen.getByRole('combobox', { name: 'Familiar type' }))
    await user.click(screen.getByRole('option', { name: /^Gang / }))
    await user.click(screen.getByRole('button', { name: 'Apply Gang' }))

    await waitFor(() => {
      expect(JSON.parse(screen.getByTestId('form-values').textContent ?? '{}')).toMatchObject({
        organizationDomain: 'criminal',
        organizationForm: null,
        functions: [],
        practices: [],
        members: {
          classAffinityIds: [],
          titles: preservedTitles,
        },
      })
      expect(screen.queryByRole('combobox', { name: 'Familiar type' })).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Use familiar type…' })).toHaveFocus()
    })
  })
})
