import { describe, expect, it } from 'vitest'
import { buildContentPurposeSelectors } from '@rpg/contracts'

import { makeCharacterClass } from '@/test/fixtures/factories/character-class'
import { makeContentFormCtx } from '../../../fixtures/content-form-ctx'
import { equipmentFormDef } from '../../../../equipment/lib/equipment-form-def'
import { organizationFormDef } from '../../../../organizations/lib/organization-form-def'
import { spellFormDef } from '../../../../spells/lib/spell-form-def'
import { weaponFormValueSyncs } from '../../../../equipment/weapons'
import { resolutionFormValueSyncs } from '../../../../spells/resolution/lib/form/resolution-form-sync'
import {
  organizationCreateDefaultValues,
  organizationDraftFormSchema,
  organizationFormSchema,
} from '../../organization-form-projection'
import {
  resolveContentFormHostConfig,
  resolveContentFormValueSyncs,
} from './content-form-host-projection'

describe('resolveContentFormValueSyncs', () => {
  it('returns weapon syncs for weapon equipment create', () => {
    const ctx = makeContentFormCtx({ equipmentKind: 'weapon' })
    expect(resolveContentFormValueSyncs(equipmentFormDef, ctx)).toBe(weaponFormValueSyncs)
  })

  it('returns resolution syncs for spells', () => {
    expect(resolveContentFormValueSyncs(spellFormDef, makeContentFormCtx())).toBe(
      resolutionFormValueSyncs,
    )
  })

  it('resolves def-owned syncs for organizations', () => {
    const rogue = makeCharacterClass({ slug: 'rogue', id: 'class-rogue', name: 'Rogue' })
    const ctx = makeContentFormCtx({
      options: {
        classes: buildContentPurposeSelectors([rogue]),
      } as never,
    })
    const syncs = resolveContentFormValueSyncs(organizationFormDef, ctx)
    expect(syncs).toBeDefined()
    expect(syncs?.length).toBeGreaterThan(0)

    const applied = syncs?.[0]?.apply({ authoringPresetId: 'thieves_guild' }, ['authoringPresetId'])
    expect(applied).toMatchObject({
      authoringPresetId: undefined,
      sourcePresetId: 'thieves_guild',
      organizationDomain: 'criminal',
      organizationForm: 'guild',
      functions: [],
      practices: ['theft'],
    })
  })
})

describe('resolveContentFormHostConfig', () => {
  it('includes non-empty valueSyncs for organization create', () => {
    const config = resolveContentFormHostConfig(organizationFormDef, makeContentFormCtx(), {
      validationIntent: 'draft',
    })
    expect(config.valueSyncs?.length).toBeGreaterThan(0)
  })

  it('uses draft vs publish schema selection', () => {
    const ctx = makeContentFormCtx()
    const draft = resolveContentFormHostConfig(organizationFormDef, ctx, {
      validationIntent: 'draft',
    })
    const publish = resolveContentFormHostConfig(organizationFormDef, ctx, {
      validationIntent: 'publish',
    })

    expect(draft.schema).toBe(organizationDraftFormSchema)
    expect(publish.schema).toBe(organizationFormSchema)
  })

  it('shallow-merges caller defaultValues over def.createDefaultValues', () => {
    const config = resolveContentFormHostConfig(organizationFormDef, makeContentFormCtx(), {
      defaultValues: {
        members: { classAffinityIds: ['class-rogue'] },
      },
    })

    expect(config.defaultValues).toEqual({
      ...organizationCreateDefaultValues,
      members: { classAffinityIds: ['class-rogue'] },
    })
    expect(config.defaultValues?.members).not.toHaveProperty('speciesAffinityIds')
  })
})
