/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { describe, expect, it } from 'vitest'

import { resolveEffectReferenceById } from '../../lib/form/resolution-effect-reference.lib'
import { ResolutionEffectReferenceTitle } from './resolution-effect-reference-title.client'

describe('ResolutionEffectReferenceTitle', () => {
  it('exposes full plain-text title via native title and aria-label', () => {
    const reference = resolveEffectReferenceById(
      [
        {
          id: 'damage',
          kind: 'damage',
          roll: { dice: { count: 1, faces: 10 } },
          damageType: 'force',
        },
      ],
      'damage',
    )

    render(<ResolutionEffectReferenceTitle reference={reference} id="effect-title" />)

    const title = screen.getByLabelText('Damage — 1d10 Force damage')
    expect(title).toHaveAttribute('title', 'Damage — 1d10 Force damage')
    expect(title).toHaveClass('truncate')
  })

  itAxe('has no axe accessibility violations for resolved and missing references', async () => {
    const resolved = resolveEffectReferenceById(
      [
        {
          id: 'damage',
          kind: 'damage',
          roll: { dice: { count: 1, faces: 10 } },
          damageType: 'force',
        },
      ],
      'damage',
    )
    const missing = resolveEffectReferenceById([], 'missing-id')

    const { container, rerender } = render(
      <ResolutionEffectReferenceTitle reference={resolved} id="effect-title" />,
    )
    await expectNoAxeViolations(container)

    rerender(<ResolutionEffectReferenceTitle reference={missing} id="effect-title" />)
    await expectNoAxeViolations(container)
  })
})
