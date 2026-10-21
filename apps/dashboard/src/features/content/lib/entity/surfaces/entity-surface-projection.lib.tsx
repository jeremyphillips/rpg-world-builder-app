import { CatalogPickerRowAction } from '@rpg/ui'

import { ContentMediaFallback, ContentMediaImage } from '@/features/media'

import type { EntityAnatomyTrailing } from '../anatomy/entity-anatomy-trailing.types'
import type {
  EntitySurfaceIdentity,
  EntitySurfaceInlineAction,
} from '../summary/entity-surface-identity.types'
import type { EntitySummaryModel } from '../summary/entity-summary.types'
import type { EntitySurfaceConfig } from './entity-surface.types'

export function buildEntitySurfaceLeadingMediaNode(identity: EntitySurfaceIdentity) {
  return buildEntitySurfaceMedia(identity)
}

function buildEntitySurfaceMedia(identity: EntitySurfaceIdentity) {
  if (identity.displayImage) {
    return (
      <ContentMediaImage
        display={identity.displayImage}
        alt={identity.heading}
        frame="anatomyFill"
      />
    )
  }

  return <ContentMediaFallback fallback={identity.fallback} frame="anatomyFill" />
}

export function projectEntitySurfaceIdentityToSummaryModel(
  identity: EntitySurfaceIdentity,
): EntitySummaryModel {
  const { heading, metadata, classification, status, selectionState } = identity

  const media =
    identity.displayImage || identity.fallback ? buildEntitySurfaceMedia(identity) : undefined

  return {
    heading,
    ...(media ? { media } : {}),
    ...(classification ? { classification } : {}),
    ...(metadata && metadata.length > 0 ? { supportingMetadata: metadata } : {}),
    ...(status && status.length > 0 ? { status } : {}),
    ...(selectionState ? { selectionState } : {}),
  }
}

export function buildEntitySurfaceInlineActionTrailing(
  action: EntitySurfaceInlineAction,
): EntityAnatomyTrailing {
  return {
    kind: 'action',
    content: (
      <CatalogPickerRowAction
        intent={action.intent ?? 'add'}
        actionLabel={action.label}
        pendingLabel={action.pendingLabel}
        pending={action.loading}
        disabled={action.disabled || action.loading}
        failed={action.failed}
        entityKey={action.entityKey}
        tooltip={action.tooltip}
        onClick={action.onClick}
      />
    ),
  }
}

export function projectEntitySurfaceConfig(config: EntitySurfaceConfig): {
  entity: EntitySummaryModel
  trailing: EntityAnatomyTrailing | undefined
  details: EntitySurfaceConfig['details']
} {
  return {
    entity: projectEntitySurfaceIdentityToSummaryModel(config.identity),
    trailing: config.inlineAction
      ? buildEntitySurfaceInlineActionTrailing(config.inlineAction)
      : undefined,
    details: config.details,
  }
}
