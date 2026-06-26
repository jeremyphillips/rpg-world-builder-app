import { useParams } from 'react-router-dom'
import { Heading, Text } from '@rpg/ui'

import { PageHeader } from '@/components/layout/page-header'
import { PageLoadState } from '@/components/layout/page-load-state'
import { WidePage } from '@/components/layout/wide-page'
import { ROUTES } from '@/app/routes'
import { useCanManageCampaign } from '@/features/campaign'

import { useHomebrewSummary } from '../hooks/use-homebrew-summary'
import { VISIBLE_SIDEBAR_CONTENT } from '../lib/visible-sidebar-content-registry'
import { ENABLED_HOMEBREW_VOCABULARY_SETS } from '../lib/vocabulary-set-registry'
import { HomebrewHubCard } from '../components/homebrew-hub-card'

const HOMEBREW_DESCRIPTION =
  'Customize this campaign’s content, rules vocabulary, and available options.'

type HomebrewHubContentProps = {
  campaignId: string
}

function formatContentCount(totalCount: number): string {
  return totalCount === 1 ? '1 item available' : `${totalCount} items available`
}

/** Campaign Homebrew hub — content catalog cards and rules vocabulary entry points. */
export function HomebrewHubContent({ campaignId }: HomebrewHubContentProps) {
  const { data: summary, isPending, isError } = useHomebrewSummary(campaignId)
  const canManage = useCanManageCampaign(campaignId)

  const countByType = new Map(
    summary?.content.map((item) => [item.contentType, item.totalCount]) ?? [],
  )

  return (
    <WidePage spacing="relaxed">
      <PageHeader heading="Homebrew" />
      <Text variant="muted">{HOMEBREW_DESCRIPTION}</Text>

      <PageLoadState
        isPending={isPending}
        isError={isError}
        defaultErrorLabel="Could not load homebrew summary."
      >
        <section aria-labelledby="homebrew-content-heading" className="space-y-4">
          <Heading variant="section" as="h3" id="homebrew-content-heading">
            Content
          </Heading>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {VISIBLE_SIDEBAR_CONTENT.map((entry) => {
              const totalCount = countByType.get(entry.contentType) ?? 0
              return (
                <li key={entry.contentType}>
                  <HomebrewHubCard
                    title={entry.label}
                    description={formatContentCount(totalCount)}
                    viewHref={entry.overview(campaignId)}
                    createHref={entry.create?.(campaignId)}
                    showCreate={canManage && Boolean(entry.create)}
                  />
                </li>
              )
            })}
          </ul>
        </section>

        <section aria-labelledby="homebrew-vocabulary-heading" className="space-y-4">
          <Heading variant="section" as="h3" id="homebrew-vocabulary-heading">
            Rules Vocabulary
          </Heading>
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
        </section>
      </PageLoadState>
    </WidePage>
  )
}

export function HomebrewHub() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  return <HomebrewHubContent campaignId={campaignId} />
}
