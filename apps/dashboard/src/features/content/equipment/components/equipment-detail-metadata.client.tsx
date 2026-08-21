'use client'

import { Heading, RichTextContent } from '@rpg/ui'

import { ContentStatRow, type ContentStatRowSize } from '../../lib/detail/metadata/content-stat-row'
import { type EquipmentDetailViewModel } from '../lib/equipment-display'

export type EquipmentDetailMetadataProps = {
  viewModel: EquipmentDetailViewModel
  omitStatLabels?: readonly string[]
  /** Hide the kind-specific section heading (e.g. picker collapsible bodies). */
  omitSectionTitle?: boolean
  /** Base id for section labelling; defaults to `equipment-detail-metadata`. */
  sectionId?: string
  /** Stat row density — picker collapsible bodies use `sm` (14px). */
  statRowSize?: ContentStatRowSize
}

/** Kind-specific metadata block for equipment detail surfaces and picker collapsible bodies. */
export function EquipmentDetailMetadata({
  viewModel,
  omitStatLabels = [],
  omitSectionTitle = false,
  sectionId = 'equipment-detail-metadata',
  statRowSize = 'default',
}: EquipmentDetailMetadataProps) {
  const omitted = new Set(omitStatLabels)
  const statRows = viewModel.statRows.filter((row) => !omitted.has(row.label))
  const headingId = `${sectionId}-heading`

  return (
    <section
      className="space-y-3"
      aria-labelledby={omitSectionTitle ? undefined : headingId}
      aria-label={omitSectionTitle ? viewModel.detailsSectionTitle : undefined}
    >
      {!omitSectionTitle ? (
        <Heading variant="subsection" as="h3" id={headingId}>
          {viewModel.detailsSectionTitle}
        </Heading>
      ) : null}

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

      {viewModel.description ? (
        <RichTextContent html={viewModel.description} size="md" tone="muted" />
      ) : null}
    </section>
  )
}
