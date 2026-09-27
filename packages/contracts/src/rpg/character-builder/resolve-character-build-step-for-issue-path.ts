import type { CharacterBuilderStepId } from './step-ids'

const ISSUE_PATH_STEP_PREFIXES: ReadonlyArray<{
  prefix: string
  stepId: CharacterBuilderStepId
}> = [
  { prefix: 'spells', stepId: 'spells' },
  { prefix: 'media', stepId: 'identity' },
  { prefix: 'narrative', stepId: 'identity' },
  { prefix: 'name', stepId: 'identity' },
  { prefix: 'alignment', stepId: 'identity' },
  { prefix: 'gender', stepId: 'identity' },
  { prefix: 'equipment', stepId: 'equipment' },
  { prefix: 'wealth', stepId: 'equipment' },
  { prefix: 'proficiencies', stepId: 'proficiencies' },
  { prefix: 'abilityScores', stepId: 'abilities' },
  { prefix: 'classes', stepId: 'class' },
  { prefix: 'species', stepId: 'species' },
  { prefix: 'relationshipEdges', stepId: 'connections' },
]

/** Maps API validation paths to builder steps; unknown paths stay review-level only. */
export function resolveCharacterBuildStepForIssuePath(
  path: string,
): CharacterBuilderStepId | undefined {
  const normalized = path.trim()
  if (normalized.length === 0) return undefined

  for (const { prefix, stepId } of ISSUE_PATH_STEP_PREFIXES) {
    if (normalized === prefix || normalized.startsWith(`${prefix}.`)) {
      return stepId
    }
  }

  return undefined
}
