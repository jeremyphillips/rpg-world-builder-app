import type {
  NarrativeCompositionPlan,
  NarrativeGenerationContext,
  NarrativeTheme,
} from '@rpg/contracts/character-narrative'
import { pickWeighted } from './selection'

export function bindNarrativeReferences(
  input: NarrativeGenerationContext,
  theme: NarrativeTheme,
  random: () => number,
): { context: NarrativeGenerationContext; plan: NarrativeCompositionPlan } {
  const weight = (reference: { affinities: string[] }) =>
    1 + reference.affinities.filter((affinity) => input.affinities.includes(affinity)).length
  const organization = pickWeighted(
    [...input.organizations].sort((a, b) => a.id.localeCompare(b.id)),
    weight,
    random,
  )
  const residence = pickWeighted(
    [...input.residences].sort((a, b) => a.id.localeCompare(b.id)),
    weight,
    random,
  )
  const tokens = { ...input.tokens }
  // Reference tokens are owned by these bindings, never by caller-supplied text.
  delete tokens['organization.name']
  delete tokens['organization.title']
  delete tokens['residence.name']
  if (organization) {
    tokens['organization.name'] = organization.name
    if (organization.title) tokens['organization.title'] = organization.title
  }
  if (residence) tokens['residence.name'] = residence.name
  return {
    context: {
      ...input,
      tokens,
      affinities: [
        ...input.affinities,
        ...(organization?.affinities ?? []),
        ...(residence?.affinities ?? []),
      ],
    },
    plan: { theme, organizationId: organization?.id, residenceId: residence?.id },
  }
}
