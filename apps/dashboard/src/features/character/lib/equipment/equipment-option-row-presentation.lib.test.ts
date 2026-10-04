import { describe, expect, it } from 'vitest'

import {
  NEUTRAL_OPTION_RECOMMENDATION,
  OPTION_PRESENTATION_RECOMMENDED_LABEL,
  projectEquipmentSelection,
  requiredByLabel,
  resolveEquipmentNotProficientMessage,
  satisfiesFocusRequirementLabel,
  type Equipment,
  type ResolvedEquipmentOption,
} from '@rpg/contracts'

import {
  equipmentOptionAccessibleLabel,
  equipmentOptionInlineClauses,
  equipmentOptionQuantityAccessibleLabel,
  resolveEquipmentOptionRowPresentation,
} from './equipment-option-row-presentation.lib'

const wizard = { kind: 'class' as const, id: 'wizard' }
const longsword = { kind: 'weapon', id: 'longsword', name: 'Longsword' } as Equipment
const fighter = { kind: 'class' as const, id: 'fighter' }
const sourceName = (source: { kind: string; id?: string }) => {
  if (source.kind === 'class' && source.id === 'wizard') return 'Wizard'
  if (source.kind === 'class' && source.id === 'fighter') return 'Fighter'
  if (source.kind === 'role') return 'Guard'
  return undefined
}

function resolved(overrides: Partial<ResolvedEquipmentOption> = {}): ResolvedEquipmentOption {
  return {
    requirements: [],
    recommendation: NEUTRAL_OPTION_RECOMMENDATION,
    state: {},
    ...overrides,
  }
}

function present(option: ResolvedEquipmentOption, metadata: readonly string[] = ['1d8 Slashing']) {
  return resolveEquipmentOptionRowPresentation({
    identity: 'Longsword',
    equipment: longsword,
    kindLabel: 'Weapon',
    metadata,
    resolved: option,
    sourceName,
  })
}

