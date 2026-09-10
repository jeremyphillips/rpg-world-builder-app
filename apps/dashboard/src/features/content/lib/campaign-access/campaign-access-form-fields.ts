import { createElement } from 'react'
import type { ContentAccessTargetType, ContentCampaignAccessPatch } from '@rpg/contracts'
import { defineDependentField } from '@rpg/ui/form'
import type { FieldConfig, FormDensity, FormItem, GroupConfig, GroupFieldItem } from '@rpg/ui/form'

import {
  buildCampaignAvailabilityFields,
  type CampaignAvailabilityPresentation,
} from '@/lib/campaign-availability/campaign-availability-form-fields'

import { CampaignAccessAvailableSwitch } from './campaign-access-available-switch'
import {
  campaignAccessVisibilityOptionAvailability,
  resolveCampaignAccessPlayerAccessHint,
} from './campaign-access-form-visibility'
import {
  CAMPAIGN_ACCESS_AVAILABLE_HINT,
  CAMPAIGN_ACCESS_AVAILABLE_LABEL,
  CAMPAIGN_ACCESS_AVAILABLE_TOOLTIP,
  CAMPAIGN_ACCESS_PARTICIPANTS_HINT,
  CAMPAIGN_ACCESS_PARTICIPANTS_LABEL,
  CAMPAIGN_ACCESS_PARTICIPANTS_TOOLTIP,
  CAMPAIGN_ACCESS_PLAYER_ACCESS_LABEL,
  CAMPAIGN_ACCESS_PLAYER_ACCESS_TOOLTIP,
  CAMPAIGN_ACCESS_UNAVAILABLE_HINT,
} from './campaign-access-labels'
import { buildCampaignAccessVisibilityOptions } from './campaign-access-options.lib'
import { toCampaignAccessPatch } from './campaign-access-state'
import { resolveCampaignAccessSummary } from './campaign-access-summary'

export type CampaignAccessFormCtx = {
  targetType: ContentAccessTargetType
  available: boolean
  pending: boolean
  /** Stable group id — include entity id so disclosure state resets per record. */
  groupId: string
  participantOptions?: ReadonlyArray<{ value: string; label: string }>
  groupDensity?: FormDensity
  presentation?: CampaignAvailabilityPresentation
}

function buildParticipantField(ctx: CampaignAccessFormCtx): FieldConfig {
  return {
    type: 'combobox',
    name: 'participantIds',
    label: CAMPAIGN_ACCESS_PARTICIPANTS_LABEL,
    hint: CAMPAIGN_ACCESS_PARTICIPANTS_HINT,
    info: CAMPAIGN_ACCESS_PARTICIPANTS_TOOLTIP,
    multiple: true,
    options: [...(ctx.participantOptions ?? [])],
    placeholder: 'Choose players…',
    required: true,
    disabled: !ctx.available || ctx.pending,
  }
}

/** Player access controller with Selected players as an inset, railed dependent. */
function buildPlayerAccessField(ctx: CampaignAccessFormCtx): GroupFieldItem {
  const playerAccess: FieldConfig = {
    type: 'select',
    name: 'visibilityMode',
    label: CAMPAIGN_ACCESS_PLAYER_ACCESS_LABEL,
    labelPosition: 'settings',
    hint: resolveCampaignAccessPlayerAccessHint(ctx),
    info: CAMPAIGN_ACCESS_PLAYER_ACCESS_TOOLTIP,
    width: 'full',
    disabled: !ctx.available || ctx.pending,
    options: buildCampaignAccessVisibilityOptions(ctx.targetType, {
      includeSpecificPlayers: true,
    }),
    optionAvailability: campaignAccessVisibilityOptionAvailability(),
  }

  if (!ctx.participantOptions) {
    return playerAccess
  }

  return defineDependentField({
    kind: 'dependent',
    controller: playerAccess,
    dependents: {
      visibility: {
        dependsOn: ['available', 'visibilityMode'],
        visibleWhen: (values) =>
          Boolean(values.available) && values.visibilityMode === 'specific_players',
      },
      fields: [buildParticipantField(ctx)],
    },
  })
}

export function buildCampaignAccessFields(ctx: CampaignAccessFormCtx): FormItem[] {
  const availableHint = ctx.available
    ? CAMPAIGN_ACCESS_AVAILABLE_HINT
    : CAMPAIGN_ACCESS_UNAVAILABLE_HINT

  const availabilityGroup = buildCampaignAvailabilityFields({
    groupId: ctx.groupId,
    pending: ctx.pending,
    groupDensity: ctx.groupDensity,
    presentation: ctx.presentation,
    summaryDependsOn: ['available', 'visibilityMode', 'participantIds'],
    resolveSummary: (values) =>
      resolveCampaignAccessSummary(
        toCampaignAccessPatch({
          available: values.available as boolean,
          visibilityMode: values.visibilityMode as ContentCampaignAccessPatch['visibilityMode'],
          participantIds: (values.participantIds as string[] | undefined) ?? [],
        }),
      ),
    availabilityField: {
      kind: 'slot',
      name: 'available',
      separator: 'faint',
      render: () =>
        createElement(CampaignAccessAvailableSwitch, {
          label: CAMPAIGN_ACCESS_AVAILABLE_LABEL,
          hint: availableHint,
          info: CAMPAIGN_ACCESS_AVAILABLE_TOOLTIP,
        }),
    },
  })[0] as GroupConfig

  return [
    {
      ...availabilityGroup,
      fields: [...(availabilityGroup.fields ?? []), buildPlayerAccessField(ctx)],
    },
  ]
}
