/**
 * ESLint flat-config blocks for the quarantined BuildingArchetype research corpus.
 *
 * Runtime apps and contracts production modules must not import archetype registry
 * helpers. Tooling and dedicated corpus tests remain allowed.
 */

const BUILDING_ARCHETYPE_QUARANTINE_MESSAGE =
  'BuildingArchetype is a quarantined research corpus — not runtime classification. Use Form, Facility, and Organization relationships instead. See docs/roadmap/building-taxonomy.md.'

/** Production apps (dashboard, api, public). */
export const buildingArchetypeAppQuarantine = {
  files: ['src/**/*.{ts,tsx}'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: [
              '**/building-archetype',
              '**/building-archetype.*',
              '**/building-archetypes/**',
            ],
            message: BUILDING_ARCHETYPE_QUARANTINE_MESSAGE,
          },
        ],
      },
    ],
  },
}

/** Contracts production src — corpus module and dedicated tests stay allowed. */
export const buildingArchetypeContractsQuarantine = {
  files: ['src/**/*.{ts,tsx}'],
  ignores: [
    'src/rpg/vocab/location/building/building-archetype.ts',
    'src/rpg/vocab/location/building/building-archetype.test.ts',
    'src/rpg/vocab/location/building/building-archetypes/**',
    'src/rpg/vocab/vocab-term-coverage.test.ts',
  ],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: [
              '**/building-archetype',
              '**/building-archetype.*',
              '**/building-archetypes/**',
            ],
            message: BUILDING_ARCHETYPE_QUARANTINE_MESSAGE,
          },
        ],
      },
    ],
  },
}
