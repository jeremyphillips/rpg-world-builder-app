import {
  SPECIES_CLASS_POLICY_MODES,
  SPECIES_MULTICLASS_POLICIES,
  type SpeciesClassPolicyMode,
  type SpeciesMulticlassPolicy,
} from '@rpg/contracts'
import { toOptions } from '@rpg/ui/form'

export const SPECIES_MULTICLASS_POLICY_LABELS = {
  inherit: 'Inherit campaign default',
  allowed: 'Allowed',
  forbidden: 'Forbidden',
  restricted: 'Restricted',
} as const satisfies Record<SpeciesMulticlassPolicy, string>

export const SPECIES_CLASS_POLICY_MODE_LABELS = {
  all: 'All classes',
  only: 'Only listed classes',
  all_except: 'All except listed classes',
} as const satisfies Record<SpeciesClassPolicyMode, string>

export const speciesMulticlassPolicyOptions = toOptions(
  SPECIES_MULTICLASS_POLICIES,
  SPECIES_MULTICLASS_POLICY_LABELS,
)

export const speciesClassPolicyModeOptions = toOptions(
  SPECIES_CLASS_POLICY_MODES,
  SPECIES_CLASS_POLICY_MODE_LABELS,
)
