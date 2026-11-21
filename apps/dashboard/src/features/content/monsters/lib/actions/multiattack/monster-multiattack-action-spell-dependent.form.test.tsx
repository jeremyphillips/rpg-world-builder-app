import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { beforeAll, describe, expect, it } from 'vitest'
import { FormItems } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import { monsterFormTestValues } from '../../monster-form-test-values'
import type { MonsterFormValues } from '../../monster-form-values'
import {
  MONSTER_MULTIATTACK_ADD_ACTION_CHOICE_LABEL,
  MONSTER_MULTIATTACK_ADD_TO_SEQUENCE_LABEL,
} from '../../monster-form-labels'
import type { MonsterActionDraftRow } from '../monster-action-presets'
import { primeMultiattackReplacementActionsSnapshot } from './monster-multiattack-replacement-form-sync'
import { monsterMultiattackMechanicFields } from './monster-multiattack-mechanic-fields'
import {
  monsterMultiattackActionSpellDependent,
  monsterMultiattackUseStepActionSpellDependent,
} from './monster-multiattack-choice-row-fields'

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

const counterspellId = 'srd:counterspell'

const ctx = {
  entityCatalogLayer: 'homebrew',
  equipmentCatalogStatus: 'ready',
  equipmentCatalogById: new Map(),
  spellCatalogStatus: 'ready',
  spellCatalogById: new Map([[counterspellId, { id: counterspellId, name: 'Counterspell' }]]),
  armorClassRules: { mode: 'ascending', base: 10 },
  options: { skills: { visible: [] } },
  rulesetId: 'srd-cc-5.2.1',
} as unknown as ContentFormCtx

const bite = {
  id: 'bite',
  kind: 'natural-weapon',
  name: 'Bite',
  mode: 'melee',
  damageType: 'piercing',
  damage: { dice: { count: 1, faces: 8 } },
}

const spellcasting = {
  id: 'spellcasting',
  kind: 'spell',
  name: 'Spellcasting',
  spells: [{ spellId: counterspellId }],
}

const multiattackBase = {
  id: 'multiattack',
  kind: 'multiattack' as const,
  name: 'Multiattack',
  steps: [{ count: 1, actionIds: ['bite'] }],
}

function MultiattackHarness({
  action,
  actionRows,
}: {
  action: MonsterActionDraftRow
  actionRows: MonsterActionDraftRow[]
}) {
  const defaultValues = monsterFormTestValues({
    name: 'Dependent spell harness',
    actions: actionRows as MonsterFormValues['actions'],
  })
  primeMultiattackReplacementActionsSnapshot(actionRows)
  const form = useForm<MonsterFormValues>({ defaultValues, shouldUnregister: false })
  return (
    <FormProvider {...form}>
      <FormItems
        idPrefix="multiattack-spell-dependent"
        namePrefix="actions.0"
        items={monsterMultiattackMechanicFields({
          namePrefix: 'actions.0',
          section: 'actions',
          action: action as Extract<MonsterActionDraftRow, { kind: 'multiattack' }>,
          ctx,
          attackOptions: [{ value: 'bite', label: 'Bite' }],
          actionRows,
          weapons: [],
          weaponActions: [],
          allowAddWeapon: false,
        })}
      />
    </FormProvider>
  )
}

async function addSingleUseStep(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: MONSTER_MULTIATTACK_ADD_TO_SEQUENCE_LABEL }))
  await user.click(await screen.findByRole('menuitem', { name: 'Spellcasting' }))
}

function dependentNestCount(container: HTMLElement) {
  return container.querySelectorAll('[data-field-dependent-nest]').length
}

describe('monsterMultiattackActionSpellDependent factory', () => {
  it('uses dependent chrome from input', () => {
    const rail = monsterMultiattackActionSpellDependent({
      actionField: { type: 'select', name: 'actionId', label: 'Action', options: [] },
      chrome: 'rail',
      sectionRowsDependsOn: 'actions',
    })
    const none = monsterMultiattackActionSpellDependent({
      actionField: { type: 'select', name: 'actionId', label: 'Action', options: [] },
      chrome: 'none',
      sectionRowsDependsOn: 'actions',
    })
    expect(rail).toMatchObject({ kind: 'dependent', dependents: { chrome: 'rail' } })
    expect(none).toMatchObject({ kind: 'dependent', dependents: { chrome: 'none' } })
    expect(rail.dependents?.fields?.[0]).toMatchObject({ name: 'spellId', type: 'select' })
    expect(rail.dependents?.visibility).toBeDefined()
    expect(rail.dependents?.fields?.[0]).not.toHaveProperty('visibility')
  })

  it('wires single-use helper with rail chrome', () => {
    const item = monsterMultiattackUseStepActionSpellDependent({
      section: 'actions',
      multiattackId: 'multiattack',
      ctx,
      sectionRowsDependsOn: '../../../../actions',
      actionRows: [multiattackBase, spellcasting],
    })
    expect(item).toMatchObject({ kind: 'dependent', dependents: { chrome: 'rail' } })
  })
})

describe('multiattack action → spell dependent fields', () => {
  const rows = [multiattackBase, bite, spellcasting] as MonsterActionDraftRow[]

  it('use-choice row omits dependent rail nest while gating spell', async () => {
    const user = userEvent.setup()
    const { container } = render(<MultiattackHarness action={multiattackBase} actionRows={rows} />)
    await addSingleUseStep(user)
    await user.click(
      screen.getByRole('button', { name: MONSTER_MULTIATTACK_ADD_ACTION_CHOICE_LABEL }),
    )

    const choiceBlocks = screen.getAllByRole('combobox', { name: 'Action' })
    const choiceAction = choiceBlocks[choiceBlocks.length - 1]!
    await user.click(choiceAction)
    await user.click(screen.getByRole('option', { name: 'Spellcasting' }))

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: 'Pin specific spell' }).length).toBeGreaterThan(
        0,
      )
      expect(dependentNestCount(container)).toBe(0)
    })
  })

  it('replacement choice row omits dependent rail nest while gating spell', async () => {
    const user = userEvent.setup()
    const { container } = render(<MultiattackHarness action={multiattackBase} actionRows={rows} />)

    await user.click(screen.getByRole('button', { name: 'Add action replacement' }))
    await user.click(screen.getByRole('button', { name: 'Add choice' }))
    await user.click(screen.getByRole('combobox', { name: 'Action' }))
    await user.click(screen.getByRole('option', { name: 'Spellcasting' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Pin specific spell' })).toBeInTheDocument()
      expect(dependentNestCount(container)).toBe(0)
    })
  })
})
