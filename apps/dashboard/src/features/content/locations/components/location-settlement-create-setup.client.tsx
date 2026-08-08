'use client'

import { useId, useMemo, useState } from 'react'
import { CollapsibleRadioCardField, Button, Modal, dialogPanelActionRowClasses } from '@rpg/ui'
import type { SettlementType } from '@rpg/contracts'

import type {
  LocationCreateIntent,
  LocationCreateSetupResult,
} from '../lib/location-create-session'
import {
  buildSettlementTypeRadioOptions,
  isSettlementType,
  resolveSettlementCreateSetupDescription,
  SETTLEMENT_CREATE_SETUP_CHANGE_LABEL,
  SETTLEMENT_CREATE_SETUP_PROMPT,
  SETTLEMENT_CREATE_SETUP_SUMMARY_EYEBROW,
} from '../lib/location-settlement-create-setup.lib'

export type LocationSettlementCreateSetupProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  intent: LocationCreateIntent
  onComplete: (result: LocationCreateSetupResult) => void
}

/** Settlement-type setup before a fixed settlement create session opens. */
export function LocationSettlementCreateSetup({
  open,
  onOpenChange,
  intent,
  onComplete,
}: LocationSettlementCreateSetupProps) {
  const [settlementType, setSettlementType] = useState<SettlementType | ''>('')
  const fieldId = useId()
  const options = useMemo(() => buildSettlementTypeRadioOptions(), [])
  const description = resolveSettlementCreateSetupDescription(intent)

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="sm">
        <Modal.Header headline="New settlement" description={description} />
        <Modal.Body>
          <CollapsibleRadioCardField
            id={fieldId}
            label={SETTLEMENT_CREATE_SETUP_PROMPT}
            summaryEyebrow={SETTLEMENT_CREATE_SETUP_SUMMARY_EYEBROW}
            changeLabel={SETTLEMENT_CREATE_SETUP_CHANGE_LABEL}
            density="compact"
            value={settlementType}
            options={options}
            onValueChange={(value) => {
              if (isSettlementType(value)) {
                setSettlementType(value)
              }
            }}
          />
        </Modal.Body>
        <Modal.Footer>
          <div className={dialogPanelActionRowClasses}>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!settlementType}
              onClick={() => {
                if (!settlementType) return
                onComplete({ settlementType })
                onOpenChange(false)
              }}
            >
              Continue
            </Button>
          </div>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}
