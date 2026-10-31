import type { ReactNode } from 'react'
import { RichTextContent, Spinner, Text } from '@rpg/ui'
import type { ContentDisplayFallback, ContentDisplayImage } from '@rpg/contracts'

import { DetailNavFlushStack } from '../../../lib/detail/collection/item-stack/detail-nav-flush-stack'
import { ContentDetailQueryStatus } from '../../../lib/detail/page/content-detail-query-status'
import type { NonEmptyContentTypeKeys } from '../../../lib/detail/page/content-detail-query-status.lib'
import { ContentStatList } from '../../../lib/detail/metadata/content-stat-row'
import { ContentDetailLayout } from '../../../lib/detail/page/content-detail-layout'
import { contentDetailProseProps } from '../../../lib/detail/page/content-detail-prose'
import { ContentDetailSection } from '../../../lib/detail/page/content-detail-section'
import {
  contentDetailSectionFlushInsetClasses,
  contentDetailSectionProseBodyFlushFollowClasses,
} from '../../../lib/detail/page/content-detail-section.variants'
import { buildDetailsStatRows } from '../../lib/monster-details-stat-rows'
import { MONSTER_DETAIL_SECTION_IDS } from '../../lib/monster-detail-sections'
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
  /** Catalogs whose initial load failed. Empty when the error is derivation-only. */
  catalogLoadErrors?: NonEmptyContentTypeKeys
  descriptionHtml?: string
  usageSection?: ReactNode
  pageShell?: boolean
}

function ActionItemBody({ item }: { item: MonsterActionItemViewModel }) {
  const attackLine =
    item.responseLabel && item.attackLine
      ? `${item.responseLabel} ${item.attackLine}`
      : item.attackLine

  return (
    <>
      {item.triggerLine ? <Text variant="body-compact">{item.triggerLine}</Text> : null}
      {attackLine ? <Text variant="body-compact">{attackLine}</Text> : null}
      {item.responseLabel && !item.attackLine ? (
        <Text variant="body-compact">{item.responseLabel}</Text>
      ) : null}
      {item.descriptionHtml ? (
        <RichTextContent html={item.descriptionHtml} {...contentDetailProseProps} />
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
      <DetailNavFlushStack
        navPrefix={navPrefix}
        items={items}
        getLabel={(item) => item.name}
        renderItem={(item) => <ActionItemBody item={item} />}
      />
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
      <div className={contentDetailSectionFlushInsetClasses}>
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
                  <td className="py-1 pr-4 font-medium">
                    {formatMonsterAbilityHeader(row.ability)}
                  </td>
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
      </div>
    </ContentDetailSection>
  )
}

function DetailsSection({ viewModel }: { viewModel: MonsterDetailViewModel }) {
  if (viewModel.detailsLeaves.length === 0 && viewModel.catalogState !== 'pending') {
    return null
  }

  const statRows =
    viewModel.catalogState === 'ready' ? buildDetailsStatRows(viewModel.detailsLeaves) : []

  return (
    <ContentDetailSection heading="Details" headingId={MONSTER_DETAIL_SECTION_IDS.details}>
      {viewModel.catalogState === 'pending' ? (
        <Spinner />
      ) : statRows.length > 0 ? (
        <ContentStatList rows={statRows} />
      ) : null}
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
  catalogLoadErrors,
  descriptionHtml,
  usageSection,
  pageShell,
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
      pageShell={pageShell}
    >
      {viewModel.traits.length > 0 ? (
        <ContentDetailSection
          heading="Traits"
          headingId={MONSTER_DETAIL_SECTION_IDS.traits}
          bodyLayout="flush"
        >
          <DetailNavFlushStack
            navPrefix="trait"
            items={viewModel.traits}
            getLabel={(trait) => trait.name}
            renderItem={(trait) => (
              <RichTextContent html={trait.descriptionHtml} {...contentDetailProseProps} />
            )}
          />
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

      {catalogLoadErrors ? (
        <div className={contentDetailSectionProseBodyFlushFollowClasses}>
          <ContentDetailQueryStatus status="error" subject={catalogLoadErrors} />
        </div>
      ) : viewModel.catalogState === 'error' ? (
        <div className={contentDetailSectionProseBodyFlushFollowClasses}>
          <Text variant="destructive" role="status">
            Some mechanical details could not be resolved from campaign catalogs.
          </Text>
        </div>
      ) : null}
    </ContentDetailLayout>
  )
}
