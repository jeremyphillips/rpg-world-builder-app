import { ContentCardMedia, Heading, InsetPanel } from '@rpg/ui'

import { getContentImageUrl } from '../../../../detail/page/content-image-url'
import { DrawerEntityBlock } from '../drawer-entity-block'
import type { DrawerEntityPresentation } from '../drawer-entity.types'

export type EntityReplacementCurrentFieldProps = {
  label: string
  entity: DrawerEntityPresentation
  imageKey?: string
}

export function EntityReplacementCurrentField({
  label,
  entity,
  imageKey,
}: EntityReplacementCurrentFieldProps) {
  return (
    <div className="space-y-2">
      <Heading variant="label" as="p">
        {label}
      </Heading>
      <InsetPanel size="sm" className="p-0">
        <div className="flex items-start gap-3 p-3">
          {imageKey ? (
            <ContentCardMedia
              src={getContentImageUrl(imageKey)}
              alt={entity.heading}
              className="shrink-0"
            />
          ) : null}
          <DrawerEntityBlock {...entity} className="min-w-0 flex-1" />
        </div>
      </InsetPanel>
    </div>
  )
}
