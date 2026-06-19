import { useParams } from 'react-router-dom'
import { DataTable, RowActionsMenu } from '@rpg/ui'
import type { Species } from '@rpg/contracts'

import { useSpecies } from '../hooks/use-species'
import { speciesColumns, speciesFilters } from '../components/species-columns'
import { ContentOverviewShell } from '../../lib/content-overview-shell'

function SpeciesRowActions(_: { row: Species }) {
  return (
    <RowActionsMenu editHref="#" enabled={true} onToggleEnabled={() => {}} itemLabel="species" />
  )
}

export function SpeciesOverview() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const { data: species = [], isPending, isError } = useSpecies(campaignId)

  return (
    <ContentOverviewShell heading="Species" isPending={isPending} isError={isError}>
      <DataTable
        columns={speciesColumns(campaignId ?? '')}
        data={species}
        filters={speciesFilters}
        rowActions={(row) => <SpeciesRowActions row={row} />}
        caption="Playable species available in this campaign"
      />
    </ContentOverviewShell>
  )
}
