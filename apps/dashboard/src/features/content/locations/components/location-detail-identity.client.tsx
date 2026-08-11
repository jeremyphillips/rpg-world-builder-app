'use client'

import { Link } from 'react-router-dom'
import { Button, Text } from '@rpg/ui'

import { ContentStatRow } from '../../lib/detail/metadata/content-stat-row.client'
import {
  contentStatRowLabelVariants,
  contentStatRowValueVariants,
  contentStatRowVariants,
} from '../../lib/detail/metadata/content-stat-row.variants'
import { LOCATION_PARENT_REPLACEMENT_ACTION_LABELS } from '../lib/location-parent-replacement'
import type { LocationDetailIdentityViewModel } from '../lib/location-display'

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

  return (
    <div className="space-y-3">
      {rows.map(({ label, value, info, infoAriaLabel }) => (
        <ContentStatRow
          key={label}
          label={label}
          value={value}
          info={info}
          infoAriaLabel={infoAriaLabel}
        />
      ))}

      {showLocatedInRow ? (
        <Text as="p" className={contentStatRowVariants()}>
          <Text as="span" className={contentStatRowLabelVariants()}>
            Located in
          </Text>
          :{' '}
          <Text as="span" className={contentStatRowValueVariants()}>
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
          </Text>
          {parentReplacementAction && onParentReplacementAction ? (
            <>
              {' '}
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto px-0 text-xs"
                onClick={onParentReplacementAction}
              >
                {LOCATION_PARENT_REPLACEMENT_ACTION_LABELS[parentReplacementAction]}
              </Button>
            </>
          ) : null}
        </Text>
      ) : null}
    </div>
  )
}
