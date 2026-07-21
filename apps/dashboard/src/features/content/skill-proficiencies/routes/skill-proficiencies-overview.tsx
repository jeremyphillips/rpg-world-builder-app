import { useParams } from 'react-router-dom'
import { DataTable } from '@rpg/ui'
import type { SkillProficiency } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'
import {
  formatContentCreateHeading,
  getContentTypeCollectionLabel,
  getContentTypeMidSentenceLabel,
  getContentTypeSentenceLabel,
} from '@/features/content/lib/content-type-labels'
import { useSkillProficiencies } from '../hooks/use-skill-proficiencies'
import {
  skillProficienciesColumns,
  skillProficienciesFilters,
} from '../lib/skill-proficiencies-overview-columns'
import { ContentOverviewShell } from '../../lib/overview/content-overview-shell'
import { ContentOverviewRowActions } from '../../lib/overview/content-overview-row-actions'

function SkillRowActions({ row, campaignId }: { row: SkillProficiency; campaignId: string }) {
  return (
    <ContentOverviewRowActions
      campaignId={campaignId}
      editHref={ROUTES.content.skillProficiencies.edit(campaignId, row.id)}
      enabled={true}
      onToggleEnabled={() => {}}
      itemLabel={getContentTypeMidSentenceLabel('skill-proficiencies')}
    />
  )
}

export function SkillProficienciesOverview() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  const { data: skillProficiencies = [], isPending, isError } = useSkillProficiencies(campaignId)

  return (
    <ContentOverviewShell
      heading={getContentTypeCollectionLabel('skill-proficiencies')}
      campaignId={campaignId}
      isPending={isPending}
      isError={isError}
      newHref={ROUTES.content.skillProficiencies.create(campaignId)}
      newLabel={formatContentCreateHeading('skill-proficiencies')}
    >
      <DataTable
        columns={skillProficienciesColumns(campaignId)}
        data={skillProficiencies}
        filters={skillProficienciesFilters}
        rowActions={(row) => <SkillRowActions row={row} campaignId={campaignId} />}
        caption={`${getContentTypeSentenceLabel('skill-proficiencies', { plural: true })} available in this campaign`}
      />
    </ContentOverviewShell>
  )
}
