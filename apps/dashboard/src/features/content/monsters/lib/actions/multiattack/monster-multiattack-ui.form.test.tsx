import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { beforeAll, describe, expect, it } from 'vitest'
import { FormItems } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import { monsterFormTestValues } from '../../monster-form-test-values'
import type { MonsterFormValues } from '../../monster-form-values'
import { buildMonsterActionMultiattackPreview } from '../previews/monster-action-multiattack-summary'
import {
  formatMonsterActionMultiattackPreviewConfigureHint,
  MONSTER_MULTIATTACK_ADD_ACTION_CHOICE_LABEL,
  MONSTER_MULTIATTACK_ADD_REPETITION_LABEL,
  MONSTER_MULTIATTACK_ADD_TO_SEQUENCE_LABEL,
  MONSTER_MULTIATTACK_MAKE_ATTACKS_LABEL,
  MONSTER_MULTIATTACK_PIN_SPELL_LABEL,
  MONSTER_MULTIATTACK_PRIMARY_SEQUENCE_LABEL,
  MONSTER_MULTIATTACK_SEQUENCE_LABEL,
  MONSTER_MULTIATTACK_STEPS_LABEL,
  MONSTER_MULTIATTACK_USE_AN_ACTION_LABEL,
} from '../../monster-form-labels'
import type { MonsterActionDraftRow } from '../monster-action-presets'
import { primeMultiattackReplacementActionsSnapshot } from './monster-multiattack-replacement-form-sync'
import { monsterMultiattackMechanicFields } from './monster-multiattack-mechanic-fields'

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

