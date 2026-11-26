import { useEffect } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form'
import { getMonsterBySlug } from '@rpg/catalog/monsters'
import { SYSTEM_OVERLAY_INTENT_FIELD } from '@rpg/contracts'
import { describe, expect, it, vi } from 'vitest'

import { buildSeedDamageTypeVocabulary } from '@/features/vocabulary'

import { makeContentFormCtx } from '../../../../lib/fixtures/content-form-ctx'
import { serializeContentFormInput } from '../../../../lib/forms/registry/content-form-serialize-input.lib'
import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import {
  resolveMonsterCreateDefaultValues,
  type MonsterFormValues,
} from '../../../lib/monster-form-values'
import { monsterFormDef } from '../../../lib/monster-form-def'
import { MonsterTraitsEditor } from './traits-editor'

function Host({
  values,
  formRef,
  formCtx,
  onSubmit,
}: {
  values?: MonsterFormValues
  formRef?: { current: UseFormReturn<MonsterFormValues> | null }
  formCtx?: ContentFormCtx
  onSubmit?: (values: MonsterFormValues) => void
}) {
  const form = useForm<MonsterFormValues>({
    defaultValues: values ?? { ...resolveMonsterCreateDefaultValues(), name: 'Owl' },
  })
  useEffect(() => {
    if (!formRef) return
    formRef.current = form
  }, [form, formRef])
  const ctx: ContentFormCtx = formCtx ?? {
    entityCatalogLayer: 'homebrew',
    damageTypeVocabulary: buildSeedDamageTypeVocabulary(),
  }
  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit((submitted) => onSubmit?.(submitted))}>
        {onSubmit ? (
          <label>
            Monster name
            <input {...form.register('name')} />
          </label>
        ) : null}
        <MonsterTraitsEditor ctx={ctx} />
        {onSubmit ? <button type="submit">Save changes</button> : null}
      </form>
    </FormProvider>
  )
}

