'use client'

'use client'

import { useState } from 'react'

import type { CampaignOnboardingIncompleteContext } from '@rpg/contracts'
import { Heading, RadioCard, Text } from '@rpg/ui'

import { NarrowPage } from '@/components/layout/narrow-page'

import {
  ONBOARDING_CHOICE_EXISTING,
  ONBOARDING_CHOICE_NEW,
  type OnboardingBranch,
} from '../lib/campaign-onboarding.lib'
import { CampaignOnboardingExistingCharacterPanel } from './campaign-onboarding-existing-character-panel.client'
import { CampaignOnboardingNewCharacterPanel } from './campaign-onboarding-new-character-panel.client'

function OnboardingChoicePanel({
  context,
  onSelect,
}: {
  context: CampaignOnboardingIncompleteContext
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

export function CampaignOnboardingClient({
  context,
  campaignId,
}: {
  context: CampaignOnboardingIncompleteContext
  campaignId: string
}) {
  const [branch, setBranch] = useState<OnboardingBranch>('choice')

  if (branch === 'existing') {
    return (
      <NarrowPage>
        <CampaignOnboardingExistingCharacterPanel
          campaignId={campaignId}
          onBack={() => setBranch('choice')}
        />
      </NarrowPage>
    )
  }

  if (branch === 'new') {
    return (
      <NarrowPage>
        <CampaignOnboardingNewCharacterPanel
          context={context}
          campaignId={campaignId}
          onBack={() => setBranch('choice')}
        />
      </NarrowPage>
    )
  }

  return (
    <NarrowPage>
      <OnboardingChoicePanel context={context} onSelect={setBranch} />
    </NarrowPage>
  )
}
