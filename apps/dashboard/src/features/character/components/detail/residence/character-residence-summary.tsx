import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'

import type { CharacterLocationReferenceResolution } from '@rpg/contracts'
import { Button, Text } from '@rpg/ui'

import { ROUTES } from '@/app/routes'

import { UNAVAILABLE_LOCATION_LABEL } from '../../../lib/display/character-display'
import { RESIDENCE_CONNECTION_KIND } from '../../../lib/connections/residence-location-connection.lib'

export type CharacterResidenceSummaryProps = {
  campaignId: string
  locationReferences: readonly CharacterLocationReferenceResolution[]
  canEdit?: boolean
  onAddResidence?: () => void
  onRemoveResidence?: (connectionId: string, locationId: string) => void
}

function CharacterResidenceSummaryRow({
  campaignId,
  reference,
  canEdit,
  onRemoveResidence,
}: {
  campaignId: string
  reference: CharacterLocationReferenceResolution
  canEdit: boolean
  onRemoveResidence?: (connectionId: string, locationId: string) => void
}) {
  const { connection, location } = reference
  const label = location?.name ?? UNAVAILABLE_LOCATION_LABEL

  return (
    <li className="flex flex-wrap items-center gap-1">
      <Text as="span" variant="muted" className="text-sm">
        {location ? (
          <Link
            to={ROUTES.content.locations.detail(campaignId, connection.locationId)}
            className="underline-offset-4 hover:underline"
          >
            {label}
          </Link>
        ) : (
          label
        )}
      </Text>
      {canEdit && onRemoveResidence ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Remove residence at ${label}`}
          onClick={() => onRemoveResidence(connection.id, connection.locationId)}
        >
          <Trash2 aria-hidden className="size-4" />
        </Button>
      ) : null}
    </li>
  )
}

/** Compact residence rows for campaign character / NPC detail headers. */
export function CharacterResidenceSummary({
  campaignId,
  locationReferences,
  canEdit = false,
  onAddResidence,
  onRemoveResidence,
}: CharacterResidenceSummaryProps) {
  const residences = locationReferences.filter(
    ({ connection }) => connection.kind === RESIDENCE_CONNECTION_KIND,
  )

  return (
    <div className="flex flex-col gap-1 pt-1">
      <Text as="span" variant="muted" className="text-sm">
        Residence
      </Text>
      {residences.length === 0 ? (
        <Text as="span" variant="muted" className="text-sm">
          None
        </Text>
      ) : (
        <ul className="flex flex-col gap-1">
          {residences.map((reference) => (
            <CharacterResidenceSummaryRow
              key={reference.connection.id}
              campaignId={campaignId}
              reference={reference}
              canEdit={canEdit}
              onRemoveResidence={onRemoveResidence}
            />
          ))}
        </ul>
      )}
      {canEdit && onAddResidence ? (
        <Button type="button" variant="text" size="sm" onClick={onAddResidence}>
          + Add residence
        </Button>
      ) : null}
    </div>
  )
}
