'use client'

import { useId } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import type { ContentCampaignAccessPatch } from '@rpg/contracts'
import { SwitchField } from '@rpg/ui'
import { useFieldControlSize } from '@rpg/ui/form'

import { useCampaignAccessAvailabilityContext } from './campaign-access-form-context.client'

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
  const controlSize = useFieldControlSize()
  const { pending, onAvailableChange } = useCampaignAccessAvailabilityContext()
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
      size={controlSize}
    />
  )
}
