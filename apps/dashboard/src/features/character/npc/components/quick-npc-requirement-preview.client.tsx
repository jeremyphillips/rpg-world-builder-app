'use client'

import { Check, TriangleAlert } from 'lucide-react'

import { Badge } from '@rpg/ui'

import { EntityItem, type EntityItemTrailing } from '@/features/content'

import { getEquipmentCalloutPresentation } from '../../components/equipment/equipment-picker-callout-presentation.lib'
import type { EquipmentPickerCallout } from '../../components/equipment/equipment-picker-drawer.types'

import {
  projectSpellRequirementPreview,
  projectWeaponRequirementPreview,
  type SpellRequirementPreviewProjection,
  type WeaponRequirementPreviewProjection,
} from '../lib/quick-npc-requirement-preview.lib'
import type {
  QuickNpcSpellRequirementOption,
  QuickNpcWeaponRequirementOption,
} from '../lib/quick-npc-requirement-options.lib'

function RequirementCalloutBadge({ callout }: { callout: EquipmentPickerCallout }) {
  const presentation = getEquipmentCalloutPresentation(callout)
  const leadingIcon =
    presentation.leadingIcon === 'check' ? (
      <Check aria-hidden />
    ) : presentation.leadingIcon === 'warning' ? (
      <TriangleAlert aria-hidden />
    ) : undefined

  return (
    <Badge
      appearance={presentation.appearance}
      tone={presentation.tone}
      size={presentation.size}
      leadingIcon={leadingIcon}
    >
      {callout.label}
    </Badge>
  )
}

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
        status: callout ? [<RequirementCalloutBadge callout={callout} />] : undefined,
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
