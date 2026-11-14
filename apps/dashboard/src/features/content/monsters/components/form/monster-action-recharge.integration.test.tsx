import { useEffect } from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  useController,
  FormProvider,
  useForm,
  useFormContext,
  type UseFormReturn,
} from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import { buildSeedDamageTypeVocabulary } from '@/features/vocabulary'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { normalizeMonsterFormValues } from '../../lib/normalize-monster-form-values'
import {
  resolveMonsterCreateDefaultValues,
  type MonsterFormValues,
} from '../../lib/monster-form-values'
import type { MonsterActionDraftRow } from '../../lib/actions/monster-action-presets'
import { MonsterActionSections } from './monster-action-sections'

const ctx = {
  entityCatalogLayer: 'homebrew',
  equipmentCatalogStatus: 'ready',
  equipmentCatalogById: new Map(),
  damageTypeVocabulary: buildSeedDamageTypeVocabulary(),
} as ContentFormCtx

const RETAINED_FORM_PATHS = [
  'name',
  'sizes',
  'creatureType',
  'alignment',
  'abilityScores',
  'armorClass',
  'hitPoints',
  'movement',
  'senses',
  'communication',
  'proficiencies',
  'weaponProficiencyMode',
  'defenses',
  'equipment',
  'traits',
  'challengeRating',
] as const

function RetainedMonsterPath({ name }: { name: (typeof RETAINED_FORM_PATHS)[number] }) {
  useController({ name, shouldUnregister: false })
  return null
}

function DirtyProbe({ dirtyRef }: { dirtyRef: { current: boolean } }) {
  const { formState } = useFormContext()
  useEffect(() => {
    dirtyRef.current = formState.isDirty
  }, [dirtyRef, formState.isDirty])
  return null
}

function Host({
  values,
  formRef,
  dirtyRef,
}: {
  values: MonsterFormValues
  formRef: { current: UseFormReturn<MonsterFormValues> | null }
  dirtyRef: { current: boolean }
}) {
  const form = useForm<MonsterFormValues>({
    shouldUnregister: true,
    defaultValues: values,
  })
  useEffect(() => {
    formRef.current = form
  })
  return (
    <FormProvider {...form}>
      <DirtyProbe dirtyRef={dirtyRef} />
      {RETAINED_FORM_PATHS.map((name) => (
        <RetainedMonsterPath key={name} name={name} />
      ))}
      <MonsterActionSections ctx={ctx} />
    </FormProvider>
  )
}

function formValues(actions: MonsterActionDraftRow[]): MonsterFormValues {
  const values = resolveMonsterCreateDefaultValues()
  values.name = 'Scout'
  values.actions = actions
  return values
}

function threshold() {
  return screen.getByRole('spinbutton', { name: /Recharges on/ })
}

function rowButton(title: string) {
  return screen.getByRole('button', {
    name: (name) => name.startsWith(title) && !name.startsWith('Actions'),
  })
}

