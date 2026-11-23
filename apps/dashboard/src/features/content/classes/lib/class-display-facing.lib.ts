import type {
  CharacterClass,
  ClassFeature,
  FacingResolution,
  ResolvedSpellcastingProgressionConfig,
  Spell,
} from '@rpg/contracts'

import { resolveFacing } from '../../facing/resolve-facing'

export function resolveClassFeatureDetailFacing(
  feature: ClassFeature,
  options?: {
    characterClass?: CharacterClass
    spellcastingProgression?: ResolvedSpellcastingProgressionConfig
    spellsById?: ReadonlyMap<string, Spell>
  },
): FacingResolution {
  const characterClass = options?.characterClass
  return resolveFacing({
    domain: 'classFeature',
    source: 'persisted',
    feature,
    host: {
      className: characterClass?.name ?? '',
      rulesetId: characterClass?.rulesetId ?? 'srd-cc-5.2.1',
      spellcasting: characterClass?.spellcasting,
      spellcastingProgression: options?.spellcastingProgression,
      spellsById: options?.spellsById,
    },
  })
}

export function classFeatureDetailTitle(feature: ClassFeature, facing: FacingResolution): string {
  if (facing.status === 'ready' || facing.status === 'incomplete') {
    return facing.document?.title ?? feature.name
  }
  return feature.name
}
