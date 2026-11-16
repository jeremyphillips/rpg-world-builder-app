/**
 * @vitest-environment jsdom
 *
 * Phase 2 risk characterization for monster save outcome authoring (effect-array plan).
 * Documents current behavior that informs D6 and Phase 7 refactors.
 */
import { useEffect } from 'react'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { planLinkedEffectRemove, resolutionEffectIdSchema } from '@rpg/contracts'
import { FormItems, getArrayFieldMutators } from '@rpg/ui/form'
import { FormProvider, useController, useForm, type UseFormReturn } from 'react-hook-form'
import { beforeAll, describe, expect, it } from 'vitest'

import { buildSeedDamageTypeVocabulary } from '@/features/vocabulary'

import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import { SAVING_THROW_DC_SOURCE_LABEL } from '../../../../lib/forms/mechanics/saving-throw-field-copy'
import {
  MONSTER_ABILITY_SOURCE_KIND_ABILITY_LABEL,
  MONSTER_SAVE_DC_PROFICIENCY_LABEL,
  MONSTER_SAVE_FAILED_LEGEND,
  MONSTER_SAVE_FAILURE_OR_SUCCESS_ADD_LABEL,
  MONSTER_SAVE_FAILURE_OR_SUCCESS_NOTE_LABEL,
} from '../../monster-form-labels'
import {
  resolveMonsterCreateDefaultValues,
  type MonsterFormValues,
} from '../../monster-form-values'
import { monsterActionDetailFields } from '../detail-fields/monster-action-detail-fields'
import type { MonsterActionDraftRow } from '../monster-action-presets'
import {
  MONSTER_SAVE_FAILED_EFFECTS_PATH,
  ensureMonsterSaveOutcomeSlots,
  readMonsterSaveOutcomes,
  readResolutionEffects,
} from './monster-action-save-outcomes'

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
  damageTypeVocabulary: buildSeedDamageTypeVocabulary(),
} as ContentFormCtx

const DAMAGE_A = resolutionEffectIdSchema.parse('damage-a')
const DAMAGE_B = resolutionEffectIdSchema.parse('damage-b')
const DAMAGE_C = resolutionEffectIdSchema.parse('damage-c')

type LinkedEffectRemoveInput = Parameters<typeof planLinkedEffectRemove>[0]

/** Resolution slice read through the loose `actions` form typing. */
type SaveResolutionSlice = { outcomes?: unknown; effects?: unknown }

function effectReference(effectId: typeof DAMAGE_A) {
  return { kind: 'effect-reference' as const, effectId, amount: 'full' as const }
}

function tripleDamageSaveAction(): MonsterActionDraftRow {
  const effects = [
    {
      id: DAMAGE_A,
      kind: 'damage' as const,
      damageType: 'bludgeoning',
      roll: { dice: { count: 2, faces: 6 }, modifier: 4 },
    },
    {
      id: DAMAGE_B,
      kind: 'damage' as const,
      damageType: 'fire',
      roll: { dice: { count: 2, faces: 6 } },
    },
    {
      id: DAMAGE_C,
      kind: 'damage' as const,
      damageType: 'cold',
      roll: { dice: { count: 1, faces: 8 } },
    },
  ]
  return {
    id: 'triple-damage',
    kind: 'save',
    name: 'Triple damage',
    dcSource: { kind: 'ability', ability: 'con', proficient: true },
    resolution: {
      selectionMode: 'targets',
      method: { kind: 'saving-throw', ability: 'dex' },
      effects,
      outcomes: ensureMonsterSaveOutcomeSlots([
        {
          result: 'failed-save',
          effects: [
            effectReference(DAMAGE_A),
            effectReference(DAMAGE_B),
            effectReference(DAMAGE_C),
          ],
        },
        { result: 'successful-save', effects: [] },
      ]),
      target: {
        count: 1,
        kind: 'creature',
        proximity: { kind: 'distance', distance: { value: 60, unit: 'ft' } },
      },
    },
  } as MonsterActionDraftRow
}

