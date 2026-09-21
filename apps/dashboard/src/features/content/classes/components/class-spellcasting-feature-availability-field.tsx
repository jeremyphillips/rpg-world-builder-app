import { useCallback, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { ConfirmDialog, Switch, Text } from '@rpg/ui'

import {
  CAMPAIGN_ACCESS_AVAILABLE_HINT,
  CAMPAIGN_ACCESS_AVAILABLE_LABEL,
  CAMPAIGN_ACCESS_AVAILABLE_TOOLTIP,
} from '../../lib/campaign-access/campaign-access-labels'

type ClassSpellcastingFeatureAvailabilityFieldProps = {
  namePrefix: string
}

export function ClassSpellcastingFeatureAvailabilityField({
  namePrefix,
}: ClassSpellcastingFeatureAvailabilityFieldProps) {
  const { control, setValue } = useFormContext()
  const fieldName = `${namePrefix}.available`
  const available = useWatch({ control, name: fieldName }) !== false
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleCheckedChange = useCallback(
    (checked: boolean) => {
      if (available && !checked) {
        setConfirmOpen(true)
        return
      }
      setValue(fieldName, checked, { shouldDirty: true })
    },
    [available, fieldName, setValue],
  )

  return (
    <>
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <Text as="span" className="text-sm font-medium">
              {CAMPAIGN_ACCESS_AVAILABLE_LABEL}
            </Text>
            <Text variant="muted" className="text-sm">
              {CAMPAIGN_ACCESS_AVAILABLE_HINT}
            </Text>
          </div>
          <Switch
            checked={available}
            onCheckedChange={handleCheckedChange}
            aria-label={CAMPAIGN_ACCESS_AVAILABLE_LABEL}
            title={CAMPAIGN_ACCESS_AVAILABLE_TOOLTIP}
          />
        </div>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        headline="Make Spellcasting unavailable?"
        description="This class will not gain its Spellcasting feature in this campaign. Its spellcasting configuration will remain on the class and can become available again if the feature is restored."
        confirmLabel="Make unavailable"
        confirmVariant="destructive"
        onConfirm={() => {
          setValue(fieldName, false, { shouldDirty: true })
          setConfirmOpen(false)
        }}
      />
    </>
  )
}
