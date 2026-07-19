import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useCharacterBuilderStore } from '../hooks/use-character-builder-store'
import { CharacterBuilderDraftRestore } from './character-builder-draft-restore.client'

vi.mock('../hooks/use-character-builder-store', () => ({
  useCharacterBuilderStore: vi.fn(),
}))

const mockUseCharacterBuilderStore = vi.mocked(useCharacterBuilderStore)

const context = {
  channel: 'build' as const,
  surface: 'dashboard' as const,
  characterKind: 'pc' as const,
  mode: 'dashboard' as const,
  scope: { type: 'standalone' as const, rulesetId: 'srd-cc-5.2.1' as const },
  rulesScope: { type: 'ruleset' as const, rulesetId: 'srd-cc-5.2.1' as const },
  ownershipTarget: { type: 'user' as const },
}

describe('CharacterBuilderDraftRestore', () => {
  it('shows the restore affordance when a pending draft exists', async () => {
    const continuePreviousDraft = vi.fn()
    const startOver = vi.fn()

    mockUseCharacterBuilderStore.mockImplementation((_ctx, selector) =>
      selector({
        hasPendingRestore: true,
        continuePreviousDraft,
        startOver,
      } as never),
    )

    render(<CharacterBuilderDraftRestore context={context as never} />)

    expect(screen.getByText('Continue your character?')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Continue previous draft' }))
    expect(continuePreviousDraft).toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: 'Start over' }))
    expect(startOver).toHaveBeenCalled()
  })
})
