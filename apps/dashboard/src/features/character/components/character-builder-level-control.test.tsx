import { beforeAll, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import {
  characterBuilderLevelMessages,
  createEmptyCharacterBuilderDraft,
  formatFieldMessage,
} from '@rpg/contracts'

import {
  createCampaignPcBuilderContextFixture,
  createStandaloneBuilderContextFixture,
} from '../lib/character-builder-fixtures'
import { CharacterBuilderLevelControl } from './character-builder-level-control.client'

beforeAll(() => {
  if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = () => false
    HTMLElement.prototype.setPointerCapture = () => {}
    HTMLElement.prototype.releasePointerCapture = () => {}
  }
  if (!HTMLElement.prototype.scrollIntoView) {
    HTMLElement.prototype.scrollIntoView = () => {}
  }
})

describe('CharacterBuilderLevelControl', () => {
  it('renders a fixed campaign entry level badge', () => {
    const context = createCampaignPcBuilderContextFixture()
    const draft = createEmptyCharacterBuilderDraft()

    render(
      <CharacterBuilderLevelControl context={context} draft={draft} onApplyLevelDraft={vi.fn()} />,
    )

    expect(
      screen.getByText(formatFieldMessage(characterBuilderLevelMessages.fieldLabel())),
    ).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'About Choose level' })).toBeInTheDocument()
  })

  it('renders a selectable level field for standalone PCs', () => {
    const context = createStandaloneBuilderContextFixture()

    render(
      <CharacterBuilderLevelControl
        context={context}
        draft={createEmptyCharacterBuilderDraft()}
        onApplyLevelDraft={vi.fn()}
      />,
    )

    expect(screen.getByRole('combobox', { name: /Choose level/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'About Choose level' })).toBeInTheDocument()
  })

  it('applies level changes immediately when no selections are removed', async () => {
    const user = userEvent.setup()
    const onApplyLevelDraft = vi.fn()
    const context = createStandaloneBuilderContextFixture()
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: 'srd-cc-5.2.1:fighter', level: 1 },
    }

    render(
      <CharacterBuilderLevelControl
        context={context}
        draft={draft}
        onApplyLevelDraft={onApplyLevelDraft}
      />,
    )

    await user.click(screen.getByRole('combobox', { name: /Choose level/i }))
    await user.click(screen.getByRole('option', { name: '2' }))

    expect(onApplyLevelDraft).toHaveBeenCalledWith(
      expect.objectContaining({
        class: { classId: 'srd-cc-5.2.1:fighter', level: 2 },
      }),
    )
  })

  it('asks for confirmation before removing invalid selections', async () => {
    const user = userEvent.setup()
    const onApplyLevelDraft = vi.fn()
    const context = createStandaloneBuilderContextFixture()
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: 'srd-cc-5.2.1:fighter', level: 1 },
      choiceSelections: {
        'spellcasting:srd-cc-5.2.1:wizard:cantrips': ['srd-cc-5.2.1:fire-bolt'],
      },
    }

    render(
      <CharacterBuilderLevelControl
        context={context}
        draft={draft}
        onApplyLevelDraft={onApplyLevelDraft}
      />,
    )

    await user.click(screen.getByRole('combobox', { name: /Choose level/i }))
    await user.click(screen.getByRole('option', { name: '2' }))

    const dialog = screen.getByRole('dialog')
    expect(
      within(dialog).getByRole('heading', {
        name: formatFieldMessage(characterBuilderLevelMessages.changeConfirmationHeadline()),
      }),
    ).toBeInTheDocument()

    await user.click(
      within(dialog).getByRole('button', {
        name: formatFieldMessage(characterBuilderLevelMessages.changeConfirmLabel()),
      }),
    )

    expect(onApplyLevelDraft).toHaveBeenCalledWith(
      expect.objectContaining({
        class: { classId: 'srd-cc-5.2.1:fighter', level: 2 },
        choiceSelections: {},
      }),
    )
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <CharacterBuilderLevelControl
        context={createStandaloneBuilderContextFixture()}
        draft={createEmptyCharacterBuilderDraft()}
        onApplyLevelDraft={vi.fn()}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
