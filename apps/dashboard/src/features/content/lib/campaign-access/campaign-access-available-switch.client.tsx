'use client'

import { useId } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import type { ContentCampaignAccessPatch } from '@rpg/contracts'
import { SwitchField } from '@rpg/ui'

import {
  CAMPAIGN_ACCESS_AVAILABLE_HINT,
  CAMPAIGN_ACCESS_AVAILABLE_LABEL,
} from './campaign-access-labels'
import { useCampaignAccessFormContext } from './campaign-access-form-context.client'

/** Availability switch with preflight handled by the section shell. */
export function CampaignAccessAvailableSwitch() {
  const id = useId()
  const { pending, onAvailableChange } = useCampaignAccessFormContext()
  const { control } = useFormContext<ContentCampaignAccessPatch>()
  const available = useWatch({ control, name: 'available' })

  return (
    <SwitchField
      id={id}
      label={CAMPAIGN_ACCESS_AVAILABLE_LABEL}
      hint={CAMPAIGN_ACCESS_AVAILABLE_HINT}
      labelPosition="settings"
      width="full"
      checked={available ?? false}
      disabled={pending}
      onCheckedChange={(checked) => void onAvailableChange(checked)}
      size="sm"
    />
  )
}
