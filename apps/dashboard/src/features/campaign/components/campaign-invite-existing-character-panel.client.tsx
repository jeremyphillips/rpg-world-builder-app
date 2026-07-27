'use client'

import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import type {
  CharacterCampaignBlockingIssue,
  CharacterCampaignWarning,
  CharacterCampaignWarningCategory,
} from '@rpg/contracts'
import { resolveCampaignInviteCompletionError } from '@rpg/contracts'
import { Button, ComboboxField, Heading, Text } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import {
  buildCharacterOptions,
  groupWarningsByCategory,
  summarizeEligibleCharacters,
  WARNING_CATEGORY_LABELS,
} from '../lib/campaign-invite-onboarding.lib'
import { formatInviteUnavailableMessage } from '../lib/campaign-invite-unavailable-display'
import {
  useCampaignInviteEligibleCharacters,
  useCompleteCampaignInviteWithExistingCharacter,
} from '../hooks/use-campaign-invite-eligible-characters'
import { CampaignInviteEligibilityAlert } from './campaign-invite-eligibility-alert.client'

function ExistingCharacterStatusMessages({
  isPending,
  isError,
  hasCharacters,
  hasEligibleCharacter,
}: {
  isPending: boolean
  isError: boolean
  hasCharacters: boolean
  hasEligibleCharacter: boolean
}) {
  if (isPending) {
    return <Text variant="muted">Loading your characters…</Text>
  }

  if (isError) {
    return (
      <Text variant="destructive" role="alert">
        Could not load your characters.
      </Text>
    )
  }

  if (!hasCharacters) {
    return (
      <Text variant="muted">
        You don&apos;t have any existing characters. Create a new character to continue.
      </Text>
    )
  }

  if (!hasEligibleCharacter) {
    return (
      <Text variant="muted">
        None of your existing characters meet this campaign&apos;s requirements. Review the reasons
        below, or create a new character.
      </Text>
    )
  }

  return null
}

function ExistingCharacterWarningReview({
  warningGroups,
}: {
  warningGroups: Partial<
    Record<CharacterCampaignWarningCategory, import('@rpg/contracts').CharacterCampaignWarning[]>
  >
}) {
  if (Object.keys(warningGroups).length === 0) return null

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted p-4">
      <Heading variant="subsection" as="h3">
        Review campaign differences
      </Heading>
      <Text variant="muted">
        This character can join, but some existing choices are not available under this
        campaign&apos;s current rules.
      </Text>
      {Object.entries(warningGroups).map(([category, warnings]) => (
        <div key={category} className="flex flex-col gap-1">
          <Text variant="small" className="font-medium">
            {WARNING_CATEGORY_LABELS[category as CharacterCampaignWarningCategory]}
          </Text>
          <ul className="list-disc pl-5 text-sm text-muted-foreground">
            {warnings?.map((warning) => (
              <li key={`${warning.category}:${warning.contentId}`}>{warning.label}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export function ExistingCharacterPanel({
  inviteId,
  onBack,
}: {
  inviteId: string
  onBack: () => void
}) {
  const navigate = useNavigate()
  const { data: characters, isPending, isError } = useCampaignInviteEligibleCharacters(inviteId)
  const completeInvite = useCompleteCampaignInviteWithExistingCharacter(inviteId)
  const [selectedCharacterId, setSelectedCharacterId] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [inviteUnavailableMessage, setInviteUnavailableMessage] = useState<string | null>(null)
  const [eligibilityError, setEligibilityError] = useState<{
    blockingIssues: CharacterCampaignBlockingIssue[]
    warnings: CharacterCampaignWarning[]
  } | null>(null)

  const options = useMemo(() => buildCharacterOptions(characters ?? []), [characters])
  const selectedCharacter = characters?.find((entry) => entry.characterId === selectedCharacterId)
  const warningGroups = useMemo(
    () => groupWarningsByCategory(selectedCharacter?.eligibility.warnings ?? []),
    [selectedCharacter],
  )
  const { hasCharacters, hasEligibleCharacter } = summarizeEligibleCharacters(characters)
  const showCharacterPicker = !isPending && !isError && hasCharacters

  const handleSubmit = async () => {
    if (!selectedCharacterId) return
    setFormError(null)
    setInviteUnavailableMessage(null)
    setEligibilityError(null)

    try {
      const result = await completeInvite.mutateAsync(selectedCharacterId)
      navigate(ROUTES.campaign.characters.detail(result.campaignId, result.characterId))
    } catch (error) {
      const resolved = resolveCampaignInviteCompletionError(
        error,
        'Could not add this character to the campaign.',
      )

      if (resolved.kind === 'campaign_ineligible') {
        setEligibilityError({
          blockingIssues: resolved.blockingIssues,
          warnings: resolved.warnings,
        })
        return
      }

      if (resolved.kind === 'invite_unavailable') {
        setInviteUnavailableMessage(formatInviteUnavailableMessage(resolved.reason))
        return
      }

      setFormError(
        resolved.kind === 'generic'
          ? resolved.message
          : error instanceof Error
            ? error.message
            : 'Could not add this character to the campaign.',
      )
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

      <ExistingCharacterStatusMessages
        isPending={isPending}
        isError={isError}
        hasCharacters={hasCharacters}
        hasEligibleCharacter={hasEligibleCharacter}
      />

      {showCharacterPicker ? (
        <ComboboxField
          id="campaign-invite-character"
          label="Character"
          placeholder="Choose a character…"
          options={options}
          multiple={false}
          value={selectedCharacterId}
          onChange={(value) => setSelectedCharacterId(typeof value === 'string' ? value : '')}
        />
      ) : null}

      {selectedCharacter ? <ExistingCharacterWarningReview warningGroups={warningGroups} /> : null}

      {inviteUnavailableMessage ? (
        <Text variant="destructive" role="alert">
          {inviteUnavailableMessage}
        </Text>
      ) : null}

      {eligibilityError ? (
        <CampaignInviteEligibilityAlert
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
          disabled={!selectedCharacter?.eligibility.eligible || completeInvite.isPending}
          onClick={() => void handleSubmit()}
        >
          {completeInvite.isPending ? 'Adding character…' : 'Add character to campaign'}
        </Button>
      </div>
    </div>
  )
}
