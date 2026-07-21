import {
  SPECIES_CLASS_POLICY_MODES,
  SPECIES_MULTICLASS_POLICIES,
  type SpeciesClassPolicyMode,
  type SpeciesMulticlassPolicy,
} from '@rpg/contracts'
import { toOptions } from '@rpg/ui/form'

import { getContentTypeMidSentenceLabel } from '@/features/content/lib/content-type-labels'

export const SPECIES_MULTICLASS_POLICY_LABELS = {
  inherit: 'Inherit campaign default',
  allowed: 'Allowed',
  forbidden: 'Forbidden',
  restricted: 'Restricted',
} as const satisfies Record<SpeciesMulticlassPolicy, string>

const speciesMidSentence = getContentTypeMidSentenceLabel('species')
const classesPlural = getContentTypeMidSentenceLabel('classes', { plural: true })

export const SPECIES_CLASS_POLICY_MODE_LABELS = {
  all: `All ${classesPlural}`,
  only: `Only listed ${classesPlural}`,
  all_except: `All except listed ${classesPlural}`,
} as const satisfies Record<SpeciesClassPolicyMode, string>

export const SPECIES_CLASS_POLICY_ALLOWED_CLASSES_LABEL = `Allowed ${classesPlural}`
export const SPECIES_CLASS_POLICY_FORBIDDEN_CLASSES_LABEL = `Forbidden ${classesPlural}`

export const SPECIES_CLASS_POLICY_ALLOWED_CLASSES_HINT = `Characters of this ${speciesMidSentence} may multiclass only into these classes.`
export const SPECIES_CLASS_POLICY_FORBIDDEN_CLASSES_HINT = `Characters of this ${speciesMidSentence} may multiclass into any class except these.`

export const speciesMulticlassPolicyOptions = toOptions(
  SPECIES_MULTICLASS_POLICIES,
  SPECIES_MULTICLASS_POLICY_LABELS,
)

export const speciesClassPolicyModeOptions = toOptions(
  SPECIES_CLASS_POLICY_MODES,
  SPECIES_CLASS_POLICY_MODE_LABELS,
)
