import {
  REGION_CLASSIFICATION_DEFINITIONS,
  REGION_CLASSIFICATION_KIND_IDS,
  getRegionTypeEntry,
  getRegionTypeIds,
  getRegionTypeLabelForKind,
  isRegionClassificationKind,
  type RegionClassification,
  type RegionClassificationKind,
} from '@rpg/contracts'
import type { RadioCardOption } from '@rpg/ui'

import { resolveRegionRelationshipLabel } from './location-contextual-terminology.lib'
import type { LocationCreateIntent } from './location-create-session'

export const REGION_CREATE_SETUP_CLASSIFICATION_FIELD_LABEL = 'Classification' as const

export const REGION_CREATE_SETUP_TYPE_FIELD_LABEL = 'Region type' as const

export const REGION_CREATE_SETUP_TYPE_PROMPT = 'Region type' as const

export function resolveRegionCreateSetupHeadline(intent: LocationCreateIntent): string {
  const noun = resolveRegionRelationshipLabel(intent.parentKind).toLowerCase()
  return `Create ${noun}`
}

export function resolveRegionCreateSetupPrompt(intent: LocationCreateIntent): string {
  const noun = resolveRegionRelationshipLabel(intent.parentKind).toLowerCase()
  return `What kind of ${noun} are you creating?`
}

export function resolveRegionCreateSetupDescription(intent: LocationCreateIntent): string {
  const noun = resolveRegionRelationshipLabel(intent.parentKind).toLowerCase()
  if (intent.parentLocationId != null) {
    return `Choose the ${noun} classification before authoring.`
  }

  return `Choose the ${noun} classification before authoring. You can place it under a parent on the next screen.`
}

export function buildRegionClassificationKindRadioOptions(): RadioCardOption[] {
  return REGION_CLASSIFICATION_KIND_IDS.map((kind) => ({
    value: kind,
    label: REGION_CLASSIFICATION_DEFINITIONS[kind].label,
    description: REGION_CLASSIFICATION_DEFINITIONS[kind].description,
  }))
}

export function buildRegionTypeRadioOptions(kind: RegionClassificationKind): RadioCardOption[] {
  return getRegionTypeIds(kind).map((typeId) => {
    const entry = getRegionTypeEntry(kind, typeId)
    return {
      value: typeId,
      label: getRegionTypeLabelForKind(kind, typeId),
      description: entry?.description,
    }
  })
}

export function isRegionClassification(
  kind: string,
  type: string,
): kind is RegionClassification['kind'] {
  if (!isRegionClassificationKind(kind)) return false
  return (getRegionTypeIds(kind) as readonly string[]).includes(type)
}

export function parseRegionClassification(
  kind: string,
  type: string,
): RegionClassification | undefined {
  if (!isRegionClassification(kind, type)) return undefined
  return { kind, type } as RegionClassification
}
