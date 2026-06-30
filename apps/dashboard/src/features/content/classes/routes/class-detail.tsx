import { useParams, Link } from 'react-router-dom'
import { Heading, RichTextContent, Text } from '@rpg/ui'
import { getAbilityLabel, skillSlugsSuggestingClass } from '@rpg/contracts'
import type { CharacterClass, SkillProficiency, Subclass } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'
import { WidePage } from '@/components/layout/wide-page'
import { useCampaignRules } from '@/features/campaign'
import { useSetBreadcrumbLabel } from '@/components/layout/use-breadcrumb-label'
import { useClasses } from '../hooks/use-classes'
import { useSubclasses } from '../hooks/use-subclasses'
import { useSkillProficiencies } from '../../skill-proficiencies/hooks/use-skill-proficiencies'
import { ContentDetailLayout } from '../../lib/detail/content-detail-layout'
import { ContentDetailResolver } from '../../lib/detail/content-detail-resolver'
import { contentEditHref } from '../../lib/detail/content-edit-href'
import { ContentStatRow } from '../../lib/detail/content-stat-row.client'
import { FeatureItem } from '../lib/feature-item'
import { getContentImageUrl } from '../../lib/detail/content-image-url'
import { ClassProgressionTable } from '../components/class-progression-table'

const SUGGESTED_SKILL_CHIP_CLASS =
  'rounded-md border px-2 py-1 text-sm hover:underline focus-visible:underline'

function FeaturesList({
  className,
  features,
}: {
  className: string
  features: CharacterClass['features']
}) {
  const sorted = [...features].sort((a, b) => a.level - b.level || a.name.localeCompare(b.name))
  return (
    <section aria-labelledby="features-heading">
      <Heading variant="section" as="h2" id="features-heading" className="mb-4">
        {className} Class Features
      </Heading>
      <ul className="space-y-4" role="list">
        {sorted.map((feature) => (
          <FeatureItem key={feature.id} feature={feature} />
        ))}
      </ul>
    </section>
  )
}

function SubclassFeaturesList({ features }: { features: Subclass['features'] }) {
  if (features.length === 0) return null
  const sorted = [...features].sort((a, b) => a.level - b.level || a.name.localeCompare(b.name))
  return (
    <ul className="mt-4 space-y-4" role="list">
      {sorted.map((feature) => (
        <FeatureItem key={feature.id} feature={feature} />
      ))}
    </ul>
  )
}

