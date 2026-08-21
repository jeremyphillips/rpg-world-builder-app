'use client'

import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import type { CharacterCampaignBlockingIssue, CharacterCampaignWarning } from '@rpg/contracts'
import { resolveCampaignCharacterAssignmentError } from '@rpg/contracts'
import { Button, ComboboxField, Heading, Text } from '@rpg/ui'

import { ROUTES } from '@/app/routes'

import { CAMPAIGN_ONBOARDING_EXISTING_CHARACTER_SUBMIT_ERROR } from '../../lib/onboarding/campaign-onboarding-copy'
import {
  buildCharacterOptions,
  summarizeEligibleCharacters,
} from '../../lib/onboarding/campaign-onboarding.lib'
import {
  useCampaignOnboardingEligibleCharacters,
  useCompleteCampaignOnboarding,
} from '../../hooks/use-campaign-onboarding-eligible-characters'
import { CampaignCharacterEligibilityAlert } from './campaign-character-eligibility-alert.client'
import { CampaignCharacterWarningReview } from './campaign-character-warning-review.client'
import { CampaignOnboardingExistingCharacterStatusMessages } from './campaign-onboarding-existing-character-status-messages.client'

function resolveExistingCharacterSubmitError(
  resolved: ReturnType<typeof resolveCampaignCharacterAssignmentError>,
): string {
  if (resolved.kind === 'generic') {
    return resolved.message
  }

  if (resolved.kind === 'invite_unavailable') {
    switch (resolved.reason) {
      case 'expired':
        return 'This invitation has expired. Ask the campaign owner for a new invite.'
      case 'revoked':
        return 'This invitation is no longer valid. Ask the campaign owner for a new invite.'
      case 'not_owned':
        return 'This invitation belongs to another account.'
      case 'not_accepted':
        return 'This invitation is not ready for character setup yet.'
      case 'already_completed':
        return 'This invitation has already been completed.'
    }
  }

  return CAMPAIGN_ONBOARDING_EXISTING_CHARACTER_SUBMIT_ERROR
}

export function CampaignOnboardingExistingCharacterPanel({
  campaignId,
  onBack,
  initialCharacterId,
}: {
  campaignId: string
  onBack: () => void
  initialCharacterId?: string
}) {
  const navigate = useNavigate()
  const {
    data: characters,
    isPending,
    isError,
    isRefetching,
    refetch,
  } = useCampaignOnboardingEligibleCharacters(campaignId)
  const completeOnboarding = useCompleteCampaignOnboarding(campaignId)
  const [selectedCharacterId, setSelectedCharacterId] = useState(initialCharacterId ?? '')
  const [formError, setFormError] = useState<string | null>(null)
  const [eligibilityError, setEligibilityError] = useState<{
    blockingIssues: CharacterCampaignBlockingIssue[]
    warnings: CharacterCampaignWarning[]
  } | null>(null)

  const options = useMemo(() => buildCharacterOptions(characters ?? []), [characters])
  const selectedCharacter = characters?.find((entry) => entry.characterId === selectedCharacterId)
  const { hasCharacters, hasEligibleCharacter } = summarizeEligibleCharacters(characters)
  const showCharacterPicker = !isPending && !isError && hasCharacters

  const handleSubmit = async () => {
    if (!selectedCharacterId) return
    setFormError(null)
    setEligibilityError(null)

    try {
      const result = await completeOnboarding.mutateAsync({
        source: 'existing',
        characterId: selectedCharacterId,
      })
      navigate(ROUTES.campaign.characters.detail(result.campaignId, result.characterId))
    } catch (error) {
      const resolved = resolveCampaignCharacterAssignmentError(
        error,
        CAMPAIGN_ONBOARDING_EXISTING_CHARACTER_SUBMIT_ERROR,
      )

      if (resolved.kind === 'campaign_ineligible') {
        setEligibilityError({
          blockingIssues: resolved.blockingIssues,
          warnings: resolved.warnings,
        })
        return
      }

      setFormError(resolveExistingCharacterSubmitError(resolved))
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Heading variant="section" as="h2">
          Existing character
        </Heading>
        <Text variant="muted">Bring an eligible character you already created.</Text>
      </div>

      <CampaignOnboardingExistingCharacterStatusMessages
        isPending={isPending}
        isError={isError}
        hasCharacters={hasCharacters}
        hasEligibleCharacter={hasEligibleCharacter}
        onRetry={() => void refetch()}
        isRetrying={isRefetching}
      />

      {showCharacterPicker ? (
        <ComboboxField
          id="campaign-onboarding-character"
          label="Character"
          placeholder="Choose a character…"
          options={options}
          multiple={false}
          value={selectedCharacterId}
          onChange={(value) => setSelectedCharacterId(typeof value === 'string' ? value : '')}
        />
      ) : null}

      {selectedCharacter ? (
        <CampaignCharacterWarningReview warnings={selectedCharacter.eligibility.warnings} />
      ) : null}

      {eligibilityError ? (
        <CampaignCharacterEligibilityAlert
          blockingIssues={eligibilityError.blockingIssues}
          warnings={eligibilityError.warnings}
          heading="This character can no longer join the campaign:"
        />
      ) : null}

      {formError ? (
        <Text variant="destructive" role="alert">
          {formError}
        </Text>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          disabled={!selectedCharacter?.eligibility.eligible || completeOnboarding.isPending}
          onClick={() => void handleSubmit()}
        >
          {completeOnboarding.isPending ? 'Adding character…' : 'Add character to campaign'}
        </Button>
      </div>
    </div>
  )
}