describe('resolveEquipmentOptionRowPresentation', () => {
  it('names a recommended item and keeps its metadata fact', () => {
    const presentation = present(
      resolved({
        recommendation: {
          strength: 'strong',
          signals: [
            {
              strength: 'strong',
              basis: 'authored',
              specificity: 'exact',
              source: fighter,
            },
          ],
        },
      }),
    )
    expect(equipmentOptionInlineClauses(presentation).map((clause) => clause.label)).toEqual([
      `${OPTION_PRESENTATION_RECOMMENDED_LABEL} by Fighter class`,
    ])
    expect(presentation.metadata).toEqual(['1d8 Slashing'])
    expect(presentation.secondaryTitle).toContain('Fighter class')
  })

  it('joins class and role recommendation sources', () => {
    const presentation = present(
      resolved({
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
              source: fighter,
            },
          ],
        },
      }),
    )
    expect(presentation.secondaryClauses[0]?.label).toBe(
      `${OPTION_PRESENTATION_RECOMMENDED_LABEL} by Guard role · Fighter class`,
    )
  })

  it('names a required item from the requirement owner', () => {
    const presentation = present(
      resolved({
        requirements: [
          {
            requirementId: 'wizard:book',
            owner: wizard,
            rule: 'exact',
            optionSatisfies: true,
            role: 'candidate',
          },
        ],
      }),
    )
    expect(presentation.secondaryClauses[0]).toMatchObject({
      kind: 'requirement',
      label: requiredByLabel('Wizard class'),
    })
  })

  it('shows owned quantity without disabling a row that can take another copy', () => {
    const presentation = present(
      projectEquipmentSelection({
        resolved: resolved(),
        quantity: 1,
        sources: [{ kind: 'role', id: 'guard' }],
        addition: 'quantity',
      }),
      [],
    )
    expect(presentation.trailingState).toEqual({
      label: '×1',
      accessibleLabel: equipmentOptionQuantityAccessibleLabel(1),
    })
    expect(presentation.disabled).toBe(false)
    expect(presentation.metadata).toEqual([])
    expect(equipmentOptionInlineClauses(presentation).map((clause) => clause.kind)).toEqual([
      'supply',
    ])
  })

  it('disables a zero-quantity row when another copy is blocked', () => {
    const presentation = present(
      projectEquipmentSelection({
        resolved: resolved(),
        quantity: 0,
        sources: [],
        addition: 'blocked',
      }),
    )
    expect(presentation.trailingState).toBeUndefined()
    expect(presentation.disabled).toBe(true)
  })

  it('disables an owned singleton when the addition constraint is single', () => {
    const presentation = present(
      projectEquipmentSelection({
        resolved: resolved(),
        quantity: 1,
        sources: [{ kind: 'role', id: 'guard' }],
        addition: 'single',
      }),
    )
    expect(presentation.trailingState?.label).toBe('×1')
    expect(presentation.disabled).toBe(true)
  })

  it('shows included multi-quantity as a selectable count', () => {
    const presentation = present(
      projectEquipmentSelection({
        resolved: resolved(),
        quantity: 3,
        sources: [{ kind: 'manual' }],
        addition: 'quantity',
      }),
    )
    expect(presentation.trailingState?.label).toBe('×3')
    expect(presentation.disabled).toBe(false)
  })

  it('keeps supply beside recommendation and leaves the third clause in the title', () => {
    const presentation = present(
      projectEquipmentSelection({
        resolved: resolved({
          requirements: [
            {
              requirementId: 'wizard:focus',
              owner: wizard,
              rule: 'anyOf',
              optionSatisfies: true,
              role: 'satisfier',
            },
          ],
          recommendation: {
            strength: 'strong',
            signals: [
              {
                strength: 'strong',
                basis: 'authored',
                specificity: 'exact',
                source: fighter,
              },
            ],
          },
          state: { compatibility: { spellcastingFocusFor: wizard, proficient: false } },
        }),
        quantity: 1,
        sources: [{ kind: 'role-default', id: 'guard' }],
        addition: 'quantity',
      }),
    )
    const inline = equipmentOptionInlineClauses(presentation).map((clause) => clause.label)
    expect(inline).toEqual([
      satisfiesFocusRequirementLabel('Wizard'),
      resolveEquipmentNotProficientMessage('weapon'),
    ])
    expect(presentation.secondaryTitle).toContain(
      `${OPTION_PRESENTATION_RECOMMENDED_LABEL} by Fighter class`,
    )
    expect(presentation.secondaryTitle).toContain('Guard role')
    expect(equipmentOptionAccessibleLabel(presentation)).toContain('Guard role')
  })

  it('keeps recommendation and package supply when a role clause repeats the recommendation', () => {
    const presentation = resolveEquipmentOptionRowPresentation({
      identity: 'Javelin',
      kindLabel: 'Weapon',
      metadata: ['1d6 Piercing'],
      sourceName,
      resolved: projectEquipmentSelection({
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
            ],
          },
        }),
        quantity: 10,
        sources: [{ kind: 'manual' }],
        addition: 'quantity',
      }),
      supplyClauses: [
        {
          label: 'Fighter package ×8',
          source: {
            kind: 'recorded',
            source: { kind: 'classStartingEquipment', sourceId: 'fighter', grantId: 'kit' },
          },
        },
        { label: 'Guard role ×1', source: { kind: 'role', id: 'guard' } },
      ],
    })
    expect(presentation.trailingState?.label).toBe('×10')
    expect(equipmentOptionInlineClauses(presentation).map((clause) => clause.label)).toEqual([
      `${OPTION_PRESENTATION_RECOMMENDED_LABEL} by Guard role`,
      'Fighter package ×8',
    ])
    expect(presentation.secondaryTitle).not.toContain('Added manually')
    expect(presentation.secondaryTitle).not.toContain('Guard role ×1')
  })

  it('shows not proficient with a recommendation without rewriting the recommendation', () => {
    const recommendation = {
      strength: 'strong' as const,
      signals: [
        {
          strength: 'strong' as const,
          basis: 'authored' as const,
          specificity: 'exact' as const,
          source: fighter,
        },
      ],
    }
    const option = resolved({
      recommendation,
      state: { compatibility: { proficient: false } },
    })
    const presentation = present(option)
    expect(option.recommendation).toBe(recommendation)
    expect(equipmentOptionInlineClauses(presentation).map((clause) => clause.label)).toEqual([
      resolveEquipmentNotProficientMessage('weapon'),
      `${OPTION_PRESENTATION_RECOMMENDED_LABEL} by Fighter class`,
    ])
  })
})
