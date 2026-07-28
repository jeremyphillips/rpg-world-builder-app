import { describe, expect, it } from 'vitest'

import { builderTestContext } from '../test-fixtures'
import { createEmptyCharacterBuilderDraft } from './draft'
import { pruneInvalidBuilderSelections } from './prune-invalid-builder-selections'

describe('pruneInvalidBuilderSelections', () => {
  it('removes selections for unavailable choice sets', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: 'srd-cc-5.2.1:fighter', level: 1 },
      choiceSelections: {
        'spellcasting:srd-cc-5.2.1:wizard:cantrips': ['srd-cc-5.2.1:fire-bolt'],
      },
    }

    const result = pruneInvalidBuilderSelections(draft, builderTestContext)

    expect(result.nextDraft.choiceSelections).toEqual({})
    expect(result.removedSelections).toEqual([
      {
        choiceSetId: 'spellcasting:srd-cc-5.2.1:wizard:cantrips',
        removedOptionIds: ['srd-cc-5.2.1:fire-bolt'],
        reason: 'choice_set_unavailable',
      },
    ])
  })
})
