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
import { MonsterActionSpellSummary } from './monster-action-spell-summary'

const spellcasting: MonsterActionDraftRow = {
  id: 'spellcasting',
  kind: 'spell',
  profile: 'primary',
  name: 'Spellcasting',
  castingAbility: { kind: 'ability', ability: 'int' },
  spells: [{ spellId: 'srd-cc-5.2.1:mage-hand' }],
}

function Host() {
  const form = useForm<MonsterFormValues>({
    defaultValues: {
      ...resolveMonsterCreateDefaultValues(),
      name: 'Mage',
      challengeRating: '5',
      abilityScores: { str: 10, dex: 10, con: 10, int: 18, wis: 10, cha: 10 },
      actions: [spellcasting],
    },
  })
  const ctx = {
    entityCatalogLayer: 'homebrew',
    equipmentCatalogStatus: 'ready',
    equipmentCatalogById: new Map(),
    spellCatalogStatus: 'ready',
    spellCatalogById: new Map([
      ['srd-cc-5.2.1:mage-hand', { id: 'srd-cc-5.2.1:mage-hand', name: 'Mage Hand' }],
    ]),
    armorClassRules: { mode: 'ascending', base: 10 },
    options: { skills: { visible: [] } },
    rulesetId: 'srd-cc-5.2.1',
  } as ContentFormCtx
  return (
    <FormProvider {...form}>
      <MonsterActionSpellSummary ctx={ctx} action={spellcasting} section="actions" />
    </FormProvider>
  )
}

describe('MonsterActionSpellSummary', () => {
  it('renders spellcasting preview prose', () => {
    render(<Host />)
    expect(screen.getByText('Spellcasting preview')).toBeInTheDocument()
    expect(screen.getByText('Mage Hand')).toBeInTheDocument()
  })
})
