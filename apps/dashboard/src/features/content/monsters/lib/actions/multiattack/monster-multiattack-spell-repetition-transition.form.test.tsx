import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form'
import { beforeAll, describe, expect, it } from 'vitest'
import { FormItems } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import { monsterFormTestValues } from '../../monster-form-test-values'
import type { MonsterFormValues } from '../../monster-form-values'
import {
  MONSTER_MULTIATTACK_ADD_REPETITION_LABEL,
  MONSTER_MULTIATTACK_REMOVE_REPETITION_LABEL,
} from '../../monster-form-labels'
import type { MonsterActionDraftRow } from '../monster-action-presets'
import { primeMultiattackReplacementActionsSnapshot } from './monster-multiattack-replacement-form-sync'
import { buildMultiattackUseRepetitionValueSyncs } from './monster-multiattack-use-repetition-form-sync'
import { MonsterMultiattackUseStepActionTransitionSlot } from '../../../components/form/actions/multiattack/multiattack-use-step-action-transition.slot'
import { MonsterMultiattackUseStepRepetitionSlot } from '../../../components/form/actions/multiattack/multiattack-use-step-repetition.slot'
import { MONSTER_FORM_WRITE_OPTIONS } from '../../monster-form-write-options'
import { monsterMultiattackUseStepActionSpellDependent } from './monster-multiattack-choice-row-fields'
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

const fireBreath = {
  id: 'fire-breath',
  kind: 'save',
  name: 'Fire Breath',
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

const useStepFieldItems = (actionRows: MonsterActionDraftRow[]) => [
  monsterMultiattackUseStepActionSpellDependent({
    section: 'actions',
    multiattackId: 'multiattack',
    ctx,
    sectionRowsDependsOn: '../../../../actions',
    actionRows,
  }),
  {
    kind: 'slot' as const,
    name: 'multiattackUseStepActionTransition',
    render: ({ namePrefix }: { namePrefix?: string }) => (
      <MonsterMultiattackUseStepActionTransitionSlot
        namePrefix={namePrefix}
        fallbackActionRows={actionRows}
      />
    ),
  },
  {
    kind: 'slot' as const,
    name: 'multiattackUseStepRepetition',
    render: ({ namePrefix }: { namePrefix?: string }) => (
      <MonsterMultiattackUseStepRepetitionSlot
        namePrefix={namePrefix}
        fallbackActionRows={actionRows}
      />
    ),
  },
]

function UseStepHarness({
  actionRows,
  onReady,
}: {
  actionRows: MonsterActionDraftRow[]
  onReady?: (form: UseFormReturn<MonsterFormValues>) => void
}) {
  const defaultValues = monsterFormTestValues({
    name: 'Spell repetition transition',
    actions: actionRows as MonsterFormValues['actions'],
  })
  primeMultiattackReplacementActionsSnapshot(actionRows)
  const form = useForm<MonsterFormValues>({ defaultValues })
  onReady?.(form)

  return (
    <FormProvider {...form}>
      <FormItems
        idPrefix="multiattack-spell-repetition-step"
        namePrefix="actions.0.steps.1"
        items={useStepFieldItems(actionRows)}
      />
    </FormProvider>
  )
}

function MultiattackHarness({
  action,
  actionRows,
  onReady,
}: {
  action: MonsterActionDraftRow
  actionRows: MonsterActionDraftRow[]
  onReady?: (form: UseFormReturn<MonsterFormValues>) => void
}) {
  const defaultValues = monsterFormTestValues({
    name: 'Spell repetition transition',
    actions: actionRows as MonsterFormValues['actions'],
  })
  primeMultiattackReplacementActionsSnapshot(actionRows)
  const form = useForm<MonsterFormValues>({ defaultValues })
  onReady?.(form)

  return (
    <FormProvider {...form}>
      <FormItems
        idPrefix="multiattack-spell-repetition"
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

describe('multiattack spell repetition — mounted form transition', () => {
  it('clears repetition when actionId changes to Spellcasting after Add repetition', async () => {
    let form!: UseFormReturn<MonsterFormValues>

    const withUseStep = {
      ...multiattackBase,
      steps: [
        ...multiattackBase.steps,
        { kind: 'use', mode: 'single', actionId: 'fire-breath', count: 2 },
      ],
    }
    const rows = [withUseStep, bite, fireBreath, spellcasting] as MonsterActionDraftRow[]

    render(
      <UseStepHarness
        actionRows={rows}
        onReady={(ready) => {
          form = ready
        }}
      />,
    )

    const stepPath = 'actions.0.steps.1'
    expect(screen.getByDisplayValue('2')).toBeInTheDocument()

    await act(async () => {
      form.setValue(
        `${stepPath}.actionId` as never,
        'spellcasting' as never,
        MONSTER_FORM_WRITE_OPTIONS,
      )
    })

    await waitFor(() => {
      const step = form.getValues(stepPath as never) as Record<string, unknown>
      expect(step.actionId).toBe('spellcasting')
      expect(step).not.toHaveProperty('count')
    })

    expect(
      screen.queryByRole('button', { name: MONSTER_MULTIATTACK_ADD_REPETITION_LABEL }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: MONSTER_MULTIATTACK_REMOVE_REPETITION_LABEL }),
    ).not.toBeInTheDocument()
  })

  it('keeps invalid stored spell repetition visible for repair', () => {
    const invalid = {
      ...multiattackBase,
      steps: [
        ...multiattackBase.steps,
        { kind: 'use', mode: 'single', actionId: 'spellcasting', count: 2 },
      ],
    }
    const harnessRows = [invalid, bite, spellcasting] as MonsterActionDraftRow[]

    render(<UseStepHarness actionRows={harnessRows} />)

    expect(
      screen.queryByRole('button', { name: MONSTER_MULTIATTACK_ADD_REPETITION_LABEL }),
    ).not.toBeInTheDocument()
    expect(screen.getByDisplayValue('2')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: MONSTER_MULTIATTACK_REMOVE_REPETITION_LABEL }),
    ).toBeInTheDocument()
  })

  it('does not clear repetition when only selecting another step row', async () => {
    const user = userEvent.setup()
    let form!: UseFormReturn<MonsterFormValues>

    const withTwoUseSteps = {
      ...multiattackBase,
      steps: [
        { count: 1, actionIds: ['bite'] },
        { kind: 'use' as const, mode: 'single' as const, actionId: 'fire-breath', count: 2 },
      ],
    } as MonsterActionDraftRow

    render(
      <MultiattackHarness
        action={withTwoUseSteps}
        actionRows={[withTwoUseSteps, bite, fireBreath] as MonsterActionDraftRow[]}
        onReady={(ready) => {
          form = ready
        }}
      />,
    )

    const stepHeaders = screen.getAllByRole('button', { name: /Fire Breath/i })
    await user.click(stepHeaders[0]!)

    expect((form.getValues('actions.0.steps.1') as { count?: number }).count).toBe(2)
    expect(screen.getByDisplayValue('2')).toBeInTheDocument()
  })
})

