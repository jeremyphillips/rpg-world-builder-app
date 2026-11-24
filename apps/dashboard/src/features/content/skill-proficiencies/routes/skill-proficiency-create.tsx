import { useParams } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { formatContentCreateHeading } from '@/features/content/lib/content-type-labels'
import { ContentCreateShell } from '../../lib/forms/shells/create/content-create-shell'
import { skillProficiencyFormDef } from '../lib/skill-proficiency-form-def'

export function SkillProficiencyCreate() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  return (
    <ContentCreateShell
      def={skillProficiencyFormDef}
      campaignId={campaignId}
      heading={formatContentCreateHeading('skill-proficiencies')}
      backHref={ROUTES.content.skillProficiencies.overview(campaignId)}
    />
  )
}