function dualDamageSaveAction(): MonsterActionDraftRow {
  const effects = [
    {
      id: DAMAGE_A,
      kind: 'damage' as const,
      damageType: 'bludgeoning',
      roll: { dice: { count: 2, faces: 6 } },
    },
    {
      id: DAMAGE_B,
      kind: 'damage' as const,
      damageType: 'fire',
      roll: { dice: { count: 2, faces: 6 } },
    },
  ]
  return {
    id: 'dual-damage',
    kind: 'save',
    name: 'Dual damage',
    dcSource: { kind: 'ability', ability: 'con', proficient: true },
    resolution: {
      selectionMode: 'targets',
      method: { kind: 'saving-throw', ability: 'dex' },
      effects,
      outcomes: ensureMonsterSaveOutcomeSlots([
        {
          result: 'failed-save',
          effects: [effectReference(DAMAGE_A), effectReference(DAMAGE_B)],
        },
        {
          result: 'successful-save',
          effects: [
            { kind: 'effect-reference', effectId: DAMAGE_A, amount: 'none' },
            { kind: 'effect-reference', effectId: DAMAGE_B, amount: 'half' },
          ],
        },
      ]),
      target: {
        count: 1,
        kind: 'creature',
        proximity: { kind: 'distance', distance: { value: 60, unit: 'ft' } },
      },
    },
  } as MonsterActionDraftRow
}

/** Keeps persisted resolution on the form when nested editors unregister (shouldUnregister: true). */
function RetainedMonsterSaveResolutionPaths({ namePrefix }: { namePrefix: string }) {
  useController({ name: `${namePrefix}.resolution`, shouldUnregister: false })
  return null
}

function SaveActionFormHost({
  action,
  formRef,
}: {
  action: MonsterActionDraftRow
  formRef: { current: UseFormReturn<MonsterFormValues> | null }
}) {
  const defaults = resolveMonsterCreateDefaultValues()
  defaults.actions = [action]
  const form = useForm<MonsterFormValues>({
    defaultValues: defaults,
    shouldUnregister: true,
  })
  useEffect(() => {
    formRef.current = form
  })
  const namePrefix = 'actions.0'
  return (
    <FormProvider {...form}>
      <RetainedMonsterSaveResolutionPaths namePrefix={namePrefix} />
      <FormItems
        items={monsterActionDetailFields({
          ctx,
          action,
          section: 'actions',
          namePrefix: 'actions.0',
          equipmentOptions: [],
          sharedCastingOptions: [],
        })}
        idPrefix="action"
        namePrefix="actions.0"
      />
    </FormProvider>
  )
}

async function configureSaveDcSource(user: ReturnType<typeof userEvent.setup>) {
  const proficiency = screen.queryByRole('switch', { name: MONSTER_SAVE_DC_PROFICIENCY_LABEL })
  if (proficiency) return
  await user.click(screen.getByRole('combobox', { name: SAVING_THROW_DC_SOURCE_LABEL }))
  await user.click(
    await screen.findByRole('option', { name: MONSTER_ABILITY_SOURCE_KIND_ABILITY_LABEL }),
  )
  await user.click(screen.getByRole('combobox', { name: 'DC ability' }))
  await user.click(await screen.findByRole('option', { name: 'Constitution' }))
  expect(
    screen.getByRole('switch', { name: MONSTER_SAVE_DC_PROFICIENCY_LABEL }),
  ).toBeInTheDocument()
}

async function waitForMountedDamageLibrary(
  formRef: { current: UseFormReturn<MonsterFormValues> | null },
  expectedCount: number,
) {
  await waitFor(() => {
    const library = readResolutionEffects(
      formRef.current!.getValues('actions.0.resolution.effects'),
    )
    expect(library).toHaveLength(expectedCount)
  })
}

async function expandFailedSaveDamageRows(user: ReturnType<typeof userEvent.setup>) {
  const failedGroup = screen.getByRole('group', {
    name: new RegExp(MONSTER_SAVE_FAILED_LEGEND, 'i'),
  })
  const damageHeaders = within(failedGroup).getAllByRole('button', {
    name: /Expand Damage/i,
  })
  for (const header of damageHeaders) {
    await user.click(header)
  }
}

