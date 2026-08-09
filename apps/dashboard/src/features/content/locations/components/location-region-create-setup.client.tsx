'use client'

import { useId, useMemo, useState } from 'react'
import { CollapsibleRadioCardField, Button, Modal, dialogPanelActionRowClasses } from '@rpg/ui'
import type { RegionClassificationKind } from '@rpg/contracts'

import type {
  LocationCreateIntent,
  LocationCreateSetupResult,
} from '../lib/location-create-session'
import {
  buildRegionClassificationKindRadioOptions,
  buildRegionTypeRadioOptions,
  parseRegionClassification,
  resolveRegionCreateSetupChangeLabel,
  resolveRegionCreateSetupDescription,
  resolveRegionCreateSetupHeadline,
  resolveRegionCreateSetupPrompt,
} from '../lib/location-region-create-setup.lib'
import { locationCreateSetupModalBodyClasses } from './location-create-setup.variants'

export type LocationRegionCreateSetupProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  intent: LocationCreateIntent
  onComplete: (result: LocationCreateSetupResult) => void
}

/** Region classification + type setup before a fixed region create session opens. */
export function LocationRegionCreateSetup({
  open,
  onOpenChange,
  intent,
  onComplete,
}: LocationRegionCreateSetupProps) {
  const [classificationKind, setClassificationKind] = useState<RegionClassificationKind | ''>('')
  const [regionType, setRegionType] = useState('')
  const kindFieldId = useId()
  const typeFieldId = useId()
  const kindOptions = useMemo(() => buildRegionClassificationKindRadioOptions(), [])
  const typeOptions = useMemo(
    () => (classificationKind ? buildRegionTypeRadioOptions(classificationKind) : []),
    [classificationKind],
  )
  const prompt = resolveRegionCreateSetupPrompt(intent)
  const classification = parseRegionClassification(classificationKind, regionType)

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="sm">
        <Modal.Header
          headline={resolveRegionCreateSetupHeadline(intent)}
          description={resolveRegionCreateSetupDescription(intent)}
        />
        <Modal.Body className={locationCreateSetupModalBodyClasses}>
          <CollapsibleRadioCardField
            id={kindFieldId}
            label={prompt}
            summaryEyebrow={prompt}
            changeLabel={resolveRegionCreateSetupChangeLabel(intent)}
            density="compact"
            value={classificationKind}
            options={kindOptions}
            onValueChange={(value) => {
              setClassificationKind(value as RegionClassificationKind | '')
              setRegionType('')
            }}
          />
          {classificationKind ? (
            <CollapsibleRadioCardField
              id={typeFieldId}
              label="Region type"
              summaryEyebrow="Region type"
              changeLabel="Change region type"
              density="compact"
              value={regionType}
              options={typeOptions}
              onValueChange={setRegionType}
            />
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          <div className={dialogPanelActionRowClasses}>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!classification}
              onClick={() => {
                if (!classification) return
                onComplete({ kind: 'region', classification })
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
