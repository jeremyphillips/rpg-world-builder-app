import { render, screen, waitFor } from '@testing-library/react'
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
  MONSTER_MULTIATTACK_OPTIONAL_LABEL,
  MONSTER_MULTIATTACK_ADD_TO_SEQUENCE_LABEL,
  MONSTER_MULTIATTACK_EMPTY_ATTACKS_HEADING,
  MONSTER_MULTIATTACK_ATTACK_GROUP_LABEL,
  MONSTER_MULTIATTACK_OTHER_ACTIONS_GROUP_LABEL,
  MONSTER_MULTIATTACK_PIN_SPELL_LABEL,
  MONSTER_MULTIATTACK_PRIMARY_SEQUENCE_LABEL,
  MONSTER_MULTIATTACK_SEQUENCE_LABEL,
  MONSTER_MULTIATTACK_STEP_CONJUNCTION,
  MONSTER_MULTIATTACK_STEPS_LABEL,
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
  kind: 'natural-weapon' as const,
  name: 'Bite',
  mode: 'melee',
  damageType: 'piercing',
  damage: { dice: { count: 1, faces: 8 } },
}

const multiattackFinished = {
  id: 'multiattack',
  kind: 'multiattack' as const,
  name: 'Multiattack',
  steps: [{ count: 1, actionIds: ['bite'] }],
}

const fireBreath = {
  id: 'fire-breath',
  kind: 'save' as const,
  name: 'Fire Breath',
}

const multiattackEmpty = {
  id: 'multiattack',
  kind: 'multiattack' as const,
  name: 'Multiattack',
  steps: [],
}

