'use client'

import { Heading, RichTextContent } from '@rpg/ui'

import { ContentStatRow } from '../../lib/detail/content-stat-row.client'
import { type EquipmentDetailViewModel } from '../lib/equipment-display'

export type EquipmentDetailMetadataProps = {
  viewModel: EquipmentDetailViewModel
  omitStatLabels?: readonly string[]
}

/** Kind-specific metadata block for equipment detail surfaces and picker collapsible bodies. */
export function EquipmentDetailMetadata({
  viewModel,
  omitStatLabels = [],
}: EquipmentDetailMetadataProps) {
  const omitted = new Set(omitStatLabels)
  const statRows = viewModel.statRows.filter((row) => !omitted.has(row.label))

  return (
    <section aria-labelledby="equipment-detail-metadata-heading" className="space-y-3">
      <Heading variant="subsection" as="h3" id="equipment-detail-metadata-heading">
        {viewModel.detailsSectionTitle}
      </Heading>

      {statRows.length > 0 ? (
        <div className="space-y-1">
          {statRows.map((row) => (
            <ContentStatRow
              key={row.label}
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
