import { describe, expect, it } from 'vitest'

import type { Epic } from '@rpg/contracts/dev-bench'

import { CliError } from './errors'
import { resolveEpicReference } from './epic-resolver'

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

describe('resolveEpicReference', () => {
  it('prefers epicId when provided', () => {
    const result = resolveEpicReference({ epicId: 'epic-1' }, epics)
    expect(result.epicId).toBe('epic-1')
    expect(result.warnings).toEqual([])
  })

  it('matches epicName case-insensitively', () => {
    const result = resolveEpicReference({ epicName: '  rules configuration  ' }, epics)
    expect(result.epicId).toBe('epic-1')
    expect(result.warnings).toEqual([])
  })

  it('warns when epicName has no match', () => {
    const result = resolveEpicReference({ epicName: 'Missing Epic' }, epics)
    expect(result.epicId).toBeNull()
    expect(result.warnings[0]).toContain('No epic matched')
  })

  it('throws AMBIGUOUS_EPIC when multiple titles match', () => {
    const duplicates: Epic[] = [
      ...epics,
      { ...epics[0]!, id: 'epic-dup', title: 'rules configuration' },
    ]

    expect(() => resolveEpicReference({ epicName: 'Rules Configuration' }, duplicates)).toThrow(
      CliError,
    )

    try {
      resolveEpicReference({ epicName: 'Rules Configuration' }, duplicates)
    } catch (error) {
      expect(error).toBeInstanceOf(CliError)
      expect((error as CliError).code).toBe('AMBIGUOUS_EPIC')
    }
  })
})
