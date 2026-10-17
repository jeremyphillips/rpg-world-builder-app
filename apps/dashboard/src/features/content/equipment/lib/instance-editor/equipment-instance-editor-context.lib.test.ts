import { describe, expect, it } from 'vitest'

import { pickEquipment } from '@/test/fixtures/pick'

import { buildEquipmentInstanceEditorContextMetadata } from './equipment-instance-editor-context.lib'

describe('buildEquipmentInstanceEditorContextMetadata', () => {
  it('includes weapon category and mode', () => {
    const dagger = pickEquipment('dagger')
    expect(buildEquipmentInstanceEditorContextMetadata(dagger)).toEqual(['Simple', 'Melee'])
  })

  it('includes armor category only', () => {
    const plate = pickEquipment('plate-armor')
    expect(buildEquipmentInstanceEditorContextMetadata(plate)).toEqual(['Heavy'])
  })
})