/** Mirrors SaveEffectReferenceSlot rowPath fallback when array field context is absent (R5). */
function referenceRowPathWithoutArrayContext(namePrefix: string, arrayName: string): string {
  const list = namePrefix ? `${namePrefix}.${arrayName}` : arrayName
  return `${list}.0`
}

describe('monster save form risks (Phase 2 characterization)', () => {
  describe('N1 — definition index shift when removing the first damage row', () => {
    it('corrupts shifted definition values after list remove and library splice (D6 needs mutator-first removal)', async () => {
      const user = userEvent.setup()
      const formRef: { current: UseFormReturn<MonsterFormValues> | null } = { current: null }
      render(<SaveActionFormHost action={tripleDamageSaveAction()} formRef={formRef} />)
      await configureSaveDcSource(user)
      await waitForMountedDamageLibrary(formRef, 3)
      await expandFailedSaveDamageRows(user)

      const namePrefix = 'actions.0'
      const failedPath = `${namePrefix}.${MONSTER_SAVE_FAILED_EFFECTS_PATH}`
      // Widened so `setValue` accepts the plan output without per-path typing.
      const libraryPath: string = `${namePrefix}.resolution.effects`
      const outcomesPath: string = `${namePrefix}.resolution.outcomes`

      await act(async () => {
        const form = formRef.current!
        getArrayFieldMutators(
          form.control as unknown as Parameters<typeof getArrayFieldMutators>[0],
          failedPath,
        )?.remove(0)
        const plan = planLinkedEffectRemove({
          library: readResolutionEffects(
            form.getValues(libraryPath),
          ) as LinkedEffectRemoveInput['library'],
          outcomes: readMonsterSaveOutcomes(
            form.getValues(outcomesPath),
          ) as LinkedEffectRemoveInput['outcomes'],
          effectId: DAMAGE_A,
        })
        form.setValue(outcomesPath, plan.outcomes, { shouldDirty: true, shouldValidate: false })
        form.setValue(libraryPath, plan.library, { shouldDirty: true, shouldValidate: false })
      })

      await waitFor(() => {
        const library = readResolutionEffects(formRef.current!.getValues(libraryPath))
        expect(library).toHaveLength(2)
        expect(library.map((effect) => effect.id)).toEqual([DAMAGE_B, DAMAGE_C])
      })

      const library = readResolutionEffects(formRef.current!.getValues(libraryPath))
      // Target after D6: fire then cold. Current shouldUnregister cleanup re-seeds shifted paths.
      expect(library[0]).toMatchObject({ id: DAMAGE_B, damageType: 'bludgeoning' })
      expect(library[1]).toMatchObject({ id: DAMAGE_C, damageType: 'fire' })
    })
  })

  describe('N2 — failure-or-success note rewrites the whole outcomes list', () => {
    it('preserves failed-save effect references while typing rules text', async () => {
      const user = userEvent.setup()
      const formRef: { current: UseFormReturn<MonsterFormValues> | null } = { current: null }
      render(<SaveActionFormHost action={tripleDamageSaveAction()} formRef={formRef} />)
      await configureSaveDcSource(user)
      await waitForMountedDamageLibrary(formRef, 3)

      const resolutionPath = 'actions.0.resolution' as const
      const snapshotBefore = structuredClone(
        formRef.current!.getValues(resolutionPath),
      ) as SaveResolutionSlice
      const failedEffectsBefore =
        readMonsterSaveOutcomes(snapshotBefore.outcomes).find(
          (outcome) => outcome.result === 'failed-save',
        )?.effects ?? []

      await user.click(
        screen.getByRole('button', { name: MONSTER_SAVE_FAILURE_OR_SUCCESS_ADD_LABEL }),
      )
      const note = screen.getByRole('textbox', { name: MONSTER_SAVE_FAILURE_OR_SUCCESS_NOTE_LABEL })
      await user.type(note, 'Applies whether the target succeeds or fails.')

      await waitFor(() => {
        const resolution = formRef.current!.getValues(resolutionPath) as SaveResolutionSlice
        const failedEffectsAfter =
          readMonsterSaveOutcomes(resolution.outcomes).find(
            (outcome) => outcome.result === 'failed-save',
          )?.effects ?? []
        expect(failedEffectsAfter).toEqual(failedEffectsBefore)
        expect(readResolutionEffects(resolution.effects)).toEqual(
          readResolutionEffects(snapshotBefore.effects),
        )
      })
    })
  })

  describe('P3 — mount-time outcome slotting', () => {
    it('does not mark the form dirty after ensure-outcome-slots hydration', async () => {
      const user = userEvent.setup()
      const formRef: { current: UseFormReturn<MonsterFormValues> | null } = { current: null }
      render(<SaveActionFormHost action={tripleDamageSaveAction()} formRef={formRef} />)
      await configureSaveDcSource(user)
      await waitForMountedDamageLibrary(formRef, 3)

      await waitFor(() => {
        const outcomes = readMonsterSaveOutcomes(
          formRef.current!.getValues('actions.0.resolution.outcomes'),
        )
        expect(outcomes.some((outcome) => outcome.result === 'failed-save')).toBe(true)
        expect(outcomes.some((outcome) => outcome.result === 'successful-save')).toBe(true)
      })

      expect(formRef.current!.formState.isDirty).toBe(false)
    })
  })

  describe('R5 — reference row path fallback', () => {
    it('binds every slot without array context to outcome effects index 0', () => {
      expect(
        referenceRowPathWithoutArrayContext('actions.0', MONSTER_SAVE_FAILED_EFFECTS_PATH),
      ).toBe(`actions.0.${MONSTER_SAVE_FAILED_EFFECTS_PATH}.0`)
    })

    it('registers the second failed-save damage editor on its definition, not index 0', async () => {
      const user = userEvent.setup()
      const formRef: { current: UseFormReturn<MonsterFormValues> | null } = { current: null }
      render(<SaveActionFormHost action={dualDamageSaveAction()} formRef={formRef} />)
      await configureSaveDcSource(user)

      await waitForMountedDamageLibrary(formRef, 2)
      await expandFailedSaveDamageRows(user)

      const failedList = screen.getByRole('group', {
        name: new RegExp(MONSTER_SAVE_FAILED_LEGEND, 'i'),
      })
      const damageTypes = within(failedList)
        .getAllByRole('combobox')
        .filter((control) => control.id.includes('damageType'))
      expect(damageTypes).toHaveLength(2)

      await user.click(damageTypes[1]!)
      await user.click(await screen.findByRole('option', { name: 'Cold' }))

      await waitFor(() => {
        const library = readResolutionEffects(
          formRef.current!.getValues('actions.0.resolution.effects'),
        )
        expect(library[0]?.damageType).toBe('bludgeoning')
        expect(library[1]).toMatchObject({ id: DAMAGE_B, damageType: 'cold' })
      })
    })
  })
})

