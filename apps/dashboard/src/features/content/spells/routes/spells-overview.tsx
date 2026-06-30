import { useParams } from 'react-router-dom'
import { DataTable } from '@rpg/ui'
import type { Spell } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'
import { useSpellSchoolVocabulary } from '@/features/homebrew'
import { useSpells } from '../hooks/use-spells'
import { spellsColumns, spellsFilters } from '../lib/spells-overview-columns'
import { ContentOverviewShell } from '../../lib/overview/content-overview-shell'
import { ContentOverviewRowActions } from '../../lib/overview/content-overview-row-actions'

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
  const { vocabulary: spellSchoolVocabulary } = useSpellSchoolVocabulary(campaignId)

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
        columns={spellsColumns(campaignId, spellSchoolVocabulary)}
        data={spells}
        filters={spellsFilters(spellSchoolVocabulary)}
        rowActions={(row) => <SpellRowActions row={row} campaignId={campaignId} />}
        caption="Spells available in this campaign"
      />
    </ContentOverviewShell>
  )
}
