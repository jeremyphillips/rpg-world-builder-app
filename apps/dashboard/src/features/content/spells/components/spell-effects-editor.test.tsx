import { render, screen, waitFor } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { describe, expect, it } from 'vitest'

import { buildSeedDamageTypeVocabulary } from '@/features/vocabulary'

import { makeContentFormCtx } from '../../lib/fixtures/content-form-ctx'
import { SPELL_EFFECT_FIXTURES } from '../lib/effects/effect-fixtures'
import { EFFECTS_NOT_SAVED_BANNER, SpellEffectsEditor } from './spell-effects-editor.client'

const formCtx = makeContentFormCtx({
  damageTypeVocabulary: buildSeedDamageTypeVocabulary(),
})

describe('SpellEffectsEditor', () => {
  it('shows persistence banner and add-effect control', async () => {
    render(<SpellEffectsEditor formCtx={formCtx} />)

    expect(screen.getByText(EFFECTS_NOT_SAVED_BANNER)).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add effect/i })).toBeInTheDocument()
    })
  })

  it('renders preview lines for populated effects', async () => {
    render(
      <SpellEffectsEditor formCtx={formCtx} defaultEffects={[...SPELL_EFFECT_FIXTURES.fireBolt]} />,
    )

    await waitFor(() => {
      expect(screen.getAllByText('Inflicts 1d10 Fire damage.').length).toBeGreaterThan(0)
    })
    expect(screen.getByText('Partially modeled')).toBeInTheDocument()
  })

  it('has no axe accessibility violations when empty', async () => {
    const { container } = render(<SpellEffectsEditor formCtx={formCtx} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add effect/i })).toBeInTheDocument()
    })

    await expectNoAxeViolations(container)
  })

  it('has no axe accessibility violations with representative effects', async () => {
    const { container } = render(
      <SpellEffectsEditor
        formCtx={formCtx}
        defaultEffects={[...SPELL_EFFECT_FIXTURES.magicMissile]}
      />,
    )

    await waitFor(() => {
      expect(screen.getAllByText('Creates 3 darts.').length).toBeGreaterThan(0)
    })

    await expectNoAxeViolations(container)
  })
})
