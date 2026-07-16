import { describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'

import {
  buildCharacterPreview,
  createEmptyCharacterBuilderDraft,
  indexCharacterBuildCatalog,
} from '@rpg/contracts'

import { createStandaloneBuilderContextFixture } from '../lib/character-builder-fixtures'
import { useCharacterPreview } from './use-character-preview'

describe('useCharacterPreview', () => {
  it('derives preview from draft and context only', () => {
    const context = createStandaloneBuilderContextFixture()
    const catalogIndex = indexCharacterBuildCatalog(context.catalog)
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      identity: { name: 'Verna' },
    }

    const { result } = renderHook(() =>
      useCharacterPreview(draft, catalogIndex, context.characterCreationRules, context.rulesetId),
    )

    expect(result.current).toEqual(
      buildCharacterPreview(
        draft,
        catalogIndex,
        context.characterCreationRules,
        context.rulesetId,
        {
          resolvedChoiceSets: [],
        },
      ),
    )
  })

  it('returns null when catalog index or rules are missing', () => {
    const draft = createEmptyCharacterBuilderDraft()

    const { result } = renderHook(() => useCharacterPreview(draft, null, null, null))

    expect(result.current).toBeNull()
  })
})
