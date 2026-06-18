import { useParams } from 'react-router-dom'
import { DataTable, RowActionsMenu } from '@rpg/ui'
import type { SkillProficiency } from '@rpg/contracts'

import { useSkillProficiencies } from '../hooks/use-skill-proficiencies'
import {
  skillProficienciesColumns,
  skillProficienciesFilters,
} from '../components/skill-proficiencies-columns'

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

  if (isPending) {
    return (
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Skill Proficiencies</h2>
        <p className="text-sm text-muted-foreground">Loading skill proficiencies…</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Skill Proficiencies</h2>
        <p role="alert" className="text-sm text-destructive">
          Could not load skill proficiencies.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">Skill Proficiencies</h2>
      <DataTable
        columns={skillProficienciesColumns(campaignId ?? '')}
        data={skillProficiencies}
        filters={skillProficienciesFilters}
        rowActions={(row) => <SkillRowActions row={row} />}
        caption="Skill proficiencies available in this campaign"
      />
    </div>
  )
}
