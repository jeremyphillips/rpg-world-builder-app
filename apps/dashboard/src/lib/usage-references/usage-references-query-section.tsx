import { Alert, Heading, Text } from '@rpg/ui'
import type { VocabularyUsageReference } from '@rpg/contracts'

import { UsageReferencesSection } from './usage-references-section'

export type UsageReferencesQuerySectionProps = {
  campaignId: string
  heading?: string
  /** When true, parent chrome owns the section heading (e.g. ContentDetailSection). */
  embedded?: boolean
  isPending: boolean
  isError: boolean
  errorMessage?: string
  onRetry?: () => void
  references?: VocabularyUsageReference[]
}

function UsageReferencesQueryBody({
  campaignId,
  heading,
  embedded,
  isPending,
  isError,
  errorMessage = 'Could not load usage references.',
  onRetry,
  references,
}: UsageReferencesQuerySectionProps) {
  if (isPending) {
    return (
      <div aria-busy="true" aria-label={heading}>
        {!embedded ? (
          <Heading variant="group" as="h3" className="mb-2">
            {heading}
          </Heading>
        ) : null}
        <Text variant="muted" className="text-sm">
          Loading usage references…
        </Text>
      </div>
    )
  }

  if (isError) {
    return (
      <div aria-label={heading}>
        {!embedded ? (
          <Heading variant="group" as="h3" className="mb-2">
            {heading}
          </Heading>
        ) : null}
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
      </div>
    )
  }

  if (!references || references.length === 0) {
    return (
      <div aria-label={heading}>
        {!embedded ? (
          <Heading variant="group" as="h3" className="mb-2">
            {heading}
          </Heading>
        ) : null}
        <Text variant="muted" className="text-sm">
          Nothing references this yet.
        </Text>
      </div>
    )
  }

  return (
    <UsageReferencesSection campaignId={campaignId} references={references} embedded={embedded} />
  )
}

/** Explicit pending | empty | error | ready states for usage reference sections. */
export function UsageReferencesQuerySection(props: UsageReferencesQuerySectionProps) {
  const heading = props.heading ?? 'Used by'

  if (props.embedded) {
    return <UsageReferencesQueryBody {...props} heading={heading} />
  }

  return (
    <section aria-label={heading}>
      <UsageReferencesQueryBody {...props} heading={heading} />
    </section>
  )
}
