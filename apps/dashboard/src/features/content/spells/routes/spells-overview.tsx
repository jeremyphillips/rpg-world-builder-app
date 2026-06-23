import { useParams } from 'react-router-dom'
import { DataTable } from '@rpg/ui'
import type { Spell } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'
import { useSpells } from '../hooks/use-spells'
import { spellsColumns, spellsFilters } from '../components/spells-columns'
import { ContentOverviewShell } from '../../lib/content-overview-shell'
import { ContentOverviewRowActions } from '../../lib/content-overview-row-actions'

function SpellRowActions({ row, campaignId }: { row: Spell; campaignId: string }) {
  return (
    <ContentOverviewRowActions
      campaignId={campaignId}
      editHref={ROUTES.content.spells.edit(campaignId, row.id)}
      enabled={true}
      onToggleEnabled={() => {}}
      itemLabel="spell"
    />
  )
}

export function SpellsOverview() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  const { data: spells = [], isPending, isError } = useSpells(campaignId)

  return (
    <ContentOverviewShell
      heading="Spells"
      campaignId={campaignId}
      isPending={isPending}
      isError={isError}
      newHref={ROUTES.content.spells.create(campaignId)}
      newLabel="New Spell"
    >
      <DataTable
        columns={spellsColumns(campaignId)}
        data={spells}
        filters={spellsFilters}
        rowActions={(row) => <SpellRowActions row={row} campaignId={campaignId} />}
        caption="Spells available in this campaign"
      />
    </ContentOverviewShell>
  )
}
