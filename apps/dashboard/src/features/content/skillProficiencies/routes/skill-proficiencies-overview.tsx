import { useParams } from 'react-router-dom'
import { DataTable, RowActionsMenu } from '@rpg/ui'
import type { SkillProficiency } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'
import { useSkillProficiencies } from '../hooks/use-skill-proficiencies'
import {
  skillProficienciesColumns,
  skillProficienciesFilters,
} from '../components/skill-proficiencies-columns'
import { ContentOverviewShell } from '../../lib/content-overview-shell'

function SkillRowActions({ row, campaignId }: { row: SkillProficiency; campaignId: string }) {
  return (
    <RowActionsMenu
      editHref={ROUTES.content.skillProficiencies.edit(campaignId, row.id)}
      enabled={true}
      onToggleEnabled={() => {}}
      itemLabel="skill proficiency"
    />
  )
}

export function SkillProficienciesOverview() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  const { data: skillProficiencies = [], isPending, isError } = useSkillProficiencies(campaignId)

  return (
    <ContentOverviewShell
      heading="Skill Proficiencies"
      isPending={isPending}
      isError={isError}
      newHref={ROUTES.content.skillProficiencies.create(campaignId)}
      newLabel="New Skill Proficiency"
    >
      <DataTable
        columns={skillProficienciesColumns(campaignId)}
        data={skillProficiencies}
        filters={skillProficienciesFilters}
        rowActions={(row) => <SkillRowActions row={row} campaignId={campaignId} />}
        caption="Skill proficiencies available in this campaign"
      />
    </ContentOverviewShell>
  )
}
