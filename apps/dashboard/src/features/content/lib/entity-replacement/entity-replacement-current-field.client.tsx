'use client'

import { ContentCardMedia, Heading, InsetPanel } from '@rpg/ui'

import { DrawerContextEntityBlock } from '../relationship/drawer-context-entity-block.client'
import type { DrawerContextEntityPresentation } from '../relationship/drawer-context.types'
import { getContentImageUrl } from '../detail/content-image-url'

export type EntityReplacementCurrentFieldProps = {
  label: string
  entity: DrawerContextEntityPresentation
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
          <DrawerContextEntityBlock {...entity} className="min-w-0 flex-1" />
        </div>
      </InsetPanel>
    </div>
  )
}
