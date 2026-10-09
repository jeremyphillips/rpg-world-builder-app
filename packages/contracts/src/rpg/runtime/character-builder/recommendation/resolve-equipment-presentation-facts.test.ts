import { describe, expect, it } from 'vitest'

import type { Equipment } from '../../../content/equipment'
import {
  resolveEquipmentNotProficientMessage,
  resolveEquipmentNotProficientShortLabel,
} from '../messages/character-builder-advisory-messages'
import { NEUTRAL_OPTION_RECOMMENDATION, type OptionRequirement } from './recommendation-envelope'
import {
  grantedByLabel,
  OPTION_PRESENTATION_COMMON_FOR_CLASS_LABEL,
  OPTION_PRESENTATION_INCLUDED_IN_PACKAGE_OPTION_LABEL,
  OPTION_PRESENTATION_IN_PACKAGE_LABEL,
  OPTION_PRESENTATION_MATCHES_FOCUS_REQUIREMENT_LABEL,
  OPTION_PRESENTATION_PROFICIENCY_AVAILABLE_LABEL,
  OPTION_PRESENTATION_PROFICIENT_LABEL,
  OPTION_PRESENTATION_RECOMMENDED_LABEL,
  OPTION_PRESENTATION_SATISFIES_FOCUS_REQUIREMENT_LABEL,
  OPTION_PRESENTATION_SPELLCASTING_FOCUS_LABEL,
  recommendedByLabel,
  requiredByLabel,
  softRecommendationFacts,
} from './resolve-option-presentation-facts'
import { resolveEquipmentPresentationFacts } from './resolve-equipment-presentation-facts'
import type { ResolvedEquipmentOption } from '../resolvers/equipment/project-equipment-option-facts'

const wizard = { kind: 'class' as const, id: 'wizard' }
const longsword = { kind: 'weapon', id: 'longsword', name: 'Longsword' } as Equipment

function resolved(overrides: Partial<ResolvedEquipmentOption> = {}): ResolvedEquipmentOption {
  return {
    requirements: [],
    recommendation: NEUTRAL_OPTION_RECOMMENDATION,
    state: {},
    ...overrides,
  }
}

function requirement(
  role: OptionRequirement['role'],
  rule: OptionRequirement['rule'] = 'exact',
  requirementId = 'wizard:required-gear',
): OptionRequirement {
  return { requirementId, owner: wizard, rule, optionSatisfies: true, role }
}

const focusState = { compatibility: { spellcastingFocusFor: wizard } }

