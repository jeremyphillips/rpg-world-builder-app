'use client'

import { Text } from '@rpg/ui'

export type CharacterEquipmentQuantityLabelProps = {
  quantity: number
}

/** Character inventory quantity — not a generic catalog affordance. */
export function CharacterEquipmentQuantityLabel({
  quantity,
}: CharacterEquipmentQuantityLabelProps) {
  if (quantity <= 1) return null

  return (
    <Text variant="muted" aria-label={`Quantity ${quantity}`}>
      ×{quantity}
    </Text>
  )
}
