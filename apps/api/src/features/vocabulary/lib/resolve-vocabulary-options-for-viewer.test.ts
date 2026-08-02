import { describe, expect, it } from 'vitest'

import {
  isVocabularyViewerManager,
  resolveVocabularyOptionsForViewer,
} from './resolve-vocabulary-options-for-viewer'

describe('resolveVocabularyOptionsForViewer', () => {
  const options = [
    { id: 'humanoid', status: 'active' as const },
    { id: 'fey', status: 'disabled' as const },
  ]

  it('returns all options for managers', () => {
    expect(isVocabularyViewerManager('owner')).toBe(true)
    expect(resolveVocabularyOptionsForViewer(options, 'owner')).toEqual(options)
  })

  it('hides disabled options for players', () => {
    expect(resolveVocabularyOptionsForViewer(options, 'pc')).toEqual([options[0]])
  })
})
