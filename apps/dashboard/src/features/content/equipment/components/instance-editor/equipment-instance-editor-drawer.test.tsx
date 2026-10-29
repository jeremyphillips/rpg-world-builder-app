import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMagicPropertyDefinitionProvider } from '@rpg/catalog/magic-properties'
import { describe, expect, it } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { pickEquipment } from '@/test/fixtures/pick'

import { EquipmentInstanceEditorDrawer } from './equipment-instance-editor-drawer'

const rulesetId = 'srd-cc-5.2.1'
const dagger = pickEquipment('dagger')
const leather = pickEquipment('leather-armor')

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

    await user.click(screen.getByRole('switch', { name: /magical/i }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.getByRole('heading', { name: 'Discard changes?' })).toBeInTheDocument()
  })

  it('shows the catalog item in the header subject band', () => {
    const provider = createMagicPropertyDefinitionProvider(rulesetId)
    const sourceEntry = {
      entryId: 'e1',
      equipmentId: dagger.id,
      quantity: 1,
      equipped: false,
      customName: 'Bright blade',
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

    expect(screen.getByText('Bright blade')).toBeInTheDocument()
    expect(screen.queryByText(dagger.name)).not.toBeInTheDocument()
  })

  it('keeps an armor enhancement bonus positive and explains descending Armor Class', async () => {
    const user = userEvent.setup()
    const provider = createMagicPropertyDefinitionProvider(rulesetId)
    const sourceEntry = {
      entryId: 'e1',
      equipmentId: leather.id,
      quantity: 1,
      equipped: true,
    }

    render(
      <EquipmentInstanceEditorDrawer
        open
        onOpenChange={() => undefined}
        sourceEntry={sourceEntry}
        entries={[sourceEntry]}
        catalogItem={leather}
        rulesetId={rulesetId}
        definitions={provider}
        subjectNoun="creature"
        armorClassRules={{ mode: 'descending', base: 10 }}
        onCommit={() => undefined}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Add adjustment' }))
    await user.click(screen.getByRole('radio', { name: /Armor Class/ }))
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    expect(screen.getByText('A positive enhancement lowers Armor Class.')).toBeInTheDocument()
    expect(screen.getByLabelText('Modifier')).toHaveValue('1')
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
