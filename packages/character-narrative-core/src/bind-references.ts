import type {
  NarrativeBindingProvenance,
  NarrativeCompositionPlan,
  NarrativeFragmentCondition,
  NarrativeGenerationContext,
  NarrativeOrganizationFact,
  NarrativePersonFact,
  NarrativePlaceFact,
  NarrativeResidenceFact,
  NarrativeTheme,
  NarrativeToken,
} from '@rpg/contracts/character-narrative'
import { pickWeighted } from './selection'

const REFERENCE_OWNED_TOKENS: NarrativeToken[] = [
  'organization.name',
  'organization.title',
  'residence.name',
  'hometown.name',
  'birthplace.name',
  'property.name',
  'mentor.name',
  'child.name',
  'partner.name',
  'rival.name',
  'parent.name',
]

type PlaceCandidate = NarrativePlaceFact | NarrativeResidenceFact

const PLACE_TOKEN_BY_ROLE: Record<PlaceCandidate['role'], NarrativeToken> = {
  hometown: 'hometown.name',
  birthplace: 'birthplace.name',
  property: 'property.name',
  residence: 'residence.name',
}

const PERSON_TOKEN_BY_ROLE: Record<NarrativePersonFact['role'], NarrativeToken> = {
  mentor: 'mentor.name',
  child: 'child.name',
  partner: 'partner.name',
  rival: 'rival.name',
  parent: 'parent.name',
}

function organizationCondition(lifecycle: 'current' | 'former'): NarrativeFragmentCondition {
  return lifecycle === 'current'
    ? 'organizationMembership.current'
    : 'organizationMembership.former'
}

function clearReferenceOwnedTokens(tokens: NarrativeGenerationContext['tokens']) {
  for (const token of REFERENCE_OWNED_TOKENS) {
    delete tokens[token]
  }
}

function bindOrganization(
  organization: NarrativeOrganizationFact,
  tokens: NarrativeGenerationContext['tokens'],
  plan: NarrativeCompositionPlan,
  boundConditions: NarrativeFragmentCondition[],
) {
  tokens['organization.name'] = organization.name
  if (organization.title) tokens['organization.title'] = organization.title
  boundConditions.push(organizationCondition(organization.lifecycle))
  plan.organizationId = organization.id
  plan.organization = { targetId: organization.id, provenance: organization.provenance }
}

function bindPlace(
  place: PlaceCandidate,
  tokens: NarrativeGenerationContext['tokens'],
  plan: NarrativeCompositionPlan,
  boundConditions: NarrativeFragmentCondition[],
) {
  tokens[PLACE_TOKEN_BY_ROLE[place.role]] = place.name
  boundConditions.push(`placeRole.${place.role}`)
  if (place.role === 'residence') plan.residenceId = place.id
  plan.place = { targetId: place.id, role: place.role, provenance: place.provenance }
}

function bindPerson(
  person: NarrativePersonFact,
  tokens: NarrativeGenerationContext['tokens'],
  plan: NarrativeCompositionPlan,
  boundConditions: NarrativeFragmentCondition[],
) {
  tokens[PERSON_TOKEN_BY_ROLE[person.role]] = person.name
  if (person.role !== 'partner' || person.lifecycle !== 'former') {
    boundConditions.push(`personRole.${person.role}`)
  }
  plan.person = { targetId: person.id, role: person.role, provenance: person.provenance }
}

function affinityWeight(
  input: NarrativeGenerationContext,
  reference: { affinities: string[] },
): number {
  return 1 + reference.affinities.filter((affinity) => input.affinities.includes(affinity)).length
}

export function bindNarrativeReferences(
  input: NarrativeGenerationContext,
  theme: NarrativeTheme,
  random: () => number,
): { context: NarrativeGenerationContext; plan: NarrativeCompositionPlan } {
  const weight = (reference: { affinities: string[] }) => affinityWeight(input, reference)
  const organization = pickWeighted(
    [...input.organizations].sort((a, b) => a.id.localeCompare(b.id)),
    weight,
    random,
  )
  const place = pickWeighted(
    [...input.residences, ...input.places].sort((a, b) => a.id.localeCompare(b.id)),
    weight,
    random,
  )
  const person = pickWeighted(
    [...input.people].sort((a, b) => a.id.localeCompare(b.id)),
    weight,
    random,
  )

  const tokens = { ...input.tokens }
  clearReferenceOwnedTokens(tokens)

  const boundConditions: NarrativeFragmentCondition[] = []
  const plan: NarrativeCompositionPlan = { theme }

  if (organization) bindOrganization(organization, tokens, plan, boundConditions)
  if (place) bindPlace(place, tokens, plan, boundConditions)
  if (person) bindPerson(person, tokens, plan, boundConditions)

  return {
    context: {
      ...input,
      tokens,
      boundConditions,
      affinities: [
        ...input.affinities,
        ...(organization?.affinities ?? []),
        ...(place?.affinities ?? []),
        ...(person?.affinities ?? []),
      ],
    },
    plan,
  }
}

export function collectSelectedBindings(
  plan: NarrativeCompositionPlan,
): NarrativeBindingProvenance[] {
  return [plan.organization?.provenance, plan.place?.provenance, plan.person?.provenance].filter(
    (binding): binding is NarrativeBindingProvenance => binding !== undefined,
  )
}
