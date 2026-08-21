import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  MessagesDirectEmptyRightPane,
  MessagesNewNeutralRightPane,
} from './messages-workspace-empty-states'

const meta = {
  title: 'Message/MessagesWorkspaceEmptyStates',
  component: MessagesDirectEmptyRightPane,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof MessagesDirectEmptyRightPane>

export default meta

type Story = StoryObj<typeof MessagesDirectEmptyRightPane>

export const SelectConversation: Story = {
  render: () => (
    <div className="flex min-h-[24rem] flex-col">
      <MessagesDirectEmptyRightPane />
    </div>
  ),
}

export const SelectConversationScoped: Story = {
  render: () => (
    <div className="flex min-h-[24rem] flex-col">
      <MessagesDirectEmptyRightPane campaignId="camp-1" />
    </div>
  ),
}

export const ChooseRecipient: Story = {
  render: () => (
    <div className="flex min-h-[24rem] flex-col">
      <MessagesNewNeutralRightPane />
    </div>
  ),
}
