import { ContentCardMedia, contentCardMediaVariants, type ContentCardDensity } from '@rpg/ui'
import { CatalogPickerActionButton } from '@rpg/ui'

import type { EntityAnatomyTrailing } from '../anatomy/entity-anatomy-trailing.types'
import type {
  EntitySurfaceIdentity,
  EntitySurfaceInlineAction,
} from '../summary/entity-surface-identity.types'
import type { EntitySummaryModel } from '../summary/entity-summary.types'
import type { EntitySurfaceConfig } from './entity-surface.types'

function buildEntitySurfaceMedia(identity: EntitySurfaceIdentity, density: ContentCardDensity) {
  return (
    <ContentCardMedia
      src={identity.displayImage?.src}
      fallback={identity.fallback}
      alt={identity.heading}
      density={density}
      className={contentCardMediaVariants({ density })}
    />
  )
}

export function projectEntitySurfaceIdentityToSummaryModel(
  identity: EntitySurfaceIdentity,
  density: ContentCardDensity = 'compact',
): EntitySummaryModel {
  const { heading, metadata, classification, status } = identity

  return {
    heading,
    media: buildEntitySurfaceMedia(identity, density),
    ...(classification ? { classification } : {}),
    ...(metadata ? { description: metadata } : {}),
    ...(status && status.length > 0 ? { status } : {}),
  }
}

export function buildEntitySurfaceInlineActionTrailing(
  action: EntitySurfaceInlineAction,
): EntityAnatomyTrailing {
  const disabled = action.disabled || action.loading

  return {
    kind: 'action',
    content: (
      <CatalogPickerActionButton disabled={disabled} onClick={action.onClick}>
        {action.loading ? `${action.label}…` : action.label}
      </CatalogPickerActionButton>
    ),
  }
}

export function buildCatalogToggleSelectInlineAction(input: {
  isSelected: boolean
  onSelect: () => void
  onDeselect: () => void
  canSelect?: boolean
  selectLabel?: string
}): EntitySurfaceInlineAction {
  return {
    label: input.isSelected ? 'Remove' : (input.selectLabel ?? 'Select'),
    onClick: input.isSelected ? input.onDeselect : input.onSelect,
    disabled: !input.isSelected && input.canSelect === false,
  }
}

export function projectEntitySurfaceConfig(
  config: EntitySurfaceConfig,
  density: ContentCardDensity = 'compact',
): {
  entity: EntitySummaryModel
  trailing: EntityAnatomyTrailing | undefined
  details: EntitySurfaceConfig['details']
} {
  return {
    entity: projectEntitySurfaceIdentityToSummaryModel(config.identity, density),
    trailing: config.inlineAction
      ? buildEntitySurfaceInlineActionTrailing(config.inlineAction)
      : undefined,
    details: config.details,
  }
}
