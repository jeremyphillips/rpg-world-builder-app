import type {
  ContentAccessTargetType,
  ContentCampaignAccessPatch,
  ResolvedContentCampaignAccess,
} from '@rpg/contracts'
import { defineDependentField } from '@rpg/ui/form'
import type { FieldConfig, FormItem, GroupConfig, GroupFieldItem } from '@rpg/ui/form'

import {
  buildCampaignAvailabilityFields,
  type CampaignAvailabilityPresentation,
} from '@/lib/campaign-availability/campaign-availability-form-fields'

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
} from './campaign-access-labels'
import { buildCampaignAccessVisibilityOptions } from './campaign-access-options.lib'
import { parentNarrowedVisibilityOptionAvailability } from './campaign-access-parent-narrowing.lib'
import { toCampaignAccessPatch } from './campaign-access-state'
import { resolveCampaignAccessSummary } from './campaign-access-summary'

export type BodyCampaignAccessFormCtx = {
  targetType: ContentAccessTargetType
  groupId: string
  parentAccess: ResolvedContentCampaignAccess
  participantOptions?: ReadonlyArray<{ value: string; label: string }>
  presentation?: CampaignAvailabilityPresentation
  inheritedRestrictionHint?: string
}

function filterParticipantOptions(
  options: ReadonlyArray<{ value: string; label: string }> | undefined,
  parentAccess: ResolvedContentCampaignAccess,
) {
  if (!options) return undefined
  if (parentAccess.visibilityMode !== 'specific_players') return [...options]
  const allowed = new Set(parentAccess.participantIds)
  return options.filter((option) => allowed.has(option.value))
}

function buildBodyParticipantField(
  participantOptions: ReadonlyArray<{ value: string; label: string }> | undefined,
): FieldConfig {
  return {
    type: 'combobox',
    name: 'participantIds',
    label: CAMPAIGN_ACCESS_PARTICIPANTS_LABEL,
    hint: CAMPAIGN_ACCESS_PARTICIPANTS_HINT,
    info: CAMPAIGN_ACCESS_PARTICIPANTS_TOOLTIP,
    multiple: true,
    options: [...(participantOptions ?? [])],
    required: true,
  }
}

function buildBodyPlayerAccessField(
  ctx: BodyCampaignAccessFormCtx,
  participantOptions: ReadonlyArray<{ value: string; label: string }> | undefined,
): GroupFieldItem {
  const baseAvailability = campaignAccessVisibilityOptionAvailability()
  const parentAvailability = parentNarrowedVisibilityOptionAvailability(ctx.parentAccess)

  const playerAccess: FieldConfig = {
    type: 'select',
    name: 'visibilityMode',
    label: CAMPAIGN_ACCESS_PLAYER_ACCESS_LABEL,
    labelPosition: 'settings',
    hint: resolveCampaignAccessPlayerAccessHint({ available: true }),
    info: CAMPAIGN_ACCESS_PLAYER_ACCESS_TOOLTIP,
    width: 'full',
    options: buildCampaignAccessVisibilityOptions(ctx.targetType, {
      includeSpecificPlayers: true,
    }),
    optionAvailability: {
      dependsOn: ['available', 'visibilityMode'],
      enabledWhen: (values, optionValue) => {
        const baseEnabled = baseAvailability.enabledWhen?.(values, optionValue) ?? true
        const parentEnabled = parentAvailability.enabledWhen?.(values, optionValue) ?? true
        return baseEnabled && parentEnabled
      },
    },
  }

  if (!participantOptions) return playerAccess

  return defineDependentField({
    kind: 'dependent',
    controller: playerAccess,
    dependents: {
      chrome: 'rail',
      visibility: {
        dependsOn: ['available', 'visibilityMode'],
        visibleWhen: (values) =>
          Boolean(values.available) && values.visibilityMode === 'specific_players',
      },
      fields: [buildBodyParticipantField(participantOptions)],
    },
  })
}

/** Body-bound campaign access dialog fields — no overlay PATCH or save session. */
export function buildBodyCampaignAccessFormFields(ctx: BodyCampaignAccessFormCtx): FormItem[] {
  const participantOptions = filterParticipantOptions(ctx.participantOptions, ctx.parentAccess)
  const presentation = ctx.presentation ?? 'dialog'

  const availabilityGroup = buildCampaignAvailabilityFields({
    groupId: ctx.groupId,
    pending: false,
    presentation,
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
      type: 'switch',
      name: 'available',
      label: CAMPAIGN_ACCESS_AVAILABLE_LABEL,
      hint: CAMPAIGN_ACCESS_AVAILABLE_HINT,
      info: CAMPAIGN_ACCESS_AVAILABLE_TOOLTIP,
      labelPosition: 'settings',
      width: 'full',
    },
  })[0] as GroupConfig

  const group: GroupConfig = {
    ...availabilityGroup,
    ...(ctx.inheritedRestrictionHint ? { description: ctx.inheritedRestrictionHint } : {}),
    fields: [
      ...(availabilityGroup.fields ?? []),
      buildBodyPlayerAccessField(ctx, participantOptions),
    ],
  }

  return [group]
}
