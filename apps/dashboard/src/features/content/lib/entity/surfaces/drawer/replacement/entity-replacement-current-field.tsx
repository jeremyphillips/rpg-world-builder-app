import { ContentCardMedia, Heading, InsetPanel } from '@rpg/ui'

import { DrawerEntityBlock } from '../drawer-entity-block'
import type { DrawerEntityPresentation } from '../drawer-entity.types'
import type { EntityReplacementCurrentSnapshot } from './entity-replacement-current.types'

export type EntityReplacementCurrentFieldProps = {
  label: string
  entity: DrawerEntityPresentation
  displayImage?: EntityReplacementCurrentSnapshot['displayImage']
  fallback?: EntityReplacementCurrentSnapshot['fallback']
}

export function EntityReplacementCurrentField({
  label,
  entity,
  displayImage,
  fallback = 'generic',
}: EntityReplacementCurrentFieldProps) {
  return (
    <div className="space-y-2">
      <Heading variant="label" as="p">
        {label}
      </Heading>
      <InsetPanel size="sm" className="p-0">
        <div className="flex items-start gap-3 p-3">
          <ContentCardMedia
            src={displayImage?.src}
            fallback={fallback}
            alt={entity.heading}
            className="shrink-0"
          />
          <DrawerEntityBlock {...entity} className="min-w-0 flex-1" />
        </div>
      </InsetPanel>
    </div>
  )
}
