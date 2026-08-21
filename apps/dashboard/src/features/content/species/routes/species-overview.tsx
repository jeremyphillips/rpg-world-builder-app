import { useParams } from 'react-router-dom'
import type { Species, WithCampaignAccess } from '@rpg/contracts'
import type { ColumnDef } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import {
  formatContentCreateHeading,
  formatContentOverviewCaption,
  getContentTypeCollectionLabel,
} from '@/features/content/lib/content-type-labels'
import { useSpecies, useSpeciesUsageMeta } from '../hooks/use-species'
import { speciesColumns, speciesFilterSchema } from '../lib/species-overview-columns'
import { ContentOverviewShell } from '../../lib/overview/content-overview-shell'
import { ContentOverviewTable } from '../../lib/overview/content-overview-table'

export function SpeciesOverview() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  const { data: species = [], isPending, isError } = useSpecies(campaignId)
  const { data: usageMeta } = useSpeciesUsageMeta(campaignId)
  const usageSummaryLabels = usageMeta?.usageSummaryLabels
  const overviewUsageScope = usageMeta?.overviewUsageScope

  return (
    <ContentOverviewShell
      heading={getContentTypeCollectionLabel('species')}
      campaignId={campaignId}
      isPending={isPending}
      isError={isError}
      newHref={ROUTES.content.species.create(campaignId)}
      newLabel={formatContentCreateHeading('species')}
    >
      <ContentOverviewTable<WithCampaignAccess<Species>>
        contentTypeKey="species"
        campaignId={campaignId}
        columns={
          speciesColumns(campaignId, { usageSummaryLabels, overviewUsageScope }) as ColumnDef<
            WithCampaignAccess<Species>,
            unknown
          >[]
        }
        filterSchema={speciesFilterSchema()}
        data={species as WithCampaignAccess<Species>[]}
        caption={formatContentOverviewCaption('species', 'Playable')}
        getEditHref={(row) => ROUTES.content.species.edit(campaignId, row.id)}
      />
    </ContentOverviewShell>
  )
}
