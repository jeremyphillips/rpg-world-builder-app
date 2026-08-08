import type { Meta, StoryObj } from '@storybook/react-vite'
import { z } from 'zod'

import { ContentFormDrawer } from './content-form-drawer.client'

const schema = z.object({
  name: z.string().min(1),
  notes: z.string().optional(),
})

const meta = {
  title: 'Content/Forms/ContentFormDrawer',
  component: ContentFormDrawer,
} satisfies Meta<typeof ContentFormDrawer>

export default meta
type Story = StoryObj<typeof ContentFormDrawer>

export const Open: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    title: 'Add item',
    pending: false,
    submitLabel: 'Create',
    form: {
      schema,
      fields: [
        { type: 'text', name: 'name', label: 'Name', required: true },
        { type: 'textarea', name: 'notes', label: 'Notes' },
      ],
      defaultValues: { name: '', notes: '' },
    },
    onSubmit: async () => undefined,
  },
}

export const Pending: Story = {
  args: {
    ...Open.args,
    pending: true,
  },
}

export const WithFormError: Story = {
  args: {
    ...Open.args,
    formError: 'Could not save item.',
  },
}
