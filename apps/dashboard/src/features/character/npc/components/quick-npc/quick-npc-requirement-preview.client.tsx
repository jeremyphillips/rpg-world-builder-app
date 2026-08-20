'use client'

import { EntityItem, type EntityItemTrailing } from '@/features/content'

import { mapEquipmentCalloutToStatusItem } from '../../../components/equipment/equipment-picker-callout-presentation.lib'
import type { EquipmentPickerCallout } from '../../../components/equipment/equipment-picker-drawer.types'

import {
  projectSpellRequirementPreview,
  projectWeaponRequirementPreview,
  type SpellRequirementPreviewProjection,
  type WeaponRequirementPreviewProjection,
} from '../../lib/quick-npc/quick-npc-requirement-preview.lib'
import type {
  QuickNpcSpellRequirementOption,
  QuickNpcWeaponRequirementOption,
} from '../../lib/quick-npc/quick-npc-requirement-options.lib'

function RequirementPreviewCard({
  projection,
  callout,
  trailing,
}: {
  projection: WeaponRequirementPreviewProjection | SpellRequirementPreviewProjection
  callout?: EquipmentPickerCallout
  trailing?: EntityItemTrailing
}) {
  return (
    <EntityItem
      entity={{
        heading: projection.title,
        description: projection.description,
        status: callout ? [mapEquipmentCalloutToStatusItem(callout)] : undefined,
      }}
      trailing={trailing}
      density="compact"
    />
  )
}

export function QuickNpcWeaponRequirementPreview({
  entry,
  trailing,
}: {
  entry: QuickNpcWeaponRequirementOption
  trailing?: EntityItemTrailing
}) {
  const projection = projectWeaponRequirementPreview(entry)
  return (
    <RequirementPreviewCard
      projection={projection}
      callout={projection.callout}
      trailing={trailing}
    />
  )
}

export function QuickNpcSpellRequirementPreview({
  entry,
  trailing,
}: {
  entry: QuickNpcSpellRequirementOption
  trailing?: EntityItemTrailing
}) {
  const projection = projectSpellRequirementPreview(entry)
  return <RequirementPreviewCard projection={projection} trailing={trailing} />
}
