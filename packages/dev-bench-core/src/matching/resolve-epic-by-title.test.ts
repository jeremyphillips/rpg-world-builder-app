import { describe, expect, it } from 'vitest'

import type { Epic } from '@rpg/contracts/dev-bench'

import {
  EpicResolutionError,
  findEpicsByTitle,
  resolveEpicIdForQuery,
} from './resolve-epic-by-title'

const epics: Epic[] = [
  {
    id: 'epic-1',
    title: 'Rules Configuration',
    description: '',
    goal: 'Rules',
    status: 'active',
    priority: 'high',
    area: 'rules',
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
  },
  {
    id: 'epic-2',
    title: 'Character Builder',
    description: '',
    goal: 'Characters',
    status: 'active',
    priority: 'high',
    area: 'character_builder',
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
  },
]

describe('findEpicsByTitle', () => {
  it('matches case-insensitively with trim', () => {
    expect(findEpicsByTitle(epics, '  character builder  ').map((epic) => epic.id)).toEqual([
      'epic-2',
    ])
  })

  it('returns empty when no match', () => {
    expect(findEpicsByTitle(epics, 'Missing Epic')).toEqual([])
  })
})

describe('resolveEpicIdForQuery', () => {
  it('prefers epicId when provided', () => {
    expect(resolveEpicIdForQuery({ epicId: 'epic-1' }, epics)).toBe('epic-1')
  })

  it('resolves epicName to id', () => {
    expect(resolveEpicIdForQuery({ epicName: 'Character Builder' }, epics)).toBe('epic-2')
  })

  it('throws EPIC_NOT_FOUND when epicName has no match', () => {
    expect(() => resolveEpicIdForQuery({ epicName: 'Missing Epic' }, epics)).toThrow(
      EpicResolutionError,
    )

    try {
      resolveEpicIdForQuery({ epicName: 'Missing Epic' }, epics)
    } catch (error) {
      expect(error).toBeInstanceOf(EpicResolutionError)
      expect((error as EpicResolutionError).code).toBe('EPIC_NOT_FOUND')
    }
  })

  it('throws AMBIGUOUS_EPIC when multiple titles match', () => {
    const duplicates: Epic[] = [
      ...epics,
      { ...epics[0]!, id: 'epic-dup', title: 'rules configuration' },
    ]

    expect(() => resolveEpicIdForQuery({ epicName: 'Rules Configuration' }, duplicates)).toThrow(
      EpicResolutionError,
    )

    try {
      resolveEpicIdForQuery({ epicName: 'Rules Configuration' }, duplicates)
    } catch (error) {
      expect(error).toBeInstanceOf(EpicResolutionError)
      expect((error as EpicResolutionError).code).toBe('AMBIGUOUS_EPIC')
    }
  })
})
