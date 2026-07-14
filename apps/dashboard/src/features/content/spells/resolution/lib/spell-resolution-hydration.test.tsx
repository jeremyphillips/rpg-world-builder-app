import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { loadSeedSpells, SRD_521_SPELL_SEED_RESOLUTION_SLUGS } from '@rpg/catalog/spells'
import { CHILL_TOUCH_RESOLUTION } from '@rpg/contracts'
import { TabbedForm } from '@rpg/ui/form'
import { describe, expect, it } from 'vitest'

import { buildSeedDamageTypeVocabulary } from '@/features/homebrew'
import { makeContentFormCtx } from '../../../lib/fixtures/content-form-ctx'
import { buildSpellTabs, spellFormSchema } from '../../lib/spell-form-fields'
import { spellFormDef } from '../../lib/spell-form-def'
import { spellToFormValues } from '../../lib/spell-form-values'
import { resolutionToStored } from './resolution-form-values'
import { RESOLUTION_FORM_FIXTURES } from './resolution-fixtures'

const formCtx = makeContentFormCtx({
  damageTypeVocabulary: buildSeedDamageTypeVocabulary(),
})

const modeledSpell = loadSeedSpells('srd-cc-5.2.1').find((spell) => spell.slug === 'chill-touch')!

const unmodeledSpell = loadSeedSpells('srd-cc-5.2.1').find(
  (spell) => spell.slug === 'eldritch-blast',
)!

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
  it('renders the editor immediately for a modeled spell', async () => {
    renderSpellTabbedForm(spellToFormValues(modeledSpell))

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /add resolution/i })).not.toBeInTheDocument()
      expect(screen.getAllByText('Melee spell attack').length).toBeGreaterThan(0)
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
        defaultValues={spellToFormValues(modeledSpell)}
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
      expect(screen.getAllByText('Target').length).toBeGreaterThan(0)
      expect(isDirty).toBe(true)
    })
  })

  it('remounts cleanly when switching between modeled and unmodeled spells', async () => {
    const modeledDefaults = spellToFormValues(modeledSpell)
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

  it('hydrates Tier A catalog resolution seeds into form values', () => {
    const spells = loadSeedSpells('srd-cc-5.2.1')

    for (const slug of SRD_521_SPELL_SEED_RESOLUTION_SLUGS) {
      const spell = spells.find((entry) => entry.slug === slug)!
      const formValues = spellToFormValues(spell)

      expect(formValues.resolution, slug).toBeDefined()
      expect(resolutionToStored(formValues.resolution)).toEqual(spell.resolution)
    }
  })

  it('preserves normalized resolution shape when saving without edits', () => {
    const formValues = spellToFormValues(modeledSpell)
    const input = spellFormDef.toInput(formValues)

    expect(input).not.toHaveProperty('resolution')
    expect(resolutionToStored(formValues.resolution)).toEqual(CHILL_TOUCH_RESOLUTION)
    expect(formValues.resolution).toEqual(RESOLUTION_FORM_FIXTURES.chillTouch)
  })
})
