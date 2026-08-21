import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { MessageComposer } from './message-composer'

function MessageComposerDemo(
  props: Omit<React.ComponentProps<typeof MessageComposer>, 'draft' | 'onDraftChange' | 'onSubmit'>,
) {
  const [draft, setDraft] = React.useState('')

  return (
    <MessageComposer
      {...props}
      draft={draft}
      onDraftChange={setDraft}
      onSubmit={() => setDraft('')}
    />
  )
}

const meta = {
  title: 'Message/MessageComposer',
  component: MessageComposerDemo,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof MessageComposerDemo>

export default meta

type Story = StoryObj<typeof MessageComposerDemo>

export const Default: Story = {
  args: {
    isSubmitting: false,
  },
}

export const Submitting: Story = {
  args: {
    isSubmitting: true,
  },
}
