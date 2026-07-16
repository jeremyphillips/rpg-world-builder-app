import { describe, expect, it } from 'vitest'

import {
  inferLocalClassId,
  inferLocalClassSlug,
  inferLocalSubclassId,
  inferLocalSubclassSlug,
  readDndBeyondClassLabel,
  readDndBeyondSubclassLabel,
} from './dnd-beyond-class-mapping'

describe('dnd-beyond-class-mapping', () => {
  const wizardClass = {
    id: 186407628,
    level: 1,
    definitionId: 0,
    definition: {
      id: 2190886,
      name: 'Wizard',
      slug: '2190886-wizard',
    },
    subclassDefinition: null,
  }

  it('reads class label from data.classes definition', () => {
    expect(readDndBeyondClassLabel(wizardClass)).toBe('Wizard')
    expect(readDndBeyondSubclassLabel(wizardClass)).toBeUndefined()
  })

  it('infers local class slug and id from D&D Beyond class slug', () => {
    expect(inferLocalClassSlug(wizardClass)).toBe('wizard')
    expect(inferLocalClassId(wizardClass)).toBe('srd-cc-5.2.1:wizard')
  })

  it('infers local subclass slug and id when subclass definition is present', () => {
    const evokerWizard = {
      ...wizardClass,
      level: 3,
      subclassDefinition: {
        id: 2190890,
        name: 'Evoker',
        slug: '2190890-evoker',
      },
    }

    expect(readDndBeyondSubclassLabel(evokerWizard)).toBe('Evoker')
    expect(inferLocalSubclassSlug(evokerWizard)).toBe('evoker')
    expect(inferLocalSubclassId(evokerWizard)).toBe('srd-cc-5.2.1:evoker')
  })
})
