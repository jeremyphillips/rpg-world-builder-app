'use client'

import { Check, TriangleAlert } from 'lucide-react'

import { Badge } from '@rpg/ui'

import { EntityItem } from '@/features/content'

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
  endSlot,
}: {
  projection: WeaponRequirementPreviewProjection | SpellRequirementPreviewProjection
  callout?: EquipmentPickerCallout
  endSlot?: React.ReactNode
}) {
  return (
    <EntityItem
      entity={{
        heading: projection.title,
        description: projection.description,
        status: callout ? [<RequirementCalloutBadge callout={callout} />] : undefined,
      }}
      trailing={endSlot ? { kind: 'action', content: endSlot } : undefined}
      density="compact"
    />
  )
}

export function QuickNpcWeaponRequirementPreview({
  entry,
  endSlot,
}: {
  entry: QuickNpcWeaponRequirementOption
  endSlot?: React.ReactNode
}) {
  const projection = projectWeaponRequirementPreview(entry)
  return (
    <RequirementPreviewCard
      projection={projection}
      callout={projection.callout}
      endSlot={endSlot}
    />
  )
}

export function QuickNpcSpellRequirementPreview({
  entry,
  endSlot,
}: {
  entry: QuickNpcSpellRequirementOption
  endSlot?: React.ReactNode
}) {
  const projection = projectSpellRequirementPreview(entry)
  return <RequirementPreviewCard projection={projection} endSlot={endSlot} />
}
