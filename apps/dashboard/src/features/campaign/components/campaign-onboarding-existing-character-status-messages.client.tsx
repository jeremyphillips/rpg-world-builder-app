'use client'

import { Text } from '@rpg/ui'

export function CampaignOnboardingExistingCharacterStatusMessages({
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
