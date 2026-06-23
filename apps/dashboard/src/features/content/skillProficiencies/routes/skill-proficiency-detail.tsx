import { Link, useParams } from 'react-router-dom'
import { Heading, Text } from '@rpg/ui'
import { ABILITIES, getClassName } from '@rpg/contracts'
import type { SkillProficiency } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'
import { useSetBreadcrumbLabel } from '@/components/layout/use-breadcrumb-label'
import { useClasses } from '../../classes/hooks/use-classes'
import { useSkillProficiencies } from '../hooks/use-skill-proficiencies'
import { ContentDetailLayout } from '../../lib/content-detail-layout'
import { ContentDetailResolver } from '../../lib/content-detail-resolver'
import { contentEditHref } from '../../lib/content-edit-href'
import { ContentStatRow } from '../../lib/content-stat-row.client'
import { getContentImageUrl } from '../../lib/content-image-url'

const SUGGESTED_CLASS_CHIP_CLASS =
  'rounded-md border px-2 py-1 text-sm hover:underline focus-visible:underline'

function SuggestedClassesList({
  campaignId,
  suggestedClasses,
}: {
  campaignId: string
  suggestedClasses: string[]
}) {
  const { data: classes = [], isPending } = useClasses(campaignId)

  if (suggestedClasses.length === 0) return null

  const classesBySlug = new Map(classes.map((cls) => [cls.slug, cls]))

  return (
    <section aria-labelledby="suggested-classes-heading">
      <Heading variant="section" as="h3" id="suggested-classes-heading" className="mb-3">
        Suggested classes
      </Heading>
      {isPending ? (
        <Text variant="muted">Loading…</Text>
      ) : (
        <ul className="flex flex-wrap gap-2" role="list">
          {suggestedClasses.map((slug) => {
            const cls = classesBySlug.get(slug)
            return (
              <li key={slug}>
                {cls ? (
                  <Link
                    to={ROUTES.content.classes.detail(campaignId, cls.id)}
                    className={SUGGESTED_CLASS_CHIP_CLASS}
                  >
                    {cls.name}
                  </Link>
                ) : (
                  <span className={SUGGESTED_CLASS_CHIP_CLASS}>{getClassName(slug)}</span>
                )}
              </li>
            )
          })}
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
    <ContentDetailLayout
      imageUrl={getContentImageUrl(skill.imageKey)}
      imageName={skill.name}
      campaignId={campaignId}
      editHref={contentEditHref('skillProficiencies', campaignId, skillId)}
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
      {skill.suggestedClasses.length > 0 && (
        <SuggestedClassesList campaignId={campaignId} suggestedClasses={skill.suggestedClasses} />
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
