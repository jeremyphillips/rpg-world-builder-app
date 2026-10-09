import { Heading } from '@rpg/ui'

import { EQUIPMENT_PICKER_CHARACTER_PREVIEW_SECTION_LABEL } from './equipment-picker-character-preview.lib'

export type EquipmentPickerCharacterPreviewSectionProps = {
  equipmentId: string
  previewLines: string[]
}

export function EquipmentPickerCharacterPreviewSection({
  equipmentId,
  previewLines,
}: EquipmentPickerCharacterPreviewSectionProps) {
  if (previewLines.length === 0) return null

  return (
    <section aria-labelledby={`${equipmentId}-character-preview-heading`} className="space-y-3">
      <Heading variant="subsection" as="h3" id={`${equipmentId}-character-preview-heading`}>
        {EQUIPMENT_PICKER_CHARACTER_PREVIEW_SECTION_LABEL}
      </Heading>
      <ul className="space-y-1" role="list">
        {previewLines.map((line) => (
          <li key={line}>
            <span className="text-sm text-muted-foreground">{line}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
