import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { describe, expect, it } from 'vitest'

import { buildSeedDamageTypeVocabulary } from '@/features/homebrew'

import { makeContentFormCtx } from '../../../../lib/fixtures/content-form-ctx'
import { RESOLUTION_FORM_FIXTURES } from '../../fixtures'
import { RESOLUTION_SECTION_LABELS } from '../../lib/form/resolution-form-labels'
import {
  RESOLUTION_NOT_SAVED_BANNER,
  SpellResolutionEditor,
} from './spell-resolution-editor.client'

const formCtx = makeContentFormCtx({
  damageTypeVocabulary: buildSeedDamageTypeVocabulary(),
})

describe('SpellResolutionEditor', () => {
  it('shows persistence banner and add-resolution control when empty', async () => {
    render(<SpellResolutionEditor formCtx={formCtx} />)

    expect(screen.getByText(RESOLUTION_NOT_SAVED_BANNER)).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add resolution/i })).toBeInTheDocument()
    })
  })

  it('renders preview sections for eldritch blast fixture', async () => {
    render(
      <SpellResolutionEditor
        formCtx={formCtx}
        defaultResolution={RESOLUTION_FORM_FIXTURES.eldritchBlast}
      />,
    )

    await waitFor(() => {
      expect(screen.getAllByText('Ranged spell attack').length).toBeGreaterThan(0)
      expect(screen.getAllByText('1d10 Force damage').length).toBeGreaterThan(0)
    })
  })

  it('renders grant-style effect rows with application label and damage fields', async () => {
    render(
      <SpellResolutionEditor
        formCtx={formCtx}
        defaultResolution={RESOLUTION_FORM_FIXTURES.eldritchBlast}
      />,
    )

    await waitFor(() => {
      expect(screen.getAllByText('Effects').length).toBeGreaterThan(0)
      expect(screen.getByText('Applied once')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /(Collapse|Expand) Effects · Damage/ }),
      ).toBeInTheDocument()
      expect(screen.getByText('Inflicts 1d10 Force damage.')).toBeInTheDocument()
    })
  })

  it('shows chill touch additional behavior in preview', async () => {
    render(
      <SpellResolutionEditor
        formCtx={formCtx}
        defaultResolution={RESOLUTION_FORM_FIXTURES.chillTouch}
      />,
    )

    await waitFor(() => {
      expect(screen.getAllByText(/can't regain Hit Points/i).length).toBeGreaterThan(0)
    })
  })

  it('adds resolution from empty state', async () => {
    const user = userEvent.setup()
    render(<SpellResolutionEditor formCtx={formCtx} />)

    await user.click(screen.getByRole('button', { name: /add resolution/i }))

    await waitFor(() => {
      expect(screen.getAllByText('Target').length).toBeGreaterThan(0)
      expect(screen.getAllByText('How it resolves').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Effects').length).toBeGreaterThan(0)
    })
  })

  it('renders read-only outcomes preview for inflict wounds fixture', async () => {
    render(
      <SpellResolutionEditor
        formCtx={formCtx}
        defaultResolution={RESOLUTION_FORM_FIXTURES.inflictWounds}
      />,
    )

    await waitFor(() => {
      expect(screen.getAllByText(RESOLUTION_SECTION_LABELS.outcomes).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/Failed save/i).length).toBeGreaterThan(0)
    })
  })

  it('has no axe accessibility violations when empty', async () => {
    const { container } = render(<SpellResolutionEditor formCtx={formCtx} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add resolution/i })).toBeInTheDocument()
    })

    await expectNoAxeViolations(container)
  })

  it('has no axe accessibility violations with eldritch blast fixture', async () => {
    const { container } = render(
      <SpellResolutionEditor
        formCtx={formCtx}
        defaultResolution={RESOLUTION_FORM_FIXTURES.eldritchBlast}
      />,
    )

    await waitFor(() => {
      expect(screen.getAllByText('Ranged spell attack').length).toBeGreaterThan(0)
    })

    await expectNoAxeViolations(container)
  })

  it('has no axe accessibility violations with chill touch fixture', async () => {
    const { container } = render(
      <SpellResolutionEditor
        formCtx={formCtx}
        defaultResolution={RESOLUTION_FORM_FIXTURES.chillTouch}
      />,
    )

    await waitFor(() => {
      expect(screen.getAllByText(/can't regain Hit Points/i).length).toBeGreaterThan(0)
    })

    await expectNoAxeViolations(container)
  })

  it('renders magic missile automatic projectiles and applied-per-dart effects label', async () => {
    render(
      <SpellResolutionEditor
        formCtx={formCtx}
        defaultResolution={RESOLUTION_FORM_FIXTURES.magicMissile}
      />,
    )

    await waitFor(() => {
      expect(screen.getAllByText('Automatic').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Projectiles').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Creates 3 darts.').length).toBeGreaterThan(0)
      expect(screen.getByText('Applied per dart')).toBeInTheDocument()
      expect(screen.getAllByText('1d4+1 Force damage').length).toBeGreaterThan(0)
    })
  })

  it('has no axe accessibility violations with magic missile fixture', async () => {
    const { container } = render(
      <SpellResolutionEditor
        formCtx={formCtx}
        defaultResolution={RESOLUTION_FORM_FIXTURES.magicMissile}
      />,
    )

    await waitFor(() => {
      expect(screen.getByText('Applied per dart')).toBeInTheDocument()
    })

    await expectNoAxeViolations(container)
  })

  it('has no axe accessibility violations with inflict wounds fixture', async () => {
    const { container } = render(
      <SpellResolutionEditor
        formCtx={formCtx}
        defaultResolution={RESOLUTION_FORM_FIXTURES.inflictWounds}
      />,
    )

    await waitFor(() => {
      expect(screen.getAllByText('Constitution saving throw').length).toBeGreaterThan(0)
    })

    await expectNoAxeViolations(container)
  })
})