describe('multiattack spell repetition — value sync reference identity', () => {
  it('leaves count in place until sync runs even when actionId mutates in place', () => {
    const beforeActions = [
      {
        ...multiattackBase,
        steps: [
          ...multiattackBase.steps,
          { kind: 'use', mode: 'single', actionId: 'fire-breath', count: 2 },
        ],
      },
      bite,
      fireBreath,
      spellcasting,
    ] as MonsterActionDraftRow[]

    primeMultiattackReplacementActionsSnapshot(structuredClone(beforeActions))

    const values = {
      ...monsterFormTestValues({
        name: 'Nested setValue',
        actions: beforeActions as unknown as MonsterFormValues['actions'],
      }),
    } as Record<string, unknown>

    const actionsRef = values.actions as MonsterActionDraftRow[]
    const first = actionsRef[0]
    if (!first || first.kind !== 'multiattack') throw new Error('expected multiattack row')
    const useStep = first.steps[1] as { actionId?: string; count?: number }
    useStep.actionId = 'spellcasting'
    expect(values.actions).toBe(actionsRef)

    const sync = buildMultiattackUseRepetitionValueSyncs()[0]!
    const patch = sync.apply(values, ['actions'])
    expect(patch).toEqual({
      actions: expect.arrayContaining([
        expect.objectContaining({
          steps: expect.arrayContaining([expect.objectContaining({ actionId: 'spellcasting' })]),
        }),
      ]),
    })
    expect(useStep.count).toBe(2)
  })
})
