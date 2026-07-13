'use client'

import { Heading, RichTextContent } from '@rpg/ui'

import { ContentStaticBadge } from '../../lib/detail/content-link-badge'
import { ContentStatRow, type ContentStatRowSize } from '../../lib/detail/content-stat-row.client'
import { SPELL_DETAIL_SECTION_LABELS, type SpellDetailViewModel } from '../lib/spell-display'

export type SpellDetailMetadataProps = {
  viewModel: SpellDetailViewModel
  omitStatLabels?: readonly string[]
  omitSectionTitle?: boolean
  sectionId?: string
  statRowSize?: ContentStatRowSize
}

export function SpellDetailMetadata({
  viewModel,
  omitStatLabels = [],
  omitSectionTitle = true,
  sectionId = 'spell-detail-metadata',
  statRowSize = 'sm',
}: SpellDetailMetadataProps) {
  const omitted = new Set(omitStatLabels)
  const statRows = viewModel.statRows.filter((row) => !omitted.has(row.label))

  return (
    <section className="space-y-3" aria-label={omitSectionTitle ? 'Spell details' : undefined}>
      {statRows.length > 0 ? (
        <div className="space-y-1">
          {statRows.map((row) => (
            <ContentStatRow
              key={row.label}
              size={statRowSize}
              label={row.label}
              value={row.value}
              info={row.info}
              infoPlacement={row.infoPlacement}
              infoAriaLabel={row.infoAriaLabel}
            />
          ))}
        </div>
      ) : null}

      {viewModel.descriptionHtml ? (
        <RichTextContent html={viewModel.descriptionHtml} size="sm" tone="muted" />
      ) : null}

      {viewModel.proseSections.cantripScaling ? (
        <>
          <Heading as="h4" variant="section">
            {SPELL_DETAIL_SECTION_LABELS.cantripScaling}
          </Heading>
          <RichTextContent html={viewModel.proseSections.cantripScaling} size="sm" tone="muted" />
        </>
      ) : null}

      {viewModel.proseSections.higherLevelSlotEffect ? (
        <>
          <Heading as="h4" variant="section">
            {SPELL_DETAIL_SECTION_LABELS.higherLevelSlotEffect}
          </Heading>
          <RichTextContent
            html={viewModel.proseSections.higherLevelSlotEffect}
            size="sm"
            tone="muted"
          />
        </>
      ) : null}

      {viewModel.tagLabels.length > 0 ? (
        <section aria-labelledby={`${sectionId}-tags-heading`}>
          <Heading variant="label" as="h4" id={`${sectionId}-tags-heading`} className="mb-2">
            {SPELL_DETAIL_SECTION_LABELS.tags}
          </Heading>
          <ul className="flex flex-wrap gap-2" role="list">
            {viewModel.tagLabels.map((label) => (
              <li key={label}>
                <ContentStaticBadge>{label}</ContentStaticBadge>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {viewModel.classLabels.length > 0 ? (
        <section aria-labelledby={`${sectionId}-classes-heading`}>
          <Heading variant="label" as="h4" id={`${sectionId}-classes-heading`} className="mb-2">
            {SPELL_DETAIL_SECTION_LABELS.classes}
          </Heading>
          <ul className="flex flex-wrap gap-2" role="list">
            {viewModel.classLabels.map((label) => (
              <li key={label}>
                <ContentStaticBadge>{label}</ContentStaticBadge>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </section>
  )
}
