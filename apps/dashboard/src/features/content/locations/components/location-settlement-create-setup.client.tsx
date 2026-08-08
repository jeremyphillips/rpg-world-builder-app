'use client'

import { useId, useState } from 'react'
import { SETTLEMENT_TYPE_ENTRIES, SETTLEMENT_TYPE_IDS, type SettlementType } from '@rpg/contracts'
import {
  Button,
  FieldLabelContent,
  Modal,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@rpg/ui'

import type { LocationCreateSetupResult } from '../lib/location-create-session'

export type LocationSettlementCreateSetupProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: (result: LocationCreateSetupResult) => void
}

/** Minimal settlement-type setup before a fixed settlement create session opens. */
export function LocationSettlementCreateSetup({
  open,
  onOpenChange,
  onComplete,
}: LocationSettlementCreateSetupProps) {
  const [settlementType, setSettlementType] = useState<SettlementType | ''>('')
  const fieldId = useId()

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="sm">
        <Modal.Header
          headline="New settlement"
          description="Choose the settlement size before authoring. You can place it under a parent on the next screen."
        />
        <Modal.Body className="space-y-2">
          <FieldLabelContent label="Settlement type" />
          <Select
            value={settlementType}
            onValueChange={(value) => setSettlementType(value as SettlementType)}
          >
            <SelectTrigger id={fieldId} aria-label="Settlement type">
              <SelectValue placeholder="Select settlement type…" />
            </SelectTrigger>
            <SelectContent>
              {SETTLEMENT_TYPE_IDS.map((id) => (
                <SelectItem key={id} value={id}>
                  {SETTLEMENT_TYPE_ENTRIES[id].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Modal.Body>
        <Modal.Footer>
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
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}
