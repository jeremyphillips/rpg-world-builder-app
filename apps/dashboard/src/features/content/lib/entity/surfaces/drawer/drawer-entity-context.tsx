import type { ReactNode } from 'react'

import { type ContentDisplayFallback, type ContentDisplayImage } from '@rpg/contracts'
import { InlineMetadata } from '@rpg/ui'

import { EntityAnatomy } from '../../anatomy/entity-anatomy'
import { buildEntitySurfaceLeadingMediaNode } from '../entity-surface-projection.lib'

export type DrawerEntityContextProps = {
  heading: string
  metadata?: readonly string[]
  displayImage?: ContentDisplayImage
  fallback: ContentDisplayFallback
  trailing?: ReactNode
}

/** Subject identity for drawer header bands — compact anatomy, one metadata line, optional trailing control. */
export function DrawerEntityContext({
  heading,
  metadata,
  displayImage,
  fallback,
  trailing,
}: DrawerEntityContextProps) {
  const description =
    metadata && metadata.length > 0 ? (
      <InlineMetadata role="supporting" density="compact">
        {metadata.map((label) => (
          <InlineMetadata.Item key={label}>{label}</InlineMetadata.Item>
        ))}
      </InlineMetadata>
    ) : undefined

  const media = buildEntitySurfaceLeadingMediaNode(
    { heading, displayImage, fallback },
    'comfortable',
  )

  return (
    <EntityAnatomy
      density="compact"
      mediaPlacement="content"
      entity={{
        heading,
        media,
        ...(description ? { description } : {}),
      }}
      trailing={
        trailing
          ? {
              kind: 'utility',
              content: <div className="shrink-0">{trailing}</div>,
            }
          : undefined
      }
    />
  )
}
