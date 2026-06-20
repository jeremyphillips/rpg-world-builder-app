import { useParams } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { ContentCreateShell } from '../../lib/content-create-shell'

export function SkillProficiencyCreate() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  return (
    <ContentCreateShell
      contentType="skill-proficiencies"
      campaignId={campaignId}
      heading="New Skill Proficiency"
      backHref={ROUTES.content.skillProficiencies.overview(campaignId)}
    />
  )
}
