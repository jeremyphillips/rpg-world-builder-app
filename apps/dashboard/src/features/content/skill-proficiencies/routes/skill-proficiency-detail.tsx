import { useParams } from 'react-router-dom'
import { Heading, Text } from '@rpg/ui'
import { classesOfferingSkillChoice, getAbilityLabel } from '@rpg/contracts'
import type { SkillProficiency } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'
import { useSetBreadcrumbLabel } from '@/components/layout/use-breadcrumb-label'
import { WidePage } from '@/components/layout/wide-page'
import { useClasses } from '../../classes/hooks/use-classes'
import { useSkillProficiencies } from '../hooks/use-skill-proficiencies'
import { ContentDetailLayout } from '../../lib/detail/content-detail-layout'
import { ContentDetailResolver } from '../../lib/detail/content-detail-resolver'
import { contentEditHref } from '../../lib/detail/content-edit-href'
import { ContentStatRow } from '../../lib/detail/content-stat-row.client'
import { getContentImageUrl } from '../../lib/detail/content-image-url'
import { ContentLinkBadge } from '../../lib/detail/content-link-badge'

function ClassSkillChoicesList({
  campaignId,
  skillSlug,
}: {
  campaignId: string
  skillSlug: string
}) {
  const { data: classes = [], isPending } = useClasses(campaignId)
  const offeringClasses = classesOfferingSkillChoice(skillSlug, classes)

  if (offeringClasses.length === 0 && !isPending) return null

  return (
    <section aria-labelledby="class-skill-choices-heading">
      <Heading variant="label" as="h2" id="class-skill-choices-heading" className="mb-3">
        Class skill choices
      </Heading>
      {isPending ? (
        <Text variant="muted">Loading…</Text>
      ) : (
        <ul className="flex flex-wrap gap-2" role="list">
          {offeringClasses.map((cls) => (
            <li key={cls.slug}>
              <ContentLinkBadge to={ROUTES.content.classes.detail(campaignId, cls.id)}>
                {cls.name}
              </ContentLinkBadge>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

type SkillDetailContentProps = {
  skill: SkillProficiency
  campaignId: string
  skillId: string
}

export function SkillDetailContent({ skill, campaignId, skillId }: SkillDetailContentProps) {
  useSetBreadcrumbLabel(skill.name)

  return (
    <WidePage>
      <ContentDetailLayout
        name={skill.name}
        imageUrl={getContentImageUrl(skill.imageKey)}
        imageName={skill.name}
        campaignId={campaignId}
        editHref={contentEditHref('skillProficiencies', campaignId, skillId)}
        metadata={
          <div className="space-y-8">
            <ContentStatRow label="Governing Ability" value={getAbilityLabel(skill.ability)} />
            {skill.description ? <Text variant="muted">{skill.description}</Text> : null}
            <ClassSkillChoicesList campaignId={campaignId} skillSlug={skill.slug} />
          </div>
        }
      />
    </WidePage>
  )
}

export function SkillProficiencyDetail() {
  const { campaignId = '', skillId = '' } = useParams<{ campaignId: string; skillId: string }>()
  const { data: skillProficiencies = [], isPending, isError } = useSkillProficiencies(campaignId)

  return (
    <ContentDetailResolver
      isPending={isPending}
      isError={isError}
      items={skillProficiencies}
      itemId={skillId}
      loadErrorLabel="Could not load skill proficiency."
      notFoundLabel="Skill proficiency not found."
    >
      {(skill) => <SkillDetailContent skill={skill} campaignId={campaignId} skillId={skillId} />}
    </ContentDetailResolver>
  )
}
