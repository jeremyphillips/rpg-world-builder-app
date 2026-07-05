import { describe, expect, it } from 'vitest'

import {
  CHARACTER_BUILDER_DRAFT_VERSION,
  characterBuilderDraftSchema,
  createEmptyCharacterBuilderDraft,
  createPersistedCharacterBuilderState,
  parsePersistedCharacterBuilderState,
} from './draft'
import type { CharacterBuilderDraft } from './draft'

function makeDraftInProgress(): CharacterBuilderDraft {
  return {
    identity: { name: 'Verna', alignment: 'ng' },
    species: { speciesId: 'srd-cc-5.2.1:dwarf' },
    class: { classId: 'srd-cc-5.2.1:fighter', level: 1 },
    abilities: { method: 'standard-array', scores: { str: 15, con: 14 } },
    choiceSelections: {
      'class:srd-cc-5.2.1:fighter:skills': ['srd-cc-5.2.1:athletics'],
    },
    currentStepId: 'abilities',
    touchedStepIds: ['identity', 'species', 'class', 'abilities'],
  }
}

describe('characterBuilderDraftSchema', () => {
  it('parses an empty draft', () => {
    const result = characterBuilderDraftSchema.safeParse(createEmptyCharacterBuilderDraft())
    expect(result.success).toBe(true)
  })

  it('parses a partially completed draft', () => {
    const result = characterBuilderDraftSchema.safeParse(makeDraftInProgress())
    expect(result.success).toBe(true)
  })

  it('allows partial ability scores without bounds enforcement', () => {
    const draft = createEmptyCharacterBuilderDraft()
    draft.abilities = { method: 'manual', scores: { dex: 25 } }
    expect(characterBuilderDraftSchema.safeParse(draft).success).toBe(true)
  })

  it('rejects levels other than 1', () => {
    const draft = { ...createEmptyCharacterBuilderDraft(), class: { level: 2 } }
    expect(characterBuilderDraftSchema.safeParse(draft).success).toBe(false)
  })

  it('rejects unknown step ids', () => {
    const draft = { ...createEmptyCharacterBuilderDraft(), currentStepId: 'background' }
    expect(characterBuilderDraftSchema.safeParse(draft).success).toBe(false)
  })

  it('drops blank alignment sentinels from persisted identity', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      identity: {
        name: 'Verna',
        narrative: { personalityTraits: ['Steady'] },
        alignment: '',
      },
    }
    const parsed = characterBuilderDraftSchema.parse(draft)
    expect(parsed.identity).toEqual({
      name: 'Verna',
      narrative: { personalityTraits: ['Steady'] },
    })
  })

  it('strips legacy identity.description on parse', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      identity: {
        name: 'Verna',
        description: 'Legacy single-field bio.',
        narrative: { backstory: 'Current backstory.' },
      },
    }
    const parsed = characterBuilderDraftSchema.parse(draft)
    expect(parsed.identity).toEqual({
      name: 'Verna',
      narrative: { backstory: 'Current backstory.' },
    })
  })
})

describe('parsePersistedCharacterBuilderState', () => {
  it('round-trips a persisted draft', () => {
    const draft = makeDraftInProgress()
    const persisted = createPersistedCharacterBuilderState(draft)
    expect(persisted.version).toBe(CHARACTER_BUILDER_DRAFT_VERSION)

    const rehydrated = parsePersistedCharacterBuilderState(JSON.parse(JSON.stringify(persisted)))
    expect(rehydrated).toEqual(draft)
  })

  it('returns null on version mismatch', () => {
    const persisted = {
      version: CHARACTER_BUILDER_DRAFT_VERSION + 1,
      draft: createEmptyCharacterBuilderDraft(),
    }
    expect(parsePersistedCharacterBuilderState(persisted)).toBeNull()
  })

  it('returns null for legacy v1 persisted drafts', () => {
    const persisted = {
      version: 1,
      draft: {
        ...createEmptyCharacterBuilderDraft(),
        identity: { name: 'Verna', description: 'Legacy bio.' },
      },
    }
    expect(parsePersistedCharacterBuilderState(persisted)).toBeNull()
  })

  it('returns null for garbage input', () => {
    expect(parsePersistedCharacterBuilderState(null)).toBeNull()
    expect(parsePersistedCharacterBuilderState('not json state')).toBeNull()
    expect(parsePersistedCharacterBuilderState({ draft: {} })).toBeNull()
  })
})
