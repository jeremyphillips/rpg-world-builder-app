import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMagicPropertyDefinitionProvider } from '@rpg/catalog/magic-properties'
import { describe, expect, it } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { pickEquipment } from '@/test/fixtures/pick'

import { EquipmentInstanceEditorDrawer } from './equipment-instance-editor-drawer'

const rulesetId = 'srd-cc-5.2.1'
const dagger = pickEquipment('dagger')

describe('EquipmentInstanceEditorDrawer', () => {
  it('prompts to discard when Cancel is clicked with a dirty session', async () => {
    const user = userEvent.setup()
    const provider = createMagicPropertyDefinitionProvider(rulesetId)
    const sourceEntry = {
      entryId: 'e1',
      equipmentId: dagger.id,
      quantity: 1,
      equipped: true,
    }

    render(
      <EquipmentInstanceEditorDrawer
        open
        onOpenChange={() => undefined}
        sourceEntry={sourceEntry}
        entries={[sourceEntry]}
        catalogItem={dagger}
        rulesetId={rulesetId}
        definitions={provider}
        subjectNoun="creature"
        onCommit={() => undefined}
      />,
    )

    await user.click(screen.getByRole('switch', { name: /magic item/i }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.getByRole('heading', { name: 'Discard changes?' })).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations in main mode', async () => {
    const provider = createMagicPropertyDefinitionProvider(rulesetId)
    const sourceEntry = {
      entryId: 'e1',
      equipmentId: dagger.id,
      quantity: 1,
      equipped: true,
    }
    const { container } = render(
      <EquipmentInstanceEditorDrawer
        open
        onOpenChange={() => undefined}
        sourceEntry={sourceEntry}
        entries={[sourceEntry]}
        catalogItem={dagger}
        rulesetId={rulesetId}
        definitions={provider}
        subjectNoun="creature"
        onCommit={() => undefined}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
