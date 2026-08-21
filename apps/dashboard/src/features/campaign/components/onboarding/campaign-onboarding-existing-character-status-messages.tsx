import { Button, Text } from '@rpg/ui'

export function CampaignOnboardingExistingCharacterStatusMessages({
  isPending,
  isError,
  hasCharacters,
  hasEligibleCharacter,
  onRetry,
  isRetrying,
}: {
  isPending: boolean
  isError: boolean
  hasCharacters: boolean
  hasEligibleCharacter: boolean
  onRetry?: () => void
  isRetrying?: boolean
}) {
  if (isPending) {
    return <Text variant="muted">Loading your characters…</Text>
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-3" role="alert">
        <Text variant="destructive">Could not load your characters.</Text>
        {onRetry ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="self-start"
            disabled={isRetrying}
            onClick={onRetry}
          >
            {isRetrying ? 'Retrying…' : 'Try again'}
          </Button>
        ) : null}
      </div>
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
