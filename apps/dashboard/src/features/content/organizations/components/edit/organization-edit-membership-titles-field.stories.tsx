import type { Meta, StoryObj } from '@storybook/react-vite'
import { z } from 'zod'
import { Form } from '@rpg/ui/form'

import { buildOrganizationMembershipTitlesArrayField } from '../../lib/membership-titles/organization-membership-titles-form.lib'

const schema = z.object({
  members: z.object({
    titles: z.array(
      z.object({
        id: z.string(),
        label: z.string(),
        priority: z.union([z.number(), z.string()]),
      }),
    ),
  }),
})

const meta = {
  title: 'Content/Organizations/OrganizationEditMembershipTitlesField',
  parameters: { layout: 'padded' },
  decorators: [
    () => (
      <Form
        schema={schema}
        fields={[buildOrganizationMembershipTitlesArrayField()]}
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
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