describe('resolveEquipmentPresentationFacts', () => {
  const sourceName = (source: { kind: string }) => {
    if (source.kind === 'class' && 'id' in source && source.id === 'wizard') return 'Wizard'
    if (source.kind === 'class' && 'id' in source && source.id === 'rogue') return 'Rogue'
    if (source.kind === 'role') return 'Guard'
    if (source.kind === 'species') return 'Dwarf'
    return undefined
  }

  it('labels an exact requirement by owner kind and keeps the named owner as source', () => {
    for (const role of ['candidate', 'satisfier'] as const) {
      const facts = resolveEquipmentPresentationFacts({
        resolved: resolved({ requirements: [requirement(role)] }),
        sourceName,
        authoredLabel: 'Spellbook',
      })

      expect(facts.facts[0]).toEqual({
        kind: 'requirement',
        discriminator: 'required',
        label: requiredByLabel('class'),
        sourceKind: 'class',
        requirementRole: role,
        sourceLabels: ['Wizard class'],
      })
      expect(facts.facts[0]?.label).toBe('Required by class')
      expect(facts.facts.some((fact) => fact.label === 'Spellbook')).toBe(false)
    }
  })

  it('matches an open focus requirement, satisfies it once owned, and skips eligible alternates', () => {
    const candidate = resolveEquipmentPresentationFacts({
      resolved: resolved({
        requirements: [requirement('candidate', 'anyOf', 'wizard:spellcasting-focus')],
        state: focusState,
      }),
      sourceName,
    })
    expect(candidate.facts).toEqual([
      expect.objectContaining({
        discriminator: 'requirement-match',
        label: OPTION_PRESENTATION_MATCHES_FOCUS_REQUIREMENT_LABEL,
        requirementRole: 'candidate',
        sourceKind: 'class',
      }),
    ])

    const satisfier = resolveEquipmentPresentationFacts({
      resolved: resolved({
        requirements: [requirement('satisfier', 'anyOf', 'wizard:spellcasting-focus')],
        state: { ...focusState, owned: true },
      }),
      sourceName,
    })
    expect(satisfier.facts).toEqual([
      expect.objectContaining({
        discriminator: 'requirement-match',
        label: OPTION_PRESENTATION_SATISFIES_FOCUS_REQUIREMENT_LABEL,
        requirementRole: 'satisfier',
      }),
    ])

    const eligible = resolveEquipmentPresentationFacts({
      resolved: resolved({
        requirements: [requirement('eligible', 'anyOf', 'wizard:spellcasting-focus')],
        state: focusState,
      }),
      sourceName,
    })
    expect(eligible.facts.map((fact) => fact.discriminator)).toEqual(['spellcasting-focus'])
    expect(eligible.facts[0]?.label).toBe(OPTION_PRESENTATION_SPELLCASTING_FOCUS_LABEL)
  })

  it('pairs proficiency with the granting class', () => {
    const facts = resolveEquipmentPresentationFacts({
      resolved: resolved({
        state: {
          compatibility: {
            proficient: true,
            proficiencySources: [{ kind: 'classFeature', sourceId: 'rogue', grantId: 'tools' }],
          },
        },
      }),
      sourceName,
    })

    expect(facts.facts[0]).toMatchObject({
      kind: 'compatibility',
      label: OPTION_PRESENTATION_PROFICIENT_LABEL,
      detail: grantedByLabel('Rogue class'),
    })
  })

  it('emits one recommendation per source kind in priority order', () => {
    const recommended = resolveEquipmentPresentationFacts({
      resolved: resolved({
        recommendation: {
          strength: 'strong',
          signals: [
            {
              strength: 'strong',
              basis: 'authored',
              specificity: 'exact',
              source: wizard,
            },
            {
              strength: 'strong',
              basis: 'preference',
              specificity: 'exact',
              source: { kind: 'role', id: 'guard' },
            },
          ],
        },
      }),
      sourceName,
    })
    expect(recommended.facts).toEqual([
      expect.objectContaining({
        label: recommendedByLabel('role'),
        sourceKind: 'role',
        sourceLabels: ['Guard role'],
        owned: false,
      }),
      expect.objectContaining({
        label: recommendedByLabel('class'),
        sourceKind: 'class',
        sourceLabels: ['Wizard class'],
        owned: false,
      }),
    ])

    const proficientOnly = resolveEquipmentPresentationFacts({
      resolved: resolved({
        state: { compatibility: { proficient: true } },
      }),
    })
    expect(proficientOnly.facts).toEqual([])
  })

  it('stamps owned recommendations instead of suppressing them', () => {
    const facts = resolveEquipmentPresentationFacts({
      resolved: resolved({
        recommendation: {
          strength: 'strong',
          signals: [
            { strength: 'strong', basis: 'inferred', specificity: 'exact', source: wizard },
          ],
        },
        state: { owned: true },
      }),
      sourceName,
    })

    expect(facts.facts).toEqual([
      expect.objectContaining({ discriminator: 'recommended', owned: true }),
    ])
  })

  it('projects a short not-proficient label with the class sentence as detail', () => {
    const recommendation = {
      strength: 'strong' as const,
      signals: [
        {
          strength: 'strong' as const,
          basis: 'authored' as const,
          specificity: 'exact' as const,
          source: wizard,
        },
      ],
    }
    const option = resolved({
      recommendation,
      state: { compatibility: { proficient: false } },
    })
    const facts = resolveEquipmentPresentationFacts({
      resolved: option,
      sourceName,
      equipment: longsword,
    })
    expect(option.recommendation).toBe(recommendation)
    expect(facts.facts.find((fact) => fact.discriminator === 'recommended')).toMatchObject({
      label: recommendedByLabel('class'),
      sourceLabels: ['Wizard class'],
    })
    expect(facts.facts.find((fact) => fact.discriminator === 'not-proficient')).toEqual({
      kind: 'compatibility',
      discriminator: 'not-proficient',
      label: resolveEquipmentNotProficientShortLabel(),
      detail: resolveEquipmentNotProficientMessage('weapon'),
      sourceLabels: [],
    })
    expect(resolveEquipmentNotProficientShortLabel()).toBe('Not proficient')
  })

  it('emits one ability-requirement-unmet fact per unmet minimum', () => {
    const facts = resolveEquipmentPresentationFacts({
      resolved: resolved({
        state: {
          compatibility: {
            unmetAbilityScoreRequirements: [
              { ability: 'str', required: 15, actual: 8 },
              { ability: 'dex', required: 13, actual: 10 },
            ],
          },
        },
      }),
    })

    expect(facts.facts).toEqual([
      {
        kind: 'compatibility',
        discriminator: 'ability-requirement-unmet',
        ability: 'str',
        label: 'Requires STR 15',
        detail: 'Requires STR 15; character has STR 8.',
        sourceLabels: [],
      },
      {
        kind: 'compatibility',
        discriminator: 'ability-requirement-unmet',
        ability: 'dex',
        label: 'Requires DEX 13',
        detail: 'Requires DEX 13; character has DEX 10.',
        sourceLabels: [],
      },
    ])
  })

  it('labels affinity, package membership, open pools, and alternative packages', () => {
    expect(
      resolveEquipmentPresentationFacts({
        resolved: resolved({
          recommendation: {
            strength: 'compatible',
            signals: [
              {
                strength: 'compatible',
                basis: 'affinity',
                specificity: 'broad_pool',
                source: wizard,
                detail: { kind: 'toolCategory', toolCategory: 'tool' },
              },
            ],
          },
        }),
        sourceName,
      }).facts[0]?.label,
    ).toBe(OPTION_PRESENTATION_COMMON_FOR_CLASS_LABEL)

    expect(
      resolveEquipmentPresentationFacts({
        resolved: resolved({
          state: {
            choice: { inOpenPool: false, inSelectedPackage: true, inAlternativePackage: false },
          },
        }),
      }).facts,
    ).toEqual([])

    expect(
      resolveEquipmentPresentationFacts({
        resolved: resolved({
          state: {
            choice: { inOpenPool: true, inSelectedPackage: false, inAlternativePackage: true },
          },
        }),
        openPoolKind: 'toolProficiency',
      }).facts.map((fact) => [fact.discriminator, fact.label]),
    ).toEqual([
      ['open-pool', OPTION_PRESENTATION_PROFICIENCY_AVAILABLE_LABEL],
      ['alternative-package', OPTION_PRESENTATION_INCLUDED_IN_PACKAGE_OPTION_LABEL],
    ])
    expect(OPTION_PRESENTATION_INCLUDED_IN_PACKAGE_OPTION_LABEL).toBe('Included in package option')
  })
})

