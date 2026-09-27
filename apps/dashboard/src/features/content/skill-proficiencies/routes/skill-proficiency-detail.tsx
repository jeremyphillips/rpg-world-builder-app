import { useParams } from 'react-router-dom'
import { RichTextContent, Text } from '@rpg/ui'
import { classesOfferingSkillChoice } from '@rpg/contracts'
import type { SkillProficiency } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'
import {
  formatContentNotFoundMessage,
  formatContentListLoadErrorMessage,
} from '@/features/content/lib/content-type-labels'
import { useSetBreadcrumbLabel } from '@/components/layout/breadcrumb/use-breadcrumb-label'
import { useClasses } from '../../classes/hooks/use-classes'
import { useSkillProficiencies } from '../hooks/use-skill-proficiencies'
import { ContentDetailLayout } from '../../lib/detail/page/content-detail-layout'
import { ContentDetailSection } from '../../lib/detail/page/content-detail-section'
import { ContentStatusNameBadge } from '../../lib/overview/content-status-name-badge'
import { ContentDetailResolver } from '../../lib/detail/page/content-detail-resolver'
import { contentEditHref } from '../../lib/detail/page/content-edit-href'
import { ContentStatRow } from '../../lib/detail/metadata/content-stat-row'
import { ContentLinkBadge } from '../../lib/detail/metadata/content-link-badge'
import { ContentUsageReferencesSection } from '../../lib/usage/content-usage-references-section'
import { buildSkillProficiencyDetailViewModel } from '../lib/skill-proficiency-display'

const SKILL_EXAMPLES_HEADING_ID = 'skill-examples-heading'
const CLASS_SKILL_CHOICES_HEADING_ID = 'class-skill-choices-heading'

function SkillExamplesList({
  examples,
  sectionTitle,
}: {
  examples: string[]
  sectionTitle: string
}) {
  if (examples.length === 0) return null

  return (
    <ContentDetailSection heading={sectionTitle} headingId={SKILL_EXAMPLES_HEADING_ID}>
      <ul className="list-disc space-y-1 pl-5" role="list">
        {examples.map((example) => (
          <li key={example}>
            <Text variant="muted">{example}</Text>
          </li>
        ))}
      </ul>
    </ContentDetailSection>
  )
}

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
    <ContentDetailSection heading="Class skill choices" headingId={CLASS_SKILL_CHOICES_HEADING_ID}>
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
    </ContentDetailSection>
  )
}

type SkillDetailContentProps = {
  skill: SkillProficiency
  campaignId: string
  skillId: string
}

export function SkillDetailContent({ skill, campaignId, skillId }: SkillDetailContentProps) {
  useSetBreadcrumbLabel(skill.name)
  const viewModel = buildSkillProficiencyDetailViewModel(skill)

  return (
    <ContentDetailLayout
      contentTypeKey="skill-proficiencies"
      name={skill.name}
      nameBadge={<ContentStatusNameBadge status={skill.status} />}
      imageName={skill.name}
      campaignId={campaignId}
      editHref={contentEditHref('skillProficiencies', campaignId, skillId)}
      heroDescription={false}
      descriptionContent={
        skill.description ? (
          <RichTextContent html={skill.description} size="md" tone="muted" />
        ) : undefined
      }
      metadata={
        <div className="space-y-4">
          <ContentStatRow label="Governing Ability" value={viewModel.governingAbilityLabel} />
          {viewModel.summarySentence ? (
            <Text variant="muted">{viewModel.summarySentence}</Text>
          ) : null}
        </div>
      }
    >
      <SkillExamplesList
        examples={viewModel.examples}
        sectionTitle={viewModel.examplesSectionTitle}
      />
      <ClassSkillChoicesList campaignId={campaignId} skillSlug={skill.slug} />
      <ContentUsageReferencesSection
        campaignId={campaignId}
        routeKey="skill-proficiencies"
        entityId={skillId}
      />
    </ContentDetailLayout>
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
      loadErrorLabel={formatContentListLoadErrorMessage('skill-proficiencies')}
      notFoundLabel={formatContentNotFoundMessage('skill-proficiencies')}
    >
      {(skill) => <SkillDetailContent skill={skill} campaignId={campaignId} skillId={skillId} />}
    </ContentDetailResolver>
  )
}
