import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { Form } from '@rpg/ui/form'
import type { OrganizationMembershipTitleDefinition } from '@rpg/contracts'

import { ORGANIZATION_SECTION_LABELS } from '../../lib/organization-display'
import { OrganizationMembershipTitlesRegistration } from '../authoring/organization-membership-titles-registration'
import { OrganizationEditMembershipTitlesField } from './organization-edit-membership-titles-field'

const schema = z.object({
  members: z.object({
    classAffinityIds: z.array(z.string()).default([]),
    titles: z.array(
      z.object({
        id: z.string(),
        label: z.string(),
        priority: z.number(),
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
      <button type="button" onClick={() => replace(changedTitles)}>
        Change titles
      </button>
      <button
        type="button"
        onClick={() => {
          form.reset({
            members: { classAffinityIds: [], titles: initialTitles },
          })
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
        {
          kind: 'group',
          legend: ORGANIZATION_SECTION_LABELS.membershipTitles,
          fields: [
            {
              kind: 'slot',
              name: prefix
                ? `${prefix}._organizationMembershipTitles`
                : '_organizationMembershipTitles',
              render: () => <OrganizationEditMembershipTitlesField prefix={prefix} />,
            },
          ],
        },
        { kind: 'slot', name: '_harness', render: () => <FormHarness /> },
      ]}
      defaultValues={{ members: { titles: initialTitles } }}
      onSubmit={() => undefined}
    />,
  )
}

function titlesGroup(): HTMLElement {
  return screen.getByRole('group', { name: ORGANIZATION_SECTION_LABELS.membershipTitles })
}

describe('OrganizationEditMembershipTitlesField', () => {
  it('renders current form members.titles', () => {
    renderTitlesField()
    const group = titlesGroup()
    expect(within(group).getByDisplayValue('Chair')).toBeInTheDocument()
    expect(within(group).getByDisplayValue('Clerk')).toBeInTheDocument()
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
          {
            kind: 'group',
            legend: ORGANIZATION_SECTION_LABELS.membershipTitles,
            fields: [
              {
                kind: 'slot',
                name: '_organizationMembershipTitles',
                render: () => <OrganizationEditMembershipTitlesField />,
              },
            ],
          },
        ]}
        defaultValues={{ members: { classAffinityIds: [], titles: initialTitles } }}
        onSubmit={() => undefined}
      />,
    )

    const group = titlesGroup()
    expect(within(group).getByDisplayValue('Chair')).toBeInTheDocument()
    expect(within(group).getByDisplayValue('Clerk')).toBeInTheDocument()
  })

  it('renders under an embedded namespace prefix', () => {
    const embeddedSchema = z.object({ operatorOrganization: schema })
    render(
      <Form
        schema={embeddedSchema}
        fields={[
          {
            kind: 'group',
            legend: ORGANIZATION_SECTION_LABELS.membershipTitles,
            fields: [
              {
                kind: 'slot',
                name: 'operatorOrganization._organizationMembershipTitles',
                render: () => (
                  <OrganizationEditMembershipTitlesField prefix="operatorOrganization" />
                ),
              },
            ],
          },
        ]}
        defaultValues={{ operatorOrganization: { members: { titles: initialTitles } } }}
        onSubmit={() => undefined}
      />,
    )

    const group = titlesGroup()
    expect(within(group).getByDisplayValue('Chair')).toBeInTheDocument()
  })

  it('exposes editable membership title controls inside the titles group', () => {
    renderTitlesField()
    const group = titlesGroup()
    expect(within(group).getAllByRole('textbox').length).toBeGreaterThan(0)
    expect(within(group).getByRole('button', { name: 'Add title' })).toBeInTheDocument()
  })

  it('updates when form state changes and reset restores the catalog', async () => {
    const user = userEvent.setup()
    renderTitlesField()

    await user.click(screen.getByRole('button', { name: 'Change titles' }))
    expect(screen.getByDisplayValue('Initiate')).toBeInTheDocument()
    expect(screen.queryByDisplayValue('Chair')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Reset titles' }))
    await waitFor(() => {
      expect(screen.getByDisplayValue('Chair')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Clerk')).toBeInTheDocument()
    })
    expect(screen.queryByDisplayValue('Initiate')).not.toBeInTheDocument()
  })
})