describe('softRecommendationFacts', () => {
  const sourceName = (source: { kind: string }) => {
    if (source.kind === 'class') return 'Wizard'
    if (source.kind === 'species') return 'Dwarf'
    if (source.kind === 'role') return 'Guard'
    return undefined
  }

  it('keeps class and species as separate facts in source priority order', () => {
    const facts = softRecommendationFacts({
      recommendation: {
        strength: 'strong',
        signals: [
          {
            strength: 'strong',
            basis: 'affinity',
            specificity: 'exact',
            source: { kind: 'species', id: 'dwarf' },
          },
          { strength: 'strong', basis: 'authored', specificity: 'exact', source: wizard },
        ],
      },
      sourceName,
    })

    expect(facts.map((fact) => [fact.label, fact.sourceKind, fact.sourceLabels])).toEqual([
      ['Recommended by class', 'class', ['Wizard class']],
      ['Recommended by species', 'species', ['Dwarf species']],
    ])
  })

  it('orders role before class', () => {
    const facts = softRecommendationFacts({
      recommendation: {
        strength: 'strong',
        signals: [
          { strength: 'strong', basis: 'authored', specificity: 'exact', source: wizard },
          {
            strength: 'strong',
            basis: 'preference',
            specificity: 'exact',
            source: { kind: 'role', id: 'guard' },
          },
        ],
      },
      sourceName,
    })

    expect(facts.map((fact) => fact.label)).toEqual(['Recommended by role', 'Recommended by class'])
  })

  it('collapses sourceless signals into a single Recommended fact', () => {
    const facts = softRecommendationFacts({
      recommendation: {
        strength: 'compatible',
        signals: [
          { strength: 'compatible', basis: 'inferred', specificity: 'broad_pool' },
          { strength: 'compatible', basis: 'inferred', specificity: 'exact' },
        ],
      },
    })

    expect(facts).toEqual([
      {
        kind: 'recommendation',
        discriminator: 'recommended',
        label: OPTION_PRESENTATION_RECOMMENDED_LABEL,
        sourceLabels: [],
      },
    ])
  })

  it('emits nothing for neutral or discouraged recommendations', () => {
    expect(softRecommendationFacts({ recommendation: NEUTRAL_OPTION_RECOMMENDATION })).toEqual([])
  })

  it('drops starting-equipment reasons at every strength', () => {
    expect(
      softRecommendationFacts({
        recommendation: {
          strength: 'strong',
          signals: [
            {
              strength: 'strong',
              basis: 'inferred',
              specificity: 'exact',
              source: wizard,
              reason: 'startingEquipment',
            },
            {
              strength: 'compatible',
              basis: 'inferred',
              specificity: 'narrow_pool',
              source: wizard,
              reason: 'startingEquipmentChoice',
            },
            {
              strength: 'compatible',
              basis: 'inferred',
              specificity: 'broad_pool',
              source: wizard,
              reason: 'availableInStartingOption',
            },
          ],
        },
        sourceName,
      }),
    ).toEqual([])
  })
})

