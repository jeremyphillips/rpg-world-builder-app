import type {
  NarrativeFragmentCondition,
  NarrativeFragment,
  NarrativeGenerationContext,
} from '@rpg/contracts/character-narrative'

export interface FoundationCompositionReviewCase {
  name: string
  seed: number
  context: NarrativeGenerationContext
  expectedCondition?: NarrativeFragmentCondition
  minimumConditionedFragments?: number
}

type NarrativeAlignment = NonNullable<NarrativeFragment['alignmentIds']>[number]

const alignments: NarrativeAlignment[] = ['lg', 'ng', 'cg', 'ln', 'n', 'cn', 'le', 'ne', 'ce']
const sparseSeeds = [1, 2, 3, 6, 7, 8, 11, 22, 4]
const richSeeds = [1, 4, 6, 7, 9, 10, 12, 16, 19]

const baseContext: NarrativeGenerationContext = {
  characterKind: 'pc',
  level: 1,
  affinities: [],
  tokens: {},
  organizations: [],
  residences: [],
  people: [],
  places: [],
  boundConditions: [],
  omittedReferenceIds: [],
}

const richContext: Omit<NarrativeGenerationContext, 'alignment'> = {
  ...baseContext,
  level: 5,
  affinities: ['class:wizard', 'species:human', 'culture:riverfolk'],
  tokens: {
    'class.name': 'Wizard',
    'species.name': 'Human',
    'culture.name': 'Riverfolk',
  },
  organizations: [
    {
      id: 'organization-lantern-guild',
      name: 'Lantern Guild',
      title: 'Wayfinder',
      lifecycle: 'current',
      affinities: ['organization:occupational'],
      provenance: { source: 'draft', draftEdgeId: 'edge-organization' },
    },
  ],
  residences: [
    {
      id: 'location-harborford',
      name: 'Harborford',
      role: 'residence',
      affinities: ['place:settlement'],
      provenance: { source: 'draft', draftEdgeId: 'edge-residence' },
    },
  ],
  people: [
    {
      id: 'character-master-erran',
      name: 'Master Erran',
      role: 'mentor',
      affinities: ['person:mentor'],
      provenance: { source: 'draft', draftEdgeId: 'edge-mentor' },
    },
  ],
  places: [
    {
      id: 'location-greybank',
      name: 'Greybank',
      role: 'hometown',
      affinities: ['place:hometown'],
      provenance: { source: 'draft', draftEdgeId: 'edge-hometown' },
    },
  ],
}

const sparseCases: FoundationCompositionReviewCase[] = alignments.map((alignment, index) => ({
  name: `sparse-${alignment}`,
  seed: sparseSeeds[index]!,
  context: { ...baseContext, alignment },
}))

const richCases: FoundationCompositionReviewCase[] = alignments.map((alignment, index) => ({
  name: `rich-${alignment}`,
  seed: richSeeds[index]!,
  context: { ...richContext, alignment },
  minimumConditionedFragments: 2,
}))

export const FOUNDATION_COMPOSITION_REVIEW_CASES: FoundationCompositionReviewCase[] = [
  ...sparseCases,
  ...richCases,
  {
    name: 'missing-alignment-sparse',
    seed: 1601,
    context: baseContext,
  },
  {
    name: 'missing-alignment-rich',
    seed: 1657,
    context: richContext,
  },
  {
    name: 'fighter-affinity',
    seed: 1709,
    context: {
      ...baseContext,
      alignment: 'ln',
      affinities: ['class:fighter'],
      tokens: { 'class.name': 'Fighter' },
    },
  },
  {
    name: 'ranger-affinity',
    seed: 1753,
    context: {
      ...baseContext,
      alignment: 'cg',
      affinities: ['class:ranger'],
      tokens: { 'class.name': 'Ranger' },
    },
  },
  {
    name: 'former-organization',
    seed: 1,
    expectedCondition: 'organizationMembership.former',
    context: {
      ...baseContext,
      alignment: 'n',
      organizations: [
        {
          id: 'organization-ash-company',
          name: 'Ash Company',
          lifecycle: 'former',
          affinities: [],
          provenance: { source: 'persisted', relationshipId: 'relationship-1', revision: 2 },
        },
      ],
    },
  },
  {
    name: 'rival-pressure',
    seed: 4,
    expectedCondition: 'personRole.rival',
    context: {
      ...baseContext,
      alignment: 'ne',
      people: [
        {
          id: 'character-sera-vale',
          name: 'Sera Vale',
          role: 'rival',
          affinities: ['person:rival'],
          provenance: { source: 'draft', draftEdgeId: 'edge-rival' },
        },
      ],
    },
  },
]
