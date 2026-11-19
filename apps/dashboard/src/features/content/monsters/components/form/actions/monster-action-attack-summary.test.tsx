/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import type { MonsterActionDraftRow } from '../../../lib/actions/monster-action-presets'
import { monsterFormTestValues } from '../../../lib/monster-form-test-values'
import type { MonsterFormValues } from '../../../lib/monster-form-values'
import { MonsterActionAttackSummary } from './monster-action-attack-summary'

const bite: MonsterActionDraftRow = {
  id: 'bite',
  kind: 'natural-weapon',
  name: 'Bite',
  mode: 'melee',
  damageType: 'piercing',
  damage: { dice: { count: 1, faces: 8 } },
  onHit: {
    effects: [{ kind: 'damage', roll: { dice: { count: 1, faces: 6 } }, damageType: 'fire' }],
  },
}

function Host({ action }: { action: MonsterActionDraftRow }) {
  const form = useForm<MonsterFormValues>({
    defaultValues: monsterFormTestValues({
      name: 'Attack summary test',
      challengeRating: '1',
      abilityScores: { str: 16, dex: 14, con: 13, int: 8, wis: 11, cha: 8 },
      actions: [action] as MonsterFormValues['actions'],
    }),
  })
  const ctx = {
    entityCatalogLayer: 'homebrew',
    equipmentCatalogStatus: 'ready',
    equipmentCatalogById: new Map(),
  } as ContentFormCtx

  return (
    <FormProvider {...form}>
      <MonsterActionAttackSummary ctx={ctx} action={action} />
    </FormProvider>
  )
}

describe('MonsterActionAttackSummary', () => {
  it('uses metadata list value emphasis for plain and composite rows', () => {
    render(<Host action={bite} />)

    const list = screen.getByText('Attack').closest('dl')
    expect(list).toHaveClass('ui-metadata-list--emphasis-value')

    const reachValue = screen.getByText('5 ft')
    expect(reachValue.tagName).toBe('DD')
    expect(reachValue).toHaveClass('ui-metadata-list__value')
    expect(reachValue.querySelector('.text-style-body-compact')).toBeNull()
    expect(reachValue.querySelector('.text-style-body')).toBeNull()

    const attackBonus = screen.getByText('+5')
    expect(attackBonus.tagName).toBe('STRONG')
    expect(attackBonus.closest('dd')).toHaveTextContent('STR +3')
    expect(attackBonus.closest('span')?.className).not.toMatch(/text-style-body-compact/)
  })

  it('does not preview a typed attack until a roll is stored', () => {
    const customAttack: MonsterActionDraftRow = {
      id: 'slash',
      kind: 'attack',
      name: 'Slash',
      modes: ['melee'],
      damageType: 'slashing',
      bonusSource: { kind: 'ability', ability: 'str', proficient: true },
    }

    function ReadyHost() {
      const form = useForm<MonsterFormValues>({
        defaultValues: monsterFormTestValues({
          name: 'Ready attack test',
          challengeRating: '1',
          abilityScores: { str: 16, dex: 14, con: 13, int: 8, wis: 11, cha: 8 },
          actions: [customAttack] as MonsterFormValues['actions'],
        }),
      })
      const ctx = {
        entityCatalogLayer: 'homebrew',
        equipmentCatalogStatus: 'ready',
        equipmentCatalogById: new Map(),
      } as ContentFormCtx

      return (
        <FormProvider {...form}>
          <MonsterActionAttackSummary ctx={ctx} action={customAttack} />
        </FormProvider>
      )
    }

    render(<ReadyHost />)

    expect(screen.getByText(/Configure Damage/i)).toBeInTheDocument()
    expect(screen.queryByText('5 ft')).not.toBeInTheDocument()
  })

  it('keeps unavailable guidance inside the attack preview panel', () => {
    const customAttack: MonsterActionDraftRow = {
      id: 'slash',
      kind: 'attack',
      name: 'Slash',
      modes: ['melee'],
      damageType: 'slashing',
      damage: { dice: { count: 1, faces: 6 } },
    }

    function UnavailableHost() {
      const form = useForm<MonsterFormValues>({
        defaultValues: monsterFormTestValues({
          name: 'Unavailable attack test',
          challengeRating: '1',
          abilityScores: { str: 16, dex: 14, con: 13, int: 8, wis: 11, cha: 8 },
          actions: [customAttack] as MonsterFormValues['actions'],
        }),
      })
      const ctx = {
        entityCatalogLayer: 'homebrew',
        equipmentCatalogStatus: 'ready',
        equipmentCatalogById: new Map(),
      } as ContentFormCtx

      return (
        <FormProvider {...form}>
          <MonsterActionAttackSummary ctx={ctx} action={customAttack} />
        </FormProvider>
      )
    }

    render(<UnavailableHost />)

    expect(screen.getByText('Attack preview').closest('.ui-panel')).toHaveClass('ui-panel--subtle')
    expect(screen.getByText('Configure Attack bonus to calculate this attack.')).toBeInTheDocument()
    expect(screen.queryByText(/Attack summary unavailable/i)).not.toBeInTheDocument()
  })

  it('shows a qualified preview title only when the action is form-restricted', () => {
    const restricted: MonsterActionDraftRow = {
      ...bite,
      onlyInFormIds: ['bear'],
    }

    function RestrictedHost() {
      const form = useForm<MonsterFormValues>({
        defaultValues: monsterFormTestValues({
          name: 'Werebear',
          challengeRating: '1',
          abilityScores: { str: 16, dex: 14, con: 13, int: 8, wis: 11, cha: 8 },
          forms: {
            profileFormId: 'profile',
            trueForm: { kind: 'profile' },
            definedForms: [{ id: 'bear', name: 'Bear' }],
          },
          actions: [restricted] as MonsterFormValues['actions'],
        }),
      })
      const ctx = {
        entityCatalogLayer: 'homebrew',
        equipmentCatalogStatus: 'ready',
        equipmentCatalogById: new Map(),
      } as ContentFormCtx

      return (
        <FormProvider {...form}>
          <MonsterActionAttackSummary ctx={ctx} action={restricted} />
        </FormProvider>
      )
    }

    render(<RestrictedHost />)

    const title = screen.getByText('Bite (Bear Form Only)')
    expect(title).toHaveClass('text-style-emphasis')
    expect(title.closest('.ui-panel')).toHaveTextContent('Attack preview')
  })

  it('shows the action name when the action is available in all forms', () => {
    render(<Host action={bite} />)
    const title = screen.getByText('Bite')
    expect(title).toHaveClass('text-style-emphasis')
    expect(title.closest('.ui-panel')).toHaveTextContent('Attack preview')
  })

  it('uses the preset name when the draft has no stored name', () => {
    const preset: MonsterActionDraftRow = {
      id: 'bite',
      kind: 'natural-weapon',
      preset: 'bite',
      mode: 'melee',
      damageType: 'piercing',
      damage: { dice: { count: 1, faces: 8 } },
    }
    render(<Host action={preset} />)
    expect(screen.getByText('Bite')).toHaveClass('text-style-emphasis')
    expect(screen.queryByText('Untitled')).not.toBeInTheDocument()
  })
})
