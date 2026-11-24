/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { collectTabbedFormResolverItems, makeResolver } from '@rpg/ui/form'
import { getMonsterBySlug } from '@rpg/catalog/monsters'

import { makeContentFormCtx } from '../../../lib/fixtures/content-form-ctx'
import {
  evaluateContentPublishValidation,
  paintValidationIssuesOnForm,
} from '../../../lib/forms/validation/content-publish-validation.lib'
import { monsterFormDef } from '../monster-form-def'
import { buildMonsterTabs } from '../monster-form-fields'
import { resolveMonsterFormSchema } from '../monster-form-schema'
import { resolveMonsterCreateDefaultValues } from '../monster-form-values'
import { makeEmptyMonsterForms } from '../forms/monster-forms-form-values'
import { monsterToFormValues, type MonsterFormValues } from '../monster-form-values'
import { monsterFormTestValues } from '../monster-form-test-values'

const ctx = makeContentFormCtx({
  equipmentCatalogStatus: 'ready',
  skillCatalogStatus: 'ready',
  spellCatalogStatus: 'ready',
})

describe('monster lair XP publish resolver', () => {
  it('returns an error on lair.experience.value for published parse', async () => {
    const tabs = buildMonsterTabs(ctx)
    const fields = collectTabbedFormResolverItems(tabs)
    const schema = resolveMonsterFormSchema(ctx, 'publish')
    const resolver = makeResolver(schema, fields)

    const values = resolveMonsterCreateDefaultValues()
    values.name = 'Test'
    values.sizes = ['medium']
    values.creatureType = 'humanoid'
    values.alignment = 'n'
    values.challengeRating = '10'
    values.lair = { enabled: true, experience: { mode: 'custom', value: 1 } }

    const result = await resolver(values as never, undefined, {
      fields: {},
      shouldUseNativeValidation: false,
    })

    const lairError =
      (result.errors as Record<string, { message?: string }>)['lair.experience.value'] ??
      (result.errors as { lair?: { experience?: { value?: { message?: string } } } }).lair
        ?.experience?.value

    expect(lairError?.message).toMatch(/In-lair XP must exceed/)
  })

  it('does not return the floor error on draft parse', async () => {
    const tabs = buildMonsterTabs(ctx)
    const fields = collectTabbedFormResolverItems(tabs)
    const schema = resolveMonsterFormSchema(ctx, 'draft')
    const resolver = makeResolver(schema, fields)

    const values = resolveMonsterCreateDefaultValues()
    values.name = 'Test'
    values.sizes = ['medium']
    values.creatureType = 'humanoid'
    values.alignment = 'n'
    values.challengeRating = '10'
    values.lair = { enabled: true, experience: { mode: 'custom', value: 1 } }

    const result = await resolver(values as never, undefined, {
      fields: {},
      shouldUseNativeValidation: false,
    })

    expect(result.errors['lair.experience.value']).toBeUndefined()
  })

  it('flags sub-minimum custom in-lair XP at CR 21 on publish parse', () => {
    const publishSchema = resolveMonsterFormSchema(ctx, 'publish')
    const fields = collectTabbedFormResolverItems(buildMonsterTabs(ctx))
    const values = resolveMonsterCreateDefaultValues()
    values.name = 'Lich test'
    values.sizes = ['medium']
    values.creatureType = 'undead'
    values.alignment = 'n'
    values.challengeRating = '21'
    values.lair = { enabled: true, experience: { mode: 'custom', value: 1 } }
    const issues = evaluateContentPublishValidation(
      publishSchema,
      values as never,
      fields,
    )
    expect(issues?.some((issue) => issue.path === 'lair.experience.value')).toBe(true)
  })

  it('returns both forms and lair errors for edit-shell-loaded lich', async () => {
    const loaded = await import('../../../lib/forms/shells/edit/content-edit-load').then((m) =>
      m.loadContentEditFormState({
        def: monsterFormDef,
        entity: { ...getMonsterBySlug('srd-cc-5.2.1', 'lich'), status: 'published' },
        optionsCtx: ctx,
        campaignId: 'camp_1',
        entityId: 'srd-cc-5.2.1:lich',
      }),
    )
    const tabs = (
      await import('../../../lib/forms/shells/layout/content-schema-form-tabs.lib')
    ).augmentTabsWithHoistedName(
      buildMonsterTabs(loaded.layoutCtx),
      monsterFormDef.nameField(loaded.layoutCtx),
    )
    const fields = collectTabbedFormResolverItems(tabs)
    const values = {
      ...loaded.defaultValues,
      lair: { enabled: true, experience: { mode: 'custom', value: 1 } },
    }
    const resolver = makeResolver(loaded.schema, fields)
    const result = await resolver(values as never, undefined, {
      fields: {},
      shouldUseNativeValidation: false,
    })
    expect(values.lair).toEqual({ enabled: true, experience: { mode: 'custom', value: 1 } })
    const lairError =
      (result.errors as Record<string, { message?: string }>)['lair.experience.value'] ??
      (result.errors as { lair?: { experience?: { value?: { message?: string } } } }).lair
        ?.experience?.value
    expect(lairError?.message).toMatch(/In-lair XP must exceed/)
  })

  it('passes draft parse for edit-shell lich with sub-floor custom in-lair XP', async () => {
    const loaded = (
      await import('../../../lib/forms/shells/edit/content-edit-load')
    ).loadContentEditFormState({
      def: monsterFormDef,
      entity: { ...getMonsterBySlug('srd-cc-5.2.1', 'lich'), status: 'draft' },
      optionsCtx: ctx,
      campaignId: 'camp_1',
      entityId: 'srd-cc-5.2.1:lich',
    })
    const tabs = (
      await import('../../../lib/forms/shells/layout/content-schema-form-tabs.lib')
    ).augmentTabsWithHoistedName(
      buildMonsterTabs(loaded.layoutCtx),
      monsterFormDef.nameField(loaded.layoutCtx),
    )
    const fields = collectTabbedFormResolverItems(tabs)
    const values = {
      ...loaded.defaultValues,
      lair: { enabled: true, experience: { mode: 'custom', value: 1 } },
    }
    const resolver = makeResolver(loaded.schema, fields)
    const result = await resolver(values as never, undefined, {
      fields: {},
      shouldUseNativeValidation: false,
    })
    expect((result.errors as { lair?: unknown }).lair).toBeUndefined()
    expect(result.errors['lair.experience.value']).toBeUndefined()
  })

  it('returns lair error when forms is only a partial definedForms array', async () => {
    const lich = getMonsterBySlug('srd-cc-5.2.1', 'lich')
    const values = monsterToFormValues(lich)
    values.forms = { definedForms: [] } as unknown as MonsterFormValues['forms']
    values.lair = { enabled: true, experience: { mode: 'custom', value: 1 } }
    const fields = collectTabbedFormResolverItems(buildMonsterTabs(ctx))
    const resolver = makeResolver(resolveMonsterFormSchema(ctx, 'publish'), fields)
    const result = await resolver(values as never, undefined, {
      fields: {},
      shouldUseNativeValidation: false,
    })
    const lairError =
      (result.errors as Record<string, { message?: string }>)['lair.experience.value'] ??
      (result.errors as { lair?: { experience?: { value?: { message?: string } } } }).lair
        ?.experience?.value
    expect(lairError?.message).toMatch(/In-lair XP must exceed/)
  })

  it('returns lair and forms errors for edit-shell fields with empty forms', async () => {
    const loaded = (
      await import('../../../lib/forms/shells/edit/content-edit-load')
    ).loadContentEditFormState({
      def: monsterFormDef,
      entity: { ...getMonsterBySlug('srd-cc-5.2.1', 'lich'), status: 'published' },
      optionsCtx: ctx,
      campaignId: 'camp_1',
      entityId: 'srd-cc-5.2.1:lich',
    })
    const tabs = (
      await import('../../../lib/forms/shells/layout/content-schema-form-tabs.lib')
    ).augmentTabsWithHoistedName(
      buildMonsterTabs(loaded.layoutCtx),
      monsterFormDef.nameField(loaded.layoutCtx),
    )
    const fields = collectTabbedFormResolverItems(tabs)
    const values = {
      ...loaded.defaultValues,
      forms: makeEmptyMonsterForms(),
      lair: { enabled: true, experience: { mode: 'custom', value: 1 } },
    }
    const resolver = makeResolver(loaded.schema, fields)
    const result = await resolver(values as never, undefined, {
      fields: {},
      shouldUseNativeValidation: false,
    })
    const lairError =
      (result.errors as Record<string, { message?: string }>)['lair.experience.value'] ??
      (result.errors as { lair?: { experience?: { value?: { message?: string } } } }).lair
        ?.experience?.value
    expect(result.errors.forms).toBeDefined()
    expect(lairError?.message).toMatch(/In-lair XP must exceed/)
  })

  it('paints publish-only lair XP floor on draft payloads', () => {
    const values = monsterFormTestValues({
      name: 'Test',
      sizes: ['medium'],
      creatureType: 'humanoid',
      alignment: 'n',
      challengeRating: '10',
      lair: { enabled: true, experience: { mode: 'custom', value: 1 } },
    })

    const { result } = renderHook(() => useForm({ defaultValues: values }))

    const publishSchema = resolveMonsterFormSchema(ctx, 'publish')
    const fields = collectTabbedFormResolverItems(buildMonsterTabs(ctx))
    const issues = evaluateContentPublishValidation(
      publishSchema,
      values as never,
      fields,
    )

    act(() => {
      result.current.reset(values)
      if (issues) paintValidationIssuesOnForm(result.current, issues)
    })

    expect(result.current.getFieldState('lair.experience.value').error?.message).toMatch(
      /In-lair XP must exceed/,
    )
  })
})
