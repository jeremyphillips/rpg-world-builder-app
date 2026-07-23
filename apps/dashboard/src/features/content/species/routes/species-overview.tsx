import { useParams } from 'react-router-dom'
import type { Species, WithCampaignAccess } from '@rpg/contracts'
import type { ColumnDef } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { useCreatureTypeVocabulary } from '@/features/homebrew'
import {
  formatContentCreateHeading,
  formatContentOverviewCaption,
  getContentTypeCollectionLabel,
} from '@/features/content/lib/content-type-labels'
import { useSpecies } from '../hooks/use-species'
import { speciesColumns, speciesFilters } from '../lib/species-overview-columns'
import { ContentOverviewShell } from '../../lib/overview/content-overview-shell'
import { ContentOverviewTable } from '../../lib/overview/content-overview-table.client'

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
      <ContentOverviewTable<WithCampaignAccess<Species>>
        contentTypeKey="species"
        campaignId={campaignId}
        columns={
          speciesColumns(campaignId, vocabulary) as ColumnDef<
            WithCampaignAccess<Species>,
            unknown
          >[]
        }
        filters={speciesFilters(vocabulary)}
        data={species as WithCampaignAccess<Species>[]}
        caption={formatContentOverviewCaption('species', 'Playable')}
        getEditHref={(row) => ROUTES.content.species.edit(campaignId, row.id)}
      />
    </ContentOverviewShell>
  )
}
