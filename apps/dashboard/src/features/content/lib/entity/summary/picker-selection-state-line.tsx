import { Check } from 'lucide-react'
import { InlineMetadata, type ContentCardDensity } from '@rpg/ui'

import type { PickerSelectionStateLineModel } from './picker-selection-state-line.types'
import {
  pickerSelectionStateIconVariants,
  pickerSelectionStateLineVariants,
  pickerSelectionStateWordVariants,
} from './picker-selection-state-line.variants'

export type PickerSelectionStateLineProps = {
  model: PickerSelectionStateLineModel
  density: ContentCardDensity
}

/** Persistent selection result. Not a badge, and not the trailing action. */
export function PickerSelectionStateLine({ model, density }: PickerSelectionStateLineProps) {
  const provenance = model.provenance ?? []

  return (
    <div className={pickerSelectionStateLineVariants({ density })} data-picker-selection-state>
      <InlineMetadata role="supporting" density={density} wrap>
        <InlineMetadata.Item>
          <span className={pickerSelectionStateWordVariants()}>
            <Check aria-hidden className={pickerSelectionStateIconVariants()} />
            {model.label}
          </span>
        </InlineMetadata.Item>
        {provenance.map((label) => (
          <InlineMetadata.Item key={label}>{label}</InlineMetadata.Item>
        ))}
      </InlineMetadata>
    </div>
  )
}
