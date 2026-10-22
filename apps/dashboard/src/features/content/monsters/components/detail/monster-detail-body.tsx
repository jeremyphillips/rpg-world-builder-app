import type { ReactNode } from 'react'
import { RichTextContent, Spinner, Text } from '@rpg/ui'
import type { ContentDisplayFallback, ContentDisplayImage } from '@rpg/contracts'

import {
  DetailCollectionFlushItemStack,
  DetailCollectionFlushItemStackItem,
} from '../../../lib/detail/collection/item-stack/detail-collection-flush-item-stack'
import { ContentDetailLayout } from '../../../lib/detail/page/content-detail-layout'
import { contentDetailNavItemId } from '../../../lib/detail/page/content-detail-nav-anchor-id'
import {
  ContentDetailSection,
  ContentDetailSectionItem,
} from '../../../lib/detail/page/content-detail-section'
import { contentDetailSectionProseBodyFlushFollowClasses } from '../../../lib/detail/page/content-detail-section.variants'
import {
  MONSTER_DETAIL_DETAILS_LEAF_IDS,
  MONSTER_DETAIL_SECTION_IDS,
} from '../../lib/monster-detail-sections'
import {
  formatMonsterAbilityHeader,
  type MonsterActionItemViewModel,
  type MonsterDetailViewModel,
} from '../../lib/monster-display'

type MonsterDetailBodyProps = {
  name: string
  nameBadge?: ReactNode
  displayImage?: ContentDisplayImage
  displayFallback?: ContentDisplayFallback
  imageName: string
  campaignId: string
  editHref?: string
  viewModel: MonsterDetailViewModel
  descriptionHtml?: string
  usageSection?: ReactNode
}

function ActionItemBody({ item }: { item: MonsterActionItemViewModel }) {
  return (
    <>
      {item.attackLine ? <Text variant="muted">{item.attackLine}</Text> : null}
      {item.triggerLine ? <Text variant="muted">{item.triggerLine}</Text> : null}
      {item.descriptionHtml ? (
        <RichTextContent html={item.descriptionHtml} size="md" tone="muted" />
      ) : null}
    </>
  )
}

function ActionSection({
  heading,
  headingId,
  items,
  navPrefix,
}: {
  heading: string
  headingId: string
  items: MonsterActionItemViewModel[]
  navPrefix: string
}) {
  if (items.length === 0) return null

  return (
    <ContentDetailSection heading={heading} headingId={headingId} bodyLayout="flush">
      <DetailCollectionFlushItemStack>
        {items.map((item) => (
          <DetailCollectionFlushItemStackItem key={item.id}>
            <ContentDetailSectionItem
              id={contentDetailNavItemId(navPrefix, item.id)}
              label={item.name}
            >
              <ActionItemBody item={item} />
            </ContentDetailSectionItem>
          </DetailCollectionFlushItemStackItem>
        ))}
      </DetailCollectionFlushItemStack>
    </ContentDetailSection>
  )
}

