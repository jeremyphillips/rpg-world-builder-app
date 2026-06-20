import { useParams } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { ContentEditShell } from '../../lib/content-edit-shell'
import { useSkillProficiencies } from '../hooks/use-skill-proficiencies'

export function SkillProficiencyEdit() {
  const { campaignId = '', skillId = '' } = useParams<{
    campaignId: string
    skillId: string
  }>()
  const { isPending, isError } = useSkillProficiencies(campaignId)

  return (
    <ContentEditShell
      contentType="skill-proficiencies"
      campaignId={campaignId}
      entityId={skillId}
      isPending={isPending}
      isError={isError}
      loadErrorLabel="Could not load skill proficiencies."
      notFoundLabel="Skill proficiency not found."
      backHref={ROUTES.content.skillProficiencies.detail(campaignId, skillId)}
    />
  )
}
