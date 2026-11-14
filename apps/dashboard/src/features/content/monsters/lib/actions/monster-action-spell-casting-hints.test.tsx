import { PRIMARY_SPELLCASTING_PROFILE, MONSTER_SPELLCASTING_ACTION_NAME } from '@rpg/contracts'
import { FormItems } from '@rpg/ui/form'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { beforeAll, describe, expect, it } from 'vitest'

import { buildSeedDamageTypeVocabulary } from '@/features/vocabulary'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import {
  MONSTER_ATTACK_BONUS_SOURCE_SPELL_HINT,
  MONSTER_ATTACK_BONUS_SOURCE_SPELL_LABEL,
} from '../monster-form-labels'
import {
  SPELLCASTING_ABILITY_PRIMARY_HINT,
  SPELLCASTING_ABILITY_SHARED_HINT,
} from '../../../lib/forms/mechanics/spellcasting-ability-field-copy'
import { resolveMonsterCreateDefaultValues, type MonsterFormValues } from '../monster-form-values'
import { monsterActionDetailFields } from './monster-action-detail-fields'
import type { MonsterActionDraftRow } from './monster-action-presets'

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

function ActionDetailHost({
  action,
  section,
}: {
  action: MonsterActionDraftRow
  section: 'actions' | 'bonusActions' | 'reactions'
}) {
  const defaults = resolveMonsterCreateDefaultValues()
  defaults[section] = [action]
  const form = useForm<MonsterFormValues>({ defaultValues: defaults, shouldUnregister: true })
  const namePrefix = `${section}.0`

  return (
    <FormProvider {...form}>
      <FormItems
        items={monsterActionDetailFields({
          ctx,
          action,
          section,
          namePrefix,
          equipmentOptions: [],
          sharedCastingOptions: [],
        })}
        idPrefix="action"
        namePrefix={namePrefix}
      />
    </FormProvider>
  )
}

function renderActionDetail(
  action: MonsterActionDraftRow,
  section: 'actions' | 'bonusActions' | 'reactions',
) {
  return render(<ActionDetailHost action={action} section={section} />)
}

describe('monsterActionSpellMechanics spellcasting hints', () => {
  it('shows the primary hint on the Actions Spellcasting profile', () => {
    renderActionDetail(
      {
        id: 'spellcasting',
        kind: 'spell',
        profile: PRIMARY_SPELLCASTING_PROFILE,
        name: MONSTER_SPELLCASTING_ACTION_NAME,
        spells: [],
      },
      'actions',
    )
    expect(screen.getByText(SPELLCASTING_ABILITY_PRIMARY_HINT)).toBeInTheDocument()
    expect(screen.queryByText(SPELLCASTING_ABILITY_SHARED_HINT)).not.toBeInTheDocument()
  })

  it('shows the shared hint on a standalone spell action', () => {
    renderActionDetail(
      {
        id: 'invisibility',
        kind: 'spell',
        name: 'Invisibility',
        spells: [],
      },
      'actions',
    )
    expect(screen.getByText(SPELLCASTING_ABILITY_SHARED_HINT)).toBeInTheDocument()
    expect(screen.queryByText(SPELLCASTING_ABILITY_PRIMARY_HINT)).not.toBeInTheDocument()
  })

  it('shows the shared hint on bonus action and reaction spell rows', () => {
    const spell = { id: 'shield', kind: 'spell' as const, spells: [] as const }

    const { unmount } = renderActionDetail(spell, 'bonusActions')
    expect(screen.getByText(SPELLCASTING_ABILITY_SHARED_HINT)).toBeInTheDocument()
    unmount()

    renderActionDetail({ ...spell, id: 'counterspell' }, 'reactions')
    expect(screen.getByText(SPELLCASTING_ABILITY_SHARED_HINT)).toBeInTheDocument()
  })

  it('keeps attack spellcasting overrides separate from spell-action hints', async () => {
    const user = userEvent.setup()
    renderActionDetail(
      {
        id: 'rays',
        kind: 'attack',
        name: 'Eye rays',
        damage: { dice: { count: 1, faces: 6 } },
      },
      'actions',
    )

    await user.click(screen.getByRole('combobox', { name: 'Attack bonus' }))
    await user.click(
      await screen.findByRole('option', { name: MONSTER_ATTACK_BONUS_SOURCE_SPELL_LABEL }),
    )

    expect(screen.getByText(MONSTER_ATTACK_BONUS_SOURCE_SPELL_HINT)).toBeInTheDocument()
    expect(screen.getByText(SPELLCASTING_ABILITY_SHARED_HINT)).toBeInTheDocument()
    expect(screen.queryByText(SPELLCASTING_ABILITY_PRIMARY_HINT)).not.toBeInTheDocument()
  })
})
