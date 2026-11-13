import { describe, expect, it } from 'vitest'

import {
  collectRequirementListIssues,
  formatRequirementTargetMenuNote,
  getRequirementAppendListConflict,
  getRequirementTargetIncompatibility,
  isRequirementCompatibleWithTargetKind,
  readRequirementCompatibilityInput,
} from './requirement-target-compatibility'
import type { ResolutionTargetRequirement } from './target-requirements'

describe('requirement target compatibility', () => {
  it('allows actor sight on every target kind', () => {
    const input = { kind: 'sight' as const, who: 'actor' as const }
    expect(isRequirementCompatibleWithTargetKind(input, 'creature')).toBe(true)
    expect(isRequirementCompatibleWithTargetKind(input, 'object')).toBe(true)
    expect(isRequirementCompatibleWithTargetKind(input, 'creature-or-object')).toBe(true)
  })

  it('restricts target and mutual sight to creature targets', () => {
    for (const who of ['target', 'both'] as const) {
      const input = { kind: 'sight' as const, who }
      expect(isRequirementCompatibleWithTargetKind(input, 'creature')).toBe(true)
      expect(isRequirementCompatibleWithTargetKind(input, 'object')).toBe(false)
      expect(isRequirementCompatibleWithTargetKind(input, 'creature-or-object')).toBe(false)
    }
  })

  it('skips population checks when target kind is unset', () => {
    const input = { kind: 'size' as const }
    expect(isRequirementCompatibleWithTargetKind(input, undefined)).toBe(true)
  })

  it('requires both populations for creature-or-object', () => {
    expect(isRequirementCompatibleWithTargetKind({ kind: 'written' }, 'creature-or-object')).toBe(
      true,
    )
    expect(isRequirementCompatibleWithTargetKind({ kind: 'size' }, 'creature-or-object')).toBe(
      false,
    )
  })

  it('collects the same list issues as schema validation', () => {
    const rows = [
      { kind: 'willing' },
      { kind: 'any-of', willing: true },
    ] as ResolutionTargetRequirement[]
    expect(collectRequirementListIssues(rows).map((issue) => issue.code)).toEqual([
      'willing-with-any-of',
    ])
  })

  it('blocks append when sight already exists', () => {
    expect(
      getRequirementAppendListConflict([{ kind: 'sight', who: 'actor' }], {
        kind: 'sight',
        who: 'target',
      }),
    ).toBe('duplicate-kind')
  })

  it('formats menu notes with a single reason', () => {
    expect(formatRequirementTargetMenuNote({ code: 'duplicate-kind' })).toBe('Already added')
    expect(formatRequirementTargetMenuNote({ code: 'condition-with-any-of' })).toBe(
      'Conflicts with an existing requirement',
    )
    const reason = getRequirementTargetIncompatibility({ kind: 'size' }, 'object')
    expect(reason).toBeDefined()
    if (reason) {
      expect(formatRequirementTargetMenuNote(reason)).toBe('Only available for Creature targets')
    }
  })

  it('reads partial rows without zod', () => {
    expect(readRequirementCompatibilityInput({ kind: 'sight', who: 'both' })).toEqual({
      kind: 'sight',
      who: 'both',
    })
    expect(readRequirementCompatibilityInput({ kind: 'condition', presence: 'has' })).toEqual({
      kind: 'condition',
    })
  })
})
