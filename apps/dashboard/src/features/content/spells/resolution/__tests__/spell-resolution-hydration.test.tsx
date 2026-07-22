import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { loadSeedSpells, SRD_521_SPELL_SEED_RESOLUTION_TIER_A_SLUGS } from '@rpg/catalog/spells'
import { type Spell } from '@rpg/contracts'
import { TabbedForm } from '@rpg/ui/form'
import { beforeAll, describe, expect, it } from 'vitest'

import { buildSeedDamageTypeVocabulary } from '@/features/homebrew'
import { makeContentFormCtx } from '../../../lib/fixtures/content-form-ctx'
import { buildSpellTabs, spellFormSchema } from '../../lib/spell-form-fields'
import { spellFormDef } from '../../lib/spell-form-def'
import { spellToFormValues } from '../../lib/spell-form-values'
import { resolutionToForm, resolutionToStored } from '../lib/form/resolution-form-values'
import { RESOLUTION_FORM_FIXTURES } from '../fixtures'

const formCtx = makeContentFormCtx({
  damageTypeVocabulary: buildSeedDamageTypeVocabulary(),
})

beforeAll(() => {
  if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = () => false
    HTMLElement.prototype.setPointerCapture = () => undefined
    HTMLElement.prototype.releasePointerCapture = () => undefined
  }
  if (!HTMLElement.prototype.scrollIntoView) {
    HTMLElement.prototype.scrollIntoView = () => undefined
  }
})

const formHydratableResolutionSlugs = [
  ...SRD_521_SPELL_SEED_RESOLUTION_TIER_A_SLUGS,
  'eldritch-blast',
] as const

const editorEligibleSpell = {
  ...loadSeedSpells('srd-cc-5.2.1').find((spell) => spell.slug === 'chill-touch')!,
  modeling: {
    reviewedAt: '2026-07-15T00:00:00.000Z',
    status: 'meaningful-partial' as const,
  },
}

const belowEditorThresholdSpell = (() => {
  const { modeling: _modeling, ...spell } = loadSeedSpells('srd-cc-5.2.1').find(
    (entry) => entry.slug === 'chill-touch',
  )!
  return spell
})()

const unmodeledSpell = loadSeedSpells('srd-cc-5.2.1').find((spell) => spell.slug === 'hex')!

function withEditorEligibility(spell: Spell): Spell {
  return {
    ...spell,
    modeling: {
      reviewedAt: '2026-07-15T00:00:00.000Z',
      status: 'meaningful-partial',
    },
  }
}

function renderSpellTabbedForm(defaultValues: ReturnType<typeof spellToFormValues>) {
  const tabs = buildSpellTabs(formCtx)
  const resolutionTab = tabs.find((tab) => tab.id === 'resolution')
  if (!resolutionTab) throw new Error('resolution tab missing')

  return render(
    <TabbedForm
      schema={spellFormSchema}
      tabs={[resolutionTab]}
      defaultValues={defaultValues}
      onSubmit={() => undefined}
    />,
  )
}

