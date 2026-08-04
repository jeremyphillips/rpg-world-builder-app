'use client'

import { Link } from 'react-router-dom'
import { Text } from '@rpg/ui'

import { ContentStatRow } from '../../lib/detail/content-stat-row.client'
import {
  contentStatRowLabelVariants,
  contentStatRowValueVariants,
  contentStatRowVariants,
} from '../../lib/detail/content-stat-row.variants'
import type { LocationDetailIdentityViewModel } from '../lib/location-display'

export type LocationDetailIdentityProps = {
  identity: LocationDetailIdentityViewModel
}

export function LocationDetailIdentity({ identity }: LocationDetailIdentityProps) {
  const { rows, locatedIn } = identity

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

      {locatedIn.length > 0 ? (
        <Text as="p" className={contentStatRowVariants()}>
          <Text as="span" className={contentStatRowLabelVariants()}>
            Located in
          </Text>
          :{' '}
          <Text as="span" className={contentStatRowValueVariants()}>
            {locatedIn.map((segment, index) => (
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
            ))}
          </Text>
        </Text>
      ) : null}
    </div>
  )
}