function Harness({
  action,
  actionRows,
  attackOptions = [{ value: 'bite', label: 'Bite' }],
  onReady,
}: {
  action: MonsterActionDraftRow
  actionRows: MonsterActionDraftRow[]
  attackOptions?: { value: string; label: string }[]
  onReady?: (form: {
    getValues: () => MonsterFormValues
    setValue: (name: string, value: unknown) => void
  }) => void
}) {
  const defaultValues = monsterFormTestValues({
    name: 'Multiattack UI',
    actions: actionRows as MonsterFormValues['actions'],
  })
  primeMultiattackReplacementActionsSnapshot(actionRows)
  const form = useForm<MonsterFormValues>({ defaultValues, shouldUnregister: false })
  onReady?.({
    getValues: () => form.getValues(),
    setValue: (name, value) => form.setValue(name as never, value as never, { shouldDirty: true }),
  })
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
          attackOptions,
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
    const rows = [multiattackEmpty, bite, fireBreath] as MonsterActionDraftRow[]
    render(<Harness action={multiattackEmpty} actionRows={rows} />)

    expect(screen.getByText(MONSTER_MULTIATTACK_SEQUENCE_LABEL)).toBeInTheDocument()
    expect(screen.queryByLabelText('Use')).not.toBeInTheDocument()

    const addButton = screen.getByRole('button', {
      name: MONSTER_MULTIATTACK_ADD_TO_SEQUENCE_LABEL,
    })
    await user.click(addButton)
    expect(await screen.findByRole('menuitem', { name: fireBreath.name })).toBeInTheDocument()
    expect(screen.getByText(MONSTER_MULTIATTACK_OTHER_ACTIONS_GROUP_LABEL)).toBeInTheDocument()
    await user.click(screen.getByRole('menuitem', { name: fireBreath.name }))

    expect(await screen.findByLabelText('Action')).toBeInTheDocument()
    const addChoice = screen.getByRole('button', {
      name: MONSTER_MULTIATTACK_ADD_ACTION_CHOICE_LABEL,
    })
    const addRepetition = screen.getByRole('button', {
      name: MONSTER_MULTIATTACK_ADD_REPETITION_LABEL,
    })
    const optional = screen.getByRole('checkbox', { name: MONSTER_MULTIATTACK_OPTIONAL_LABEL })
    expect(
      addChoice.compareDocumentPosition(addRepetition) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(
      addRepetition.compareDocumentPosition(optional) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
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

    render(<Harness action={multiattackFinished} actionRows={rows} />)

    await user.click(
      screen.getByRole('button', { name: MONSTER_MULTIATTACK_ADD_TO_SEQUENCE_LABEL }),
    )
    expect(
      screen.queryByText(MONSTER_MULTIATTACK_OTHER_ACTIONS_GROUP_LABEL),
    ).not.toBeInTheDocument()
    expect(
      await screen.findByRole('menuitem', { name: MONSTER_MULTIATTACK_ATTACK_GROUP_LABEL }),
    ).toBeInTheDocument()

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

  it('hides Add action choice while optional or repetition is active', async () => {
    const user = userEvent.setup()
    const rows = [multiattackEmpty, bite, fireBreath] as MonsterActionDraftRow[]
    render(<Harness action={multiattackEmpty} actionRows={rows} />)

    await user.click(
      screen.getByRole('button', { name: MONSTER_MULTIATTACK_ADD_TO_SEQUENCE_LABEL }),
    )
    await user.click(await screen.findByRole('menuitem', { name: fireBreath.name }))

    const addChoice = () =>
      screen.queryByRole('button', { name: MONSTER_MULTIATTACK_ADD_ACTION_CHOICE_LABEL })

    expect(addChoice()).toBeInTheDocument()

    await user.click(screen.getByRole('checkbox', { name: MONSTER_MULTIATTACK_OPTIONAL_LABEL }))
    expect(addChoice()).not.toBeInTheDocument()

    await user.click(screen.getByRole('checkbox', { name: MONSTER_MULTIATTACK_OPTIONAL_LABEL }))
    expect(addChoice()).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: MONSTER_MULTIATTACK_ADD_REPETITION_LABEL }))
    expect(addChoice()).not.toBeInTheDocument()
  })

  it('shows attack step headers with anatomy row fields', async () => {
    const user = userEvent.setup()
    const rows = [multiattackEmpty, bite] as MonsterActionDraftRow[]
    render(<Harness action={multiattackEmpty} actionRows={rows} />)

    await user.click(
      screen.getByRole('button', { name: MONSTER_MULTIATTACK_ADD_TO_SEQUENCE_LABEL }),
    )
    await user.click(
      await screen.findByRole('menuitem', { name: MONSTER_MULTIATTACK_ATTACK_GROUP_LABEL }),
    )

    expect(await screen.findByText('Choose attacks')).toBeInTheDocument()
    expect(screen.getByLabelText('Count')).toBeInTheDocument()
    expect(screen.getByLabelText('Attacks')).toBeInTheDocument()
  })

  it('creates attack groups and named actions without extra fields', async () => {
    const user = userEvent.setup()
    let form: { getValues: () => MonsterFormValues } | undefined
    const rows = [multiattackEmpty, bite, fireBreath] as MonsterActionDraftRow[]
    render(
      <Harness
        action={multiattackEmpty}
        actionRows={rows}
        onReady={(api) => {
          form = api
        }}
      />,
    )
    await user.click(
      screen.getByRole('button', { name: MONSTER_MULTIATTACK_ADD_TO_SEQUENCE_LABEL }),
    )
    await user.click(
      await screen.findByRole('menuitem', { name: MONSTER_MULTIATTACK_ATTACK_GROUP_LABEL }),
    )
    await user.click(
      screen.getByRole('button', { name: MONSTER_MULTIATTACK_ADD_TO_SEQUENCE_LABEL }),
    )
    await user.click(await screen.findByRole('menuitem', { name: fireBreath.name }))
    await user.click(
      screen.getByRole('button', { name: MONSTER_MULTIATTACK_ADD_TO_SEQUENCE_LABEL }),
    )
    await user.click(await screen.findByRole('menuitem', { name: fireBreath.name }))

    const steps = form?.getValues().actions?.[0]
    expect(steps && 'steps' in steps ? steps.steps : []).toEqual([
      { actionIds: [] },
      { kind: 'use', mode: 'single', actionId: 'fire-breath' },
      { kind: 'use', mode: 'single', actionId: 'fire-breath' },
    ])
    expect(screen.getAllByText(MONSTER_MULTIATTACK_STEP_CONJUNCTION)).toHaveLength(2)
  })

  it('keeps a seeded use step free of repetition, spell, and optional writes', async () => {
    let form: { getValues: () => MonsterFormValues } | undefined
    const seeded = {
      ...multiattackEmpty,
      steps: [{ kind: 'use' as const, mode: 'single' as const, actionId: 'fire-breath' }],
    } as MonsterActionDraftRow
    const rows = [seeded, bite, fireBreath] as MonsterActionDraftRow[]
    render(
      <Harness
        action={seeded}
        actionRows={rows}
        onReady={(api) => {
          form = api
        }}
      />,
    )
    await waitFor(() => {
      const step = form?.getValues().actions?.[0]
      const stored = step && 'steps' in step ? step.steps?.[0] : undefined
      expect(stored).toMatchObject({
        kind: 'use',
        mode: 'single',
        actionId: 'fire-breath',
      })
      expect(stored).not.toHaveProperty('count')
      expect(stored).not.toHaveProperty('spellId')
      expect(stored).not.toHaveProperty('optional')
    })
  })

  it('shows a live action in both sequences after the rows change', async () => {
    const user = userEvent.setup()
    let form: { setValue: (name: string, value: unknown) => void } | undefined
    const action = { ...multiattackEmpty, alternative: { steps: [] } }
    const rows = [action, bite] as MonsterActionDraftRow[]
    render(
      <Harness
        action={action}
        actionRows={rows}
        onReady={(api) => {
          form = api
        }}
      />,
    )
    const presence = { id: 'presence', kind: 'special', name: 'Frightful Presence' }
    form?.setValue('actions', [action, bite, presence])
    const addButtons = screen.getAllByRole('button', {
      name: MONSTER_MULTIATTACK_ADD_TO_SEQUENCE_LABEL,
    })
    await user.click(addButtons[0]!)
    expect(await screen.findByRole('menuitem', { name: presence.name })).toBeInTheDocument()
    await user.keyboard('{Escape}')
    await user.click(addButtons[1]!)
    expect(await screen.findByRole('menuitem', { name: presence.name })).toBeInTheDocument()
    await user.click(screen.getByRole('menuitem', { name: presence.name }))
    const tail = { id: 'tail', kind: 'save', name: 'Tail' }
    form?.setValue('actions', [action, bite, presence, tail])
    await user.click(screen.getByRole('combobox', { name: 'Action' }))
    expect(await screen.findByRole('option', { name: tail.name })).toBeInTheDocument()
  })

  it('uses the empty-attacks slot when no executable attacks exist', () => {
    render(
      <Harness
        action={multiattackEmpty}
        actionRows={[multiattackEmpty] as MonsterActionDraftRow[]}
        attackOptions={[]}
      />,
    )
    expect(screen.getByText(MONSTER_MULTIATTACK_EMPTY_ATTACKS_HEADING)).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: MONSTER_MULTIATTACK_ADD_TO_SEQUENCE_LABEL }),
    ).not.toBeInTheDocument()
  })
})