describe('starting-equipment presentation guidance', () => {
  const sourceName = (source: { kind: string }) => (source.kind === 'class' ? 'Wizard' : undefined)
  const packageChoice = {
    inOpenPool: false,
    inSelectedPackage: false,
    inAlternativePackage: true,
  } as const

  function labels(option: ResolvedEquipmentOption): string[] {
    return resolveEquipmentPresentationFacts({ resolved: option, sourceName }).facts.map(
      (fact) => fact.label,
    )
  }

  it('shows package guidance only for starting-equipment evidence', () => {
    expect(
      labels(
        resolved({
          recommendation: {
            strength: 'compatible',
            signals: [
              {
                strength: 'compatible',
                basis: 'inferred',
                specificity: 'exact',
                source: wizard,
                reason: 'startingEquipment',
              },
            ],
          },
          state: { choice: packageChoice },
        }),
      ),
    ).toEqual([OPTION_PRESENTATION_INCLUDED_IN_PACKAGE_OPTION_LABEL])
  })

  it('shows Recommended by class for an independent class suggestion', () => {
    expect(
      labels(
        resolved({
          recommendation: {
            strength: 'strong',
            signals: [
              {
                strength: 'strong',
                basis: 'authored',
                specificity: 'exact',
                source: wizard,
                reason: 'classSuggested',
              },
            ],
          },
        }),
      ),
    ).toEqual(['Recommended by class'])
  })

  it('keeps package guidance and an independent class suggestion as separate facts', () => {
    expect(
      labels(
        resolved({
          recommendation: {
            strength: 'strong',
            signals: [
              {
                strength: 'strong',
                basis: 'authored',
                specificity: 'exact',
                source: wizard,
                reason: 'classSuggested',
              },
              {
                strength: 'compatible',
                basis: 'inferred',
                specificity: 'exact',
                source: wizard,
                reason: 'startingEquipment',
              },
            ],
          },
          state: { choice: packageChoice },
        }),
      ),
    ).toEqual(['Recommended by class', OPTION_PRESENTATION_INCLUDED_IN_PACKAGE_OPTION_LABEL])
  })

  it('emits no package row guidance when the selected package contributes the item', () => {
    expect(
      labels(
        resolved({
          recommendation: {
            strength: 'compatible',
            signals: [
              {
                strength: 'compatible',
                basis: 'inferred',
                specificity: 'exact',
                source: wizard,
                reason: 'startingEquipment',
              },
            ],
          },
          state: {
            owned: true,
            choice: { inOpenPool: false, inSelectedPackage: true, inAlternativePackage: false },
          },
        }),
      ),
    ).toEqual([])
    expect(OPTION_PRESENTATION_IN_PACKAGE_LABEL).toBe('In your package')
  })
})
