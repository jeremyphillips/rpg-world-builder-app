import type { CreatureSize } from '../../vocab/creature-size'
import type { CreatureFormOverrides, CreatureFormsDraft } from '../../content/creature/forms'
import type { MovementSpeeds } from '../../vocab/movement-mode'

export type CreatureFormStatisticsSource = {
  overrides?: CreatureFormOverrides
}

export type ResolvedCreatureFormStatistics = {
  sizes: readonly CreatureSize[]
  movement: { speeds: MovementSpeeds; hover: boolean }
  canSpeak: boolean
}

export type ResolvedCreatureFormIdentity = {
  id: string
  kind: 'profile' | 'defined'
  name: string
  form?: CreatureFormsDraft['definedForms'][number]
  usesBaseStatistics: boolean
}

export type CreatureFormsContext =
  | {
      status: 'complete'
      profile: ResolvedCreatureFormIdentity
      trueForm: ResolvedCreatureFormIdentity
      eligibleForms: readonly ResolvedCreatureFormIdentity[]
      alternateDestinations: readonly ResolvedCreatureFormIdentity[]
      definedForms: readonly ResolvedCreatureFormIdentity[]
    }
  | {
      status: 'incomplete' | 'missing'
      profile: ResolvedCreatureFormIdentity
      trueForm: undefined
      eligibleForms: readonly ResolvedCreatureFormIdentity[]
      alternateDestinations: readonly []
      definedForms: readonly ResolvedCreatureFormIdentity[]
    }
  | {
      status: 'invalid'
      profile: undefined
      trueForm: undefined
      eligibleForms: readonly []
      alternateDestinations: readonly []
      definedForms: readonly []
    }

/** Resolves profile identity, designation, destinations, and statistics ownership once. */
export function resolveCreatureFormsContext(
  forms: CreatureFormsDraft,
  creatureName: string,
): CreatureFormsContext {
  const candidate = forms as Partial<CreatureFormsDraft>
  if (
    typeof candidate.profileFormId !== 'string' ||
    !candidate.profileFormId ||
    !candidate.trueForm ||
    !Array.isArray(candidate.definedForms)
  ) {
    return {
      status: 'invalid',
      profile: undefined,
      trueForm: undefined,
      eligibleForms: [],
      alternateDestinations: [],
      definedForms: [],
    }
  }
  const designation = candidate.trueForm
  const sourceForms = candidate.definedForms
  const profile: ResolvedCreatureFormIdentity = {
    id: candidate.profileFormId,
    kind: 'profile',
    name:
      designation.kind === 'profile' && designation.name?.trim()
        ? designation.name.trim()
        : creatureName.trim(),
    usesBaseStatistics: true,
  }
  const definedForms = sourceForms.map(
    (form): ResolvedCreatureFormIdentity => ({
      id: form.id,
      kind: 'defined',
      name: form.name?.trim() ?? '',
      form,
      usesBaseStatistics: designation.kind === 'defined' && designation.formId === form.id,
    }),
  )
  if (designation.kind === 'profile') {
    return {
      status: 'complete',
      profile,
      trueForm: profile,
      eligibleForms: [profile, ...definedForms],
      alternateDestinations: definedForms,
      definedForms,
    }
  }
  if (!designation.formId) {
    return {
      status: 'incomplete',
      profile,
      trueForm: undefined,
      eligibleForms: definedForms,
      alternateDestinations: [],
      definedForms,
    }
  }
  const trueFormId = designation.formId
  const resolvedTrueForm = definedForms.find((form) => form.id === trueFormId)
  if (!resolvedTrueForm) {
    return {
      status: 'missing',
      profile,
      trueForm: undefined,
      eligibleForms: definedForms,
      alternateDestinations: [],
      definedForms,
    }
  }
  return {
    status: 'complete',
    profile,
    trueForm: resolvedTrueForm,
    eligibleForms: definedForms,
    alternateDestinations: definedForms.filter((form) => form.id !== resolvedTrueForm.id),
    definedForms,
  }
}

type CreatureBaseStatistics = {
  sizes?: readonly CreatureSize[]
  movement: MovementSpeeds
  hover?: boolean
}

/** Resolves effective sizes, movement, and speech for one eligible form identity. */
export function resolveCreatureFormStatistics(
  base: CreatureBaseStatistics,
  form?: CreatureFormStatisticsSource,
  options: { usesBaseStatistics?: boolean } = {},
): ResolvedCreatureFormStatistics {
  const usesBase = options.usesBaseStatistics === true
  const overrideSizes = usesBase ? undefined : form?.overrides?.sizes
  const sizes = overrideSizes && overrideSizes.length > 0 ? overrideSizes : (base.sizes ?? [])

  const movementOverride = usesBase ? undefined : form?.overrides?.movement
  const movement =
    movementOverride != null
      ? {
          speeds: movementOverride.speeds,
          hover: movementOverride.hover === true,
        }
      : {
          speeds: base.movement,
          hover: base.hover === true,
        }

  const canSpeak = form?.overrides?.canSpeak === false ? false : true

  return { sizes, movement, canSpeak }
}

export function creatureFormSizesDiffer(
  left: readonly CreatureSize[],
  right: readonly CreatureSize[],
): boolean {
  if (left.length !== right.length) return true
  const sizeSetKey = (sizes: readonly CreatureSize[]) => [...sizes].sort().join('\0')
  return sizeSetKey(left) !== sizeSetKey(right)
}
