'use client'

import { useState } from 'react'

import type { CampaignInviteOnboardingAcceptedContext } from '@rpg/contracts'
import { Heading, RadioCard, Text } from '@rpg/ui'

import { NarrowPage } from '@/components/layout/narrow-page'

import {
  ONBOARDING_CHOICE_EXISTING,
  ONBOARDING_CHOICE_NEW,
  type OnboardingBranch,
} from '../lib/campaign-invite-onboarding.lib'
import { ExistingCharacterPanel } from './campaign-invite-existing-character-panel.client'
import { NewCharacterPanel } from './campaign-invite-new-character-panel.client'

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
    return (
      <NarrowPage>
        <ExistingCharacterPanel inviteId={inviteId} onBack={() => setBranch('choice')} />
      </NarrowPage>
    )
  }

  if (branch === 'new') {
    return (
      <NewCharacterPanel context={context} inviteId={inviteId} onBack={() => setBranch('choice')} />
    )
  }

  return (
    <NarrowPage>
      <OnboardingChoicePanel context={context} onSelect={setBranch} />
    </NarrowPage>
  )
}
