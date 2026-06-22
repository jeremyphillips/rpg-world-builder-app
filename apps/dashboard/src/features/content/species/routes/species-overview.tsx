import { useParams } from 'react-router-dom'
import { DataTable } from '@rpg/ui'
import type { Species } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'
import { useSpecies } from '../hooks/use-species'
import { speciesColumns, speciesFilters } from '../components/species-columns'
import { ContentOverviewShell } from '../../lib/content-overview-shell'
import { ContentOverviewRowActions } from '../../lib/content-overview-row-actions'

function SpeciesRowActions({ row, campaignId }: { row: Species; campaignId: string }) {
  return (
    <ContentOverviewRowActions
      campaignId={campaignId}
      editHref={ROUTES.content.species.edit(campaignId, row.id)}
      enabled={true}
      onToggleEnabled={() => {}}
      itemLabel="species"
    />
  )
}

export function SpeciesOverview() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  const { data: species = [], isPending, isError } = useSpecies(campaignId)

  return (
    <ContentOverviewShell
      heading="Species"
      campaignId={campaignId}
      isPending={isPending}
      isError={isError}
      newHref={ROUTES.content.species.create(campaignId)}
      newLabel="New Species"
    >
      <DataTable
        columns={speciesColumns(campaignId)}
        data={species}
        filters={speciesFilters}
        rowActions={(row) => <SpeciesRowActions row={row} campaignId={campaignId} />}
        caption="Playable species available in this campaign"
      />
    </ContentOverviewShell>
  )
}
