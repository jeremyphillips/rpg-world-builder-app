import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useFormContext } from 'react-hook-form'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { Form } from '@rpg/ui/form'
import type { OrganizationMembershipTitleDefinition } from '@rpg/contracts'

import { ORGANIZATION_SECTION_LABELS } from '../../lib/organization-display'
import { OrganizationEditMembershipTitlesField } from './organization-edit-membership-titles-field'

const schema = z.object({
  members: z.object({
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
  return (
    <div>
      <button type="button" onClick={() => form.setValue('members.titles', changedTitles)}>
        Change titles
      </button>
      <button type="button" onClick={() => form.reset()}>
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
    expect(within(group).getByText('Chair')).toBeInTheDocument()
    expect(within(group).getByText('Clerk')).toBeInTheDocument()
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
    expect(within(group).getByText('Chair')).toBeInTheDocument()
  })

  it('exposes no mutation controls inside the titles group', () => {
    renderTitlesField()
    const group = titlesGroup()
    expect(within(group).queryAllByRole('button')).toHaveLength(0)
    expect(within(group).queryAllByRole('textbox')).toHaveLength(0)
    expect(within(group).queryAllByRole('checkbox')).toHaveLength(0)
    expect(within(group).queryAllByRole('radio')).toHaveLength(0)
  })

  it('updates when form state changes and reset restores the catalog', async () => {
    const user = userEvent.setup()
    renderTitlesField()

    await user.click(screen.getByRole('button', { name: 'Change titles' }))
    expect(screen.getByText('Initiate')).toBeInTheDocument()
    expect(screen.queryByText('Chair')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Reset titles' }))
    expect(screen.getByText('Chair')).toBeInTheDocument()
    expect(screen.getByText('Clerk')).toBeInTheDocument()
    expect(screen.queryByText('Initiate')).not.toBeInTheDocument()
  })
})