const ctx = {
  entityCatalogLayer: 'homebrew',
  equipmentCatalogStatus: 'ready',
  equipmentCatalogById: new Map(),
  spellCatalogStatus: 'ready',
  spellCatalogById: new Map(),
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

const multiattackFinished = {
  id: 'multiattack',
  kind: 'multiattack',
  name: 'Multiattack',
  steps: [{ count: 1, actionIds: ['bite'] }],
}

const multiattackEmpty = {
  id: 'multiattack',
  kind: 'multiattack',
  name: 'Multiattack',
  steps: [],
}

function Harness({
  action,
  actionRows,
  onReady,
}: {
  action: MonsterActionDraftRow
  actionRows: MonsterActionDraftRow[]
  onReady?: (getValues: () => MonsterFormValues) => void
}) {
  const defaultValues = monsterFormTestValues({
    name: 'Multiattack UI',
    actions: actionRows as MonsterFormValues['actions'],
  })
  primeMultiattackReplacementActionsSnapshot(actionRows)
  const form = useForm<MonsterFormValues>({ defaultValues, shouldUnregister: true })
  onReady?.(() => form.getValues())
  return (
    <FormProvider {...form}>
      <FormItems
        idPrefix="multiattack-ui"
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

describe('multiattack editor UI cleanup', () => {
  it('shows sequence acquisition labels and use-step controls without mode select', async () => {
    const user = userEvent.setup()
    const rows = [multiattackEmpty, bite] as MonsterActionDraftRow[]
    render(<Harness action={multiattackEmpty} actionRows={rows} />)

    expect(screen.getByText(MONSTER_MULTIATTACK_SEQUENCE_LABEL)).toBeInTheDocument()
    expect(screen.queryByLabelText('Use')).not.toBeInTheDocument()

    const addButton = screen.getByRole('button', {
      name: MONSTER_MULTIATTACK_ADD_TO_SEQUENCE_LABEL,
    })
    await user.click(addButton)
    expect(
      await screen.findByRole('menuitem', { name: MONSTER_MULTIATTACK_USE_AN_ACTION_LABEL }),
    ).toBeInTheDocument()
    await user.click(
      screen.getByRole('menuitem', { name: MONSTER_MULTIATTACK_USE_AN_ACTION_LABEL }),
    )

    expect(await screen.findByLabelText('Action')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: MONSTER_MULTIATTACK_ADD_REPETITION_LABEL }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: MONSTER_MULTIATTACK_ADD_ACTION_CHOICE_LABEL }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: MONSTER_MULTIATTACK_PIN_SPELL_LABEL }),
    ).not.toBeInTheDocument()
  })

  it('orders alternative before replacement and updates primary heading when alternative exists', () => {
    const action = {
      ...multiattackEmpty,
      alternative: { steps: [] },
    }
    const rows = [action, bite] as MonsterActionDraftRow[]
    render(<Harness action={action} actionRows={rows} />)

    expect(screen.getByText(MONSTER_MULTIATTACK_PRIMARY_SEQUENCE_LABEL)).toBeInTheDocument()
  })

  it('renders alternative acquisition before action replacement', () => {
    render(
      <Harness
        action={multiattackEmpty}
        actionRows={[multiattackEmpty, bite] as MonsterActionDraftRow[]}
      />,
    )
    const alternativeAdd = screen.getByRole('button', { name: 'Add alternative sequence' })
    const replacementAdd = screen.getByRole('button', { name: 'Add action replacement' })
    expect(
      alternativeAdd.compareDocumentPosition(replacementAdd) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('keeps finished attack-only preview and drops to configure hint for an empty use step', async () => {
    const user = userEvent.setup()
    let getValues: (() => MonsterFormValues) | undefined
    const rows = [multiattackFinished, bite] as MonsterActionDraftRow[]
    const baselineValues = monsterFormTestValues({
      name: 'Multiattack UI',
      actions: rows as MonsterFormValues['actions'],
    })

    expect(
      buildMonsterActionMultiattackPreview({
        values: baselineValues,
        ctx,
        actionId: 'multiattack',
      })?.status,
    ).toBe('ready')

    render(
      <Harness
        action={multiattackFinished}
        actionRows={rows}
        onReady={(getter) => {
          getValues = getter
        }}
      />,
    )

    const addButton = screen.getByRole('button', {
      name: MONSTER_MULTIATTACK_ADD_TO_SEQUENCE_LABEL,
    })
    await user.click(addButton)
    await user.click(
      await screen.findByRole('menuitem', { name: MONSTER_MULTIATTACK_USE_AN_ACTION_LABEL }),
    )

    expect(await screen.findByText('Choose an action')).toBeInTheDocument()

    const preview = buildMonsterActionMultiattackPreview({
      values: monsterFormTestValues({
        name: 'Multiattack UI',
        actions: [
          {
            ...multiattackFinished,
            steps: [...multiattackFinished.steps, { kind: 'use', mode: 'single', actionId: '' }],
          },
          bite,
        ] as MonsterFormValues['actions'],
      }),
      ctx,
      actionId: 'multiattack',
    })
    expect(preview?.status).toBe('unavailable')
    if (!preview || preview.status !== 'unavailable') return
    expect(preview.guidance).toBe(
      formatMonsterActionMultiattackPreviewConfigureHint(MONSTER_MULTIATTACK_STEPS_LABEL),
    )
  })

  it('shows attack step headers with anatomy row fields', async () => {
    const user = userEvent.setup()
    const rows = [multiattackEmpty, bite] as MonsterActionDraftRow[]
    render(<Harness action={multiattackEmpty} actionRows={rows} />)

    await user.click(
      screen.getByRole('button', { name: MONSTER_MULTIATTACK_ADD_TO_SEQUENCE_LABEL }),
    )
    await user.click(
      await screen.findByRole('menuitem', { name: MONSTER_MULTIATTACK_MAKE_ATTACKS_LABEL }),
    )

    expect(await screen.findByText('Choose attacks')).toBeInTheDocument()
    expect(screen.getByLabelText('Count')).toBeInTheDocument()
    expect(screen.getByLabelText('Attacks')).toBeInTheDocument()
  })
})
