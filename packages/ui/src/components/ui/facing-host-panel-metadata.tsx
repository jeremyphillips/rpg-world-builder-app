import { MetadataList } from './metadata-list'
import type { FacingHostPanelModel } from './facing-host-panel-model'

export function FacingHostPanelMetadata({
  rows,
}: {
  rows: NonNullable<FacingHostPanelModel['metadataRows']>
}) {
  if (rows.length === 0) return null

  return (
    <MetadataList
      size="sm"
      columnGap="sm"
      valueTrack="fill"
      emphasis="value"
      divider={false}
      items={rows.map((row) => ({
        id: row.id,
        label: row.label,
        value: row.primary,
      }))}
    />
  )
}
