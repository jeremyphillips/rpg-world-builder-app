import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

import {
  createPopulatedStandaloneBuilderContextFixture,
  createStandaloneBuilderCatalogIndexFixture,
} from '../../../lib/fixtures/character-builder-fixtures'
import {
  buildCharacterDetailViewModel,
  toCharacterDetailSource,
} from '../../../lib/display/character-display'
import { SAMPLE_PC } from '../../../lib/fixtures/character-fixtures'
import { CharacterDetailAbilitiesRow } from './character-detail-abilities-row'

const context = createPopulatedStandaloneBuilderContextFixture()
const catalogIndex = createStandaloneBuilderCatalogIndexFixture(context)
const viewModel = buildCharacterDetailViewModel({
  source: toCharacterDetailSource(SAMPLE_PC),
  catalogIndex,
  rules: context.characterCreationRules,
  xpProgression: { entries: [{ level: 1, xpRequired: 0 }] },
})

describe('CharacterDetailAbilitiesRow', () => {
  it('renders read-only ability cards without steppers', () => {
    render(<CharacterDetailAbilitiesRow abilities={viewModel.abilities} />)

    expect(screen.getAllByRole('article')).toHaveLength(6)
    expect(screen.queryByRole('button', { name: /Increase/i })).not.toBeInTheDocument()
    const tray = screen.getAllByRole('article')[0]?.closest('.w-fit')
    expect(tray).toHaveClass('rounded-md', 'border')
    expect(tray).not.toHaveClass('ui-card', 'p-3')
  })

  it('renders numeric editors when an editor is provided', () => {
    render(
      <CharacterDetailAbilitiesRow
        abilities={viewModel.abilities}
        abilityScoreEditor={{
          abilityScores: SAMPLE_PC.abilityScores,
          onCommit: vi.fn(),
          isAbilityPending: () => false,
        }}
      />,
    )

    expect(screen.getAllByRole('button', { name: /Increase/i }).length).toBeGreaterThan(0)
  })
})
