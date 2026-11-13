/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import type { MonsterActionDraftRow } from '../../lib/actions/monster-action-presets'
import {
  resolveMonsterCreateDefaultValues,
  type MonsterFormValues,
} from '../../lib/monster-form-values'
import { MonsterActionParrySummary } from './monster-action-parry-summary'

const parry: MonsterActionDraftRow = {
  id: 'parry',
  kind: 'parry',
  name: 'Parry',
  acBonus: 2,
  followUpActionId: 'rapier',
}

function Host({ reactions }: { reactions: MonsterFormValues['reactions'] }) {
  const form = useForm<MonsterFormValues>({
    defaultValues: {
      ...resolveMonsterCreateDefaultValues(),
      name: 'Pirate Captain',
      actions: [{ id: 'rapier', kind: 'attack', name: 'Rapier' }],
      reactions,
    },
  })
  const ctx = {
    entityCatalogLayer: 'homebrew',
    equipmentCatalogStatus: 'ready',
    equipmentCatalogById: new Map(),
    armorClassRules: { mode: 'ascending', base: 10 },
    options: { skills: { visible: [] } },
    rulesetId: 'srd-cc-5.2.1',
  } as ContentFormCtx
  return (
    <FormProvider {...form}>
      <MonsterActionParrySummary ctx={ctx} action={reactions?.[0] ?? parry} />
    </FormProvider>
  )
}

describe('MonsterActionParrySummary', () => {
  it('previews the generated trigger and response', () => {
    render(<Host reactions={[parry]} />)
    expect(screen.getByText('Reaction preview')).toBeInTheDocument()
    expect(screen.getByText(/The pirate captain is hit by a melee attack roll/)).toBeInTheDocument()
    expect(
      screen.getByText(/adds 2 to its AC against that attack.*makes one Rapier attack/),
    ).toBeInTheDocument()
  })

  it('shows the trigger without a response until the bonus is a whole number', () => {
    render(<Host reactions={[{ id: 'parry', kind: 'parry', name: 'Parry' }]} />)
    expect(screen.getByText('Reaction preview')).toBeInTheDocument()
    expect(screen.getByText(/while holding a weapon/)).toBeInTheDocument()
    expect(screen.queryByText(/Response:/)).not.toBeInTheDocument()
  })
})
