import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { describe, expect, it, vi, afterEach } from 'vitest'

import { buildSeedDamageTypeVocabulary } from '@/features/homebrew'

import { makeContentFormCtx } from '../../../../lib/fixtures/content-form-ctx'
import { RESOLUTION_FORM_FIXTURES } from '../../fixtures'
import * as resolutionChangeConfirm from '../../hooks/use-resolution-change-confirm.client'
import { RESOLUTION_SECTION_LABELS } from '../../lib/form/resolution-form-labels'
import { SpellResolutionEditor } from './spell-resolution-editor.client'

const formCtx = makeContentFormCtx({
  damageTypeVocabulary: buildSeedDamageTypeVocabulary(),
})

describe('SpellResolutionEditor', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows add-resolution control when empty', async () => {
    render(<SpellResolutionEditor formCtx={formCtx} />)

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
      expect(screen.getByRole('group', { name: /Effects & outcomes/ })).toBeInTheDocument()
      expect(screen.getByRole('group', { name: /^Authored effects/ })).toBeInTheDocument()
      expect(screen.getByText('Applied once per beam')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /(Collapse|Expand) Damage/ })).toBeInTheDocument()
      expect(screen.getByText('Inflicts 1d10 Force damage.')).toBeInTheDocument()
      expect(screen.getAllByRole('button', { name: /Remove Damage/i })).toHaveLength(2)
    })
  })

  it('renders the add effect control after authored effect rows', async () => {
    render(
      <SpellResolutionEditor
        formCtx={formCtx}
        defaultResolution={RESOLUTION_FORM_FIXTURES.eldritchBlast}
      />,
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Collapse Damage/i })).toBeInTheDocument()
    })

    const collapse = screen.getByRole('button', { name: /Collapse Damage/i })
    const addEffect = screen.getByRole('button', { name: /^Add effect$/ })
    expect(
      collapse.compareDocumentPosition(addEffect) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('routes header remove through requestResolutionChange', async () => {
    const requestResolutionChange = vi.fn()
    vi.spyOn(resolutionChangeConfirm, 'useResolutionEditorContext').mockReturnValue({
      requestResolutionChange,
      notice: null,
      clearNotice: vi.fn(),
    })

    const user = userEvent.setup()
    render(
      <SpellResolutionEditor
        formCtx={formCtx}
        defaultResolution={RESOLUTION_FORM_FIXTURES.inflictWounds}
      />,
    )

    await waitFor(() => {
      const authoredEffects = screen.getByRole('group', { name: /^Authored effects/ })
      expect(
        within(authoredEffects).getByRole('button', {
          name: /Remove Damage — 2d10 Necrotic damage/i,
        }),
      ).toBeInTheDocument()
    })

    const authoredEffects = screen.getByRole('group', { name: /^Authored effects/ })
    await user.click(
      within(authoredEffects).getByRole('button', {
        name: /Remove Damage — 2d10 Necrotic damage/i,
      }),
    )

    expect(requestResolutionChange).toHaveBeenCalledWith({
      field: 'removeEffect',
      effectId: 'damage',
    })
  })

  it('keeps header remove available when the effect row is collapsed', async () => {
    const user = userEvent.setup()
    render(
      <SpellResolutionEditor
        formCtx={formCtx}
        defaultResolution={RESOLUTION_FORM_FIXTURES.eldritchBlast}
      />,
    )

    const collapseButton = await screen.findByRole('button', { name: /Collapse Damage/i })
    await user.click(collapseButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Expand Damage/i })).toBeInTheDocument()
      const authoredEffects = screen.getByRole('group', { name: /^Authored effects/ })
      expect(
        within(authoredEffects).getByRole('button', {
          name: /Remove Damage — 1d10 Force damage/i,
        }),
      ).toBeInTheDocument()
    })
  })

  it('shows chill touch additional behavior in outcomes editor', async () => {
    render(
      <SpellResolutionEditor
        formCtx={formCtx}
        defaultResolution={RESOLUTION_FORM_FIXTURES.chillTouch}
      />,
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue(/can't regain Hit Points/i)).toBeInTheDocument()
    })
  })

  it('adds resolution from empty state', async () => {
    const user = userEvent.setup()
    render(<SpellResolutionEditor formCtx={formCtx} />)

    await user.click(screen.getByRole('button', { name: /add resolution/i }))

    await waitFor(() => {
      expect(screen.getAllByText('Selection').length).toBeGreaterThan(0)
      expect(screen.getAllByText('How it resolves').length).toBeGreaterThan(0)
      expect(screen.getByRole('group', { name: /Effects & outcomes/ })).toBeInTheDocument()
      expect(screen.getByRole('group', { name: /^Authored effects/ })).toBeInTheDocument()
    })
  })

  it('renders interactive outcomes for inflict wounds fixture', async () => {
    render(
      <SpellResolutionEditor
        formCtx={formCtx}
        defaultResolution={RESOLUTION_FORM_FIXTURES.inflictWounds}
      />,
    )

    await waitFor(() => {
      expect(screen.getByRole('group', { name: /^Outcome branches/ })).toBeInTheDocument()
      expect(screen.getByText(RESOLUTION_SECTION_LABELS.outcomesHint)).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'On failed save' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'On successful save' })).toBeInTheDocument()
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
      expect(screen.getByText('Applied once per dart')).toBeInTheDocument()
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
      expect(screen.getByText('Applied once per dart')).toBeInTheDocument()
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
