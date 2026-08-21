import { useState } from 'react'

import type { CampaignOnboardingIncompleteContext } from '@rpg/contracts'
import { Heading, RadioCard, Text } from '@rpg/ui'

import { NarrowPage } from '@/components/layout/page/narrow-page'

import {
  CAMPAIGN_ONBOARDING_RECONNECT_BODY,
  CAMPAIGN_ONBOARDING_RECONNECT_HEADING,
} from '../../lib/onboarding/campaign-onboarding-copy'
import {
  ONBOARDING_CHOICE_EXISTING,
  ONBOARDING_CHOICE_NEW,
  type OnboardingBranch,
} from '../../lib/onboarding/campaign-onboarding.lib'
import { CampaignOnboardingExistingCharacterPanel } from './campaign-onboarding-existing-character-panel'
import { CampaignOnboardingNewCharacterPanel } from './campaign-onboarding-new-character-panel'

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
  initialCharacterId,
}: {
  context: CampaignOnboardingIncompleteContext
  campaignId: string
  initialCharacterId?: string
}) {
  const isReconnect = context.mode === 'reconnect'
  const preselectedCharacterId = initialCharacterId ?? context.staleCharacterId
  const [branch, setBranch] = useState<OnboardingBranch>(isReconnect ? 'existing' : 'choice')

  if (branch === 'existing') {
    return (
      <NarrowPage>
        {isReconnect ? (
          <div className="mb-6 flex flex-col gap-2">
            <Heading variant="page" as="h1">
              {CAMPAIGN_ONBOARDING_RECONNECT_HEADING}
            </Heading>
            <Text variant="muted">{CAMPAIGN_ONBOARDING_RECONNECT_BODY}</Text>
          </div>
        ) : null}
        <CampaignOnboardingExistingCharacterPanel
          campaignId={campaignId}
          initialCharacterId={preselectedCharacterId}
          onBack={() => setBranch(isReconnect ? 'existing' : 'choice')}
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
