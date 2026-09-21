import { Text } from '@rpg/ui'

export function ClassFeatureManagedSpellcastingGrantField() {
  return (
    <div className="space-y-2">
      <Text className="text-sm font-medium">Grants</Text>
      <Text variant="muted" className="text-sm">
        Spellcasting — Managed by class spellcasting.
      </Text>
    </div>
  )
}