describe('owner damage row remove (Phase 7)', () => {
  it('removes the library definition and every linked outcome reference via the array remove control', async () => {
    const user = userEvent.setup()
    const formRef: { current: UseFormReturn<MonsterFormValues> | null } = { current: null }
    render(<SaveActionFormHost action={dualDamageSaveAction()} formRef={formRef} />)
    await configureSaveDcSource(user)
    await waitForMountedDamageLibrary(formRef, 2)
    await expandFailedSaveDamageRows(user)

    const failedList = screen.getByRole('group', {
      name: new RegExp(MONSTER_SAVE_FAILED_LEGEND, 'i'),
    })
    const removeButtons = within(failedList).getAllByRole('button', { name: /^Remove Damage/i })
    await user.click(removeButtons[0]!)

    await waitFor(() => {
      const library = readResolutionEffects(
        formRef.current!.getValues('actions.0.resolution.effects'),
      )
      expect(library).toHaveLength(1)
      expect(library[0]?.id).toBe(DAMAGE_B)

      const outcomes = readMonsterSaveOutcomes(
        formRef.current!.getValues('actions.0.resolution.outcomes'),
      )
      const failed = outcomes.find((outcome) => outcome.result === 'failed-save')
      const success = outcomes.find((outcome) => outcome.result === 'successful-save')
      expect(failed?.effects).toEqual([effectReference(DAMAGE_B)])
      expect(success?.effects).toEqual([
        { kind: 'effect-reference', effectId: DAMAGE_B, amount: 'half' },
      ])
    })
  })
})
