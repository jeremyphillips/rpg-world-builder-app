import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DndContext } from '@dnd-kit/core'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { abilitiesFormCopy } from '../../../../../lib/steps/abilities-form-labels'
import { FIXED_SCORES_DND_KINDS } from '../../../../../lib/steps/fixed-scores-dnd.lib'
import { ScoreToken } from './score-token.client'

function renderScoreToken(ui: ReactElement) {
  return render(<DndContext>{ui}</DndContext>)
}

describe('ScoreToken', () => {
  it('renders pool token with button role and token surface', () => {
    renderScoreToken(
      <ScoreToken
        value={15}
        size="pool"
        surface="token"
        interactive
        dndId="pool:15"
        dndData={{ kind: FIXED_SCORES_DND_KINDS.pool, score: 15 }}
      />,
    )

    const token = screen.getByRole('button', { name: 'Score 15' })
    expect(token).toHaveClass('bg-secondary', 'border-border', 'cursor-grab')
    expect(token).toHaveTextContent('15')
  })

  it('renders assigned plain score without token surface at rest', () => {
    renderScoreToken(
      <ScoreToken
        value={14}
        size="assigned"
        surface="plain"
        interactive
        ariaLabel="Dexterity score 14"
        dndId="assigned:dex"
        dndData={{ kind: FIXED_SCORES_DND_KINDS.assigned, ability: 'dex', score: 14 }}
      />,
    )

    const token = screen.getByRole('button', { name: 'Dexterity score 14' })
    expect(token).toHaveClass('bg-transparent', 'px-0', 'w-fit', 'hover:px-4', 'hover:py-2')
    expect(token).not.toHaveClass('bg-secondary', 'px-4')
    expect(token).toHaveClass('cursor-grab')
  })

  it('renders placeholder without grab affordance or button role', () => {
    renderScoreToken(
      <ScoreToken
        label={abilitiesFormCopy.dropScoreHere}
        size="assigned"
        surface="placeholder"
        interactive={false}
      />,
    )

    expect(screen.getByText(abilitiesFormCopy.dropScoreHere)).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.getByText(abilitiesFormCopy.dropScoreHere)).not.toHaveClass('cursor-grab')
  })

  it('hides the drag source visually while keeping it mounted', () => {
    renderScoreToken(
      <ScoreToken
        value={14}
        size="assigned"
        surface="plain"
        interactive
        sourceHidden
        ariaLabel="Dexterity score 14"
        dndId="assigned:dex"
        dndData={{ kind: FIXED_SCORES_DND_KINDS.assigned, ability: 'dex', score: 14 }}
      />,
    )

    const token = screen.getByRole('button', { name: 'Dexterity score 14' })
    expect(token).toHaveClass('invisible', 'opacity-0')
    expect(token).not.toHaveClass('bg-secondary')
  })

  it('applies token surface when dragging assigned score', () => {
    renderScoreToken(
      <ScoreToken
        value={14}
        size="assigned"
        surface="plain"
        interactive
        dragging
        ariaLabel="Dexterity score 14"
        dndId="assigned:dex"
        dndData={{ kind: FIXED_SCORES_DND_KINDS.assigned, ability: 'dex', score: 14 }}
      />,
    )

    const token = screen.getByRole('button', { name: 'Dexterity score 14' })
    expect(token).toHaveClass('bg-secondary', 'border-border', 'opacity-40', 'px-4', 'py-2')
  })

  it('renders drag overlay with token surface and no button role', () => {
    const { container } = renderScoreToken(
      <ScoreToken value={15} size="pool" surface="token" dragOverlay interactive={false} />,
    )

    const token = container.querySelector('[aria-hidden="true"]')
    expect(token).toHaveClass('bg-secondary', 'shadow-lg', 'pointer-events-none')
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('does not wire interactivity when value is missing', () => {
    renderScoreToken(
      <ScoreToken
        label="Drop score here"
        size="assigned"
        surface="placeholder"
        interactive
        dndId="pool:15"
        dndData={{ kind: FIXED_SCORES_DND_KINDS.pool, score: 15 }}
      />,
    )

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = renderScoreToken(
      <div className="flex gap-4">
        <ScoreToken
          value={15}
          size="pool"
          surface="token"
          interactive
          dndId="pool:15"
          dndData={{ kind: FIXED_SCORES_DND_KINDS.pool, score: 15 }}
        />
        <ScoreToken
          value={14}
          size="assigned"
          surface="plain"
          interactive
          ariaLabel="Dexterity score 14"
          dndId="assigned:dex"
          dndData={{ kind: FIXED_SCORES_DND_KINDS.assigned, ability: 'dex', score: 14 }}
        />
        <ScoreToken
          label={abilitiesFormCopy.dropScoreHere}
          size="assigned"
          surface="placeholder"
          interactive={false}
        />
      </div>,
    )

    await expectNoAxeViolations(container)
  })
})
