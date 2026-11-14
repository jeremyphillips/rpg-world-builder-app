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
import { MonsterActionMultiattackSummary } from './monster-action-multiattack-summary'

const bite: MonsterActionDraftRow = {
  id: 'bite',
  kind: 'natural-weapon',
  name: 'Bite',
  mode: 'melee',
  damageType: 'piercing',
  damage: { dice: { count: 1, faces: 8 } },
}

const multiattack: MonsterActionDraftRow = {
  id: 'multiattack',
  kind: 'multiattack',
  name: 'Multiattack',
  steps: [{ count: 1, actionIds: ['bite'] }],
}

function Host() {
  const form = useForm<MonsterFormValues>({
    defaultValues: {
      ...resolveMonsterCreateDefaultValues(),
      name: 'Wolf',
      actions: [bite, multiattack],
    },
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
  } as ContentFormCtx
  return (
    <FormProvider {...form}>
      <MonsterActionMultiattackSummary ctx={ctx} action={multiattack} />
    </FormProvider>
  )
}

describe('MonsterActionMultiattackSummary', () => {
  it('renders multiattack preview prose', () => {
    render(<Host />)
    expect(screen.getByText('Multiattack preview')).toBeInTheDocument()
    expect(screen.getByText(/bite attack/i)).toBeInTheDocument()
  })
})
