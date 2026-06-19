import { Link, useParams } from 'react-router-dom'
import { buttonVariants, Heading, RichTextContent, Text } from '@rpg/ui'
import { ABILITIES, getSkillName } from '@rpg/contracts'
import type { CharacterClass, Subclass } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'
import { useSetBreadcrumbLabel } from '@/components/layout/use-breadcrumb-label'
import { useClasses } from '../hooks/use-classes'
import { useSubclasses } from '../hooks/use-subclasses'
import { ContentDetailLayout } from '../../lib/content-detail-layout'
import { ContentDetailResolver } from '../../lib/content-detail-resolver'
import { ContentStatRow } from '../../lib/content-stat-row'
import { FeatureItem } from '../../lib/feature-item'
import { getContentImageUrl } from '../../lib/content-image-url'
import { ClassProgressionTable } from '../components/class-progression-table'

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
      <Heading variant="section" as="h3" id="features-heading" className="mb-4">
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
      <Heading variant="section" as="h3" id="subclasses-heading" className="mb-4">
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
            {sub.description && <RichTextContent html={sub.description} size="sm" tone="muted" />}
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

function ClassStatsSection({ characterClass }: { characterClass: CharacterClass }) {
  const { hitDie, primaryAbilities, proficiencies } = characterClass

  const primaryAbilitiesLabel = primaryAbilities.map((a) => ABILITIES[a]).join(', ')
  const savingThrowsLabel = proficiencies.savingThrows.map((a) => ABILITIES[a]).join(', ')
  const skillsLabel = `Choose ${proficiencies.skills.choose}: ${proficiencies.skills.from.map((s) => getSkillName(s)).join(', ')}`
  const weaponsLabel = proficiencies.weapons.categories.map(titleCase).join(', ')
  const armorLabel =
    proficiencies.armor.length > 0 ? proficiencies.armor.map(titleCase).join(', ') : 'None'

  return (
    <div className="space-y-3">
      <ContentStatRow label="Hit Die" value={`d${hitDie} per level`} />
      <ContentStatRow label="Primary Abilities" value={primaryAbilitiesLabel} />
      <ContentStatRow label="Saving Throws" value={savingThrowsLabel} />
      <ContentStatRow label="Skills" value={skillsLabel} />
      <ContentStatRow label="Weapons" value={weaponsLabel} />
      <ContentStatRow label="Armor" value={armorLabel} />
    </div>
  )
}

type ClassDetailContentProps = {
  characterClass: CharacterClass
  campaignId: string
  classId: string
  subclasses: Subclass[]
}

export function ClassDetailContent({
  characterClass,
  campaignId,
  classId,
  subclasses,
}: ClassDetailContentProps) {
  useSetBreadcrumbLabel(characterClass.name)
  const editHref = ROUTES.content.classes.edit(campaignId, classId)

  return (
    <div className="space-y-6">
      <ContentDetailLayout
        imageUrl={getContentImageUrl(characterClass.imageKey)}
        imageName={characterClass.name}
        actions={
          <Link to={editHref} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            Edit
          </Link>
        }
      >
        <div className="space-y-4">
          <Heading variant="display" as="h2">
            {characterClass.name}
          </Heading>
          <ClassStatsSection characterClass={characterClass} />
          {characterClass.description && (
            <RichTextContent html={characterClass.description} size="sm" tone="muted" />
          )}
        </div>
        {characterClass.features.length > 0 && (
          <FeaturesList className={characterClass.name} features={characterClass.features} />
        )}
      </ContentDetailLayout>
      <ClassProgressionTable characterClass={characterClass} />
      <SubclassesList subclasses={subclasses} />
    </div>
  )
}

export function ClassDetail() {
  const { campaignId = '', classId = '' } = useParams<{ campaignId: string; classId: string }>()
  const { data: classes = [], isPending, isError } = useClasses(campaignId)
  const { data: subclasses = [] } = useSubclasses(campaignId, classId)

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
        />
      )}
    </ContentDetailResolver>
  )
}
