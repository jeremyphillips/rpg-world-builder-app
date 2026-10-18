import { useParams } from 'react-router-dom'
import { Card, InlineMetadata, Text } from '@rpg/ui'
import { Link } from 'react-router-dom'

import { PageHeader } from '@/components/layout/page/page-header'
import { PageLoadState } from '@/components/layout/page/page-load-state'
import { PageShell } from '@/components/layout/page/page-shell'
import { ROUTES } from '@/app/routes'
import { useCanManageCampaign } from '@/features/campaign'

import { useVocabularySets } from '@/features/vocabulary'
import { GAME_TERMS_VOCABULARY_CATEGORIES } from '../lib/hub/vocabulary-set-registry'
import { GAME_TERMS_HUB_LABEL } from '../lib/detail/game-terms-fallback'

const GAME_TERMS_HUB_DESCRIPTION =
  'Browse and customize the closed vocabulary sets that shape how rules read in this campaign.'

type VocabularyHubContentProps = {
  campaignId: string
}

function formatTermCount(count: number): string {
  return count === 1 ? '1 term' : `${count} terms`
}

/** Surface-owned copy: vocabulary sets use "terms", not results/items. */
function formatUnavailableCount(count: number): string {
  return count === 1 ? '1 unavailable' : `${count} unavailable`
}

/** Game Terms hub — browsable category list with counts. */
export function VocabularyHubContent({ campaignId }: VocabularyHubContentProps) {
  const canManage = useCanManageCampaign(campaignId)
  const { data: sets, isPending, isError } = useVocabularySets(campaignId)

  const countsBySetId = new Map(
    (sets ?? []).map((set) => [
      set.id,
      {
        total: set.options.length,
        unavailable: set.options.filter((option) => option.status === 'disabled').length,
      },
    ]),
  )

  return (
    <PageShell width="narrow" rhythm="relaxed">
      <PageHeader heading={GAME_TERMS_HUB_LABEL} />
      <Text variant="muted">{GAME_TERMS_HUB_DESCRIPTION}</Text>

      <PageLoadState
        isPending={isPending}
        isError={isError}
        defaultErrorLabel="Could not load game terms."
      >
        <ul className="flex flex-col gap-2">
          {[...GAME_TERMS_VOCABULARY_CATEGORIES]
            .sort((left, right) => left.label.localeCompare(right.label))
            .map((category) => {
              const counts = countsBySetId.get(category.setId)
              const metadataParts = [formatTermCount(counts?.total ?? 0)]
              if (canManage && (counts?.unavailable ?? 0) > 0) {
                metadataParts.push(formatUnavailableCount(counts!.unavailable))
              }

              return (
                <li key={category.setId}>
                  <Card
                    link={<Link to={ROUTES.gameTerms.overview(campaignId, category.setId)} />}
                    density="compact"
                    tone="quiet"
                    header={{
                      title: category.label,
                      description: category.description,
                    }}
                  >
                    <Text variant="muted" className="text-xs">
                      <InlineMetadata role="supporting" density="compact">
                        {metadataParts.map((part) => (
                          <InlineMetadata.Item key={part}>{part}</InlineMetadata.Item>
                        ))}
                      </InlineMetadata>
                    </Text>
                  </Card>
                </li>
              )
            })}
        </ul>
      </PageLoadState>
    </PageShell>
  )
}

export function VocabularyHub() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  return <VocabularyHubContent campaignId={campaignId} />
}
