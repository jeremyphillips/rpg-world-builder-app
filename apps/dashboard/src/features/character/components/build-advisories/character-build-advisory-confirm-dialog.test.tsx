import { describe, expect, it } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import type { CharacterBuildAdvisory, CharacterKind } from '@rpg/contracts'

import { useCharacterBuildAdvisoryConfirm } from '../../hooks/use-character-build-advisory-confirm'

const advisory: CharacterBuildAdvisory = {
  code: 'equipment_not_proficient',
  subject: {
    kind: 'equipment',
    equipmentId: 'srd-cc-5.2.1:greatsword',
    label: 'Greatsword',
    equipmentClass: 'weapon',
  },
}

function setup(characterKind: CharacterKind) {
  let confirm!: ReturnType<typeof useCharacterBuildAdvisoryConfirm>['confirmAdvisories']
  function Harness() {
    const gate = useCharacterBuildAdvisoryConfirm({ characterKind })
    confirm = gate.confirmAdvisories
    return <>{gate.dialog}</>
  }
  render(<Harness />)
  let result!: Promise<boolean>
  act(() => {
    result = confirm([advisory])
  })
  return result
}

describe('useCharacterBuildAdvisoryConfirm', () => {
  it('resolves true without a dialog when there are no advisories', async () => {
    let confirm!: ReturnType<typeof useCharacterBuildAdvisoryConfirm>['confirmAdvisories']
    function Harness() {
      const gate = useCharacterBuildAdvisoryConfirm({ characterKind: 'pc' })
      confirm = gate.confirmAdvisories
      return <>{gate.dialog}</>
    }
    render(<Harness />)
    await expect(confirm([])).resolves.toBe(true)
    expect(screen.queryByRole('alertdialog')).toBeNull()
  })

  it('lists advisories and resolves false on Go back', async () => {
    const result = setup('pc')
    expect(await screen.findByText(/Greatsword/)).toBeTruthy()
    expect(screen.getByText(/Not proficient with this weapon/)).toBeTruthy()
    await userEvent.click(screen.getByRole('button', { name: 'Go back' }))
    await expect(result).resolves.toBe(false)
  })

  it('resolves true on Create character anyway', async () => {
    const result = setup('pc')
    await userEvent.click(await screen.findByRole('button', { name: 'Create character anyway' }))
    await expect(result).resolves.toBe(true)
  })

  it('uses NPC copy for NPC builds', async () => {
    const result = setup('npc')
    await userEvent.click(await screen.findByRole('button', { name: 'Create NPC anyway' }))
    await expect(result).resolves.toBe(true)
  })

  itAxe('has no axe accessibility violations', async () => {
    void setup('pc')
    await screen.findByRole('alertdialog')
    await expectNoAxeViolations(document.body)
  })
})
