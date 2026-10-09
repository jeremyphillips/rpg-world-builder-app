import { Link } from 'react-router-dom'
import { ActionIcon, Button } from '@rpg/ui'

import { ContentStatList } from '../../../lib/detail/metadata/content-stat-row'
import type { ContentStatRowData } from '../../../lib/detail/metadata/content-stat-rows'
import { LOCATION_PARENT_REPLACEMENT_ACTION_LABELS } from '../../lib/hierarchy/location-parent-replacement'
import type { LocationDetailIdentityViewModel } from '../../lib/location-display'

export type LocationDetailIdentityProps = {
  identity: LocationDetailIdentityViewModel
  onParentReplacementAction?: () => void
}

export function LocationDetailIdentity({
  identity,
  onParentReplacementAction,
}: LocationDetailIdentityProps) {
  const { rows, locatedIn, locatedInFallbackLabel, parentReplacementAction } = identity
  const showLocatedInRow = locatedIn.length > 0 || Boolean(locatedInFallbackLabel)
  const statRows: ContentStatRowData[] = [...rows]

  if (showLocatedInRow) {
    statRows.push({
      id: 'located-in',
      label: 'Located in',
      value: locatedInFallbackLabel ?? '',
      valueContent: (
        <>
          {locatedIn.length > 0
            ? locatedIn.map((segment, index) => (
                <span key={segment.id} className="inline-flex items-center">
                  {index > 0 ? (
                    <span aria-hidden="true" className="px-1">
                      /
                    </span>
                  ) : null}
                  {segment.href ? (
                    <Link to={segment.href} className="text-link hover:underline">
                      {segment.name}
                    </Link>
                  ) : (
                    <span>{segment.name}</span>
                  )}
                </span>
              ))
            : locatedInFallbackLabel}
          {parentReplacementAction && onParentReplacementAction ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              density="compact"
              aria-label={LOCATION_PARENT_REPLACEMENT_ACTION_LABELS[parentReplacementAction]}
              onClick={onParentReplacementAction}
            >
              <ActionIcon action="waypoints" step="md" />
            </Button>
          ) : null}
        </>
      ),
    })
  }

  return <ContentStatList rows={statRows} />
}
