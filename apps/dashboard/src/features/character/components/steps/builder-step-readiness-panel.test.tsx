import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { characterBuilderStepReadinessMessages, formatFieldMessage } from '@rpg/contracts'

import { BuilderStepReadinessPanel } from './builder-step-readiness-panel.client'

describe('BuilderStepReadinessPanel', () => {
  it('renders a partial-block info alert with helper text', () => {
    render(
      <BuilderStepReadinessPanel
        state={{
          readiness: 'blocked',
          classDependentBlocked: true,
          message: formatFieldMessage(
            characterBuilderStepReadinessMessages.proficienciesBlockedNoClass(),
          ),
          helperText: formatFieldMessage(
            characterBuilderStepReadinessMessages.proficienciesBlockedNoClassHelper(),
          ),
        }}
      />,
    )

    expect(
      screen.getByText('Choose a class before selecting class proficiencies.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Class selection determines saving throws, armor, weapons, tools, and skill choices.',
      ),
    ).toBeInTheDocument()
  })

  it('renders muted copy for non-partial readiness states', () => {
    render(
      <BuilderStepReadinessPanel
        state={{
          readiness: 'notApplicable',
          message: formatFieldMessage(
            characterBuilderStepReadinessMessages.spellsNotApplicableNoSpellcasting({
              className: 'Fighter',
            }),
          ),
        }}
      />,
    )

    expect(screen.getByText('Fighter does not have spellcasting.')).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <BuilderStepReadinessPanel
        state={{
          readiness: 'blocked',
          classDependentBlocked: true,
          message: formatFieldMessage(
            characterBuilderStepReadinessMessages.proficienciesBlockedNoClass(),
          ),
          helperText: formatFieldMessage(
            characterBuilderStepReadinessMessages.proficienciesBlockedNoClassHelper(),
          ),
        }}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
