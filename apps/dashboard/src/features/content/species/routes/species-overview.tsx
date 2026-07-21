import { useParams } from 'react-router-dom'
import { DataTable } from '@rpg/ui'
import type { Species } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'
import { useCreatureTypeVocabulary } from '@/features/homebrew'
import {
  formatContentCreateHeading,
  formatContentOverviewCaption,
  getContentTypeCollectionLabel,
  getContentTypeMidSentenceLabel,
} from '@/features/content/lib/content-type-labels'
import { useSpecies } from '../hooks/use-species'
import { speciesColumns, speciesFilters } from '../lib/species-overview-columns'
import { ContentOverviewShell } from '../../lib/overview/content-overview-shell'
import { ContentOverviewRowActions } from '../../lib/overview/content-overview-row-actions'

function SpeciesRowActions({ row, campaignId }: { row: Species; campaignId: string }) {
  return (
    <ContentOverviewRowActions
      campaignId={campaignId}
      editHref={ROUTES.content.species.edit(campaignId, row.id)}
      enabled={true}
      onToggleEnabled={() => {}}
      itemLabel={getContentTypeMidSentenceLabel('species')}
    />
  )
}

export function SpeciesOverview() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  const { data: species = [], isPending, isError } = useSpecies(campaignId)
  const {
    vocabulary,
    isPending: isVocabularyPending,
    isError: isVocabularyError,
  } = useCreatureTypeVocabulary(campaignId)

  return (
    <ContentOverviewShell
      heading={getContentTypeCollectionLabel('species')}
      campaignId={campaignId}
      isPending={isPending || isVocabularyPending}
      isError={isError || isVocabularyError}
      newHref={ROUTES.content.species.create(campaignId)}
      newLabel={formatContentCreateHeading('species')}
    >
      <DataTable
        columns={speciesColumns(campaignId, vocabulary)}
        data={species}
        filters={speciesFilters(vocabulary)}
        rowActions={(row) => <SpeciesRowActions row={row} campaignId={campaignId} />}
        caption={formatContentOverviewCaption('species', 'Playable')}
      />
    </ContentOverviewShell>
  )
}
