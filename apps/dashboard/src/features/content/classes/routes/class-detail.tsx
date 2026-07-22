import { useParams } from 'react-router-dom'
import { Heading, RichTextContent, Text } from '@rpg/ui'
import { type CharacterClass, type SkillProficiency, type Subclass } from '@rpg/contracts'

import {
  formatContentNotFoundMessage,
  formatContentListLoadErrorMessage,
} from '@/features/content/lib/content-type-labels'
import { WidePage } from '@/components/layout/wide-page'
import { useCampaignRules } from '@/features/campaign'
import { useSetBreadcrumbLabel } from '@/components/layout/use-breadcrumb-label'
import { useClasses } from '../hooks/use-classes'
import { useSubclasses } from '../hooks/use-subclasses'
import { useSkillProficiencies } from '../../skill-proficiencies/hooks/use-skill-proficiencies'
import { ContentDetailLayout } from '../../lib/detail/content-detail-layout'
import { ContentStatusNameBadge } from '../../lib/overview/content-status-name-badge.client'
import { ContentDetailResolver } from '../../lib/detail/content-detail-resolver'
import { contentEditHref } from '../../lib/detail/content-edit-href'
import { getContentImageUrl } from '../../lib/detail/content-image-url'
import { ClassProgressionTable } from '../components/class-progression-table'
import { ClassProficienciesSection } from '../components/class-proficiencies-section.client'
import { FeatureItem } from '../lib/feature-item'
import { isSubclassChoiceFeatureRow } from '../lib/class-subclass-choice-features'
import {
  buildClassDetailViewModel,
  type ClassDetailViewModel,
  type ClassFeatureDetailItem,
} from '../lib/class-display'

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

function ClassFeaturesSection({
  section,
}: {
  section: Extract<ClassDetailViewModel['sections'][number], { id: 'features' }>
}) {
  return (
    <section aria-labelledby="features-heading">
      <Heading variant="section" as="h2" id="features-heading" className="mb-4">
        {section.title}
      </Heading>
      <ul className="space-y-4" role="list">
        {section.items.map((item) => (
          <ClassFeatureItem key={item.id} item={item} />
        ))}
      </ul>
    </section>
  )
}

function ClassFeatureItem({ item }: { item: ClassFeatureDetailItem }) {
  return (
    <FeatureItem
      feature={{
        level: item.level,
        name: item.title,
        description: item.bodyHtml,
      }}
    />
  )
}

function ClassDetailSections({
  sections,
  campaignId,
  skillProficiencies,
  skillsPending,
  vocabulary,
}: {
  sections: ClassDetailViewModel['sections']
  campaignId: string
  skillProficiencies: ClassDetailContentProps['skillProficiencies']
  skillsPending: boolean
  vocabulary: { resolveToolLabel: (slug: string) => string }
}) {
  return (
    <>
      {sections.map((section) =>
        section.id === 'proficiencies' ? (
          <ClassProficienciesSection
            key={section.id}
            section={section}
            campaignId={campaignId}
            skillProficiencies={skillProficiencies}
            skillsPending={skillsPending}
            vocabulary={vocabulary}
          />
        ) : (
          <ClassFeaturesSection key={section.id} section={section} />
        ),
      )}
    </>
  )
}

type ClassDetailContentProps = {
  characterClass: CharacterClass
  campaignId: string
  classId: string
  subclasses: Subclass[]
  skillProficiencies: SkillProficiency[]
  skillsPending: boolean
  showProgressionTable?: boolean
}

export function ClassDetailContent({
  characterClass,
  campaignId,
  classId,
  subclasses,
  skillProficiencies,
  skillsPending,
  showProgressionTable = true,
}: ClassDetailContentProps) {
  useSetBreadcrumbLabel(characterClass.name)
  const campaignRules = useCampaignRules(campaignId)
  const subclassingEnabled = campaignRules.subclassing.enabled
  const visibleFeatures = subclassingEnabled
    ? characterClass.features
    : characterClass.features.filter((feature) => !isSubclassChoiceFeatureRow(feature))

  const vocabulary = {
    resolveToolLabel: (slug: string) =>
      slug
        .split('-')
        .map((part) => (part.length > 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part))
        .join(' '),
  }

  const viewModel = buildClassDetailViewModel(characterClass, vocabulary, {
    surface: 'content-detail',
    features: visibleFeatures,
  })

  return (
    <WidePage spacing="relaxed">
      <ContentDetailLayout
        name={characterClass.name}
        nameBadge={<ContentStatusNameBadge status={characterClass.status} />}
        imageUrl={getContentImageUrl(characterClass.imageKey)}
        imageName={characterClass.name}
        campaignId={campaignId}
        editHref={contentEditHref('classes', campaignId, classId)}
        statRows={viewModel.statRows}
        descriptionContent={
          viewModel.descriptionHtml ? (
            <RichTextContent html={viewModel.descriptionHtml} size="md" tone="muted" />
          ) : undefined
        }
      >
        <ClassDetailSections
          sections={viewModel.sections}
          campaignId={campaignId}
          skillProficiencies={skillProficiencies}
          skillsPending={skillsPending}
          vocabulary={vocabulary}
        />
        {subclassingEnabled ? <SubclassesList subclasses={subclasses} /> : null}
      </ContentDetailLayout>
      {showProgressionTable ? (
        <ClassProgressionTable characterClass={characterClass} campaignRules={campaignRules} />
      ) : null}
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
      loadErrorLabel={formatContentListLoadErrorMessage('classes')}
      notFoundLabel={formatContentNotFoundMessage('classes')}
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
