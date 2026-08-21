import { useParams } from 'react-router-dom'
import { Text } from '@rpg/ui'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { PageHeader } from '@/components/layout/page/page-header'
import { PageLoadState } from '@/components/layout/page/page-load-state'
import { WidePage } from '@/components/layout/page/wide-page'
import { ROUTES } from '@/app/routes'
import { useCanManageCampaign } from '@/features/campaign'
import {
  campaignDestinationChevronClasses,
  campaignDestinationListVariants,
  campaignDestinationRowVariants,
} from '@/features/campaign'

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
    <WidePage spacing="relaxed">
      <PageHeader heading={GAME_TERMS_HUB_LABEL} />
      <Text variant="muted">{GAME_TERMS_HUB_DESCRIPTION}</Text>

      <PageLoadState
        isPending={isPending}
        isError={isError}
        defaultErrorLabel="Could not load game terms."
      >
        <ul className={campaignDestinationListVariants()}>
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
                  <Link
                    to={ROUTES.gameTerms.overview(campaignId, category.setId)}
                    className={campaignDestinationRowVariants()}
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="font-medium text-foreground">{category.label}</span>
                      <Text variant="small">{category.description}</Text>
                      <Text variant="muted" className="text-xs">
                        {metadataParts.join(' · ')}
                      </Text>
                    </div>
                    <ChevronRight aria-hidden className={campaignDestinationChevronClasses} />
                  </Link>
                </li>
              )
            })}
        </ul>
      </PageLoadState>
    </WidePage>
  )
}

export function VocabularyHub() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  return <VocabularyHubContent campaignId={campaignId} />
}
