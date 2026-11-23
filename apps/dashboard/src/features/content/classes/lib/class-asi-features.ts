import {
  DEFAULT_ASI_FEATURE_DESCRIPTION,
  DEFAULT_ASI_FEATURE_NAME,
  type ClassFeature,
} from '@rpg/contracts'

/** Creates an ASI class feature (`kind: 'asi'`; grant choice is projected at read time). */
export function createAsiFeature(level: number): ClassFeature {
  return {
    kind: 'asi',
    id: `ability-score-improvement-${level}`,
    name: DEFAULT_ASI_FEATURE_NAME,
    level,
    description: DEFAULT_ASI_FEATURE_DESCRIPTION,
  }
}
