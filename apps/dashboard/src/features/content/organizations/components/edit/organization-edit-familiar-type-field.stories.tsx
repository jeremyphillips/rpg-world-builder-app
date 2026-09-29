import { createElement } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { z } from 'zod'
import { Form } from '@rpg/ui/form'

import { OrganizationAuthoringProvider } from '../authoring/organization-authoring-context'
import { OrganizationEditFamiliarTypeField } from './organization-edit-familiar-type-field'
import { OrganizationUseFamiliarTypeAction } from './organization-use-familiar-type-action'

const schema = z.object({
  organizationDomain: z.string(),
  organizationForm: z.string().nullable(),
  functions: z.array(z.string()),
  practices: z.array(z.string()),
  members: z.object({ classAffinityIds: z.array(z.string()) }),
})

const meta = {
  title: 'Content/Organizations/Edit/EditFamiliarTypeField',
  component: OrganizationEditFamiliarTypeField,
  args: {
    discoverableClasses: [],
  },
  render: (args) => (
    <OrganizationAuthoringProvider>
      <Form
        schema={schema}
        fields={[
          {
            kind: 'group',
            heading: {
              label: 'Organization profile',
              hint: 'Define the organization’s domain, structure, activities, and practices.',
              action: createElement(OrganizationUseFamiliarTypeAction),
            },
            fields: [
              {
                kind: 'slot',
                name: '_organizationEditFamiliarType',
                render: () => <OrganizationEditFamiliarTypeField {...args} />,
              },
            ],
          },
        ]}
        defaultValues={{
          organizationDomain: 'government',
          organizationForm: 'hierarchy',
          functions: ['governance'],
          practices: [],
          members: { classAffinityIds: [] },
        }}
        onSubmit={() => undefined}
      />
    </OrganizationAuthoringProvider>
  ),
} satisfies Meta<typeof OrganizationEditFamiliarTypeField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
