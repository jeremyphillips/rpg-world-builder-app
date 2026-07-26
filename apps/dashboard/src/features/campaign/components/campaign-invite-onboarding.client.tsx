'use client'

import { useState } from 'react'

import type { CampaignInviteOnboardingAcceptedContext } from '@rpg/contracts'
import { Button, Heading, RadioCard, Text } from '@rpg/ui'

import {
  ONBOARDING_CHOICE_EXISTING,
  ONBOARDING_CHOICE_NEW,
  type OnboardingBranch,
} from '../lib/campaign-invite-onboarding.lib'
import { ExistingCharacterPanel } from './campaign-invite-existing-character-panel.client'

function NewCharacterPlaceholder({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <Heading variant="section" as="h2">
        Create a new character
      </Heading>
      <Text variant="muted">
        Building a new campaign character from this campaign&apos;s rules is coming in the next
        onboarding phase.
      </Text>
      <Button type="button" variant="outline" onClick={onBack}>
        Back
      </Button>
    </div>
  )
}

function OnboardingChoicePanel({
  context,
  onSelect,
}: {
  context: CampaignInviteOnboardingAcceptedContext
  onSelect: (branch: OnboardingBranch) => void
}) {
  const [choice, setChoice] = useState('')

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Heading variant="page" as="h1">
          Join {context.campaign.name}
        </Heading>
        <Text variant="muted">Choose how you want to add your campaign character.</Text>
      </div>

      <RadioCard
        value={choice}
        onValueChange={(value) => {
          setChoice(value)
          if (value === ONBOARDING_CHOICE_EXISTING) onSelect('existing')
          if (value === ONBOARDING_CHOICE_NEW) onSelect('new')
        }}
        options={[
          {
            value: ONBOARDING_CHOICE_EXISTING,
            label: 'Use an existing character',
            description: 'Bring an eligible character you already created.',
          },
          {
            value: ONBOARDING_CHOICE_NEW,
            label: 'Create a new character',
            description: "Build using this campaign's rules and available content.",
          },
        ]}
      />
    </div>
  )
}

export function CampaignInviteOnboardingClient({
  context,
  inviteId,
}: {
  context: CampaignInviteOnboardingAcceptedContext
  inviteId: string
}) {
  const [branch, setBranch] = useState<OnboardingBranch>('choice')

  if (branch === 'existing') {
    return <ExistingCharacterPanel inviteId={inviteId} onBack={() => setBranch('choice')} />
  }

  if (branch === 'new') {
    return <NewCharacterPlaceholder onBack={() => setBranch('choice')} />
  }

  return <OnboardingChoicePanel context={context} onSelect={setBranch} />
}
