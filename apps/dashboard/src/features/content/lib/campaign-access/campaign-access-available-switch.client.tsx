'use client'

import { useId } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import type { ContentCampaignAccessPatch } from '@rpg/contracts'
import { SwitchField } from '@rpg/ui'

import { useCampaignAccessFormContext } from './campaign-access-form-context.client'

export type CampaignAccessAvailableSwitchProps = {
  label: string
  hint?: string
  info?: string
}

/** Availability switch with preflight handled by the section shell. */
export function CampaignAccessAvailableSwitch({
  label,
  hint,
  info,
}: CampaignAccessAvailableSwitchProps) {
  const id = useId()
  const { pending, onAvailableChange } = useCampaignAccessFormContext()
  const { control } = useFormContext<ContentCampaignAccessPatch>()
  const available = useWatch({ control, name: 'available' })

  return (
    <SwitchField
      id={id}
      label={label}
      hint={hint}
      info={info}
      labelPosition="settings"
      width="full"
      checked={available ?? false}
      disabled={pending}
      onCheckedChange={(checked) => void onAvailableChange(checked)}
      size="sm"
    />
  )
}
