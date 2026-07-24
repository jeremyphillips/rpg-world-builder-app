import { useParams } from 'react-router-dom'
import type { SkillProficiency, WithCampaignAccess } from '@rpg/contracts'
import type { ColumnDef } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import {
  formatContentCreateHeading,
  getContentTypeCollectionLabel,
  getContentTypeSentenceLabel,
} from '@/features/content/lib/content-type-labels'
import { useSkillProficiencies } from '../hooks/use-skill-proficiencies'
import {
  skillProficienciesColumns,
  skillProficienciesFilterSchema,
} from '../lib/skill-proficiencies-overview-columns'
import { ContentOverviewShell } from '../../lib/overview/content-overview-shell'
import { ContentOverviewTable } from '../../lib/overview/content-overview-table.client'

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
      <ContentOverviewTable<WithCampaignAccess<SkillProficiency>>
        contentTypeKey="skill-proficiencies"
        campaignId={campaignId}
        columns={
          skillProficienciesColumns(campaignId) as ColumnDef<
            WithCampaignAccess<SkillProficiency>,
            unknown
          >[]
        }
        filterSchema={skillProficienciesFilterSchema}
        data={skillProficiencies as WithCampaignAccess<SkillProficiency>[]}
        caption={`${getContentTypeSentenceLabel('skill-proficiencies', { plural: true })} available in this campaign`}
        getEditHref={(row) => ROUTES.content.skillProficiencies.edit(campaignId, row.id)}
      />
    </ContentOverviewShell>
  )
}