describe('spell resolution tab hydration', () => {
  it('renders the editor for editor-eligible spells', async () => {
    renderSpellTabbedForm(spellToFormValues(editorEligibleSpell))

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /add resolution/i })).not.toBeInTheDocument()
      expect(screen.getAllByText('Melee spell attack').length).toBeGreaterThan(0)
    })
  })

  it('renders the empty state when resolution exists but status is below meaningful-partial', async () => {
    renderSpellTabbedForm(spellToFormValues(belowEditorThresholdSpell))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add resolution/i })).toBeInTheDocument()
      expect(screen.queryByText('Melee spell attack')).not.toBeInTheDocument()
    })
  })

  it('renders the empty state for an unmodeled spell', async () => {
    renderSpellTabbedForm(spellToFormValues(unmodeledSpell))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add resolution/i })).toBeInTheDocument()
    })
  })

  it('does not mark the form dirty when hydrating modeled resolution', async () => {
    let isDirty = false
    render(
      <TabbedForm
        schema={spellFormSchema}
        tabs={buildSpellTabs(formCtx).filter((tab) => tab.id === 'resolution')}
        defaultValues={spellToFormValues(editorEligibleSpell)}
        onSubmit={() => undefined}
        footer={(form) => {
          isDirty = form.formState.isDirty
          return null
        }}
      />,
    )

    await waitFor(() => {
      expect(screen.getAllByText('Melee spell attack').length).toBeGreaterThan(0)
    })
    expect(isDirty).toBe(false)
  })

  it('adds resolution from empty state and marks the form dirty', async () => {
    const user = userEvent.setup()
    let isDirty = false

    render(
      <TabbedForm
        schema={spellFormSchema}
        tabs={buildSpellTabs(formCtx).filter((tab) => tab.id === 'resolution')}
        defaultValues={spellToFormValues(unmodeledSpell)}
        onSubmit={() => undefined}
        footer={(form) => {
          isDirty = form.formState.isDirty
          return null
        }}
      />,
    )

    await user.click(screen.getByRole('button', { name: /add resolution/i }))

    await waitFor(() => {
      expect(screen.getAllByText('Selection').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Check').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Effects & outcomes').length).toBeGreaterThan(0)
      expect(isDirty).toBe(true)
    })
  })

  it('remounts cleanly when switching between modeled and unmodeled spells', async () => {
    const modeledDefaults = spellToFormValues(editorEligibleSpell)
    const unmodeledDefaults = spellToFormValues(unmodeledSpell)
    const resolutionTab = buildSpellTabs(formCtx).filter((tab) => tab.id === 'resolution')

    const { rerender } = render(
      <TabbedForm
        key="modeled"
        schema={spellFormSchema}
        tabs={resolutionTab}
        defaultValues={modeledDefaults}
        onSubmit={() => undefined}
      />,
    )

    await waitFor(() => {
      expect(screen.getAllByText('Melee spell attack').length).toBeGreaterThan(0)
    })

    rerender(
      <TabbedForm
        key="unmodeled"
        schema={spellFormSchema}
        tabs={resolutionTab}
        defaultValues={unmodeledDefaults}
        onSubmit={() => undefined}
      />,
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add resolution/i })).toBeInTheDocument()
      expect(screen.queryByText('Melee spell attack')).not.toBeInTheDocument()
    })

    rerender(
      <TabbedForm
        key="modeled-again"
        schema={spellFormSchema}
        tabs={resolutionTab}
        defaultValues={{
          ...unmodeledDefaults,
          resolution: RESOLUTION_FORM_FIXTURES.chillTouch,
        }}
        onSubmit={() => undefined}
      />,
    )

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /add resolution/i })).not.toBeInTheDocument()
      expect(screen.getAllByText(/can't regain Hit Points/i).length).toBeGreaterThan(0)
    })
  })

  it('hydrates damage-only catalog resolution seeds into form values', () => {
    const spells = loadSeedSpells('srd-cc-5.2.1')

    for (const slug of formHydratableResolutionSlugs) {
      const spell = withEditorEligibility(spells.find((entry) => entry.slug === slug)!)
      const formValues = spellToFormValues(spell)

      expect(formValues.resolution, slug).toBeDefined()
      expect(resolutionToStored(formValues.resolution)).toEqual(spell.resolution)
    }
  })

  it('preserves normalized resolution shape when saving without edits', () => {
    const formValues = spellToFormValues(editorEligibleSpell)
    const input = spellFormDef.toInput(formValues)

    expect(input.resolution).toEqual(editorEligibleSpell.resolution)
    expect(resolutionToStored(formValues.resolution)).toEqual(editorEligibleSpell.resolution)
    expect(formValues.resolution).toEqual(resolutionToForm(editorEligibleSpell.resolution!))
  })

  it('renders seeded damage type and roll for Tier A acid-splash without marking dirty', async () => {
    const acidSplash = withEditorEligibility(
      loadSeedSpells('srd-cc-5.2.1').find((spell) => spell.slug === 'acid-splash')!,
    )
    let isDirty = false

    render(
      <TabbedForm
        schema={spellFormSchema}
        tabs={buildSpellTabs(formCtx).filter((tab) => tab.id === 'resolution')}
        defaultValues={spellToFormValues(acidSplash)}
        onSubmit={() => undefined}
        footer={(form) => {
          isDirty = form.formState.isDirty
          return null
        }}
      />,
    )

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: 'Damage type' })).toHaveTextContent('Acid')
      expect(screen.getByRole('spinbutton', { name: 'Damage roll Number of dice' })).toHaveValue(1)
      expect(screen.getByRole('combobox', { name: 'Die size' })).toHaveTextContent('d6')
    })
    expect(isDirty).toBe(false)
  })

  it('renders seeded necrotic damage for Tier A chill-touch', async () => {
    renderSpellTabbedForm(spellToFormValues(editorEligibleSpell))

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: 'Damage type' })).toHaveTextContent('Necrotic')
      expect(screen.getByRole('spinbutton', { name: 'Damage roll Number of dice' })).toHaveValue(1)
      expect(screen.getByRole('combobox', { name: 'Die size' })).toHaveTextContent('d10')
    })
  })

  it('hydrates Eldritch Blast resolution with projectiles and per-beam force damage', async () => {
    const eldritchBlast = withEditorEligibility(
      loadSeedSpells('srd-cc-5.2.1').find((spell) => spell.slug === 'eldritch-blast')!,
    )
    let isDirty = false

    render(
      <TabbedForm
        schema={spellFormSchema}
        tabs={buildSpellTabs(formCtx).filter((tab) => tab.id === 'resolution')}
        defaultValues={spellToFormValues(eldritchBlast)}
        onSubmit={() => undefined}
        footer={(form) => {
          isDirty = form.formState.isDirty
          return null
        }}
      />,
    )

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /add resolution/i })).not.toBeInTheDocument()
      expect(screen.getAllByText('Projectiles').length).toBeGreaterThan(0)
      expect(screen.getByRole('combobox', { name: 'Damage type' })).toHaveTextContent('Force')
      expect(screen.getByRole('spinbutton', { name: 'Damage roll Number of dice' })).toHaveValue(1)
      expect(screen.getByRole('combobox', { name: 'Die size' })).toHaveTextContent('d10')
    })

    expect(isDirty).toBe(false)
    expect(eldritchBlast.resolution?.applicationPattern?.kind).toBe('projectiles')
  })

  it('hides hybrid notice for magic-missile when application pattern is projectiles', async () => {
    const magicMissile = withEditorEligibility(
      loadSeedSpells('srd-cc-5.2.1').find((spell) => spell.slug === 'magic-missile')!,
    )

    render(
      <TabbedForm
        schema={spellFormSchema}
        tabs={buildSpellTabs(formCtx).filter((tab) => tab.id === 'resolution')}
        defaultValues={spellToFormValues(magicMissile)}
        onSubmit={() => undefined}
      />,
    )

    await waitFor(() => {
      expect(screen.getAllByText('Projectiles').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Applied once per dart').length).toBeGreaterThan(0)
    })
    expect(magicMissile.resolution?.applicationPattern?.kind).toBe('projectiles')
  })

  it('renders automatic healing for cure-wounds without marking dirty', async () => {
    const cureWounds = withEditorEligibility(
      loadSeedSpells('srd-cc-5.2.1').find((spell) => spell.slug === 'cure-wounds')!,
    )
    let isDirty = false

    render(
      <TabbedForm
        schema={spellFormSchema}
        tabs={buildSpellTabs(formCtx).filter((tab) => tab.id === 'resolution')}
        defaultValues={spellToFormValues(cureWounds)}
        onSubmit={() => undefined}
        footer={(form) => {
          isDirty = form.formState.isDirty
          return null
        }}
      />,
    )

    await waitFor(() => {
      expect(screen.getAllByText('Automatic').length).toBeGreaterThan(0)
      expect(screen.getByRole('spinbutton', { name: 'Roll Number of dice' })).toHaveValue(2)
      expect(screen.getByRole('combobox', { name: 'Die size' })).toHaveTextContent('d8')
    })
    expect(isDirty).toBe(false)
  })

  it('keeps manifest-deferred hex in empty resolution state', async () => {
    const formValues = spellToFormValues(unmodeledSpell)

    renderSpellTabbedForm(formValues)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add resolution/i })).toBeInTheDocument()
      expect(screen.queryByRole('combobox', { name: 'Damage type' })).not.toBeInTheDocument()
    })
    expect(formValues.resolution).toBeUndefined()
  })

  it('hides saving throw ability when switching from saving throw to attack', async () => {
    const user = userEvent.setup()
    const inflictWounds = withEditorEligibility(
      loadSeedSpells('srd-cc-5.2.1').find((spell) => spell.slug === 'inflict-wounds')!,
    )

    renderSpellTabbedForm(spellToFormValues(inflictWounds))

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: 'Saving throw' })).toHaveTextContent(
        'Constitution',
      )
    })

    await user.click(screen.getByRole('combobox', { name: 'Method' }))
    await user.click(screen.getByRole('option', { name: 'Melee spell attack' }))

    await waitFor(() => {
      expect(screen.queryByRole('combobox', { name: 'Saving throw' })).not.toBeInTheDocument()
    })
  })
})
