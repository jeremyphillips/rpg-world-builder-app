import { ComboboxField, SelectField } from '@rpg/ui'

import { useCampaignAccessParticipantRoster } from '@/features/content/lib/campaign-access/use-campaign-access-participant-roster'
import { buildCampaignAccessVisibilityOptions } from '@/features/content/lib/campaign-access/campaign-access-options.lib'
import {
  CAMPAIGN_ACCESS_PARTICIPANTS_HINT,
  CAMPAIGN_ACCESS_PARTICIPANTS_LABEL,
  CAMPAIGN_ACCESS_PARTICIPANTS_TOOLTIP,
  CAMPAIGN_ACCESS_PLAYER_ACCESS_HINT,
  CAMPAIGN_ACCESS_PLAYER_ACCESS_LABEL,
  CAMPAIGN_ACCESS_PLAYER_ACCESS_TOOLTIP,
} from '@/features/content/lib/campaign-access/campaign-access-labels'

import type { ConnectionDetailsFormState } from '../../../lib/relationship/connection-details-fields.lib'

export type ConnectionAudienceFieldsProps = {
  campaignId: string
  state: ConnectionDetailsFormState
  onStateChange: (next: ConnectionDetailsFormState) => void
}

export function ConnectionAudienceFields({
  campaignId,
  state,
  onStateChange,
}: ConnectionAudienceFieldsProps) {
  const participantRoster = useCampaignAccessParticipantRoster(campaignId)
  const participantOptions = (participantRoster.data ?? []).map((participant) => ({
    value: participant.id,
    label: participant.playerDisplayName,
  }))

  return (
    <>
      <SelectField
        id="connection-visibility"
        label={CAMPAIGN_ACCESS_PLAYER_ACCESS_LABEL}
        hint={CAMPAIGN_ACCESS_PLAYER_ACCESS_HINT}
        info={CAMPAIGN_ACCESS_PLAYER_ACCESS_TOOLTIP}
        value={state.visibility}
        onValueChange={(visibility) =>
          onStateChange({
            ...state,
            visibility: visibility as ConnectionDetailsFormState['visibility'],
            participantIds: visibility === 'specific_players' ? state.participantIds : [],
          })
        }
        options={buildCampaignAccessVisibilityOptions('organizations', {
          includeSpecificPlayers: true,
        })}
      />

      {state.visibility === 'specific_players' ? (
        <ComboboxField
          id="connection-participants"
          label={CAMPAIGN_ACCESS_PARTICIPANTS_LABEL}
          hint={CAMPAIGN_ACCESS_PARTICIPANTS_HINT}
          info={CAMPAIGN_ACCESS_PARTICIPANTS_TOOLTIP}
          multiple
          required
          options={participantOptions}
          value={state.participantIds}
          onChange={(participantIds) =>
            onStateChange({
              ...state,
              participantIds: Array.isArray(participantIds)
                ? participantIds
                : participantIds
                  ? [participantIds]
                  : [],
            })
          }
        />
      ) : null}
    </>
  )
}
