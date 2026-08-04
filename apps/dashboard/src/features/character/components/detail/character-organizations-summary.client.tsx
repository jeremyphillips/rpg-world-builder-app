'use client'

import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import type { OrganizationReferenceResolution } from '@rpg/contracts'
import { Text } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { UNAVAILABLE_ORGANIZATION_LABEL } from '../../lib/display/character-display'

export type CharacterOrganizationsSummaryProps = {
  campaignId: string
  organizationReferences: OrganizationReferenceResolution[]
}

/** Compact organization links shown below roster/vital on campaign character detail. */
export function CharacterOrganizationsSummary({
  campaignId,
  organizationReferences,
}: CharacterOrganizationsSummaryProps) {
  if (organizationReferences.length === 0) {
    return null
  }

  return (
    <Text as="span" variant="muted" className="text-sm">
      Organizations:{' '}
      {organizationReferences.map(({ organizationId, organization }, index) => {
        const label = organization?.name ?? UNAVAILABLE_ORGANIZATION_LABEL

        return (
          <Fragment key={organizationId}>
            {index > 0 ? ', ' : null}
            {organization ? (
              <Link
                to={ROUTES.content.organizations.detail(campaignId, organizationId)}
                className="underline-offset-4 hover:underline"
              >
                {label}
              </Link>
            ) : (
              label
            )}
          </Fragment>
        )
      })}
    </Text>
  )
}