function SubclassesList({ subclasses }: { subclasses: Subclass[] }) {
  if (subclasses.length === 0) return null
  return (
    <section aria-labelledby="subclasses-heading">
      <Heading variant="section" as="h2" id="subclasses-heading" className="mb-4">
        Subclasses
      </Heading>
      <ul className="space-y-6" role="list">
        {subclasses.map((sub) => (
          <li key={sub.id} className="space-y-2">
            <Heading variant="label" as="p">
              {sub.name}
            </Heading>
            {sub.tagline && (
              <Text variant="small" className="italic">
                {sub.tagline}
              </Text>
            )}
            {sub.description && <RichTextContent html={sub.description} size="md" tone="muted" />}
            <SubclassFeaturesList features={sub.features} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function titleCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function SuggestedProficienciesList({
  campaignId,
  classSlug,
  choose,
  skillProficiencies,
  isPending,
}: {
  campaignId: string
  classSlug: string
  choose: number
  skillProficiencies: SkillProficiency[]
  isPending: boolean
}) {
  const suggestedSkillSlugs = skillSlugsSuggestingClass(classSlug, skillProficiencies)
  if (!isPending && suggestedSkillSlugs.length === 0) return null

  const skillsBySlug = new Map(skillProficiencies.map((skill) => [skill.slug, skill]))

  return (
    <section aria-labelledby="suggested-proficiencies-heading">
      <Heading variant="section" as="h2" id="suggested-proficiencies-heading" className="mb-3">
        Suggested proficiencies
      </Heading>
      <Text variant="muted" className="mb-3">
        Choose {choose}
      </Text>
      {isPending ? (
        <Text variant="muted">Loading…</Text>
      ) : (
        <ul className="flex flex-wrap gap-2" role="list">
          {suggestedSkillSlugs.map((slug) => {
            const skill = skillsBySlug.get(slug)
            return (
              <li key={slug}>
                {skill ? (
                  <Link
                    to={ROUTES.content.skillProficiencies.detail(campaignId, skill.id)}
                    className={SUGGESTED_SKILL_CHIP_CLASS}
                  >
                    {skill.name}
                  </Link>
                ) : (
                  <span className={SUGGESTED_SKILL_CHIP_CLASS}>{slug}</span>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

function ClassStatsSection({ characterClass }: { characterClass: CharacterClass }) {
  const { hitDie, primaryAbilities, proficiencies } = characterClass

  const primaryAbilitiesLabel = primaryAbilities.map(getAbilityLabel).join(', ')
  const savingThrowsLabel = proficiencies.savingThrows.map(getAbilityLabel).join(', ')
  const weaponsLabel = proficiencies.weapons.categories.map(titleCase).join(', ')
  const armorLabel =
    proficiencies.armor.length > 0 ? proficiencies.armor.map(titleCase).join(', ') : 'None'

  return (
    <div className="space-y-3">
      <ContentStatRow label="Hit Die" value={`d${hitDie} per level`} />
      <ContentStatRow label="Primary Abilities" value={primaryAbilitiesLabel} />
      <ContentStatRow label="Saving Throws" value={savingThrowsLabel} />
      <ContentStatRow label="Weapon Proficiencies" value={weaponsLabel} />
      <ContentStatRow label="Armor Training" value={armorLabel} />
    </div>
  )
}

type ClassDetailContentProps = {
  characterClass: CharacterClass
  campaignId: string
  classId: string
  subclasses: Subclass[]
  skillProficiencies: SkillProficiency[]
  skillsPending: boolean
}

export function ClassDetailContent({
  characterClass,
  campaignId,
  classId,
  subclasses,
  skillProficiencies,
  skillsPending,
}: ClassDetailContentProps) {
  useSetBreadcrumbLabel(characterClass.name)
  const campaignRules = useCampaignRules(campaignId)

  return (
    <WidePage spacing="relaxed">
      <ContentDetailLayout
        name={characterClass.name}
        imageUrl={getContentImageUrl(characterClass.imageKey)}
        imageName={characterClass.name}
        campaignId={campaignId}
        editHref={contentEditHref('classes', campaignId, classId)}
        metadata={<ClassStatsSection characterClass={characterClass} />}
        descriptionContent={
          characterClass.description ? (
            <RichTextContent html={characterClass.description} size="md" tone="muted" />
          ) : undefined
        }
      >
        <SuggestedProficienciesList
          campaignId={campaignId}
          classSlug={characterClass.slug}
          choose={characterClass.proficiencies.skills.choose}
          skillProficiencies={skillProficiencies}
          isPending={skillsPending}
        />
        {characterClass.features.length > 0 && (
          <FeaturesList className={characterClass.name} features={characterClass.features} />
        )}
        <SubclassesList subclasses={subclasses} />
      </ContentDetailLayout>
      <ClassProgressionTable characterClass={characterClass} campaignRules={campaignRules} />
    </WidePage>
  )
}

export function ClassDetail() {
  const { campaignId = '', classId = '' } = useParams<{ campaignId: string; classId: string }>()
  const { data: classes = [], isPending, isError } = useClasses(campaignId)
  const { data: subclasses = [] } = useSubclasses(campaignId, classId)
  const { data: skillProficiencies = [], isPending: skillsPending } =
    useSkillProficiencies(campaignId)

  return (
    <ContentDetailResolver
      isPending={isPending}
      isError={isError}
      items={classes}
      itemId={classId}
      loadErrorLabel="Could not load class."
      notFoundLabel="Class not found."
    >
      {(characterClass) => (
        <ClassDetailContent
          characterClass={characterClass}
          campaignId={campaignId}
          classId={classId}
          subclasses={subclasses}
          skillProficiencies={skillProficiencies}
          skillsPending={skillsPending}
        />
      )}
    </ContentDetailResolver>
  )
}
