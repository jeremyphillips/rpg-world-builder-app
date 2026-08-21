import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Text, Wizard, type WizardStepDef } from '@rpg/ui'

import { InviteMembersStep } from '../invite-members-step'

const meta = {
  title: 'Campaign Create/InviteMembersStep',
  component: InviteMembersStep,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InviteMembersStep>

export default meta

const STEPS: WizardStepDef[] = [{ id: 'invites', label: 'Invite members' }]

export const Default: StoryObj = {
  render: () => {
    const [completed, setCompleted] = useState<Record<string, unknown> | null>(null)

    if (completed) {
      return <Text variant="small">Submitted: {JSON.stringify(completed)}</Text>
    }

    return (
      <Wizard
        steps={STEPS}
        initialValues={{ name: 'The Sunless Citadel' }}
        onComplete={setCompleted}
      >
        <InviteMembersStep onFinish={setCompleted} />
      </Wizard>
    )
  },
}
