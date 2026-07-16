'use client'

import { Badge } from '@rpg/ui'

export const catalogPickerItemMarkerRowClasses = 'flex flex-wrap gap-1.5'

export type CatalogPickerItemMarkersProps = {
  markers: readonly string[]
}

export function CatalogPickerItemMarkers({ markers }: CatalogPickerItemMarkersProps) {
  if (markers.length === 0) return null

  return (
    <div className={catalogPickerItemMarkerRowClasses}>
      {markers.map((marker) => (
        <Badge key={marker} appearance="outline" tone="neutral" size="sm">
          {marker}
        </Badge>
      ))}
    </div>
  )
}
