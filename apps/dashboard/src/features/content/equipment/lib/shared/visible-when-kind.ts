import type { EquipmentKind } from '@rpg/contracts'
import type { FieldVisibility } from '@rpg/ui/form'

/** Shows fields only when the equipment form `kind` matches one of the given kinds. */
export function visibleWhenKind(...kinds: EquipmentKind[]): FieldVisibility {
  return {
    dependsOn: ['kind'],
    visibleWhen: (v) => kinds.includes(v.kind as EquipmentKind),
  }
}