describe('MonsterTraitsEditor', () => {
  it('navigates mounted system rows and serializes only the intended name and homebrew removal', async () => {
    const user = userEvent.setup()
    const seed = getMonsterBySlug('srd-cc-5.2.1', 'kobold-warrior')
    const seedTraitIds = seed.traits?.map((trait) => trait.id) ?? []
    const homebrewId = 'persisted-homebrew-trait'
    const entity = {
      ...seed,
      catalogLayer: 'system' as const,
      status: 'published' as const,
      overlayRevision: 7,
      seedRowIdsByPath: { traits: seedTraitIds },
      overlayReadDiagnostics: {
        orphanedSeedOverrides: ['removed-seed-trait'],
        identityConflicts: [],
      },
      traits: [
        ...(seed.traits ?? []),
        {
          id: homebrewId,
          kind: 'custom' as const,
          name: 'Persisted Homebrew Trait',
          description: 'Authored outside the catalog.',
        },
      ],
    }
    const values = monsterFormDef.toFormValues(entity) as MonsterFormValues
    const baseline = monsterFormDef.normalizeOverlayBody!(
      values,
      { entity, armorClassRules: { mode: 'ascending', base: 10 } },
      'publish',
    )
    const payloads: Record<string, unknown>[] = []
    const formRef: { current: UseFormReturn<MonsterFormValues> | null } = { current: null }
    const ctx = {
      ...makeContentFormCtx(),
      entityCatalogLayer: 'system' as const,
      rulesetId: 'srd-cc-5.2.1',
      persistedIdentityRowIdsByPath: {
        traits: [...seedTraitIds, homebrewId],
      },
      embeddedSystemOriginRowIds: {
        traits: seedTraitIds,
      },
    }

    render(
      <Host
        values={values}
        formRef={formRef}
        formCtx={ctx}
        onSubmit={(draft) => {
          payloads.push(
            serializeContentFormInput(
              monsterFormDef,
              draft,
              { entity, armorClassRules: ctx.armorClassRules },
              'publish',
              {
                operation: 'update',
                entityId: entity.id,
                rulesetId: 'srd-cc-5.2.1',
                catalogSeed: seed as Record<string, unknown>,
                overlayBaseline: baseline,
                expectedOverlayRevision: entity.overlayRevision,
                seedRowIdsByPath: entity.seedRowIdsByPath,
                dirtyFields: { name: true, traits: true },
              },
            ) as Record<string, unknown>,
          )
        }}
      />,
    )

    const seedTraits = seed.traits ?? []
    expect(seedTraits.length).toBeGreaterThanOrEqual(2)
    await user.click(screen.getByRole('button', { name: /Sunlight Sensitivity/i }))
    await user.click(screen.getByRole('button', { name: /Pack Tactics/i }))
    await user.click(screen.getByRole('button', { name: /Actions for Pack Tactics/i }))
    expect(screen.queryByRole('menuitem', { name: /Delete trait/i })).not.toBeInTheDocument()
    await user.keyboard('{Escape}')

    await user.clear(screen.getByRole('textbox', { name: 'Monster name' }))
    await user.type(screen.getByRole('textbox', { name: 'Monster name' }), 'Renamed Kobold Warrior')
    await user.click(screen.getByRole('button', { name: /Save changes/i }))
    expect(payloads[0]?.[SYSTEM_OVERLAY_INTENT_FIELD]).toEqual({
      set: { name: 'Renamed Kobold Warrior' },
    })
    expect(payloads[0]).not.toHaveProperty('overlayReadDiagnostics')
    expect(payloads[0]?.expectedOverlayRevision).toBe(7)

    await user.click(screen.getByRole('button', { name: /Persisted Homebrew Trait/i }))
    await user.click(screen.getByRole('button', { name: /Actions for Persisted Homebrew Trait/i }))
    expect(screen.getByRole('menuitem', { name: /Delete trait/i })).toBeInTheDocument()
    await user.click(screen.getByRole('menuitem', { name: /Delete trait/i }))
    await user.click(screen.getByRole('button', { name: /^Delete$/ }))
    await user.click(screen.getByRole('button', { name: /Save changes/i }))

    expect(payloads[1]?.[SYSTEM_OVERLAY_INTENT_FIELD]).toMatchObject({
      set: { name: 'Renamed Kobold Warrior' },
      collections: { traits: { reset: true } },
    })
    expect(entity.seedRowIdsByPath.traits).not.toContain(homebrewId)
    expect(ctx.persistedIdentityRowIdsByPath.traits).toContain(homebrewId)
    expect(vi.isMockFunction(serializeContentFormInput)).toBe(false)
  })

  it('does not offer species-only sense templates in the add menu', async () => {
    const user = userEvent.setup()
    render(<Host />)
    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(screen.getByRole('menuitem', { name: /Magic Resistance/i })).toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: /^Darkvision$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: /^Blindsight$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: /^Tremorsense$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: /^Truesight$/i })).not.toBeInTheDocument()
  })

  it('finds Flyby from its discovery description', async () => {
    const user = userEvent.setup()
    render(<Host />)
    await user.click(screen.getByRole('button', { name: 'Add' }))
    await user.type(screen.getByRole('searchbox', { name: 'Search traits…' }), 'flying')
    expect(screen.getByRole('menuitem', { name: /Flyby/ })).toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: /Pack Tactics/ })).not.toBeInTheDocument()
  })

  it('shows the generated sentence for a preset and keeps custom fields editable', async () => {
    const user = userEvent.setup()
    render(<Host />)
    await user.click(screen.getByRole('button', { name: 'Add' }))
    await user.click(screen.getByRole('menuitem', { name: /Flyby/ }))
    const preview = screen.getByText('Preview').closest('.ui-panel')
    expect(preview).toHaveTextContent('Flyby')
    expect(preview).toHaveTextContent(/The owl doesn't provoke an Opportunity Attack/)

    await user.click(screen.getByRole('button', { name: 'Add' }))
    await user.click(screen.getByRole('menuitem', { name: /Custom trait/ }))
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeInTheDocument()
    expect(screen.queryByText('Preview')).not.toBeInTheDocument()
  })

  it('shows guidance when trait preview is not ready', () => {
    const values = resolveMonsterCreateDefaultValues()
    values.traits = [
      {
        kind: 'template',
        id: 'lr',
        templateId: 'legendary-resistance',
        config: { uses: {} },
      },
    ]
    render(<Host values={values} />)
    const preview = screen.getByText('Preview').closest('.ui-panel')
    expect(preview).toHaveTextContent('Complete trait configuration to preview rules text.')
  })

  it('previews legendary resistance with the stat-block heading when lair is enabled', () => {
    const values = resolveMonsterCreateDefaultValues()
    values.name = 'Lich'
    values.lair = { enabled: true, experience: { mode: 'suggested' } }
    values.traits = [
      {
        kind: 'template',
        id: 'lr',
        templateId: 'legendary-resistance',
        config: { uses: { normal: 4, inLair: 5 } },
      },
    ]
    render(<Host values={values} />)
    const preview = screen.getByText('Preview').closest('.ui-panel')
    expect(preview).toHaveTextContent('Legendary Resistance (4/Day, or 5/Day in Lair)')
    expect(preview).toHaveTextContent('fails a saving throw')
    const listRow = screen.getByRole('button', { current: true })
    expect(listRow).toHaveTextContent('Legendary Resistance (4/Day)')
  })

  it('previews a template trait and offers supplemental details only', () => {
    const values = resolveMonsterCreateDefaultValues()
    values.name = 'Kobold Warrior'
    values.traits = [
      {
        id: 'pack-tactics',
        kind: 'template',
        templateId: 'pack-tactics',
      },
    ]
    render(<Host values={values} />)

    expect(screen.getByRole('button', { current: true, name: /Pack Tactics/ })).toBeInTheDocument()
    const preview = screen.getByText('Preview').closest('.ui-panel')
    expect(preview).toHaveTextContent('The kobold warrior')
    expect(preview).toHaveTextContent('its allies')
    expect(preview).not.toHaveTextContent('This creature')
    expect(
      screen.queryByRole('switch', { name: 'Override generated name and description' }),
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add custom name' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Edit name' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add details' })).toBeInTheDocument()
  })

  it('shows a Tunneler advisory only on that trait', async () => {
    const user = userEvent.setup()
    const values = resolveMonsterCreateDefaultValues()
    values.name = 'Ankheg'
    values.traits = [
      { id: 'note', kind: 'custom', name: 'Note', description: 'Custom.' },
      { id: 'tunnel', preset: 'tunneler' },
    ]
    const formRef: { current: UseFormReturn<MonsterFormValues> | null } = { current: null }
    render(<Host values={values} formRef={formRef} />)
    expect(
      screen.queryByText(/Tunneler uses half the creature's Burrow Speed/),
    ).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Tunneler/ }))
    const preview = screen.getByText('Preview')
    const alert = screen.getByText(/Tunneler uses half the creature's Burrow Speed/)
    expect(preview.compareDocumentPosition(alert) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(alert.closest('.ui-alert')).toHaveClass('ui-alert--warning')
    expect(preview.closest('.ui-panel')).toHaveTextContent('Tunneler')
    expect(preview.closest('.ui-panel')).toHaveTextContent(/burrow through solid rock/)

    formRef.current?.setValue('movement', [{ mode: 'burrow', feet: 20 }])
    await waitFor(() => {
      expect(
        screen.queryByText(/Tunneler uses half the creature's Burrow Speed/),
      ).not.toBeInTheDocument()
    })
    expect(formRef.current?.getValues('traits.1')).toEqual({ id: 'tunnel', preset: 'tunneler' })

    await user.click(screen.getByRole('button', { name: /Note/ }))
    expect(screen.queryByText('Preview')).not.toBeInTheDocument()
  })

  it('keeps water breathing duration behind a checkbox and out of the stored row when off', async () => {
    const user = userEvent.setup()
    const formRef: { current: UseFormReturn<MonsterFormValues> | null } = { current: null }
    render(<Host formRef={formRef} />)
    await user.click(screen.getByRole('button', { name: 'Add' }))
    await user.click(screen.getByRole('menuitem', { name: /Water Breathing/ }))
    expect(screen.getAllByText(/can breathe only underwater/).length).toBeGreaterThan(0)
    expect(screen.getByText('Preview').closest('.ui-panel')).not.toHaveTextContent('outside water')
    expect(screen.queryByRole('group', { name: 'Duration' })).not.toBeInTheDocument()
    const checkbox = screen.getByRole('checkbox', { name: 'Hold breath outside water' })
    expect(checkbox).not.toBeChecked()
    expect(formRef.current?.getValues('traits.0')).not.toHaveProperty('outsideWaterBreathEnabled')

    await user.click(checkbox)
    await waitFor(() => {
      expect(
        screen.getAllByText(/hold its breath for 1 hour outside water/).length,
      ).toBeGreaterThan(0)
    })
    expect(formRef.current?.getValues('traits.0')).toMatchObject({
      preset: 'water-breathing',
      outsideWaterBreathAmount: 1,
      outsideWaterBreathUnit: 'hour',
    })

    await user.click(screen.getByRole('checkbox', { name: 'Hold breath outside water' }))
    await waitFor(() => {
      expect(screen.getByText('Preview').closest('.ui-panel')).not.toHaveTextContent(
        'outside water',
      )
    })
    const cleared = formRef.current?.getValues('traits.0')
    expect(cleared).not.toHaveProperty('outsideWaterBreathAmount')
    expect(cleared).not.toHaveProperty('outsideWaterBreathUnit')
    expect(cleared).not.toHaveProperty('outsideWaterBreathEnabled')
  })

  it('builds regeneration rules from hit points, 0 HP, and interrupting damage types', async () => {
    const user = userEvent.setup()
    const formRef: { current: UseFormReturn<MonsterFormValues> | null } = { current: null }
    render(<Host formRef={formRef} />)
    await user.click(screen.getByRole('button', { name: 'Add' }))
    await user.click(screen.getByRole('menuitem', { name: /Regeneration/ }))

    const preview = () => screen.getByText('Preview').closest('.ui-panel')
    expect(preview()).toHaveTextContent(
      'The owl regains 10 Hit Points at the start of each of its turns if it has at least 1 Hit Point.',
    )
    expect(preview()).not.toHaveTextContent("doesn't regenerate")
    expect(screen.getByRole('checkbox', { name: 'Regenerates at 0 HP' })).not.toBeChecked()
    expect(formRef.current?.getValues('traits.0')).toMatchObject({
      preset: 'regeneration',
      hitPoints: 10,
      regeneratesAtZeroHp: false,
      interruptedByDamageTypes: [],
    })

    await user.click(screen.getByRole('checkbox', { name: 'Regenerates at 0 HP' }))
    await waitFor(() => {
      expect(preview()).toHaveTextContent(
        "The owl regains 10 Hit Points at the start of each of its turns. The owl dies only if it starts its turn with 0 Hit Points and doesn't regenerate.",
      )
    })
    expect(preview()).not.toHaveTextContent('at least 1 Hit Point')

    await user.click(
      screen.getByRole('combobox', { name: 'Damage types that interrupt regeneration' }),
    )
    await user.click(screen.getByRole('option', { name: 'Acid' }))
    const damageSearch = screen.getByRole('searchbox', { name: /search damage types/i })
    await user.type(damageSearch, 'fire')
    expect(screen.getByRole('option', { name: 'Fire' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Cold' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('option', { name: 'Fire' }))
    await waitFor(() => {
      expect(preview()).toHaveTextContent(
        "If the owl takes Acid or Fire damage, this trait doesn't function on the owl's next turn.",
      )
    })
    expect(preview()).toHaveTextContent("doesn't regenerate")
    expect(formRef.current?.getValues('traits.0')).toMatchObject({
      regeneratesAtZeroHp: true,
      interruptedByDamageTypes: ['acid', 'fire'],
    })

    await user.click(screen.getByRole('checkbox', { name: 'Regenerates at 0 HP' }))
    await waitFor(() => {
      expect(preview()).toHaveTextContent('at least 1 Hit Point')
    })
    expect(preview()).toHaveTextContent('Acid or Fire')
    expect(preview()).not.toHaveTextContent("doesn't regenerate")
    expect(formRef.current?.getValues('traits.0')).toMatchObject({
      regeneratesAtZeroHp: false,
      interruptedByDamageTypes: ['acid', 'fire'],
    })
    expect(screen.getByRole('button', { name: /^Regeneration/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove Acid' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove Fire' })).toBeInTheDocument()
  })
})
