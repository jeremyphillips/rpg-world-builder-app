/**
 * @vitest-environment jsdom
 */
import { useEffect } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useController, FormProvider, useForm, type UseFormReturn } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import { buildSeedDamageTypeVocabulary } from '@/features/vocabulary'
import { pickEquipment } from '@/test/fixtures/pick'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import type { MonsterActionDraftRow } from '../../lib/actions/monster-action-presets'
import {
  resolveMonsterCreateDefaultValues,
  type MonsterFormValues,
} from '../../lib/monster-form-values'
import { MonsterActionSections } from './monster-action-sections'

const shortbow = pickEquipment('shortbow')

const weapon: MonsterActionDraftRow = {
  id: 'shot',
  kind: 'weapon',
  equipmentEntryId: 'bow',
  description: '<p>Keen</p>',
  damage: { dice: { count: 2, faces: 6 } },
  onHit: {
    effects: [{ kind: 'damage', damageType: 'fire', roll: { dice: { count: 1, faces: 4 } } }],
  },
}

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

function Host({ formRef }: { formRef: { current: UseFormReturn<MonsterFormValues> | null } }) {
  const values = resolveMonsterCreateDefaultValues()
  values.equipment = [{ entryId: 'bow', equipmentId: shortbow.id, quantity: 1, equipped: true }]
  values.actions = [
    weapon,
    { id: 'parry', kind: 'special', name: 'Parry', description: '<p>Block</p>' },
  ]
  const form = useForm<MonsterFormValues>({ shouldUnregister: true, defaultValues: values })
  useEffect(() => {
    formRef.current = form
  })
  const ctx = {
    entityCatalogLayer: 'homebrew',
    equipmentCatalogStatus: 'ready',
    equipmentCatalogById: new Map([[shortbow.id, shortbow]]),
    damageTypeVocabulary: buildSeedDamageTypeVocabulary(),
  } as ContentFormCtx
  return (
    <FormProvider {...form}>
      {RETAINED_FORM_PATHS.map((name) => (
        <RetainedMonsterPath key={name} name={name} />
      ))}
      <MonsterActionSections ctx={ctx} />
    </FormProvider>
  )
}

function shot(values: MonsterFormValues): MonsterActionDraftRow | undefined {
  return values.actions.find((row) => row.id === 'shot') as MonsterActionDraftRow | undefined
}

describe('monster action field order form state', () => {
  it('keeps weapon details across row switches and tracks a damage edit', async () => {
    const user = userEvent.setup()
    const formRef: { current: UseFormReturn<MonsterFormValues> | null } = { current: null }
    render(<Host formRef={formRef} />)

    const onHitHint = await screen.findByText(
      'Effects that apply when this attack hits, beyond its primary damage.',
    )
    const details = screen.getByRole('button', { name: 'Remove Additional details' })
    expect(
      onHitHint.compareDocumentPosition(details) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(shot(formRef.current!.getValues())).toMatchObject({
      description: '<p>Keen</p>',
      damage: { dice: { count: 2, faces: 6 } },
      onHit: {
        effects: [{ kind: 'damage', damageType: 'fire', roll: { dice: { count: 1, faces: 4 } } }],
      },
    })

    await user.click(screen.getByRole('button', { name: /Parry/i }))
    await user.click(screen.getByRole('button', { name: new RegExp(shortbow.name, 'i') }))
    expect(shot(formRef.current!.getValues())).toMatchObject({
      description: '<p>Keen</p>',
      damage: { dice: { count: 2, faces: 6 } },
      onHit: {
        effects: [{ kind: 'damage', damageType: 'fire', roll: { dice: { count: 1, faces: 4 } } }],
      },
    })

    await user.click(screen.getByRole('button', { name: 'Remove Additional details' }))
    await waitFor(() => {
      expect(shot(formRef.current!.getValues())).toMatchObject({ description: '' })
      expect(formRef.current!.getFieldState('actions.0.description').isDirty).toBe(true)
    })
    expect(shot(formRef.current!.getValues())).toMatchObject({
      damage: { dice: { count: 2, faces: 6 } },
      onHit: {
        effects: [{ kind: 'damage', damageType: 'fire', roll: { dice: { count: 1, faces: 4 } } }],
      },
    })
    await user.click(screen.getByRole('button', { name: 'Add additional details' }))
    expect(screen.getByRole('textbox', { name: 'Additional details' })).toBeInTheDocument()
  })
})
