import { useParams } from 'react-router-dom'
import { DataTable, RowActionsMenu } from '@rpg/ui'
import type { SkillProficiency } from '@rpg/contracts'

import { useSkillProficiencies } from '../hooks/use-skill-proficiencies'
import {
  skillProficienciesColumns,
  skillProficienciesFilters,
} from '../components/skill-proficiencies-columns'
import { ContentOverviewShell } from '../../lib/content-overview-shell'

function SkillRowActions(_: { row: SkillProficiency }) {
  return (
    <RowActionsMenu
      editHref="#"
      enabled={true}
      onToggleEnabled={() => {}}
      itemLabel="skill proficiency"
    />
  )
}

export function SkillProficienciesOverview() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const { data: skillProficiencies = [], isPending, isError } = useSkillProficiencies(campaignId)

  return (
    <ContentOverviewShell heading="Skill Proficiencies" isPending={isPending} isError={isError}>
      <DataTable
        columns={skillProficienciesColumns(campaignId ?? '')}
        data={skillProficiencies}
        filters={skillProficienciesFilters}
        rowActions={(row) => <SkillRowActions row={row} />}
        caption="Skill proficiencies available in this campaign"
      />
    </ContentOverviewShell>
  )
}
