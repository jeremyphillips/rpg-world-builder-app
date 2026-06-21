import type { Meta, StoryObj } from '@storybook/react-vite'

import { ClassSubclassesTabStub } from './class-subclasses-tab-stub'

const meta = {
  title: 'Content/Classes/ClassSubclassesTabStub',
  component: ClassSubclassesTabStub,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ClassSubclassesTabStub>

export default meta
type Story = StoryObj<typeof ClassSubclassesTabStub>

export const CreateMode: Story = {
  name: 'Create (save first)',
  args: { mode: 'create' },
}

export const EditMode: Story = {
  name: 'Edit (link to detail)',
  args: {
    mode: 'edit',
    campaignId: 'campaign-1',
    entityId: 'class-fighter',
  },
}
