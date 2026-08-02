'use client'

import { Alert, Heading, Text } from '@rpg/ui'
import type { VocabularyUsageReference } from '@rpg/contracts'

import { UsageReferencesSection } from './usage-references-section.client'

export type UsageReferencesQuerySectionProps = {
  campaignId: string
  heading?: string
  isPending: boolean
  isError: boolean
  errorMessage?: string
  onRetry?: () => void
  references?: VocabularyUsageReference[]
}

/** Explicit pending | empty | error | ready states for usage reference sections. */
export function UsageReferencesQuerySection({
  campaignId,
  heading = 'Used by',
  isPending,
  isError,
  errorMessage = 'Could not load usage references.',
  onRetry,
  references,
}: UsageReferencesQuerySectionProps) {
  if (isPending) {
    return (
      <section aria-busy="true" aria-label={heading}>
        <Heading variant="group" as="h3" className="mb-2">
          {heading}
        </Heading>
        <Text variant="muted" className="text-sm">
          Loading usage references…
        </Text>
      </section>
    )
  }

  if (isError) {
    return (
      <section aria-label={heading}>
        <Heading variant="group" as="h3" className="mb-2">
          {heading}
        </Heading>
        <Alert
          variant="destructive"
          title={errorMessage}
          actions={
            onRetry ? (
              <button type="button" className="underline" onClick={onRetry}>
                Retry
              </button>
            ) : undefined
          }
        />
      </section>
    )
  }

  if (!references || references.length === 0) {
    return (
      <section aria-label={heading}>
        <Heading variant="group" as="h3" className="mb-2">
          {heading}
        </Heading>
        <Text variant="muted" className="text-sm">
          Nothing references this yet.
        </Text>
      </section>
    )
  }

  return <UsageReferencesSection campaignId={campaignId} references={references} />
}
