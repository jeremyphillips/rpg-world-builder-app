import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { lanternGuild } from '../../connections/picker/organization-picker-drawer.fixtures'
import { CharacterConnectionAddModal } from './character-connection-add-modal'
import { connectionSheetDataFixture } from './connection-sheet-data.fixtures'

const noopAsync = vi.fn(async () => undefined)

describe('CharacterConnectionAddModal organization domain filter', () => {
  it('shows the domain band when more than one domain is present', () => {
    render(
      <CharacterConnectionAddModal
        open
        sectionId="organizations"
        sheetData={connectionSheetDataFixture}
        existingProjectionKinds={new Set()}
        onOpenChange={() => undefined}
        onAddPerson={noopAsync}
        onAddOrganization={noopAsync}
        onAddPlace={noopAsync}
        onAddProperty={noopAsync}
      />,
    )

    expect(screen.getByRole('combobox', { name: 'Domain' })).toBeInTheDocument()
  })

  it('omits the domain band when every organization shares one domain', () => {
    render(
      <CharacterConnectionAddModal
        open
        sectionId="organizations"
        sheetData={{
          ...connectionSheetDataFixture,
          availableOrganizations: [lanternGuild],
          organizationsById: new Map([[lanternGuild.id, lanternGuild]]),
        }}
        existingProjectionKinds={new Set()}
        onOpenChange={() => undefined}
        onAddPerson={noopAsync}
        onAddOrganization={noopAsync}
        onAddPlace={noopAsync}
        onAddProperty={noopAsync}
      />,
    )

    expect(screen.queryByRole('combobox', { name: 'Domain' })).not.toBeInTheDocument()
    expect(screen.getByText('Lantern Guild')).toBeInTheDocument()
  })
})
