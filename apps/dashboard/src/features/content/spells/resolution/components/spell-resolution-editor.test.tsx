import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { describe, expect, it } from 'vitest'

import { buildSeedDamageTypeVocabulary } from '@/features/homebrew'

import { makeContentFormCtx } from '../../../lib/fixtures/content-form-ctx'
import {
  RESOLUTION_NOT_SAVED_BANNER,
  SpellResolutionEditor,
} from '../components/spell-resolution-editor.client'
import { RESOLUTION_FORM_FIXTURES } from '../lib/resolution-fixtures'

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
      expect(screen.getAllByText('Check').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Effects').length).toBeGreaterThan(0)
    })
  })

  it('does not render Outcomes editing for configured resolution', async () => {
    render(
      <SpellResolutionEditor
        formCtx={formCtx}
        defaultResolution={RESOLUTION_FORM_FIXTURES.inflictWounds}
      />,
    )

    await waitFor(() => {
      expect(screen.getAllByText('Effects').length).toBeGreaterThan(0)
      expect(screen.queryByText('Outcomes are generated')).not.toBeInTheDocument()
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
