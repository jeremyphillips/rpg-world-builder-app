import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { Form } from '@rpg/ui/form'
import type { OrganizationMembershipTitleDefinition } from '@rpg/contracts'

import { buildOrganizationMembershipTitlesArrayField } from '../../lib/membership-titles/organization-membership-titles-form.lib'
import { OrganizationMembershipTitlesRegistration } from '../authoring/organization-membership-titles-registration'

const schema = z.object({
  members: z.object({
    classAffinityIds: z.array(z.string()).default([]),
    titles: z.array(
      z.object({
        id: z.string(),
        label: z.string(),
        priority: z.union([z.number(), z.string()]),
      }),
    ),
  }),
})

const initialTitles: OrganizationMembershipTitleDefinition[] = [
  { id: 'omt_chair', label: 'Chair', priority: 50 },
  { id: 'omt_clerk', label: 'Clerk', priority: 10 },
]

const changedTitles: OrganizationMembershipTitleDefinition[] = [
  { id: 'omt_initiate', label: 'Initiate', priority: 10 },
]

function FormHarness() {
  const form = useFormContext<z.infer<typeof schema>>()
  const { replace } = useFieldArray({ control: form.control, name: 'members.titles' })
  return (
    <div>
      <button
        type="button"
        onClick={() => {
          replace(changedTitles)
          form.setValue('members.titles', changedTitles, { shouldDirty: true })
        }}
      >
        Change titles
      </button>
      <button
        type="button"
        onClick={() => {
          const resetMembers = { classAffinityIds: [], titles: initialTitles }
          form.reset({ members: resetMembers })
          replace(initialTitles)
        }}
      >
        Reset titles
      </button>
    </div>
  )
}

function renderTitlesField(prefix?: string) {
  render(
    <Form
      schema={schema}
      fields={[
        buildOrganizationMembershipTitlesArrayField(prefix),
        {
          kind: 'slot',
          name: '_harness',
          render: () => <FormHarness />,
        },
      ]}
      defaultValues={{ members: { titles: initialTitles } }}
      onSubmit={() => undefined}
    />,
  )
}

function titlesFieldset(): HTMLElement {
  const fieldset = document.getElementById('organization-membership-titles')
  if (!fieldset) {
    throw new Error('Expected membership titles fieldset')
  }
  return fieldset
}

describe('Organization membership titles array field', () => {
  it('renders current form members.titles', () => {
    renderTitlesField()
    const fieldset = titlesFieldset()
    expect(within(fieldset).getByDisplayValue('Chair')).toBeInTheDocument()
    expect(within(fieldset).getByDisplayValue('Clerk')).toBeInTheDocument()
  })

  it('renders titles when a sibling registers members without titles', () => {
    render(
      <Form
        schema={schema}
        fields={[
          {
            kind: 'slot',
            name: '_organizationMembershipTitlesRegistration',
            render: () => <OrganizationMembershipTitlesRegistration />,
          },
          {
            type: 'chips',
            name: 'members.classAffinityIds',
            label: 'Class affinities',
            options: [{ value: 'class-fighter', label: 'Fighter' }],
            multiple: true,
          },
          buildOrganizationMembershipTitlesArrayField(),
        ]}
        defaultValues={{ members: { classAffinityIds: [], titles: initialTitles } }}
        onSubmit={() => undefined}
      />,
    )

    const fieldset = titlesFieldset()
    expect(within(fieldset).getByDisplayValue('Chair')).toBeInTheDocument()
    expect(within(fieldset).getByDisplayValue('Clerk')).toBeInTheDocument()
  })

  it('renders under an embedded namespace prefix', () => {
    const embeddedSchema = z.object({ operatorOrganization: schema })
    render(
      <Form
        schema={embeddedSchema}
        fields={[buildOrganizationMembershipTitlesArrayField('operatorOrganization')]}
        defaultValues={{ operatorOrganization: { members: { titles: initialTitles } } }}
        onSubmit={() => undefined}
      />,
    )

    const fieldset = titlesFieldset()
    expect(within(fieldset).getByDisplayValue('Chair')).toBeInTheDocument()
  })

  it('exposes editable membership title controls inside the titles group', () => {
    renderTitlesField()
    const fieldset = titlesFieldset()
    expect(within(fieldset).getAllByRole('textbox').length).toBeGreaterThan(0)
    expect(within(fieldset).getByRole('button', { name: 'Add title' })).toBeInTheDocument()
    expect(within(fieldset).getAllByRole('button', { name: /Remove/ }).length).toBeGreaterThan(0)
  })

  it('updates when form state changes and reset restores the catalog', async () => {
    const user = userEvent.setup()
    renderTitlesField()

    await user.click(screen.getByRole('button', { name: 'Change titles' }))
    await waitFor(() => {
      expect(screen.getByDisplayValue('Initiate')).toBeInTheDocument()
    })
    expect(screen.queryByDisplayValue('Chair')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Reset titles' }))
    await waitFor(() => {
      expect(screen.getByDisplayValue('Chair')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Clerk')).toBeInTheDocument()
    })
    expect(screen.queryByDisplayValue('Initiate')).not.toBeInTheDocument()
  })
})