describe('monster action recharge editor', () => {
  it('keeps a breath weapon threshold visible after the recharge is cleared', async () => {
    const user = userEvent.setup()
    const formRef: { current: UseFormReturn<MonsterFormValues> | null } = { current: null }
    const dirtyRef = { current: false }
    render(
      <Host
        formRef={formRef}
        dirtyRef={dirtyRef}
        values={formValues([
          {
            id: 'breath',
            kind: 'save',
            preset: 'breath-weapon',
            name: 'Fire Breath',
            limitedUse: { kind: 'recharge', minRoll: 5 },
          },
        ])}
      />,
    )

    await user.click(rowButton('Fire Breath'))
    expect(threshold()).toHaveValue(5)
    expect(screen.queryByRole('button', { name: 'Add recharge' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Remove Recharges on' }))
    await waitFor(() => {
      expect(formRef.current!.getValues('actions.0.limitedUse')).toBeUndefined()
    })
    expect(threshold()).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add recharge' })).not.toBeInTheDocument()
    expect(dirtyRef.current).toBe(true)

    fireEvent.change(threshold(), { target: { value: '' } })
    expect(formRef.current!.getValues('actions.0.limitedUse')).toBeUndefined()

    formRef.current!.reset()
    await waitFor(() => {
      expect(formRef.current!.getValues('actions.0.limitedUse')).toEqual({
        kind: 'recharge',
        minRoll: 5,
      })
    })
    expect(threshold()).toHaveValue(5)
  })

  it('adds, edits, and removes an optional bite recharge without copying it to another row', async () => {
    const user = userEvent.setup()
    const formRef: { current: UseFormReturn<MonsterFormValues> | null } = { current: null }
    const dirtyRef = { current: false }
    render(
      <Host
        formRef={formRef}
        dirtyRef={dirtyRef}
        values={formValues([
          {
            id: 'bite',
            kind: 'natural-weapon',
            name: 'Bite',
            mode: 'melee',
            damageType: 'piercing',
          },
          {
            id: 'claw',
            kind: 'natural-weapon',
            name: 'Claw',
            mode: 'melee',
            damageType: 'slashing',
          },
        ])}
      />,
    )

    await user.click(rowButton('Bite'))
    await user.click(screen.getByRole('button', { name: 'Add recharge' }))
    await waitFor(() => {
      expect(formRef.current!.getValues('actions.0.limitedUse')).toEqual({
        kind: 'recharge',
        minRoll: 5,
      })
    })
    expect(dirtyRef.current).toBe(true)

    fireEvent.change(threshold(), { target: { value: '1' } })
    expect(formRef.current!.getValues('actions.0.limitedUse')).toEqual({
      kind: 'recharge',
      minRoll: 5,
    })

    fireEvent.change(threshold(), { target: { value: '6' } })
    expect(formRef.current!.getValues('actions.0.limitedUse')).toEqual({
      kind: 'recharge',
      minRoll: 6,
    })

    await user.click(rowButton('Claw'))
    expect(screen.getByRole('button', { name: 'Add recharge' })).toBeInTheDocument()
    expect(formRef.current!.getValues('actions.0.limitedUse')).toEqual({
      kind: 'recharge',
      minRoll: 6,
    })
    expect(formRef.current!.getValues('actions.1.limitedUse')).toBeUndefined()

    await user.click(rowButton('Bite'))
    await user.click(screen.getByRole('button', { name: 'Remove Recharges on' }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Add recharge' })).toBeInTheDocument()
    })
    expect(formRef.current!.getValues('actions.0.limitedUse')).toBeUndefined()
    expect(formRef.current!.getValues('actions.1.limitedUse')).toBeUndefined()
  })

  it('leaves a stored uses limit in place until the author adds a recharge', async () => {
    const user = userEvent.setup()
    const formRef: { current: UseFormReturn<MonsterFormValues> | null } = { current: null }
    const uses = {
      kind: 'uses' as const,
      count: { kind: 'fixed' as const, value: 2 },
      recovery: { minimumRest: 'long' as const },
    }
    render(
      <Host
        formRef={formRef}
        dirtyRef={{ current: false }}
        values={formValues([
          {
            id: 'bite',
            kind: 'natural-weapon',
            name: 'Bite',
            mode: 'melee',
            damageType: 'piercing',
            limitedUse: uses,
          },
        ])}
      />,
    )

    await user.click(rowButton('Bite'))
    expect(screen.getByRole('button', { name: 'Add recharge' })).toBeInTheDocument()
    const saved = normalizeMonsterFormValues(formRef.current!.getValues(), {
      intent: 'draft',
      mode: 'create',
    })
    expect((saved.actions as { limitedUse?: unknown }[])[0]?.limitedUse).toEqual(uses)

    await user.click(screen.getByRole('button', { name: 'Add recharge' }))
    await waitFor(() => {
      expect(formRef.current!.getValues('actions.0.limitedUse')).toEqual({
        kind: 'recharge',
        minRoll: 5,
      })
    })
  })

  it('keeps a weapon limit that the editor does not show', () => {
    const formRef: { current: UseFormReturn<MonsterFormValues> | null } = { current: null }
    const limitedUse = { kind: 'recharge' as const, minRoll: 5 }
    render(
      <Host
        formRef={formRef}
        dirtyRef={{ current: false }}
        values={formValues([
          { id: 'sword', kind: 'weapon', equipmentEntryId: 'sword', limitedUse },
        ])}
      />,
    )
    expect(formRef.current!.getValues('actions.0.limitedUse')).toEqual(limitedUse)
    const saved = normalizeMonsterFormValues(formRef.current!.getValues(), {
      intent: 'draft',
      mode: 'create',
    })
    expect((saved.actions as { limitedUse?: unknown }[])[0]?.limitedUse).toEqual(limitedUse)
  })
})
