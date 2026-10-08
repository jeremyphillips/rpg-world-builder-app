import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

beforeAll(() => {
  Element.prototype.hasPointerCapture ??= () => false
  Element.prototype.setPointerCapture ??= () => undefined
  Element.prototype.releasePointerCapture ??= () => undefined
  Element.prototype.scrollIntoView ??= () => undefined
})

import { CATALOG_TOOLBAR_RESET_WITHOUT_SORT_NAME } from '../../picker/catalog-toolbar-reset-action'
import { CharacterPickerDrawer } from './character-picker-drawer'
import type { CharacterPickerItem } from './character-picker-drawer.types'

const items: CharacterPickerItem[] = [
  {
    character: {
      id: 'pc-aria',
      name: 'Aria Thorn',
      summary: 'PC · Wizard',
      characterType: 'pc',
      classIds: ['wizard'],
    },
    selected: false,
  },
  {
    character: {
      id: 'npc-darius',
      name: 'Darius Vale',
      summary: 'NPC · Rogue',
      characterType: 'npc',
      classIds: ['rogue'],
    },
    selected: false,
  },
]

describe('CharacterPickerDrawer filters', () => {
  it('filters by type and class, and mounts reset only while a criterion is set', async () => {
    const user = userEvent.setup()

    render(
      <CharacterPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={items}
        resolveClassLabel={(classId) => (classId === 'wizard' ? 'Wizard' : 'Rogue')}
        onSelect={vi.fn()}
      />,
    )

    expect(
      screen.queryByRole('button', { name: CATALOG_TOOLBAR_RESET_WITHOUT_SORT_NAME }),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: 'NPC' }))
    expect(screen.getByText('Darius Vale')).toBeInTheDocument()
    expect(screen.queryByText('Aria Thorn')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: CATALOG_TOOLBAR_RESET_WITHOUT_SORT_NAME }))
    expect(screen.getByText('Aria Thorn')).toBeInTheDocument()

    await user.click(screen.getByRole('combobox', { name: 'Class' }))
    await user.click(screen.getByRole('option', { name: 'Rogue' }))
    expect(screen.getByText('Darius Vale')).toBeInTheDocument()
    expect(screen.queryByText('Aria Thorn')).not.toBeInTheDocument()
  })
})
