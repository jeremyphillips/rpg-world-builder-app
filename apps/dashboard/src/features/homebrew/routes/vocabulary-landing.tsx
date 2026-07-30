import { useParams } from 'react-router-dom'
import { Text } from '@rpg/ui'

import { PageHeader } from '@/components/layout/page-header'
import { WidePage } from '@/components/layout/wide-page'
import { ROUTES } from '@/app/routes'

import { HomebrewHubCard } from '../components/homebrew-hub-card'
import { ENABLED_HOMEBREW_VOCABULARY_SETS } from '../lib/hub/vocabulary-set-registry'

const VOCABULARY_LANDING_DESCRIPTION =
  'Choose a vocabulary set to manage campaign-specific labels and options.'

type VocabularyLandingContentProps = {
  campaignId: string
}

/** Stable vocabulary landing — set picker for breadcrumb middle crumb. */
export function VocabularyLandingContent({ campaignId }: VocabularyLandingContentProps) {
  return (
    <WidePage spacing="relaxed">
      <PageHeader heading="Vocabulary" />
      <Text variant="muted">{VOCABULARY_LANDING_DESCRIPTION}</Text>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ENABLED_HOMEBREW_VOCABULARY_SETS.map((entry) => (
          <li key={entry.setId}>
            <HomebrewHubCard
              title={entry.label}
              description="Manage campaign vocabulary options"
              viewHref={ROUTES.homebrew.vocabulary(campaignId, entry.setId)}
            />
          </li>
        ))}
      </ul>
    </WidePage>
  )
}

export function VocabularyLanding() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  return <VocabularyLandingContent campaignId={campaignId} />
}