function AbilitiesSection({ viewModel }: { viewModel: MonsterDetailViewModel }) {
  if (viewModel.catalogState === 'pending') {
    return (
      <ContentDetailSection
        heading="Abilities"
        headingId={MONSTER_DETAIL_SECTION_IDS.abilities}
        bodyLayout="flush"
      >
        <Spinner />
      </ContentDetailSection>
    )
  }

  if (viewModel.abilities.length === 0) {
    return null
  }

  return (
    <ContentDetailSection
      heading="Abilities"
      headingId={MONSTER_DETAIL_SECTION_IDS.abilities}
      bodyLayout="flush"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[20rem] text-left text-style-body">
          <thead>
            <tr className="text-muted-foreground">
              <th className="pb-2 pr-4 font-medium">Ability</th>
              <th className="pb-2 pr-4 font-medium">Score</th>
              <th className="pb-2 pr-4 font-medium">Mod</th>
              <th className="pb-2 font-medium">Save</th>
            </tr>
          </thead>
          <tbody>
            {viewModel.abilities.map((row) => (
              <tr key={row.ability}>
                <td className="py-1 pr-4 font-medium">{formatMonsterAbilityHeader(row.ability)}</td>
                <td className="py-1 pr-4 tabular-nums">{row.score}</td>
                <td className="py-1 pr-4 tabular-nums">{row.modifierLabel}</td>
                <td className="py-1 tabular-nums">
                  {row.saveProficient ? (
                    <span className="font-medium">{row.saveLabel}</span>
                  ) : (
                    row.saveLabel
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ContentDetailSection>
  )
}

function DetailsSection({ viewModel }: { viewModel: MonsterDetailViewModel }) {
  if (viewModel.detailsLeaves.length === 0 && viewModel.catalogState !== 'pending') {
    return null
  }

  return (
    <ContentDetailSection
      heading="Details"
      headingId={MONSTER_DETAIL_SECTION_IDS.details}
      bodyLayout="flush"
    >
      {viewModel.catalogState === 'pending' ? (
        <Spinner />
      ) : (
        <DetailCollectionFlushItemStack>
          {viewModel.detailsLeaves.map((leaf) => (
            <DetailCollectionFlushItemStackItem key={leaf.id}>
              <ContentDetailSectionItem
                id={
                  MONSTER_DETAIL_DETAILS_LEAF_IDS[
                    leaf.id as keyof typeof MONSTER_DETAIL_DETAILS_LEAF_IDS
                  ] ?? `monster-details-${leaf.id}`
                }
                label={leaf.label}
              >
                <Text variant="muted">{leaf.body}</Text>
              </ContentDetailSectionItem>
            </DetailCollectionFlushItemStackItem>
          ))}
        </DetailCollectionFlushItemStack>
      )}
    </ContentDetailSection>
  )
}

export function MonsterDetailBody({
  name,
  nameBadge,
  displayImage,
  displayFallback,
  imageName,
  campaignId,
  editHref,
  viewModel,
  descriptionHtml,
  usageSection,
}: MonsterDetailBodyProps) {
  const statRows =
    viewModel.catalogState === 'pending'
      ? undefined
      : viewModel.statRows.length > 0
        ? viewModel.statRows
        : undefined

  return (
    <ContentDetailLayout
      contentTypeKey="monsters"
      classificationLabel={viewModel.classificationLabel}
      name={name}
      nameBadge={nameBadge}
      displayImage={displayImage}
      displayFallback={displayFallback}
      imageName={imageName}
      campaignId={campaignId}
      editHref={editHref}
      statRows={statRows}
      metadata={
        viewModel.catalogState === 'pending' ? (
          <div className="flex justify-center py-4">
            <Spinner />
          </div>
        ) : undefined
      }
      heroDescription={Boolean(descriptionHtml)}
      descriptionHtml={descriptionHtml}
    >
      {viewModel.traits.length > 0 ? (
        <ContentDetailSection
          heading="Traits"
          headingId={MONSTER_DETAIL_SECTION_IDS.traits}
          bodyLayout="flush"
        >
          <DetailCollectionFlushItemStack>
            {viewModel.traits.map((trait) => (
              <DetailCollectionFlushItemStackItem key={trait.id}>
                <ContentDetailSectionItem
                  id={contentDetailNavItemId('trait', trait.id)}
                  label={trait.name}
                >
                  <RichTextContent html={trait.descriptionHtml} size="md" tone="muted" />
                </ContentDetailSectionItem>
              </DetailCollectionFlushItemStackItem>
            ))}
          </DetailCollectionFlushItemStack>
        </ContentDetailSection>
      ) : null}

      <AbilitiesSection viewModel={viewModel} />
      <DetailsSection viewModel={viewModel} />

      <ActionSection
        heading="Actions"
        headingId={MONSTER_DETAIL_SECTION_IDS.actions}
        items={viewModel.actions}
        navPrefix="action"
      />
      <ActionSection
        heading="Bonus Actions"
        headingId={MONSTER_DETAIL_SECTION_IDS.bonusActions}
        items={viewModel.bonusActions}
        navPrefix="bonus-action"
      />
      <ActionSection
        heading="Reactions"
        headingId={MONSTER_DETAIL_SECTION_IDS.reactions}
        items={viewModel.reactions}
        navPrefix="reaction"
      />

      {usageSection}

      {viewModel.catalogState === 'error' ? (
        <div className={contentDetailSectionProseBodyFlushFollowClasses}>
          <Text variant="destructive" role="status">
            Some mechanical details could not be resolved from campaign catalogs.
          </Text>
        </div>
      ) : null}
    </ContentDetailLayout>
  )
}
