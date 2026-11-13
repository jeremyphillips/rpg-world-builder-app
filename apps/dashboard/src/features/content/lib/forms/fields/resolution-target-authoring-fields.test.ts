import { describe, expect, it } from 'vitest'

import {
  buildResolutionRequirementAddMenu,
  formatResolutionRequirementSummary,
  formatResolutionTargetAuthoringPreview,
  resolveResolutionRequirementCollapsible,
} from './resolution-target-authoring-fields'

const creatureTypes = [
  { value: 'humanoid', label: 'Humanoid' },
  { value: 'giant', label: 'Giant' },
]

describe('resolution target authoring fields', () => {
  it('summarizes simple rows and collapses multi-value rows to a phrase', () => {
    const label = (id: string) => creatureTypes.find((option) => option.value === id)?.label ?? id
    expect(formatResolutionRequirementSummary({ kind: 'sight', who: 'actor' }, label)).toBe(
      'You can see it',
    )
    expect(
      formatResolutionRequirementSummary(
        { kind: 'size', bound: 'large', comparison: 'or-smaller' },
        label,
      ),
    ).toBe('Large or smaller')
    expect(
      formatResolutionRequirementSummary(
        { kind: 'creature-type', mode: 'include', ids: ['humanoid', 'giant'] },
        label,
      ),
    ).toBe('Humanoid or Giant')
    expect(
      formatResolutionRequirementSummary(
        {
          kind: 'any-of',
          willing: true,
          conditionIds: ['grappled', 'incapacitated', 'restrained'],
        },
        label,
      ),
    ).toBe('Willing, or Grappled, Incapacitated, or Restrained')
    expect(formatResolutionRequirementSummary({ kind: 'size' }, label)).toBe('Size limit')
    expect(formatResolutionRequirementSummary({ kind: 'written', text: 'demon' }, label)).toBe(
      'demon',
    )
  })

  it('previews the stat-block sentence, including an awkward written noun', () => {
    expect(
      formatResolutionTargetAuthoringPreview(
        {
          'resolution.target.count': 1,
          'resolution.target.kind': 'creature',
          'resolution.target.proximity.kind': 'distance',
          'resolution.target.proximity.distance.value': 5,
          'resolution.target.requirements': [
            { kind: 'size', bound: 'large', comparison: 'or-smaller' },
            { kind: 'sight', who: 'actor' },
          ],
        },
        'resolution.target',
      ),
    ).toBe('One Large or smaller creature you can see within 5 feet')
    expect(
      formatResolutionTargetAuthoringPreview(
        {
          'resolution.target.count': 1,
          'resolution.target.kind': 'creature',
          'resolution.target.proximity.kind': 'distance',
          'resolution.target.proximity.distance.value': 5,
          'resolution.target.requirements': [{ kind: 'written', text: 'demon' }],
        },
        'resolution.target',
      ),
    ).toBe('One creature within 5 feet demon')
  })

  it('blocks a second sight row and does not seed a size or condition', () => {
    const menu = buildResolutionRequirementAddMenu()
    const sight = menu.items.find((item) => item.id === 'sight-target')
    const size = menu.items.find((item) => item.id === 'size')
    const condition = menu.items.find((item) => item.id === 'condition')
    expect(sight?.isDuplicate?.([{ kind: 'sight', who: 'actor' }])).toBe(true)
    expect(size?.appendDefaults).toEqual({ kind: 'size' })
    const creatureType = menu.items.find((item) => item.id === 'creature-type')
    expect(creatureType?.appendDefaults).toEqual({ kind: 'creature-type', mode: 'include' })
    expect(condition?.appendDefaults).toEqual({ kind: 'condition', presence: 'has' })
    expect(condition?.isDuplicate?.([{ kind: 'any-of' }])).toBe(true)
  })

  it('disables disclosure when a requirement row has no editable fields', () => {
    expect(resolveResolutionRequirementCollapsible({ kind: 'willing' })).toBe(false)
    expect(resolveResolutionRequirementCollapsible({ kind: 'sight', who: 'actor' })).toBe(false)
    expect(resolveResolutionRequirementCollapsible({ kind: 'size' })).toBe(true)
  })
})
