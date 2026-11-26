import { describe, expect, it } from 'vitest'

import { SUBCLASSES_FOR_FIGHTER } from '../../fixtures'

import { buildSubclassListItems } from './subclass-editor-state'

const CLASS_ID = 'srd-cc-5.2.1:fighter'

describe('buildSubclassListItems', () => {
  it('includes overlay failure rows alongside resolved subclasses', () => {
    const items = buildSubclassListItems(CLASS_ID, [SUBCLASSES_FOR_FIGHTER[0]!], [], {}, [
      {
        targetId: 'srd:broken-subclass',
        slug: 'broken-subclass',
        name: 'Broken Subclass',
        code: 'overlay_validation',
        message: 'Stored system overlay is invalid.',
      },
    ])

    expect(items).toHaveLength(2)
    expect(items[1]?.overlayResolveFailure?.targetId).toBe('srd:broken-subclass')
    expect(items[1]?.catalogLayer).toBe('system')
  })
})
