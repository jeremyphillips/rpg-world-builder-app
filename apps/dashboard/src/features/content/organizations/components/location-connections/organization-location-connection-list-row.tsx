import { useNavigate } from 'react-router-dom'

import type { OrganizationLocationConnectionKind } from '@rpg/contracts'

import { ENTITY_UNAVAILABLE_LOCATION_HEADING } from '../../../lib/entity/summary/entity-unavailable-headings.lib'
import { EntityRowList } from '../../../lib/entity/row-list/entity-row-list'
import { detailOverflowActionsToRowMenuItems } from '../../../lib/entity/row-list/entity-row-list-menu-items'
import { buildLocationEntityContextPresentation } from '../../../locations/lib/location-display'
import type { OrganizationLocationConnectionPreviewItem } from '../../lib/organization-display'
import type { OrganizationLocationConnectionMutationContext } from '../../lib/location-connections/organization-location-connection-mutation-context'
import { buildOrganizationLocationConnectionOverflowActions } from './organization-location-connection-overflow-actions'

export type OrganizationLocationConnectionListRowProps = {
  item: OrganizationLocationConnectionPreviewItem
  canManage: boolean
  isMutationPending?: boolean
  mutationContext: OrganizationLocationConnectionMutationContext
  onChangeKindConnection?: (connection: {
    connectionId: string
    locationId: string
    kind: OrganizationLocationConnectionKind
  }) => void
  onChangeTargetConnection?: (connection: {
    connectionId: string
    locationId: string
    kind: OrganizationLocationConnectionKind
  }) => void
  onRemoveConnection?: (input: { connectionId: string; locationId: string }) => Promise<void>
}

export function OrganizationLocationConnectionListRow({
  item,
  canManage,
  isMutationPending = false,
  mutationContext,
  onChangeKindConnection,
  onChangeTargetConnection,
  onRemoveConnection,
}: OrganizationLocationConnectionListRowProps) {
  const navigate = useNavigate()
  const presentation = item.target
    ? buildLocationEntityContextPresentation(item.target)
    : { heading: ENTITY_UNAVAILABLE_LOCATION_HEADING }

  const actions = buildOrganizationLocationConnectionOverflowActions({
    item,
    canManage,
    isMutationPending,
    mutationContext,
    navigate,
    onChangeKindConnection,
    onChangeTargetConnection,
    onRemoveConnection,
  })

  return (
    <EntityRowList.Row
      heading={presentation.heading}
      headingHref={item.target?.href}
      classification={presentation.classification}
      description={presentation.supportingText}
      status={
        item.target == null ? [{ kind: 'badge', label: 'Unavailable', tone: 'warning' }] : undefined
      }
      menu={
        actions.length > 0
          ? {
              label: `Actions for ${presentation.heading}`,
              items: detailOverflowActionsToRowMenuItems(actions),
            }
          : undefined
      }
    />
  )
}
