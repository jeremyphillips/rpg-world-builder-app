import {
  EntityAnatomyHost,
  type EntityAnatomyTrailing,
  type EntitySummaryStatusItem,
} from '@/features/content'

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
  status,
  trailing,
}: {
  projection: WeaponRequirementPreviewProjection | SpellRequirementPreviewProjection
  status?: readonly EntitySummaryStatusItem[]
  trailing?: EntityAnatomyTrailing
}) {
  return (
    <EntityAnatomyHost
      entity={{
        heading: projection.title,
        description: projection.description,
        status,
        statusComposition: 'metadata',
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
  trailing?: EntityAnatomyTrailing
}) {
  const projection = projectWeaponRequirementPreview(entry)
  return (
    <RequirementPreviewCard
      projection={projection}
      status={projection.status}
      trailing={trailing}
    />
  )
}

export function QuickNpcSpellRequirementPreview({
  entry,
  trailing,
}: {
  entry: QuickNpcSpellRequirementOption
  trailing?: EntityAnatomyTrailing
}) {
  const projection = projectSpellRequirementPreview(entry)
  return <RequirementPreviewCard projection={projection} trailing={trailing} />
}
