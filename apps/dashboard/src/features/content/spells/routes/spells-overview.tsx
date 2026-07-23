import { useParams } from 'react-router-dom'
import type { Spell, WithCampaignAccess } from '@rpg/contracts'
import type { ColumnDef } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { useSpellSchoolVocabulary } from '@/features/homebrew'
import {
  formatContentCollectionAvailabilityCaption,
  formatContentCreateHeading,
  getContentTypeCollectionLabel,
} from '@/features/content/lib/content-type-labels'
import { useSpells } from '../hooks/use-spells'
import { spellsColumns, spellsFilters } from '../lib/spells-overview-columns'
import { ContentOverviewShell } from '../../lib/overview/content-overview-shell'
import { ContentOverviewTable } from '../../lib/overview/content-overview-table.client'

export function SpellsOverview() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  const { data: spells = [], isPending, isError } = useSpells(campaignId)
  const { vocabulary: spellSchoolVocabulary } = useSpellSchoolVocabulary(campaignId)

  return (
    <ContentOverviewShell
      heading={getContentTypeCollectionLabel('spells')}
      campaignId={campaignId}
      isPending={isPending}
      isError={isError}
      newHref={ROUTES.content.spells.create(campaignId)}
      newLabel={formatContentCreateHeading('spells')}
    >
      <ContentOverviewTable<WithCampaignAccess<Spell>>
        contentTypeKey="spells"
        campaignId={campaignId}
        columns={
          spellsColumns(campaignId, spellSchoolVocabulary) as ColumnDef<
            WithCampaignAccess<Spell>,
            unknown
          >[]
        }
        filters={spellsFilters(spellSchoolVocabulary)}
        data={spells as WithCampaignAccess<Spell>[]}
        caption={formatContentCollectionAvailabilityCaption('spells')}
        getEditHref={(row) => ROUTES.content.spells.edit(campaignId, row.id)}
      />
    </ContentOverviewShell>
  )
}
