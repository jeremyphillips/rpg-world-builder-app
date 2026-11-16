import type { CreatureSize } from '../../vocab/creature-size'
import type { CreatureFormsDraft } from '../../content/creature/forms'

export type CreatureFormStatisticsSource = {
  overrides?: { sizes?: readonly CreatureSize[] }
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

/** Resolves effective sizes; profile and designated true identities always use base sizes. */
export function resolveCreatureFormStatistics(
  base: { sizes?: readonly CreatureSize[] },
  form?: CreatureFormStatisticsSource,
  options: { usesBaseStatistics?: boolean } = {},
): { sizes: readonly CreatureSize[] } {
  const override = options.usesBaseStatistics ? undefined : form?.overrides?.sizes
  if (override && override.length > 0) return { sizes: override }
  return { sizes: base.sizes ?? [] }
}

export function creatureFormSizesDiffer(
  left: readonly CreatureSize[],
  right: readonly CreatureSize[],
): boolean {
  if (left.length !== right.length) return true
  const sizeSetKey = (sizes: readonly CreatureSize[]) => [...sizes].sort().join('\0')
  return sizeSetKey(left) !== sizeSetKey(right)
}
