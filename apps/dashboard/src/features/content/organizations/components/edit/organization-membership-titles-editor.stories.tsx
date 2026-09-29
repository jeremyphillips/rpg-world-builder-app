import type { Meta, StoryObj } from '@storybook/react-vite'
import { z } from 'zod'
import { Form } from '@rpg/ui/form'

import {
  ORGANIZATION_MEMBERSHIP_TITLES_DESCRIPTION,
  ORGANIZATION_SECTION_LABELS,
} from '../../lib/organization-display'
import { OrganizationMembershipTitlesEditor } from './organization-membership-titles-editor'

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

const meta = {
  title: 'Content/Organizations/OrganizationMembershipTitlesEditor',
  component: OrganizationMembershipTitlesEditor,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <Form
        schema={schema}
        fields={[
          {
            kind: 'group',
            legend: ORGANIZATION_SECTION_LABELS.membershipTitles,
            description: ORGANIZATION_MEMBERSHIP_TITLES_DESCRIPTION,
            fields: [
              {
                kind: 'slot',
                name: '_organizationMembershipTitlesEditor',
                render: () => <Story />,
              },
            ],
          },
        ]}
        defaultValues={{
          members: {
            titles: [
              { id: 'omt_1', label: 'Guildmaster', priority: 50 },
              { id: 'omt_2', label: 'Member', priority: 20 },
            ],
          },
        }}
        onSubmit={() => undefined}
      />
    ),
  ],
} satisfies Meta<typeof OrganizationMembershipTitlesEditor>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
