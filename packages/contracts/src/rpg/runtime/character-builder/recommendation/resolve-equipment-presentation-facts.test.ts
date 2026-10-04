import { describe, expect, it } from 'vitest'

import type { Equipment } from '../../../content/equipment'
import { resolveEquipmentNotProficientMessage } from '../messages/character-builder-advisory-messages'
import { NEUTRAL_OPTION_RECOMMENDATION } from './recommendation-envelope'
import {
  grantedByLabel,
  includedQuantityLabel,
  OPTION_PRESENTATION_AVAILABLE_IN_STARTING_OPTION_LABEL,
  OPTION_PRESENTATION_COMMON_FOR_CLASS_LABEL,
  OPTION_PRESENTATION_IN_PACKAGE_LABEL,
  OPTION_PRESENTATION_PROFICIENCY_AVAILABLE_LABEL,
  OPTION_PRESENTATION_PROFICIENT_LABEL,
  OPTION_PRESENTATION_RECOMMENDED_LABEL,
  OPTION_PRESENTATION_SPELLCASTING_FOCUS_LABEL,
  requiredByLabel,
  satisfiesFocusRequirementLabel,
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

describe('resolveEquipmentPresentationFacts', () => {
  const sourceName = (source: { kind: string }) => {
    if (source.kind === 'class' && 'id' in source && source.id === 'wizard') return 'Wizard'
    if (source.kind === 'class' && 'id' in source && source.id === 'rogue') return 'Rogue'
    if (source.kind === 'role') return 'Guard'
    return undefined
  }

  it('names an unsatisfied requirement by its owner', () => {
    const facts = resolveEquipmentPresentationFacts({
      resolved: resolved({
        requirements: [
          {
            requirementId: 'wizard:required-gear',
            owner: wizard,
            rule: 'exact',
            optionSatisfies: true,
            role: 'candidate',
          },
        ],
      }),
      sourceName,
      authoredLabel: 'Spellbook',
    })

    expect(facts.facts[0]).toMatchObject({
      kind: 'requirement',
      discriminator: 'required',
      label: requiredByLabel('Wizard class'),
    })
    expect(facts.facts[0]?.label).toBe(requiredByLabel('Wizard class'))
    expect(facts.facts.some((fact) => fact.label === 'Spellbook')).toBe(false)
  })

  it('keeps an unsatisfied focus pool on the requirement, then drops other candidates', () => {
    const candidate = resolveEquipmentPresentationFacts({
      resolved: resolved({
        requirements: [
          {
            requirementId: 'wizard:spellcasting-focus',
            owner: wizard,
            rule: 'anyOf',
            optionSatisfies: true,
            role: 'candidate',
          },
        ],
        state: { compatibility: { spellcastingFocusFor: wizard } },
      }),
      sourceName,
    })
    expect(candidate.facts.map((fact) => fact.label)).toEqual([requiredByLabel('Wizard class')])

    const satisfier = resolveEquipmentPresentationFacts({
      resolved: resolved({
        requirements: [
          {
            requirementId: 'wizard:spellcasting-focus',
            owner: wizard,
            rule: 'anyOf',
            optionSatisfies: true,
            role: 'satisfier',
          },
        ],
        state: { compatibility: { spellcastingFocusFor: wizard } },
      }),
      sourceName,
      ownedQuantity: 1,
    })
    expect(satisfier.facts.map((fact) => fact.label)).toEqual([
      satisfiesFocusRequirementLabel('Wizard'),
      includedQuantityLabel(1),
    ])
    expect(satisfier.facts.map((fact) => fact.discriminator)).toEqual(['satisfies', 'included'])

    const other = resolveEquipmentPresentationFacts({
      resolved: resolved({
        state: { compatibility: { spellcastingFocusFor: wizard } },
      }),
      sourceName,
    })
    expect(other.facts.map((fact) => fact.label)).toEqual([
      OPTION_PRESENTATION_SPELLCASTING_FOCUS_LABEL,
    ])
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

  it('keeps every soft source and does not invent a recommendation from proficiency alone', () => {
    const recommended = resolveEquipmentPresentationFacts({
      resolved: resolved({
        recommendation: {
          strength: 'strong',
          signals: [
            {
              strength: 'strong',
              basis: 'preference',
              specificity: 'exact',
              source: { kind: 'role', id: 'guard' },
            },
            {
              strength: 'strong',
              basis: 'authored',
              specificity: 'exact',
              source: wizard,
            },
          ],
        },
      }),
      sourceName,
    })
    expect(recommended.facts[0]).toMatchObject({
      label: OPTION_PRESENTATION_RECOMMENDED_LABEL,
      sourceLabels: ['Guard role', 'Wizard class'],
    })

    const proficientOnly = resolveEquipmentPresentationFacts({
      resolved: resolved({
        state: { compatibility: { proficient: true } },
      }),
    })
    expect(proficientOnly.facts).toEqual([])
  })

  it('projects not-proficient without changing recommendation strength or copy', () => {
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
      label: OPTION_PRESENTATION_RECOMMENDED_LABEL,
      sourceLabels: ['Wizard class'],
    })
    expect(facts.facts.find((fact) => fact.discriminator === 'not-proficient')).toMatchObject({
      kind: 'compatibility',
      label: resolveEquipmentNotProficientMessage('weapon'),
    })
  })

  it('labels affinity, package membership, and open pools as state or compatibility', () => {
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
      }).facts.map((fact) => fact.label),
    ).toEqual([OPTION_PRESENTATION_IN_PACKAGE_LABEL])

    expect(
      resolveEquipmentPresentationFacts({
        resolved: resolved({
          state: {
            choice: { inOpenPool: true, inSelectedPackage: false, inAlternativePackage: true },
          },
        }),
        openPoolKind: 'toolProficiency',
      }).facts.map((fact) => fact.label),
    ).toEqual([
      OPTION_PRESENTATION_PROFICIENCY_AVAILABLE_LABEL,
      OPTION_PRESENTATION_AVAILABLE_IN_STARTING_OPTION_LABEL,
    ])
  })
})
