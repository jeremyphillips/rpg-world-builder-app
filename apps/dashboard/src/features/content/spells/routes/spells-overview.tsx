import { useParams } from 'react-router-dom'
import { DataTable } from '@rpg/ui'

import { useSpells } from '../hooks/use-spells'
import { spellsColumns, spellsFilters } from '../components/spells-columns'
import { ContentOverviewShell } from '../../lib/content-overview-shell'

export function SpellsOverview() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  const { data: spells = [], isPending, isError } = useSpells(campaignId)

  return (
    <ContentOverviewShell heading="Spells" isPending={isPending} isError={isError}>
      <DataTable
        columns={spellsColumns(campaignId)}
        data={spells}
        filters={spellsFilters}
        caption="Spells available in this campaign"
      />
    </ContentOverviewShell>
  )
}
