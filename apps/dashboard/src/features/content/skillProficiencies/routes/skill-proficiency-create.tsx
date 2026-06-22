import { useParams } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { ContentCreateShell } from '../../lib/content-create-shell'
// Registers the skill proficiency form def into the content form registry on module load.
import '../lib/skill-proficiency-form-def'

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
