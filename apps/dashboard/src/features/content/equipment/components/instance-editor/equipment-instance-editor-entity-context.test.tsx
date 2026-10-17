import { render, screen } from '@testing-library/react'
import { createMagicPropertyDefinitionProvider } from '@rpg/catalog/magic-properties'
import { describe, expect, it } from 'vitest'

import { pickEquipment } from '@/test/fixtures/pick'

import {
  createEquipmentEditorState,
  equipmentEditorReducer,
} from '../../lib/instance-editor/equipment-editor-reducer'
import { EquipmentInstanceEditorEntityContext } from './equipment-instance-editor-entity-context'

const rulesetId = 'srd-cc-5.2.1'
const dagger = pickEquipment('dagger')
const definitions = createMagicPropertyDefinitionProvider(rulesetId)

const sourceEntry = {
  entryId: 'e1',
  equipmentId: dagger.id,
  quantity: 1,
  equipped: true,
}

function renderEntityContext(state = createEquipmentEditorState({ sourceEntry })) {
  return render(
    <EquipmentInstanceEditorEntityContext
      state={state}
      catalogItem={dagger}
      definitions={definitions}
      dispatch={() => undefined}
    />,
  )
}

describe('EquipmentInstanceEditorEntityContext', () => {
  it('shows the quantity stepper on the main edit screen', () => {
    renderEntityContext()
    expect(screen.getByRole('spinbutton')).toBeInTheDocument()
  })

  it('hides quantity trailing in add-adjustment sub-mode', () => {
    const main = createEquipmentEditorState({ sourceEntry })
    const adjustment = equipmentEditorReducer(main, { type: 'openEffectChoose' })

    renderEntityContext(adjustment)

    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument()
    expect(screen.queryByText('×1 (separated on save)')).not.toBeInTheDocument()
  })
})
