import { Link, useParams } from 'react-router-dom'
import { buttonVariants, Heading, Text } from '@rpg/ui'
import { ABILITIES, getClassName } from '@rpg/contracts'
import type { SkillProficiency } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'
import { useSetBreadcrumbLabel } from '@/components/layout/use-breadcrumb-label'
import { useSkillProficiencies } from '../hooks/use-skill-proficiencies'
import { ContentDetailLayout } from '../../lib/content-detail-layout'
import { ContentDetailResolver } from '../../lib/content-detail-resolver'
import { ContentStatRow } from '../../lib/content-stat-row'
import { getContentImageUrl } from '../../lib/content-image-url'

function SuggestedClassesList({
  campaignId,
  rulesetId,
  suggestedClasses,
}: {
  campaignId: string
  rulesetId: string
  suggestedClasses: string[]
}) {
  if (suggestedClasses.length === 0) return null
  return (
    <section aria-labelledby="suggested-classes-heading">
      <Heading variant="section" as="h3" id="suggested-classes-heading" className="mb-3">
        Commonly Taken By
      </Heading>
      <ul className="flex flex-wrap gap-2" role="list">
        {suggestedClasses.map((slug) => (
          <li key={slug}>
            {/*
             * System class ids are deterministic: `${rulesetId}:${slug}`.
             * This breaks for homebrew classes, which use a Mongo-generated id.
             * Fix: load the classes list and look up by slug when homebrew
             * classes need to appear in suggestedClasses.
             */}
            <Link
              to={ROUTES.content.classes.detail(campaignId, `${rulesetId}:${slug}`)}
              className="rounded-md border px-2 py-1 text-sm hover:underline focus-visible:underline"
            >
              {getClassName(slug)}
            </Link>
          </li>
        ))}
      </ul>
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
  const editHref = ROUTES.content.skillProficiencies.edit(campaignId, skillId)

  return (
    <ContentDetailLayout
      imageUrl={getContentImageUrl(skill.imageKey)}
      imageName={skill.name}
      actions={
        <Link to={editHref} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          Edit
        </Link>
      }
    >
      <div className="space-y-4">
        <Heading variant="display" as="h2">
          {skill.name}
        </Heading>
        <div className="space-y-3">
          <ContentStatRow label="Governing Ability" value={ABILITIES[skill.ability]} />
        </div>
        {skill.description && <Text variant="muted">{skill.description}</Text>}
      </div>
      {skill.suggestedClasses && skill.suggestedClasses.length > 0 && (
        <SuggestedClassesList
          campaignId={campaignId}
          rulesetId={skill.rulesetId}
          suggestedClasses={skill.suggestedClasses}
        />
      )}
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
      loadErrorLabel="Could not load skill proficiency."
      notFoundLabel="Skill proficiency not found."
    >
      {(skill) => <SkillDetailContent skill={skill} campaignId={campaignId} skillId={skillId} />}
    </ContentDetailResolver>
  )
}
