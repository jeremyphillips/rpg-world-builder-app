import { useParams } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import {
  formatContentNotFoundMessage,
  formatContentListLoadErrorMessage,
} from '@/features/content/lib/content-type-labels'
import { ContentEditShell } from '../../lib/forms/shells/content-edit-shell'
import { useSkillProficiencies } from '../hooks/use-skill-proficiencies'
// Registers the skill proficiency form def into the content form registry on module load.
import '../lib/skill-proficiency-form-def'

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
      loadErrorLabel={formatContentListLoadErrorMessage('skill-proficiencies')}
      notFoundLabel={formatContentNotFoundMessage('skill-proficiencies')}
      backHref={ROUTES.content.skillProficiencies.detail(campaignId, skillId)}
      overviewHref={ROUTES.content.skillProficiencies.overview(campaignId)}
      contentTypeKey="skill-proficiencies"
    />
  )
}
